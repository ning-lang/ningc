import { option } from "rusty-ts";
import { JisonSymbolLocation } from "../../jison";
import { convertToTextRangeIfNeeded, mergeRanges } from "../../textRange";
import { Merge, TextRange } from "../../types";
import * as ast from "../../types/ast";
import { Yy } from "../../types/yy";

interface YyImplPrivateFields {
  nodeIdCounter: number;

  getNodeId(): number;
}

const rawYyImpl: Yy & YyImplPrivateFields = {
  nodeIdCounter: 0,

  getNodeId,

  NodeType: ast.NodeType,
  ExtensibilityLevel: ast.ExtensibilityLevel,
  VisibilityLevel: ast.VisibilityLevel,
  ForBindingType: ast.ForBindingType,
  IfPseudexType: ast.IfPseudexType,
  SwitchPseudexType: ast.SwitchPseudexType,
  ForStatementRangeType: ast.ForStatementRangeType,
  LiteralType: ast.LiteralType,
  ArrayLiteralType: ast.ArrayLiteralType,
  RangeCheckRangeType: ast.RangeCheckRangeType,
  PrefixOperatorType: ast.PrefixOperatorType,
  InfixOperatorType: ast.InfixOperatorType,
  ForPseudexOutType: ast.ForPseudexOutType,
  QuantifierType: ast.QuantifierType,

  option,

  resetNodeIdCounter,
  createNode,
  merge,
  concat,
  mergeLocations: mergeRanges,
};

const yyImpl: Yy = rawYyImpl;

export default yyImpl;

function getNodeId(): number {
  const id = rawYyImpl.nodeIdCounter;
  rawYyImpl.nodeIdCounter++;
  return id;
}

function resetNodeIdCounter(): void {
  rawYyImpl.nodeIdCounter = 0;
}

function createNode(
  nodeType: ast.NodeType.NullableType | ast.NodeType.ArrayType,
  location: JisonSymbolLocation | TextRange,
  fields: {
    baseType: ast.AngleBracketlessType;
  }
): ast.AngleBracketlessType;

function createNode(
  nodeType: ast.NodeType.NullableType,
  location: JisonSymbolLocation | TextRange,
  fields: {
    baseType: ast.NiladicType | ast.InstantiatedGenericType;
  }
):
  | ast.NullableType<ast.NiladicType>
  | ast.NullableType<ast.InstantiatedGenericType>;

function createNode<T extends ast.NodeType, U extends ast.Node<T>>(
  nodeType: T,
  location: JisonSymbolLocation | TextRange,
  fields: Omit<U, "nodeType" | "location">
): U;

function createNode<T extends ast.NodeType, U extends ast.Node<T>>(
  nodeType: T,
  location: JisonSymbolLocation | TextRange,
  fields: Omit<U, "nodeType" | "nodeId" | "location">
): U {
  return {
    ...fields,
    nodeType,
    nodeId: getNodeId(),
    location: convertToTextRangeIfNeeded(location),
  } as unknown as U;
}

function merge<A, B>(a: A, b: B): Merge<A, B> {
  return { ...a, ...b } as Merge<A, B>;
}

function concat<A, B>(a: A[], b: B[]): (A | B)[] {
  return (a as (A | B)[]).concat(b);
}
