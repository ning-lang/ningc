import { Option } from "rusty-ts";
import * as ast from "./ast";
import { Yy } from "./yy";

export declare const yy: Yy;

export interface TysonTypeDict extends TokenTypeDict, NodeTypeDict {
  optTrailingComma: unknown;
}

interface TokenTypeDict
  extends JavaReservedWordTypeDict,
    SandReservedWordTypeDict,
    SandTokenWithSpecialMeaningInCertainContextsTypeDict,
    NonwordTokenTypeDict,
    NonConstantLiteralTokenTypeDict {
  EOF: "";
  INVALID: string;
}

interface JavaReservedWordTypeDict {
  abstract: "abstract";
  assert: "assert";
  boolean: "boolean";
  break: "break";
  byte: "byte";
  case: "case";
  catch: "catch";
  char: "char";
  class: "class";
  const: "const";
  continue: "continue";
  default: "default";
  do: "do";
  double: "double";
  else: "else";
  enum: "enum";
  extends: "extends";
  final: "final";
  finally: "finally";
  float: "float";
  for: "for";
  goto: "goto";
  if: "if";
  implements: "implements";
  import: "import";
  instanceof: "instanceof";
  int: "int";
  interface: "interface";
  long: "long";
  native: "native";
  new: "new";
  package: "package";
  private: "private";
  protected: "protected";
  public: "public";
  return_: "return";
  short: "short";
  static: "static";
  strictfp: "strictfp";
  super: "super";
  switch: "switch";
  synchronized: "synchronized";
  this: "this";
  throw: "throw";
  throws: "throws";
  transient: "transient";
  try: "try";
  void: "void";
  volatile: "volatile";
  while: "while";
}

interface SandReservedWordTypeDict {
  _: "_";
  as: "as";
  copy: "copy";
  downto: "downto";
  downuntil: "downuntil";
  false: "false";
  in: "in";
  is: "is";
  let: "let";
  loop: "loop";
  never: "never";
  isnot: "isnot";
  null: "null";
  open: "open";
  override: "override";
  prot: "prot";
  pub: "pub";
  repeat: "repeat";
  shadow: "shadow";
  true: "true";
  tryorthrow: "tryorthrow";
  upto: "upto";
  upuntil: "upuntil";
  use: "use";
  var: "var";
  yield: "yield";
  yieldall: "yieldall";
}

interface SandTokenWithSpecialMeaningInCertainContextsTypeDict {
  every: "every";
  get: "get";
  hasbeeninitialized: "hasbeeninitialized";
  priv: "priv";
  set: "set";
  some: "some";
  step: "step";
}

interface NonwordTokenTypeDict {
  "(": "(";
  ")": ")";
  "{": "{";
  "}": "}";
  "[": "[";
  "]": "]";
  ";": ";";
  ",": ",";
  ".": ".";
  "#": "#";
  "&": "&";
  "|": "|";
  ":": ":";
  "=": "=";
  "**=": "**=";
  "*=": "*=";
  "/=": "/=";
  "%=": "%=";
  "+=": "+=";
  "-=": "-=";
  "\\": "\\";
  "->": "->";
  "||": "||";
  "&&": "&&";
  "==": "==";
  "!=": "!=";
  "~=": "~=";
  "!~=": "!~=";
  "===": "===";
  "!==": "!==";
  "<": "<";
  GENERIC_METHOD_TYPE_PARAM_LIST_LEFT_ANGLE_BRACKET: "GENERIC_METHOD_TYPE_PARAM_LIST_LEFT_ANGLE_BRACKET";
  "<=": "<=";
  ">": ">";
  ">=": ">=";
  "~<": "~<";
  "~<=": "~<=";
  "~>": "~>";
  "~>=": "~>=";
  "...": "...";
  "..=": "..=";
  "=..": "=..";
  "=.=": "=.=";
  "+": "+";
  "-": "-";
  "*": "*";
  "/": "/";
  "%": "%";
  "**": "**";
  "!": "!";
  "!<": "!<";
  "?": "?";
  "@": "@";
}

