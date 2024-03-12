import { JisonSymbolLocation, Scanner } from "../../../jison";

const MAX_DEBUG_LENGTH = 20;
const ELLIPSIS = "...";

export default class SandScanner implements Scanner<string> {
  private src: string;
  private tokenIndex: number;

  constructor() {
    this.src = "";
    this.tokenIndex = 0;
  }

  public setInput(input: string): void {
    this.src = input;
    this.tokenIndex = 0;
  }

  public lex(): string {
    const tokenType = this.scanner.lex();

    const tokenIndex = this.tokenIndex;
    this.tokenIndex++;

    const isTokenTypeGenericMethodParamLeftAngle =
      tokenType === "<" &&
      this.genericMethodTypeParamLeftAngleIndices.includes(tokenIndex);

    if (isTokenTypeGenericMethodParamLeftAngle) {
      return GENERIC_METHOD_TYPE_PARAM_LIST_LEFT_ANGLE_BRACKET;
    } else {
      return tokenType;
    }
  }

  public get yytext(): string {
    return this.scanner.yytext;
  }

  public get yyleng(): number {
    return this.scanner.yyleng;
  }

  public get yylloc(): JisonSymbolLocation {
    return this.scanner.yylloc;
  }

  public get yylineno(): number {
    return this.scanner.yylineno;
  }

  public pastInput(): string {
    return this.scanner.pastInput();
  }

  public upcomingInput(): string {
    return this.scanner.upcomingInput();
  }

  public input(): void {
    this.scanner.input();
  }

  public showPosition(): string {
    return this.scanner.showPosition();
  }

  getComments(): Comment[] {
    return this.scanner.comments;
  }
}

function getGenericMethodTypeParamLeftAngleIndices(input: string): number[] {
  const tokenTypes = getFirstPassTokenTypes(input);
  const indices: number[] = [];

  let i = tokenTypes.length - 1;
  while (i >= 1) {
    const tokenType = tokenTypes[i];
    const prevTokenType = tokenTypes[i - 1];

    if (
      i >= 3 &&
      tokenTypes[i - 3] === "<" &&
      tokenTypes[i - 2] === "!" &&
      prevTokenType === ">" &&
      tokenType === "("
    ) {
      i -= 4;
      continue;
    }

    if (prevTokenType === ">" && tokenType === "(") {
      i -= 2;

      let angleCount = 1;
      while (i >= 0) {
        const tokenType = tokenTypes[i];

        if (tokenType === "<") {
          angleCount--;
        }

        if (angleCount === 0) {
          indices.push(i);

          i--;
          break;
        }

        if (tokenType === ">") {
          angleCount++;
        }

        i--;
      }
    } else {
      i--;
    }
  }

  return indices;
}

function getFirstPassTokenTypes(input: string): TokenType[] {
  const scanner = new FirstPassScanner();
  scanner.setInput(input);

  const tokenTypes: TokenType[] = [];

  while (true) {
    const tokenType = scanner.lex();
    tokenTypes.push(tokenType);

    if (tokenType === EOF || tokenType === INVALID) {
      break;
    }
  }

  return tokenTypes;
}

class FirstPassScanner implements Scanner<TokenType> {
  public yytext: string;
  public yylloc: JisonSymbolLocation;

  public readonly comments: Comment[];

  private rules: TokenizationRule[];
  private input_: string;
  private pastInput_: string;
  private location: PointLocation;

  constructor() {
    this.yytext = "";
    this.yylloc = {
      first_line: 1,
      first_column: 0,
      last_line: 1,
      last_column: 0,
    };

    this.comments = [];

    this.rules = SAND_TOKENIZATION_RULES;
    this.input_ = "";
    this.pastInput_ = "";
    this.location = { line: 1, column: 0 };
  }

  public setInput(input: string) {
    this.input_ = input;
    this.pastInput_ = "";

    this.yylloc = {
      first_line: 1,
      first_column: 0,
      last_line: 1,
      last_column: 0,
    };
    this.location = { line: 1, column: 0 };
  }

  public lex(): TokenType {
    if (this.input_ === "") {
      this.yytext = "";
      return EOF;
    }

    const leadingWhitespace = this.input_.match(/^\s+/)?.[0];
    if (leadingWhitespace !== undefined) {
      this.input_ = this.input_.slice(leadingWhitespace.length);
      this.pastInput_ += leadingWhitespace;
      this.yytext = leadingWhitespace;
      this.advanceCursorAndUpdateYyloc();
      return this.lex();
    }

    if (/^"/.test(this.input_)) {
      return this.lexStringLiteral();
    }

    if (/^\/\//.test(this.input_)) {
      return this.recordSingleLineCommentAndLexNextToken();
    }

    if (/^\/\*/.test(this.input_)) {
      return this.recordMultiLineCommentAndLexNextToken();
    }

    const ruleToUse = this.rules.find(([regex]) => regex.test(this.input_));

    if (ruleToUse === undefined) {
      this.yytext = this.input_;
      this.advanceCursorAndUpdateYyloc();
      return INVALID;
    }

    const [regex, tokenType] = ruleToUse;
    this.yytext = this.input_.match(regex)![0];
    this.input_ = this.input_.slice(this.yytext.length);

    this.pastInput_ += this.yytext;
    this.advanceCursorAndUpdateYyloc();
    return tokenType;
  }

  private advanceCursorAndUpdateYyloc() {
    const startLocation = this.location;
    const endLocation = getEndLocation(this.yytext, startLocation);
    this.yylloc = mergePointLocations(startLocation, endLocation);
    this.location = endLocation;
  }

