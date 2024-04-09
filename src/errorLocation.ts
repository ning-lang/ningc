import { ParseResult } from "./parser";
import {
  ArgTypeMismatchError,
  ExpectedValReturnButGotVoidReturnError,
  ExpectedVoidReturnButGotValueReturnError,
  GlobalDefNotFirstError,
  IllegalCommandInGlobalDefError,
  IllegalCommandInQueryDefError,
  MultipleGlobalDefsError,
  NameClashError,
  NameNotFoundError,
  NingTypeError,
  QueryCommandMutatesGlobalVariableError,
  QueryDefBodyLacksInevitableReturnError,
  ReassignedImmutableVariableError,
  ReturnTypeMismatchError,
  SquareTypeMismatchError,
  TypeErrorKind,
} from "./typecheck";

export interface ErrorLocationBoundary {
  kind: "start" | "end";
  codeIndex: number;
}

export function getErrorBoundaries(
  parseResult: ParseResult,
  typeErrors: readonly NingTypeError[]
): ErrorLocationBoundary[] {
  if (!parseResult.succeeded) {
    // TODO: We need to modify the Jison lexer
    // to provide location info.
    return [];
  }

  return typeErrors.flatMap(getBoundariesOfTypeError);
}

function getBoundariesOfTypeError(
  error: NingTypeError
): ErrorLocationBoundary[] {
  switch (error.kind) {
    case TypeErrorKind.GlobalDefNotFirst:
      return getBoundariesOfGlobalDefNotFirstError(error);
    case TypeErrorKind.MultipleGlobalDefs:
      return getBoundariesOfMultipleGlobalDefsError(error);
    case TypeErrorKind.NameClash:
      return getBoundariesOfNameClashError(error);
    case TypeErrorKind.IllegalCommandInGlobalDef:
      return getBoundariesOfIllegalCommandInGlobalDefError(error);
    case TypeErrorKind.IllegalCommandInQueryDef:
      return getBoundariesOfIllegalCommandInQueryDefError(error);
    case TypeErrorKind.QueryCommandMutatesGlobalVariable:
      return getBoundariesOfQueryCommandMutatesGlobalVariableError(error);
    case TypeErrorKind.QueryDefBodyLacksInevitableReturn:
      return getBoundariesOfQueryDefBodyLacksInevitableReturnError(error);
    case TypeErrorKind.ReassignedImmutableVariable:
      return getBoundariesOfReassignedImmutableVariableError(error);
    case TypeErrorKind.ExpectedVoidReturnButGotValueReturn:
      return getBoundariesOfExpectedVoidReturnButGotValueReturnError(error);
    case TypeErrorKind.ExpectedValReturnButGotVoidReturn:
      return getBoundariesOfExpectedValReturnButGotVoidReturnError(error);
    case TypeErrorKind.ReturnTypeMismatch:
      return getBoundariesOfReturnTypeMismatchError(error);
    case TypeErrorKind.ArgTypeMismatch:
      return getBoundariesOfArgTypeMismatchError(error);
    case TypeErrorKind.SquareTypeMismatch:
      return getBoundariesOfSquareTypeMismatchError(error);
    case TypeErrorKind.NameNotFound:
      return getBoundariesOfNameNotFoundError(error);
  }
}

function getBoundariesOfGlobalDefNotFirstError(
  error: GlobalDefNotFirstError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfMultipleGlobalDefsError(
  error: MultipleGlobalDefsError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfNameClashError(
  error: NameClashError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfIllegalCommandInGlobalDefError(
  error: IllegalCommandInGlobalDefError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfIllegalCommandInQueryDefError(
  error: IllegalCommandInQueryDefError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfQueryCommandMutatesGlobalVariableError(
  error: QueryCommandMutatesGlobalVariableError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfQueryDefBodyLacksInevitableReturnError(
  error: QueryDefBodyLacksInevitableReturnError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfReassignedImmutableVariableError(
  error: ReassignedImmutableVariableError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfExpectedVoidReturnButGotValueReturnError(
  error: ExpectedVoidReturnButGotValueReturnError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfExpectedValReturnButGotVoidReturnError(
  error: ExpectedValReturnButGotVoidReturnError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfReturnTypeMismatchError(
  error: ReturnTypeMismatchError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfArgTypeMismatchError(
  error: ArgTypeMismatchError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfSquareTypeMismatchError(
  error: SquareTypeMismatchError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}

function getBoundariesOfNameNotFoundError(
  error: NameNotFoundError
): ErrorLocationBoundary[] {
  // TODO
  return [];
}
