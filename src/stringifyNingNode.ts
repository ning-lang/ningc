import { stringifyIdentifierSequence } from "./funcSignature";
import type * as ast from "./types/tysonTypeDict";

export const INDENT_SIZE = 4;

export function stringifyCommand(command: ast.Command): string {
  return stringifyCommandWithIndent(command, 0);
}

export function stringifyCommandWithIndent(
  command: ast.Command,
  indentSpaces: number
): string {
  const indent = " ".repeat(indentSpaces);
  return (
    indent +
    command.parts.map((p) => stringifyCommandPart(p, indentSpaces)).join(" ") +
    ";"
  );
}

function stringifyCommandPart(
  part: ast.CommandPart,
  indentSpaces: number
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

  if (part.kind === "block_command") {
    return stringifyBlockCommand(part, indentSpaces);
  }

  const _exhaustivnessCheck: never = part;
  return _exhaustivnessCheck;
}

function stringifyBlockCommand(
  command: ast.BlockCommand,
  indentSpaces: number
): string {
  const indent = " ".repeat(indentSpaces);

  let out = "{";

  for (const c of command.commands) {
    out += "\n" + stringifyCommandWithIndent(c, indentSpaces + INDENT_SIZE);
  }

  if (command.commands.length === 0) {
    out += "}";
  } else {
    out += "\n" + indent + "}";
  }

  return out;
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
