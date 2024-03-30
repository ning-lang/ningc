import { TysonTypeDict } from "../../types/tysonTypeDict";

interface TokenLocation {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
  range: [number, number];
}

const semanticActions = {
  "file -> zeroOrMoreDefs EOF"(
    $1: TysonTypeDict["zeroOrMoreDefs"]
  ): TysonTypeDict["file"] {
    let $$: TysonTypeDict["file"];
    return $1;
  },

  "zeroOrMoreDefs -> zeroOrMoreDefs def"(
    $1: TysonTypeDict["zeroOrMoreDefs"],
    $2: TysonTypeDict["def"]
  ): TysonTypeDict["zeroOrMoreDefs"] {
    let $$: TysonTypeDict["zeroOrMoreDefs"];
    $$ = $1;
    $$.push($2);
    return $$;
  },

  "zeroOrMoreDefs -> "(): TysonTypeDict["zeroOrMoreDefs"] {
    let $$: TysonTypeDict["zeroOrMoreDefs"];
    $$ = [];
    return $$;
  },

  "def -> commandDef"($1: TysonTypeDict["commandDef"]): TysonTypeDict["def"] {
    let $$: TysonTypeDict["def"];
    $$ = $1;
    return $$;
  },

  "def -> queryDef"($1: TysonTypeDict["queryDef"]): TysonTypeDict["def"] {
    let $$: TysonTypeDict["def"];
    $$ = $1;
    return $$;
  },

  "def -> globalDef"($1: TysonTypeDict["globalDef"]): TysonTypeDict["def"] {
    let $$: TysonTypeDict["def"];
    $$ = $1;
    return $$;
  },

  "commandDef -> commandKw lparen zeroOrMoreFuncSignatureParts rparen blockCommand"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["commandKw"],
    $2: TysonTypeDict["lparen"],
    $3: TysonTypeDict["zeroOrMoreFuncSignatureParts"],
    $4: TysonTypeDict["rparen"],
    $5: TysonTypeDict["blockCommand"]
  ): TysonTypeDict["commandDef"] {
    let $$: TysonTypeDict["commandDef"];
    $$ = {
      location: yylstack["@$"],
      kind: "command_def",
      commandKw: $1,
      lparen: $2,
      signature: $3,
      rparen: $4,
      body: $5,
    };
    return $$;
  },

  "queryDef -> type_ queryKw lparen zeroOrMoreFuncSignatureParts rparen blockCommand"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["type_"],
    $2: TysonTypeDict["queryKw"],
    $3: TysonTypeDict["lparen"],
    $4: TysonTypeDict["zeroOrMoreFuncSignatureParts"],
    $5: TysonTypeDict["rparen"],
    $6: TysonTypeDict["blockCommand"]
  ): TysonTypeDict["queryDef"] {
    let $$: TysonTypeDict["queryDef"];
    $$ = {
      location: yylstack["@$"],
      kind: "query_def",
      returnType: $1,
      queryKw: $2,
      lparen: $3,
      signature: $4,
      rparen: $5,
      body: $6,
    };
    return $$;
  },

  "globalDef -> globalKw blockCommand"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["globalKw"],
    $2: TysonTypeDict["blockCommand"]
  ): TysonTypeDict["globalDef"] {
    let $$: TysonTypeDict["globalDef"];
    $$ = {
      location: yylstack["@$"],
      kind: "global_def",
      globalKw: $1,
      body: $2,
    };
    return $$;
  },

  "zeroOrMoreFuncSignatureParts -> zeroOrMoreFuncSignatureParts funcSignaturePart"(
    $1: TysonTypeDict["zeroOrMoreFuncSignatureParts"],
    $2: TysonTypeDict["funcSignaturePart"]
  ): TysonTypeDict["zeroOrMoreFuncSignatureParts"] {
    let $$: TysonTypeDict["zeroOrMoreFuncSignatureParts"];
    $$ = $1;
    $$.push($2);
    return $$;
  },

  "zeroOrMoreFuncSignatureParts -> "(): TysonTypeDict["zeroOrMoreFuncSignatureParts"] {
    let $$: TysonTypeDict["zeroOrMoreFuncSignatureParts"];
    $$ = [];
    return $$;
  },

  "funcSignaturePart -> identifier"(
    $1: TysonTypeDict["identifier"]
  ): TysonTypeDict["funcSignaturePart"] {
    let $$: TysonTypeDict["funcSignaturePart"];
    $$ = $1;
    return $$;
  },

  "funcSignaturePart -> lparen type_ oneOrMoreIdentifiers rparen"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["lparen"],
    $2: TysonTypeDict["type_"],
    $3: TysonTypeDict["oneOrMoreIdentifiers"],
    $4: TysonTypeDict["rparen"]
  ): TysonTypeDict["funcSignaturePart"] {
    let $$: TysonTypeDict["funcSignaturePart"];
    $$ = {
      location: yylstack["@$"],
      kind: "func_param_def",
      lparen: $1,
      paramType: $2,
      name: $3,
      rparen: $4,
    };
    return $$;
  },

  "oneOrMoreIdentifiers -> identifier"(
    $1: TysonTypeDict["identifier"]
  ): TysonTypeDict["oneOrMoreIdentifiers"] {
    let $$: TysonTypeDict["oneOrMoreIdentifiers"];
    $$ = [$1];
    return $$;
  },

  "oneOrMoreIdentifiers -> oneOrMoreIdentifiers identifier"(
    $1: TysonTypeDict["oneOrMoreIdentifiers"],
    $2: TysonTypeDict["identifier"]
  ): TysonTypeDict["oneOrMoreIdentifiers"] {
    let $$: TysonTypeDict["oneOrMoreIdentifiers"];
    $$ = $1;
    $$.push($2);
    return $$;
  },

  "blockCommand -> lcurly zeroOrMoreCommands rcurly"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["lcurly"],
    $2: TysonTypeDict["zeroOrMoreCommands"],
    $3: TysonTypeDict["rcurly"]
  ): TysonTypeDict["blockCommand"] {
    let $$: TysonTypeDict["blockCommand"];
    $$ = {
      location: yylstack["@$"],
      kind: "block_command",
      lcurly: $1,
      commands: $2,
      rcurly: $3,
    };
    return $$;
  },

  "zeroOrMoreCommands -> zeroOrMoreCommands command"(
    $1: TysonTypeDict["zeroOrMoreCommands"],
    $2: TysonTypeDict["command"]
  ): TysonTypeDict["zeroOrMoreCommands"] {
    let $$: TysonTypeDict["zeroOrMoreCommands"];
    $$ = $1;
    $$.push($2);
    return $$;
  },

  "zeroOrMoreCommands -> "(): TysonTypeDict["zeroOrMoreCommands"] {
    let $$: TysonTypeDict["zeroOrMoreCommands"];
    $$ = [];
    return $$;
  },

  "command -> zeroOrMoreCommandParts semicolon"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["zeroOrMoreCommandParts"],
    $2: TysonTypeDict["semicolon"]
  ): TysonTypeDict["command"] {
    let $$: TysonTypeDict["command"];
    $$ = {
      location: yylstack["@$"],
      kind: "command",
      parts: $1,
      semicolon: $2,
    };
    return $$;
  },

  "zeroOrMoreCommandParts -> zeroOrMoreCommandParts commandPart"(
    $1: TysonTypeDict["zeroOrMoreCommandParts"],
    $2: TysonTypeDict["commandPart"]
  ): TysonTypeDict["zeroOrMoreCommandParts"] {
    let $$: TysonTypeDict["zeroOrMoreCommandParts"];
    $$ = $1;
    $$.push($2);
    return $$;
  },

  "zeroOrMoreCommandParts -> "(): TysonTypeDict["zeroOrMoreCommandParts"] {
    let $$: TysonTypeDict["zeroOrMoreCommandParts"];
    $$ = [];
    return $$;
  },

  "commandPart -> identifier"(
    $1: TysonTypeDict["identifier"]
  ): TysonTypeDict["commandPart"] {
    let $$: TysonTypeDict["commandPart"];
    $$ = $1;
    return $$;
  },

  "commandPart -> parenthesizedExpression"(
    $1: TysonTypeDict["parenthesizedExpression"]
  ): TysonTypeDict["commandPart"] {
    let $$: TysonTypeDict["commandPart"];
    $$ = $1;
    return $$;
  },

  "commandPart -> squareBracketedIdentifierSequence"(
    $1: TysonTypeDict["squareBracketedIdentifierSequence"]
  ): TysonTypeDict["commandPart"] {
    let $$: TysonTypeDict["commandPart"];
    $$ = $1;
    return $$;
  },

  "commandPart -> blockCommand"(
    $1: TysonTypeDict["blockCommand"]
  ): TysonTypeDict["commandPart"] {
    let $$: TysonTypeDict["commandPart"];
    $$ = $1;
    return $$;
  },

  "parenthesizedExpression -> lparen expression rparen"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["lparen"],
    $2: TysonTypeDict["expression"],
    $3: TysonTypeDict["rparen"]
  ): TysonTypeDict["parenthesizedExpression"] {
    let $$: TysonTypeDict["parenthesizedExpression"];
    $$ = {
      location: yylstack["@$"],
      kind: "parenthesized_expression",
      lparen: $1,
      expression: $2,
      rparen: $3,
    };
    return $$;
  },

  "squareBracketedIdentifierSequence -> lsquare oneOrMoreIdentifiers rsquare"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["lsquare"],
    $2: TysonTypeDict["oneOrMoreIdentifiers"],
    $3: TysonTypeDict["rsquare"]
  ): TysonTypeDict["squareBracketedIdentifierSequence"] {
    let $$: TysonTypeDict["squareBracketedIdentifierSequence"];
    $$ = {
      location: yylstack["@$"],
      kind: "square_bracketed_identifier_sequence",
      lsquare: $1,
      identifiers: $2,
      rsquare: $3,
    };
    return $$;
  },

  "expression -> stringLiteral"(
    $1: TysonTypeDict["stringLiteral"]
  ): TysonTypeDict["expression"] {
    let $$: TysonTypeDict["expression"];
    $$ = $1;
    return $$;
  },

  "expression -> compoundExpression"(
    $1: TysonTypeDict["compoundExpression"]
  ): TysonTypeDict["expression"] {
    let $$: TysonTypeDict["expression"];
    $$ = $1;
    return $$;
  },

  "compoundExpression -> zeroOrMoreCompoundExpressionParts"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["zeroOrMoreCompoundExpressionParts"]
  ): TysonTypeDict["compoundExpression"] {
    let $$: TysonTypeDict["compoundExpression"];
    $$ = { location: yylstack["@$"], kind: "compound_expression", parts: $1 };
    return $$;
  },

  "zeroOrMoreCompoundExpressionParts -> zeroOrMoreCompoundExpressionParts compoundExpressionPart"(
    $1: TysonTypeDict["zeroOrMoreCompoundExpressionParts"],
    $2: TysonTypeDict["compoundExpressionPart"]
  ): TysonTypeDict["zeroOrMoreCompoundExpressionParts"] {
    let $$: TysonTypeDict["zeroOrMoreCompoundExpressionParts"];
    $$ = $1;
    $$.push($2);
    return $$;
  },

  "zeroOrMoreCompoundExpressionParts -> "(): TysonTypeDict["zeroOrMoreCompoundExpressionParts"] {
    let $$: TysonTypeDict["zeroOrMoreCompoundExpressionParts"];
    $$ = [];
    return $$;
  },

  "compoundExpressionPart -> identifier"(
    $1: TysonTypeDict["identifier"]
  ): TysonTypeDict["compoundExpressionPart"] {
    let $$: TysonTypeDict["compoundExpressionPart"];
    $$ = $1;
    return $$;
  },

  "compoundExpressionPart -> parenthesizedExpression"(
    $1: TysonTypeDict["parenthesizedExpression"]
  ): TysonTypeDict["compoundExpressionPart"] {
    let $$: TysonTypeDict["compoundExpressionPart"];
    $$ = $1;
    return $$;
  },

  "compoundExpressionPart -> squareBracketedIdentifierSequence"(
    $1: TysonTypeDict["squareBracketedIdentifierSequence"]
  ): TysonTypeDict["compoundExpressionPart"] {
    let $$: TysonTypeDict["compoundExpressionPart"];
    $$ = $1;
    return $$;
  },

  "type_ -> numberKw"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["numberKw"]
  ): TysonTypeDict["type_"] {
    let $$: TysonTypeDict["type_"];
    $$ = {
      location: yylstack["@$"],
      kind: "type",
      tokens: [$1],
      value: "number",
    };
    return $$;
  },

  "type_ -> stringKw"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["stringKw"]
  ): TysonTypeDict["type_"] {
    let $$: TysonTypeDict["type_"];
    $$ = {
      location: yylstack["@$"],
      kind: "type",
      tokens: [$1],
      value: "string",
    };
    return $$;
  },

  "type_ -> booleanKw"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["booleanKw"]
  ): TysonTypeDict["type_"] {
    let $$: TysonTypeDict["type_"];
    $$ = {
      location: yylstack["@$"],
      kind: "type",
      tokens: [$1],
      value: "boolean",
    };
    return $$;
  },

  "lparen -> LPAREN"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["lparen"] {
    let $$: TysonTypeDict["lparen"];
    $$ = { location: yylstack["@$"], kind: "lparen" };
    return $$;
  },

  "rparen -> RPAREN"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["rparen"] {
    let $$: TysonTypeDict["rparen"];
    $$ = { location: yylstack["@$"], kind: "rparen" };
    return $$;
  },

  "lsquare -> LSQUARE"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["lsquare"] {
    let $$: TysonTypeDict["lsquare"];
    $$ = { location: yylstack["@$"], kind: "lsquare" };
    return $$;
  },

  "rsquare -> RSQUARE"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["rsquare"] {
    let $$: TysonTypeDict["rsquare"];
    $$ = { location: yylstack["@$"], kind: "rsquare" };
    return $$;
  },

  "lcurly -> LCURLY"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["lcurly"] {
    let $$: TysonTypeDict["lcurly"];
    $$ = { location: yylstack["@$"], kind: "lcurly" };
    return $$;
  },

  "rcurly -> RCURLY"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["rcurly"] {
    let $$: TysonTypeDict["rcurly"];
    $$ = { location: yylstack["@$"], kind: "rcurly" };
    return $$;
  },

  "semicolon -> SEMICOLON"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["semicolon"] {
    let $$: TysonTypeDict["semicolon"];
    $$ = { location: yylstack["@$"], kind: "semicolon" };
    return $$;
  },

  "stringLiteral -> STRING_LITERAL"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["STRING_LITERAL"]
  ): TysonTypeDict["stringLiteral"] {
    let $$: TysonTypeDict["stringLiteral"];
    $$ = { location: yylstack["@$"], kind: "string_literal", source: $1 };
    return $$;
  },

  "commandKw -> COMMAND_KW"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["commandKw"] {
    let $$: TysonTypeDict["commandKw"];
    $$ = { location: yylstack["@$"], kind: "command_kw" };
    return $$;
  },

  "queryKw -> QUERY_KW"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["queryKw"] {
    let $$: TysonTypeDict["queryKw"];
    $$ = { location: yylstack["@$"], kind: "query_kw" };
    return $$;
  },

  "globalKw -> GLOBAL_KW"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["globalKw"] {
    let $$: TysonTypeDict["globalKw"];
    $$ = { location: yylstack["@$"], kind: "global_kw" };
    return $$;
  },

  "numberKw -> NUMBER_KW"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["numberKw"] {
    let $$: TysonTypeDict["numberKw"];
    $$ = { location: yylstack["@$"], kind: "number_kw" };
    return $$;
  },

  "stringKw -> STRING_KW"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["stringKw"] {
    let $$: TysonTypeDict["stringKw"];
    $$ = { location: yylstack["@$"], kind: "string_kw" };
    return $$;
  },

  "booleanKw -> BOOLEAN_KW"(yylstack: {
    "@$": TokenLocation;
  }): TysonTypeDict["booleanKw"] {
    let $$: TysonTypeDict["booleanKw"];
    $$ = { location: yylstack["@$"], kind: "boolean_kw" };
    return $$;
  },

  "identifier -> IDENTIFIER"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["IDENTIFIER"]
  ): TysonTypeDict["identifier"] {
    let $$: TysonTypeDict["identifier"];
    $$ = { location: yylstack["@$"], kind: "identifier", name: $1 };
    return $$;
  },
};
