/* Builds AST from Sand source. */

%lex

%%
\s+                   /* skip whitespace */
[0-9]+("."[0-9]+)?\b  return '1';
"<"                   return '<';
"%"                   return '%';
">"                   return '>';
<<EOF>>               return 'EOF';

/lex

/* TODO Delete

%nonassoc "=" "**=" "*=" "/=" "%=" "+=" "-="

%nonassoc "->"

%left "||"
%left "&&"

%left "==" "!=" "~=" "!~=" "===" "!=="
%left "<" "<=" ">" ">=" "~<" "~<=" "~>" "~>=" "is" "isnot"

%left "as"

%nonassoc "in" "..." "..=" "=.." "=.="

%left "+" "-"
%left "*" "/" "%"
%right "**"

%nonassoc "!"
%nonassoc "?"

%left "!<"

%nonassoc PREFIX
%nonassoc POSTFIX
%nonassoc ANGLE_BRACKETLESS_TYPE
%nonassoc GENERIC_METHOD_TYPE_PARAM_LIST_LEFT_ANGLE_BRACKET

%nonassoc "["
%nonassoc "("

%left "."
%left "#"

*/

%start file

%%

file
    : expr EOF
        { return $1; }
;

expr
    : "1"
        { $$ = { location: @$, val: $1 } }
    | "<" expr "%" expr ">"
        { $$ = {  location: @$, left: $2, right: $4 } }
    ;
