import { BUILTIN_COMMANDS } from "./builtins";
import { getCommandInputs } from "./funcInputs";
import { getCommandSignature } from "./funcSignature";
import { ParseResult } from "./parser";
import { stringifyCommand } from "./stringifyNingNode";
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

const POSSIBLE_NAME_DEF_COMMAND_SIGNATURES: ReadonlySet<string> = new Set([
  BUILTIN_COMMANDS.let_.signature,
  BUILTIN_COMMANDS.var_.signature,
  BUILTIN_COMMANDS.booleanListCreate.signature,
  BUILTIN_COMMANDS.numberListCreate.signature,
  BUILTIN_COMMANDS.stringListCreate.signature,
]);

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
  const { newDef } = error;
  switch (newDef.kind) {
    case "command": {
      // Sanity check
      const signature = getCommandSignature(newDef);
      if (!POSSIBLE_NAME_DEF_COMMAND_SIGNATURES.has(signature)) {
        throw new Error(
          "Impossible: Got NameClashError with non-name-def command: " +
            stringifyCommand(newDef)
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_args, squares] = getCommandInputs(newDef);
      const squareIdents = squares[0].identifiers;
      const firstIdent = squareIdents[0];
      const lastIdent = squareIdents[squareIdents.length - 1];
      return [
        { kind: "start", codeIndex: firstIdent.location.range[0] },
        { kind: "end", codeIndex: lastIdent.location.range[1] },
      ];
    }

    case "command_def":
    case "query_def": {
      const firstHeaderPart = newDef.header[0];
      const lastHeaderPart = newDef.header[newDef.header.length - 1];
      return [
        { kind: "start", codeIndex: firstHeaderPart.location.range[0] },
        { kind: "end", codeIndex: lastHeaderPart.location.range[1] },
      ];
    }

    case "func_param_def": {
      const firstIdent = newDef.name[0];
      const lastIdent = newDef.name[newDef.name.length - 1];
      return [
        { kind: "start", codeIndex: firstIdent.location.range[0] },
        { kind: "end", codeIndex: lastIdent.location.range[1] },
      ];
    }
  }
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
