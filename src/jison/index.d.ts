export class Parser implements ParserGeneratedByJison {
  constructor(grammar: any);

  lexer: Scanner;
  yy: any;

  generate(): string;
  parse(program: string): any;
}

export interface ParserGeneratedByJison {
  lexer: Scanner;
  yy: unknown;

  generate(): string;
  parse(program: string): any;
}

export function print(line: string): void;

export interface Scanner<TokenType = string> {
  yytext: string;
  yyleng: number;
  yylloc: JisonTokenLocation;
  yylineno: number;

  lex(): TokenType;
  setInput(input: string): void;

  pastInput(): string;
  upcomingInput(): string;
  input(): void;
  showPosition(): string;
}

export interface JisonTokenLocation {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
  /** `parser.options.ranges` must be set to `true`, or else this property will be missing. */
  range: [number, number];
}

export interface JisonUnexpectedTokenError<TokenType = string> extends Error {
  hash: {
    text: string | undefined;
    token: TokenType;
    line: number;
    loc: JisonTokenLocation;
    expected: TokenType[];
  };
}

export interface JisonLexError extends Error {
  hash: {
    text: string | undefined;
    token: null;
    line: number;
  };
}
