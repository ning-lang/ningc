import { JisonTokenLocation } from "../jison";

export declare const yy: Yy;

interface Yy {}

export interface TysonTypeDict extends TokenTypeDict, NodeTypeDict {}

interface TokenTypeDict {
  LPAREN: "(";
  RPAREN: ")";
  LSQUARE: "[";
  RSQUARE: "]";
  LCURLY: "{";
  RCURLY: "}";
  SEMICOLON: ";";
  STRING_LITERAL: string;
  COMMAND_KW: "Command";
  QUERY_KW: "Query";
  GLOBAL_KW: "Global";
  NUMBER_KW: "Number";
  STRING_KW: "String";
  BOOLEAN_KW: "Boolean";
  LIST_KW: "List";
  IDENTIFIER: string;
  EOF: unknown;
}

interface NodeTypeDict {
  file: Def[];
  zeroOrMoreDefs: Def[];
  def: Def;
  commandDef: CommandDef;
  queryDef: QueryDef;
  globalDef: GlobalDef;
  zeroOrMoreFuncSignatureParts: FuncSignaturePart[];
  funcSignaturePart: FuncSignaturePart;
  oneOrMoreIdentifiers: Identifier[];
  blockCommand: BlockCommand;
  zeroOrMoreCommands: Command[];
  command: Command;
  zeroOrMoreCommandParts: CommandPart[];
  commandPart: CommandPart;
  parenthesizedExpression: ParenthesizedExpression;
  squareBracketedExpression: SquareBracketedExpression;
  expression: Expression;
  compoundExpression: CompoundExpression;
  zeroOrMoreCompoundExpressionParts: CompoundExpressionPart[];
  compoundExpressionPart: CompoundExpressionPart;
  type_: TypeNode;

  lparen: Token<"lparen">;
  rparen: Token<"rparen">;
  lsquare: Token<"lsquare">;
  rsquare: Token<"rsquare">;
  lcurly: Token<"lcurly">;
  rcurly: Token<"rcurly">;
  semicolon: Token<"semicolon">;
  commandKw: Token<"command_kw">;
  queryKw: Token<"query_kw">;
  globalKw: Token<"global_kw">;
  numberKw: Token<"number_kw">;
  stringKw: Token<"string_kw">;
  booleanKw: Token<"boolean_kw">;
  listKw: Token<"list_kw">;

  stringLiteral: StringLiteral;
  identifier: Identifier;
}

export type Def = CommandDef | QueryDef | GlobalDef;

export interface CommandDef {
  location: JisonTokenLocation;
  kind: "command_def";

  commandKw: Token<"command_kw">;
  lparen: Token<"lparen">;
  signature: FuncSignaturePart[];
  rparen: Token<"rparen">;
  body: BlockCommand;
}

export interface QueryDef {
  location: JisonTokenLocation;
  kind: "query_def";

  returnType: TypeNode;
  queryKw: Token<"query_kw">;
  lparen: Token<"lparen">;
  signature: FuncSignaturePart[];
  rparen: Token<"rparen">;
  body: BlockCommand;
}

export interface GlobalDef {
  location: JisonTokenLocation;
  kind: "global_def";

  globalKw: Token<"global_kw">;
  body: BlockCommand;
}

export type FuncSignaturePart = Identifier | FuncParamDef;

export interface FuncParamDef {
  location: JisonTokenLocation;
  kind: "func_param_def";

  lparen: Token<"lparen">;
  paramType: TypeNode;
  name: Identifier[];
  rparen: Token<"rparen">;
}

export interface BlockCommand {
  location: JisonTokenLocation;
  kind: "block_command";

  lcurly: Token<"lcurly">;
  commands: Command[];
  rcurly: Token<"rcurly">;
}

export interface Command {
  location: JisonTokenLocation;
  kind: "command";

  parts: CommandPart[];
  semicolon: Token<"semicolon">;
}

export type CommandPart =
  | Identifier
  | ParenthesizedExpression
  | SquareBracketedExpression
  | BlockCommand;

export type NonIdentifierCommandPart = Exclude<CommandPart, Identifier>;

export interface ParenthesizedExpression {
  location: JisonTokenLocation;
  kind: "parenthesized_expression";

  lparen: Token<"lparen">;
  expression: Expression;
  rparen: Token<"rparen">;
}

export interface SquareBracketedExpression {
  location: JisonTokenLocation;
  kind: "square_bracketed_expression";

  lsquare: Token<"lsquare">;
  expression: Expression;
  rsquare: Token<"rsquare">;
}

export type Expression = StringLiteral | CompoundExpression;

export interface CompoundExpression {
  location: JisonTokenLocation;
  kind: "compound_expression";

  parts: CompoundExpressionPart[];
}

export type CompoundExpressionPart =
  | Identifier
  | ParenthesizedExpression
  | SquareBracketedExpression;

export interface TypeNode {
  location: JisonTokenLocation;
  kind: "type";

  tokens: Token<TokenKind>[];
  value: Type;
}

export type Type =
  | "number"
  | "string"
  | "boolean"
  | "number_list"
  | "string_list"
  | "boolean_list";

export interface Token<K extends TokenKind> {
  location: JisonTokenLocation;
  kind: K;
}

export type TokenKind =
  | "lparen"
  | "rparen"
  | "lsquare"
  | "rsquare"
  | "lcurly"
  | "rcurly"
  | "semicolon"
  | "command_kw"
  | "query_kw"
  | "global_kw"
  | "number_kw"
  | "string_kw"
  | "boolean_kw"
  | "list_kw"
  | "string_literal"
  | "identifier";

export interface StringLiteral {
  location: JisonTokenLocation;
  kind: "string_literal";
  source: string;
}

export interface Identifier {
  location: JisonTokenLocation;
  kind: "identifier";
  name: string;
}