interface NonConstantLiteralTokenTypeDict {
  UNRESERVED_IDENTIFIER: string;
  ESCAPED_IDENTIFIER: string;
  NUMBER_LITERAL: string;
  CHAR_LITERAL: string;
  STRING_LITERAL: string;
}

interface NodeTypeDict {
  optPackageStatement: Option<ast.PackageStatement>;
  optImportStatements: ast.ImportStatement[];
  optUseStatements: ast.UseStatement[];
  pubClassOrInterfaceDeclaration:
    | ast.PubClassDeclaration
    | ast.PubInterfaceDeclaration;
  optPrivClassOrInterfaceDeclarations: (
    | ast.ClassDeclaration
    | ast.InterfaceDeclaration
  )[];
  file: ast.SourceFile;
  packageStatement: ast.PackageStatement;
  oneOrMoreDotSeparatedIdentifiers: ast.Identifier[];
  identifier: ast.Identifier;
  importStatement: ast.ImportStatement;
  oneOrMoreUseStatements: ast.UseStatement[];
  useStatement: ast.UseStatement;
  useStatementWithExplicitAlias: ast.UseSingleItemStatement;
  useStatementWithImplicitAlias: ast.UseSingleItemStatement;
  useAllStatement: ast.UseAllStatement;
  pubClassDeclaration: ast.PubClassDeclaration;
  pubInterfaceDeclaration: ast.PubInterfaceDeclaration;
  classDeclaration: ast.ClassDeclaration & { isPub: false };
  extensibleClassDeclaration: ast.ClassDeclaration & {
    isPub: false;
    extensibility:
      | ast.ExtensibilityLevel.Open
      | ast.ExtensibilityLevel.Abstract;
  };
  finalClassDeclaration: ast.ClassDeclaration & {
    isPub: false;
    extensibility: ast.ExtensibilityLevel.Final;
  };
  extensibilityModifier:
    | ast.ExtensibilityLevel.Open
    | ast.ExtensibilityLevel.Abstract;
  optShadowKeyword: Option<"shadow">;
  optBracketedFormalTypeParams: ast.FormalTypeParamDeclaration[];
  optClassExtensionClause: Option<ast.Type>;
  optImplementsClause: ast.Type[];
  curlyBraceEnclosedClassBody: ClassBody;
  oneOrMoreFormalTypeParams: ast.FormalTypeParamDeclaration[];
  formalTypeParam: ast.FormalTypeParamDeclaration;
  optTypeConstraint: Option<ast.TypeParamConstraint>;
  typeConstraint: ast.TypeParamConstraint;
  extendsConstraint: ast.TypeParamExtendsConstraint;
  superConstraint: ast.TypeParamSuperConstraint;
  oneOrMoreAmpersandSeparatedTypes: ast.Type[];
  type: ast.Type;
  optBracketedActualTypeParams: ast.Type[];
  primitiveTypeLiteral:
    | "int"
    | "short"
    | "long"
    | "byte"
    | "char"
    | "float"
    | "double"
    | "boolean"
    | "void"
    | "never";
  oneOrMoreCommaSeparatedTypes: ast.Type[];
  classExtensionClause: ast.Type;
  implementsClause: ast.Type[];
  oneOrMoreMethodCopyStatements: ast.MethodCopyStatement[];
  oneOrMoreClassItems: ast.ClassItem[];
  methodCopyStatement: ast.MethodCopyStatement;
  classItem: ast.ClassItem;
  classConstructorDeclaration: ast.ClassConstructorDeclaration;
  classDefaultConstructorDeclaration: ast.ClassDefaultConstructorDeclaration;
  classStaticPropertyDeclaration: ast.ClassStaticPropertyDeclaration;
  classStaticMethodDeclaration: ast.ClassStaticMethodDeclaration;
  classInstancePropertyDeclaration: ast.ClassInstancePropertyDeclaration;
  classInstanceMethodDeclaration: ast.ClassInstanceMethodDeclaration;
  classFinalNonOverrideInstanceMethodDeclaration: ast.ClassFinalNonOverrideInstanceMethodDeclaration;
  classFinalOverrideInstanceMethodDeclaration: ast.ClassFinalOverrideInstanceMethodDeclaration;
  classOpenInstanceMethodDeclaration: ast.ClassOpenInstanceMethodDeclaration;
  classAbstractInstanceMethodDeclaration: ast.ClassAbstractInstanceMethodDeclaration;
  classInnerClassDeclaration: ast.ClassInnerClassDeclaration;
  classInnerInterfaceDeclaration: ast.ClassInnerInterfaceDeclaration;
  optVisibilityModifier: Option<
    ast.VisibilityLevel.Protected | ast.VisibilityLevel.Public
  >;
  parenthesizedFormalMethodParamDeclarations: ast.FormalMethodParamDeclaration[];
  methodBody: ast.MethodBody;
  visibilityModifier:
    | ast.VisibilityLevel.Protected
    | ast.VisibilityLevel.Public;
  oneOrMoreFormalMethodParamDeclarations: ast.FormalMethodParamDeclaration[];
  formalMethodParamDeclaration: ast.FormalMethodParamDeclaration;
  oneOrMoreFormalMethodParamModifiers: FormalMethodParamModifiers;
  oneOrMoreStatements: ast.Statement[];
  expression: ast.Expression;
  returnablePseudex: ast.ReturnablePseudex;
  statement: ast.Statement;
  optVariableTypeAnnotation: Option<ast.Type>;
  expressionOrAssignmentPseudex: ast.Expression | ast.AssignmentPseudex;
  propertyAccessorDeclarations: ast.PropertyAccessorDeclarations;
  propertyGetterDeclaration: ast.PropertyGetterDeclaration;
  propertySetterDeclaration: ast.PropertySetterDeclaration;
  variableTypeAnnotation: ast.Type;
  optReturnTypeAnnotation: Option<ast.Type>;
  optThrowsClause: ast.Type[];
  angleBracketEnclosedGenericMethodFormalTypeParams: ast.FormalTypeParamDeclaration[];
  returnTypeAnnotation: ast.Type;
  throwsClause: ast.Type[];
  optAngleBracketEnclosedGenericMethodFormalTypeParams: ast.FormalTypeParamDeclaration[];
  interfaceDeclaration: ast.InterfaceDeclaration & { isPub: false };
  optInterfaceExtensionClause: ast.Type[];
  optInterfaceMethodDeclarations: ast.InterfaceMethodDeclaration[];
  interfaceExtensionClause: ast.Type[];
  interfaceMethodDeclaration: ast.InterfaceMethodDeclaration;
  propertyHasBeenInitializedAssertion: ast.PropertyHasBeenInitializedAssertion;
  blockStatement: ast.BlockStatement;
  ifStatement: ast.IfStatement;
  switchStatement: ast.SwitchStatement;
  returnStatement: ast.ReturnStatement;
  breakStatement: ast.BreakStatement;
  continueStatement: ast.ContinueStatement;
  variableDeclaration: ast.VariableDeclaration;
  variableAssignment: ast.VariableAssignment;
  throwStatement: ast.ThrowStatement;
  whileStatement: ast.WhileStatement;
  doWhileStatement: ast.DoWhileStatement;
  loopStatement: ast.LoopStatement;
  forStatement: ast.ForStatement;
  tryStatement: ast.TryStatement;
  optStatementElseIfClauses: ast.StatementElseIfClause[];
  statementElseClause: ast.BlockStatement;
  statementElseIfClause: ast.StatementElseIfClause;
  oneOrMoreStatementCaseClauses: ast.StatementCaseClause[];
  statementCaseClause: ast.StatementCaseClause;
  oneOrMorePipeSeparatedExpressions: ast.Expression[];
  variableDeclarationKeyword: "let" | "var";
  assignmentPseudex: ast.AssignmentPseudex;
  nonReturnablePseudex: ast.NonReturnablePseudex;
  blockPseudex: ast.BlockPseudex;
  sequentialListFillPseudex: ast.NonEmptyListPseudex;
  nonEmptyListPseudex: ast.NonEmptyListPseudex;
  collectionIterationForPseudex: ast.CollectionIterationForPseudex & {
    outType: ast.ForPseudexOutType.Array;
  };
  rangeForPseudex: ast.RangeForPseudex & {
    outType: ast.ForPseudexOutType.Array;
  };
  optStepClause: Option<ast.Expression>;
  blockYield: ast.BlockYield;
  yieldOrYieldAllKeyword: "yield" | "yieldall";
  expressionOrReturnablePseudex: ast.Expression | ast.ReturnablePseudex;
  arrayForPseudex: ast.ForPseudex & { outType: ast.ForPseudexOutType.Array };
  listForPseudex: ast.ForPseudex & { outType: ast.ForPseudexOutType.List };
  listForIfPseudex: ast.ForIfPseudex;
  collectionIterationForIfPseudex: ast.CollectionIterationForIfPseudex;
  forIfPseudexBody: ForIfPseudexBody;
  rangeForIfPseudex: ast.RangeForIfPseudex;
  oneOrMoreCommaSeparatedExpressions: ast.Expression[];
  oneOrMoreForBindings: ast.ForBinding[];
  forBinding: ast.ForBinding;
  forValueBinding: ast.ForBinding;
  forIndexBinding: ast.ForBinding;
  quantifierPseudex: ast.QuantifierPseudex;
  ifPseudex: ast.IfPseudex;
  ifPseudexWithIfBodyPseudex: ast.IfPseudexWithIfBodyPseudex;
  ifPseudexWithIfBodyExpressionAndAtLeastOnePseudexElseIfClause: ast.IfPseudexWithIfBodyExpressionAndAtLeastOnePseudexElseIfClause;
  ifPseudexWithIfBodyExpressionAndOnlyExpressionElseIfClauses: ast.IfPseudexWithIfBodyExpressionAndOnlyExpressionElseIfClauses;
  switchPseudex: ast.SwitchPseudex;
  switchPseudexWithAtLeastOnePseudexCaseClause: ast.SwitchPseudexWithAtLeastOnePseudexCaseClause;
  switchPseudexWithOneOrMoreExpressionCaseClauses: ast.SwitchPseudexWithOneOrMoreExpressionCaseClauses;
  switchPseudexWithNoCaseClauses: ast.SwitchPseudexWithNoCaseClauses;
  tryPseudex: ast.TryPseudex;
  tryOrThrowPseudex: ast.TryOrThrowPseudex;
  throwPseudex: ast.ThrowPseudex;
  blockExpressionOrBlockPseudex: ast.BlockExpression | ast.BlockPseudex;
  oneOrMoreExpressionElseIfClauses: ast.ExpressionElseIfClause[];
  oneOrMorePseudexElseIfClausesAndOptExpressionElseIfClauses: (
    | ast.ExpressionElseIfClause
    | ast.PseudexElseIfClause
  )[];
  blockExpression: ast.BlockExpression;
  expressionElseIfClause: ast.ExpressionElseIfClause;
  pseudexElseIfClause: ast.PseudexElseIfClause;
  oneOrMorePseudexCaseClausesAndOptExpressionCaseClauses: (
    | ast.ExpressionCaseClause
    | ast.PseudexCaseClause
  )[];
  oneOrMoreExpressionCaseClauses: ast.ExpressionCaseClause[];
  pseudexCaseClause: ast.PseudexCaseClause;
  expressionCaseClause: ast.ExpressionCaseClause;
  oneOrMoreExpressionOrPseudexCatchClauses: (
    | ast.ExpressionCatchClause
    | ast.PseudexCatchClause
  )[];
  expressionOrPseudexCatchClause:
    | ast.ExpressionCatchClause
    | ast.PseudexCatchClause;
  oneOrMorePipeSeparatedTypes: ast.Type[];
  assignableExpression: ast.AssignableExpression;
  collectionIterationForStatement: ast.CollectionIterationForStatement;
  rangeForStatement: ast.RangeForStatement;
  forRangeKeyword: ast.ForStatementRangeType;
  oneOrMoreStatementCatchClauses: ast.StatementCatchClause[];
  statementCatchClause: ast.StatementCatchClause;
  angleBracketlessType: ast.AngleBracketlessType;
  nonassignableExpression: ast.NonAssignableExpression;
  literalExpression: ast.LiteralExpression;
  nullLiteral: ast.NullLiteral;
  trueLiteral: ast.BooleanLiteral & { value: true };
  falseLiteral: ast.FalseLiteral;
  numberLiteral: ast.NumberLiteral;
  charLiteral: ast.CharacterLiteral;
  stringLiteral: ast.StringLiteral;
  arrayLiteral: ast.ArrayLiteral;
  sequentialArrayLiteral: ast.SequentialArrayLiteral;
  defaultValueArrayLiteral: ast.DefaultValueArrayLiteral;
  defaultArrayValue: ast.NumberLiteral | ast.FalseLiteral | ast.NullLiteral;
  emptyListLiteral: ast.EmptyListLiteral;
  methodInvocationExpression: ast.MethodInvocationExpression;
  parenthesizedActualMethodParams: ast.ActualMethodParam[];
  oneOrMoreCommaSeparatedActualMethodParams: ast.ActualMethodParam[];
  actualMethodParam: ast.ActualMethodParam;
  unlabeledActualMethodParam: ast.UnlabeledActualMethodParam;
  labeledActualMethodParam: ast.LabeledActualMethodParam;
  castExpression: ast.CastExpression;
  anonymousInnerClassInstantiationExpression: ast.AnonymousInnerClassInstantiationExpression;
  lambdaExpression: ast.LambdaExpression;
  rangeCheckExpression: ast.RangeCheckExpression;
  isExpression: ast.IsExpression;
  isnotExpression: ast.IsnotExpression;
  postfixExpression: ast.PostfixExpression;
  nonNullAssertionExpression: ast.NonNullAssertionExpression;
  nullableChainingExpression: ast.NullableChainingExpression;
  prefixExpression: ast.PrefixExpression;
  infixExpression: ast.InfixExpression;
  ifExpression: ast.IfExpression;
  switchExpression: ast.SwitchExpression;
  parenthesizedExpression: ast.ParenthesizedExpression;
  angleBracketEnclosedGenericMethodActualTypeParams: ast.Type[];
  anonymousInnerClassInstantiationType: ast.AnonymousInnerClassInstantiationType;
  anonymousInnerClassBody: AnonymousInnerClassBody;
  optAnonymousInnerClassItems: ast.AnonymousInnerClassItem[];
  anonymousInnerClassItem: ast.AnonymousInnerClassItem;
  oneOrMoreCommaSeparatedIdentifiers: ast.Identifier[];
}

interface ClassBody {
  methodCopyStatements: ast.MethodCopyStatement[];
  useStatements: ast.UseStatement[];
  items: ast.ClassItem[];
}

interface FormalMethodParamModifiers {
  isReassignable: boolean;
  doesShadow: boolean;
}

interface ForIfPseudexBody {
  condition: ast.Expression;
  body: ast.BlockYield;
}
interface AnonymousInnerClassBody {
  useStatements: ast.UseStatement[];
  items: ast.AnonymousInnerClassItem[];
}
