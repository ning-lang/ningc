import type * as ast from "./types/tysonTypeDict";
import {
  UNTYPED_BLOCK_SENTINEL,
  UNTYPED_REF_SENTINEL,
  UNTYPED_VAL_SENTINEL,
} from "./builtins";

export function stringifyIdentifierSequence(
  seq: readonly ast.Identifier[]
): string {
  return seq.map((id) => id.name).join(" ");
}

export function getFunctionDefSignature(
  signature: readonly ast.FuncHeaderPart[]
): string {
  return (
    signature
      // eslint-disable-next-line array-callback-return
      .map((p): string => {
        switch (p.kind) {
          case "identifier":
            return p.name;
          case "func_param_def":
            return UNTYPED_VAL_SENTINEL;
        }
      })
      .join(" ")
  );
}

export function getQuerySignature(expr: ast.CompoundExpression): string {
  return (
    expr.parts
      // eslint-disable-next-line array-callback-return
      .map((p): string => {
        switch (p.kind) {
          case "identifier":
            return p.name;
          case "parenthesized_expression":
            return UNTYPED_VAL_SENTINEL;
          case "square_bracketed_identifier_sequence":
            return UNTYPED_REF_SENTINEL;
        }
      })
      .join(" ")
  );
}

export function getCommandSignature(expr: ast.Command): string {
  return (
    expr.parts
      // eslint-disable-next-line array-callback-return
      .map((p): string => {
        switch (p.kind) {
          case "identifier":
            return p.name;
          case "parenthesized_expression":
            return UNTYPED_VAL_SENTINEL;
          case "square_bracketed_identifier_sequence":
            return UNTYPED_REF_SENTINEL;
          case "block_command":
            return UNTYPED_BLOCK_SENTINEL;
        }
      })
      .join(" ")
  );
}
