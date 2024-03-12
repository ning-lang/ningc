export class Parser implements ParserGeneratedByJison {
  constructor(grammar: any);

  lexer: Scanner;
  yy: any;

  generate(): string;
  parse(program: string): any;
}

export interface ParserGeneratedByJison {
  lexer: Scanner;
  yy: any;

  generate(): string;
  parse(program: string): any;
}

export function print(line: string): void;

export interface Scanner<TokenType = string> {
  yytext: string;
  yyleng: number;
  yylloc: JisonSymbolLocation;
  yylineno: number;

  lex(): TokenType;
  setInput(input: string): void;

  pastInput(): string;
  upcomingInput(): string;
  input(): void;
  showPosition(): string;
}

export interface JisonSymbolLocation {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}

export interface JisonUnexpectedTokenError<TokenType = string> extends Error {
  hash: {
    text: string | undefined;
    token: TokenType;
    line: number;
    loc: JisonSymbolLocation;
    expected: TokenType[];
  };
}