  private lexStringLiteral(): typeof STRING_LITERAL | typeof INVALID {
    let curlyCount = 0;
    let i = 1;
    let token = '"';
    while (true) {
      if (i >= this.input_.length) {
        this.yytext = this.input_;

        this.pastInput_ += this.yytext;
        this.advanceCursorAndUpdateYyloc();
        return INVALID;
      }

      const char = this.input_.charAt(i);

      if (char === "\\") {
        const escapeSequence = this.input_
          .slice(i)
          .match(/^\\(?:[\\"nrvft{}]|u[\dA-F]{4,5})/)?.[0];

        if (escapeSequence === undefined) {
          token += char;
          this.yytext = token;
          this.input_ = this.input_.slice(this.yytext.length);

          this.pastInput_ += this.yytext;
          this.advanceCursorAndUpdateYyloc();
          return INVALID;
        }

        token += escapeSequence;
        i += escapeSequence.length;
        continue;
      }

      if (/^[\n\r\v\f\u0085\u2028\u2029]$/.test(char)) {
        token += char;
        this.yytext = token;
        this.input_ = this.input_.slice(this.yytext.length);

        this.pastInput_ += this.yytext;
        this.advanceCursorAndUpdateYyloc();
        return INVALID;
      }

      token += char;

      if (char === '"' && curlyCount === 0) {
        break;
      }

      if (char === "{") {
        curlyCount++;
      }

      if (char === "}") {
        curlyCount--;
      }

      i++;
    }

    this.yytext = token;
    this.input_ = this.input_.slice(this.yytext.length);

    this.pastInput_ += this.yytext;
    this.advanceCursorAndUpdateYyloc();
    return STRING_LITERAL;
  }

  private recordSingleLineCommentAndLexNextToken(): TokenType {
    let i = 2;
    let token = "//";
    while (true) {
      const char = this.input_.charAt(i);

      if (
        /^[\n\r\v\f\u0085\u2028\u2029]$/.test(char) ||
        i >= this.input_.length
      ) {
        break;
      }

      token += char;

      i++;
    }

    this.yytext = token;
    this.input_ = this.input_.slice(this.yytext.length);
    this.pastInput_ += this.yytext;
    this.advanceCursorAndUpdateYyloc();

    this.comments.push({ source: token, location: this.location });

    return this.lex();
  }

  private recordMultiLineCommentAndLexNextToken(): TokenType {
    let i = 2;
    let token = "/*";
    while (true) {
      if (i >= this.input_.length) {
        this.yytext = this.input_;

        this.pastInput_ += this.yytext;
        this.advanceCursorAndUpdateYyloc();
        return INVALID;
      }

      if ("*/" === this.input_.slice(i, i + 2)) {
        token += "*/";
        break;
      }

      const char = this.input_.charAt(i);
      token += char;

      i++;
    }

    this.yytext = token;
    this.input_ = this.input_.slice(this.yytext.length);
    this.pastInput_ += this.yytext;
    this.advanceCursorAndUpdateYyloc();

    this.comments.push({ source: token, location: this.location });

    return this.lex();
  }

  public pastInput() {
    return this.pastInput_;
  }

  public upcomingInput() {
    return this.yytext + this.input_;
  }

  public input() {
    const c = this.input_.charAt(0);
    this.yytext += c;
    this.pastInput_ += c;
    this.input_ = this.input_.slice(1);
  }

  public get yylineno(): number {
    return this.location.line;
  }

  public get yyleng(): number {
    return this.yytext.length;
  }

  public showPosition(): string {
    const past = this.getPastInputForDebug();
    const underline = "-".repeat(past.length);
    const upcoming = this.getUpcomingInputForDebug();
    return past + upcoming + "\n" + underline + "^";
  }

  private getPastInputForDebug(): string {
    const withoutCurrentMatch = this.pastInput_.slice(0, -this.yytext.length);
    const withCollapsedWhitespace = withoutCurrentMatch.replace(/\s+/g, " ");
    if (withCollapsedWhitespace.length <= MAX_DEBUG_LENGTH) {
      return withCollapsedWhitespace;
    } else {
      return (
        ELLIPSIS +
        withCollapsedWhitespace.slice(-MAX_DEBUG_LENGTH + ELLIPSIS.length)
      );
    }
  }

  private getUpcomingInputForDebug(): string {
    const withCollapsedWhitespace = this.upcomingInput().replace(/\s+/g, " ");
    if (withCollapsedWhitespace.length <= MAX_DEBUG_LENGTH) {
      return withCollapsedWhitespace;
    } else {
      return (
        withCollapsedWhitespace.slice(0, MAX_DEBUG_LENGTH - ELLIPSIS.length) +
        ELLIPSIS
      );
    }
  }
}

interface PointLocation {
  line: number;
  column: number;
}

function getEndLocation(str: string, start: PointLocation): PointLocation {
  const lines = str.split("\n");
  if (lines.length === 1) {
    return {
      line: start.line,
      column: start.column + lines[0].length,
    };
  } else {
    const lastLine = lines[lines.length - 1];
    return {
      line: start.line + lines.length - 1,
      column: lastLine.length,
    };
  }
}

function mergePointLocations(
  start: PointLocation,
  end: PointLocation
): JisonSymbolLocation {
  return {
    first_line: start.line,
    first_column: start.column,
    last_line: end.line,
    last_column: end.column,
  };
}
