%lex

%%
\s+ /* skip whitespace */
\/\/[^\n]* /* skip comments */
"(" return "LPAREN";
")" return "RPAREN";
"[" return "LSQUARE";
"]" return "RSQUARE";
"{" return "LCURLY";
"}" return "RCURLY";
";" return "SEMICOLON";
\"(?:[^"]|\{0x[0-9a-fA-F]+\})*\" return "STRING_LITERAL";
"Command" return "COMMAND_KW";
"Query" return "QUERY_KW";
"Global" return "GLOBAL_KW";
"Number" return "NUMBER_KW";
"String" return "STRING_KW";
"Boolean" return "BOOLEAN_KW";
"List" return "LIST_KW";
[^\s()[\]{};A-Z"]+ return "IDENTIFIER"
<<EOF>> return 'EOF';

/lex

%start file

%%

file
    : zeroOrMoreDefs EOF
        { return $1; }
;

zeroOrMoreDefs
    : zeroOrMoreDefs def
        { $$ = $1; $$.push($2); }
    | /* empty */
        { $$ = []; }
    ;

def : commandDef
    | queryDef
    | globalDef
    ;

commandDef
    : commandKw lparen zeroOrMoreFuncSignatureParts rparen blockCommand
        { $$ = { location: @$, kind: "command_def", commandKw: $1, lparen: $2, signature: $3, rparen: $4, body: $5 }; }
;

queryDef
    : type_ queryKw lparen zeroOrMoreFuncSignatureParts rparen blockCommand
        { $$ = { location: @$, kind: "query_def", returnType: $1, queryKw: $2, lparen: $3, signature: $4, rparen: $5, body: $6 }; }
;

globalDef
    : globalKw blockCommand
        { $$ = { location: @$, kind: "global_def", globalKw: $1, body: $2 }; }
;

zeroOrMoreFuncSignatureParts
    : zeroOrMoreFuncSignatureParts funcSignaturePart
        { $$ = $1; $$.push($2); }
    | /* empty */
        { $$ = []; }
;

funcSignaturePart
    : identifier
    | lparen type_ oneOrMoreIdentifiers rparen
        { $$ = { location: @$, kind: "func_param_def", lparen: $1, paramType: $2, name: $3, rparen: $4 }; }
;

oneOrMoreIdentifiers
    : identifier
        { $$ = [$1]; }
    | oneOrMoreIdentifiers identifier
        { $$ = $1; $$.push($2); }
;

blockCommand
    : lcurly zeroOrMoreCommands rcurly
        { $$ = { location: @$, kind: "block_command", lcurly: $1, commands: $2, rcurly: $3 }; }
;

zeroOrMoreCommands
    : zeroOrMoreCommands command
        { $$ = $1; $$.push($2); }
    | /* empty */
        { $$ = []; }
;

command
    : zeroOrMoreCommandParts semicolon
        { $$ = { location: @$, kind: "command", parts: $1, semicolon: $2 }; }
;

zeroOrMoreCommandParts
    : zeroOrMoreCommandParts commandPart
        { $$ = $1; $$.push($2); }
    | /* empty */
        { $$ = []; }
;

commandPart
    : identifier
    | parenthesizedExpression
    | squareBracketedExpression
    | blockCommand
;

parenthesizedExpression
    : lparen expression rparen
        { $$ = { location: @$, kind: "parenthesized_expression", lparen: $1, expression: $2, rparen: $3 }; }
;

squareBracketedExpression
    : lsquare expression rsquare
        { $$ = { location: @$, kind: "square_bracketed_expression", lsquare: $1, expression: $2, rsquare: $3 }; }
;

expression
    : stringLiteral
    | compoundExpression
;

compoundExpression
    : zeroOrMoreCompoundExpressionParts
        { $$ = { location: @$, kind: "compound_expression", parts: $1 }; }
;

zeroOrMoreCompoundExpressionParts
    : zeroOrMoreCompoundExpressionParts compoundExpressionPart
        { $$ = $1; $$.push($2); }
    | /* empty */
        { $$ = []; }
;

compoundExpressionPart
    : identifier
    | parenthesizedExpression
    | squareBracketedExpression
;

type_
    : numberKw
        { $$ = { location: @$, kind: "type", tokens: [$1], value: "number" }; }
    | stringKw
        { $$ = { location: @$, kind: "type", tokens: [$1], value: "string" }; }
    | booleanKw
        { $$ = { location: @$, kind: "type", tokens: [$1], value: "boolean" }; }
    | numberKw listKw
        { $$ = { location: @$, kind: "type", tokens: [$1, $2], value: "number_list" }; }
    | stringKw listKw
        { $$ = { location: @$, kind: "type", tokens: [$1, $2], value: "string_list" }; }
    | booleanKw listKw
        { $$ = { location: @$, kind: "type", tokens: [$1, $2], value: "boolean_list" }; }
;

lparen
    : LPAREN
        { $$ = { location: @$, kind: "lparen" }; }
;

rparen
    : RPAREN
        { $$ = { location: @$, kind: "rparen" }; }
;

lsquare
    : LSQUARE
        { $$ = { location: @$, kind: "lsquare" }; }
;

rsquare
    : RSQUARE
        { $$ = { location: @$, kind: "rsquare" }; }
;

lcurly
    : LCURLY
        { $$ = { location: @$, kind: "lcurly" }; }
;

rcurly
    : RCURLY
        { $$ = { location: @$, kind: "rcurly" }; }
;

semicolon
    : SEMICOLON
        { $$ = { location: @$, kind: "semicolon" }; }
;

stringLiteral
    : STRING_LITERAL
        { $$ = { location: @$, kind: "string_literal", source: $1 }; }
;

commandKw
    : COMMAND_KW
        { $$ = { location: @$, kind: "command_kw" }; }
;

queryKw
    : QUERY_KW
        { $$ = { location: @$, kind: "query_kw" }; }
;

globalKw
    : GLOBAL_KW
        { $$ = { location: @$, kind: "global_kw" }; }
;

numberKw
    : NUMBER_KW
        { $$ = { location: @$, kind: "number_kw" }; }
;

stringKw
    : STRING_KW
        { $$ = { location: @$, kind: "string_kw" }; }
;

booleanKw
    : BOOLEAN_KW
        { $$ = { location: @$, kind: "boolean_kw" }; }
;

listKw
    : LIST_KW
        { $$ = { location: @$, kind: "list_kw" }; }
;

identifier
    : IDENTIFIER
        { $$ = { location: @$, kind: "identifier", name: $1 }; }
;
