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

export interface ErrorSpan {
  error: NingTypeError;
  startIndex: number;
  endIndex: number;
}

export function getErrorSpans(
  parseResult: ParseResult,
  typeErrors: readonly NingTypeError[]
): ErrorSpan[] {
  if (!parseResult.succeeded) {
    // TODO: We need to modify the Jison lexer
    // to provide location info.
    return [];
  }

  return typeErrors.flatMap(getSpansOfTypeError);
}

function getSpansOfTypeError(error: NingTypeError): ErrorSpan[] {
  switch (error.kind) {
    case TypeErrorKind.GlobalDefNotFirst:
      return getSpansOfGlobalDefNotFirstError(error);
    case TypeErrorKind.MultipleGlobalDefs:
      return getSpansOfMultipleGlobalDefsError(error);
    case TypeErrorKind.NameClash:
      return getSpansOfNameClashError(error);
    case TypeErrorKind.IllegalCommandInGlobalDef:
      return getSpansOfIllegalCommandInGlobalDefError(error);
    case TypeErrorKind.IllegalCommandInQueryDef:
      return getSpansOfIllegalCommandInQueryDefError(error);
    case TypeErrorKind.QueryCommandMutatesGlobalVariable:
      return getSpansOfQueryCommandMutatesGlobalVariableError(error);
    case TypeErrorKind.QueryDefBodyLacksInevitableReturn:
      return getSpansOfQueryDefBodyLacksInevitableReturnError(error);
    case TypeErrorKind.ReassignedImmutableVariable:
      return getSpansOfReassignedImmutableVariableError(error);
    case TypeErrorKind.ExpectedVoidReturnButGotValueReturn:
      return getSpansOfExpectedVoidReturnButGotValueReturnError(error);
    case TypeErrorKind.ExpectedValReturnButGotVoidReturn:
      return getSpansOfExpectedValReturnButGotVoidReturnError(error);
    case TypeErrorKind.ReturnTypeMismatch:
      return getSpansOfReturnTypeMismatchError(error);
    case TypeErrorKind.ArgTypeMismatch:
      return getSpansOfArgTypeMismatchError(error);
    case TypeErrorKind.SquareTypeMismatch:
      return getSpansOfSquareTypeMismatchError(error);
    case TypeErrorKind.NameNotFound:
      return getSpansOfNameNotFoundError(error);
  }
}

function getSpansOfGlobalDefNotFirstError(
  error: GlobalDefNotFirstError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfMultipleGlobalDefsError(
  error: MultipleGlobalDefsError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfNameClashError(error: NameClashError): ErrorSpan[] {
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
        {
          error,
          startIndex: firstIdent.location.range[0],
          endIndex: lastIdent.location.range[1],
        },
      ];
    }

    case "command_def":
    case "query_def": {
      const firstHeaderPart = newDef.header[0];
      const lastHeaderPart = newDef.header[newDef.header.length - 1];
      return [
        {
          error,
          startIndex: firstHeaderPart.location.range[0],
          endIndex: lastHeaderPart.location.range[1],
        },
      ];
    }

    case "func_param_def": {
      const firstIdent = newDef.name[0];
      const lastIdent = newDef.name[newDef.name.length - 1];
      return [
        {
          error,
          startIndex: firstIdent.location.range[0],
          endIndex: lastIdent.location.range[1],
        },
      ];
    }
  }
}

function getSpansOfIllegalCommandInGlobalDefError(
  error: IllegalCommandInGlobalDefError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfIllegalCommandInQueryDefError(
  error: IllegalCommandInQueryDefError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfQueryCommandMutatesGlobalVariableError(
  error: QueryCommandMutatesGlobalVariableError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfQueryDefBodyLacksInevitableReturnError(
  error: QueryDefBodyLacksInevitableReturnError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfReassignedImmutableVariableError(
  error: ReassignedImmutableVariableError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfExpectedVoidReturnButGotValueReturnError(
  error: ExpectedVoidReturnButGotValueReturnError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfExpectedValReturnButGotVoidReturnError(
  error: ExpectedValReturnButGotVoidReturnError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfReturnTypeMismatchError(
  error: ReturnTypeMismatchError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfArgTypeMismatchError(
  error: ArgTypeMismatchError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfSquareTypeMismatchError(
  error: SquareTypeMismatchError
): ErrorSpan[] {
  // TODO
  return [];
}

function getSpansOfNameNotFoundError(error: NameNotFoundError): ErrorSpan[] {
  // TODO
  return [];
}
