import { stringifyIdentifierSequence } from "./funcSignature";
import type * as ast from "./types/tysonTypeDict";

export function stringifyCommand(command: ast.Command): string {
  return "TODO IMPLEMENT stringifyCommand;";
}

export function stringifyExpression(expr: ast.Expression): string {
  if (expr.kind === "string_literal") {
    return expr.source;
  }
  return stringifyCompoundExpression(expr);
}

function stringifyCompoundExpression(expr: ast.CompoundExpression): string {
  return expr.parts.map(stringifyCompoundExpressionPart).join(" ");
}

function stringifyCompoundExpressionPart(
  part: ast.CompoundExpressionPart
): string {
  if (part.kind === "identifier") {
    return part.name;
  }

  if (part.kind === "parenthesized_expression") {
    return "(" + stringifyExpression(part.expression) + ")";
  }

  if (part.kind === "square_bracketed_identifier_sequence") {
    return "[" + stringifyIdentifierSequence(part.identifiers) + "]";
  }

  const _exhaustivnessCheck: never = part;
  return _exhaustivnessCheck;
}
