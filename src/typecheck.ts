import { getCommandApplicationArgsAndSquaresAndBlockCommands } from "./funcApplicationInputs";
import {
  getCommandSignature,
  getFunctionDefSignature,
  stringifyIdentifierSequence,
} from "./funcSignature";
import { TysonTypeDict } from "./types/tysonTypeDict";
import type * as ast from "./types/tysonTypeDict";
import { BUILTIN_COMMANDS } from "./builtins";

export type NingTypeError =
  | GlobalDefNotFirstError
  | MultipleGlobalDefsError
  | NameClashError
  | IllegalCommandInGlobalDefError
  | IllegalCommandInQueryDefError
  | QueryCommandMutatesGlobalVariableError
  | QueryDefBodyLacksInevitableReturnError;

export enum TypeErrorKind {
  GlobalDefNotFirst = "global_def_not_first",
  MultipleGlobalDefs = "multiple_global_defs",
  NameClash = "name_clash",
  IllegalCommandInGlobalDef = "illegal_command_in_global_def",
  IllegalCommandInQueryDef = "illegal_command_in_query_def",
  QueryCommandMutatesGlobalVariable = "query_command_mutates_global_variable",
  QueryDefBodyLacksInevitableReturn = "query_def_body_lacks_inevitable_return",
}

export interface GlobalDefNotFirstError {
  kind: TypeErrorKind.GlobalDefNotFirst;
}

export interface MultipleGlobalDefsError {
  kind: TypeErrorKind.MultipleGlobalDefs;
}

export interface NameClashError {
  kind: TypeErrorKind.NameClash;
  existingDef: NameDef;
  newDef: NameDef;
}

export interface IllegalCommandInGlobalDefError {
  kind: TypeErrorKind.IllegalCommandInGlobalDef;
  command: ast.Command;
}

export interface IllegalCommandInQueryDefError {
  kind: TypeErrorKind.IllegalCommandInQueryDef;
  command: ast.Command;
}

export interface QueryCommandMutatesGlobalVariableError {
  kind: TypeErrorKind.QueryCommandMutatesGlobalVariable;
  command: ast.Command;
  globalVariableDef: NameDef;
}

export interface QueryDefBodyLacksInevitableReturnError {
  kind: TypeErrorKind.QueryDefBodyLacksInevitableReturn;
  def: ast.QueryDef;
}

export type NameDef =
  | ast.Command
  | ast.FuncParamDef
  | ast.QueryDef
  | ast.CommandDef;

export function typecheck(file: TysonTypeDict["file"]): NingTypeError[] {
  return new Typechecker(file).typecheck();
}

const LEGAL_GLOBAL_DEF_BODY_COMMAND_SIGNATURE_STRINGS: Set<string> = new Set([
  BUILTIN_COMMANDS.let_.signature,
  BUILTIN_COMMANDS.var_.signature,
  BUILTIN_COMMANDS.numberListCreate.signature,
  BUILTIN_COMMANDS.stringListCreate.signature,
  BUILTIN_COMMANDS.booleanListCreate.signature,
]);

const LEGAL_QUERY_DEF_BODY_COMMAND_SIGNATURE_STRINGS: Set<string> = new Set([
  BUILTIN_COMMANDS.let_.signature,
  BUILTIN_COMMANDS.var_.signature,
  BUILTIN_COMMANDS.numberListCreate.signature,
  BUILTIN_COMMANDS.stringListCreate.signature,
  BUILTIN_COMMANDS.booleanListCreate.signature,
  BUILTIN_COMMANDS.assign.signature,
  BUILTIN_COMMANDS.increase.signature,
  BUILTIN_COMMANDS.listReplaceItem.signature,
  BUILTIN_COMMANDS.listInsert.signature,
  BUILTIN_COMMANDS.listDeleteItem.signature,
  BUILTIN_COMMANDS.listDeleteAll.signature,
  BUILTIN_COMMANDS.listAdd.signature,
  BUILTIN_COMMANDS.repeat.signature,
  BUILTIN_COMMANDS.if_.signature,
  BUILTIN_COMMANDS.ifElse.signature,
  BUILTIN_COMMANDS.valReturn.signature,
]);

/**
 * This set only includes "leaf" commands, not
 * commands like `if` which contain subcommands.
 */
const LEGAL_QUERY_DEF_BODY_MUTATING_LEAF_COMMAND_SIGNATURE_STRINGS: Set<string> =
  new Set([
    BUILTIN_COMMANDS.assign.signature,
    BUILTIN_COMMANDS.increase.signature,
    BUILTIN_COMMANDS.listReplaceItem.signature,
    BUILTIN_COMMANDS.listInsert.signature,
    BUILTIN_COMMANDS.listDeleteItem.signature,
    BUILTIN_COMMANDS.listDeleteAll.signature,
    BUILTIN_COMMANDS.listAdd.signature,
  ]);

class Typechecker {
  errors: NingTypeError[];
  stack: StackEntry[];
  userQueryDefs: Map<string, ast.QueryDef>;
  userCommandDefs: Map<string, ast.CommandDef>;

  constructor(private file: TysonTypeDict["file"]) {
    this.errors = [];
    this.stack = [getEmptyStackEntry()];
    this.userQueryDefs = new Map();
    this.userCommandDefs = new Map();
  }

  reset(): void {
    this.errors = [];
    this.stack = [getEmptyStackEntry()];
    this.userQueryDefs = new Map();
    this.userCommandDefs = new Map();
  }

  typecheck(): NingTypeError[] {
    this.reset();
    this.checkAndRegisterGlobalDefs();
    this.checkAndRegisterQueryDefs();
    this.checkAndRegisterCommandDefs();
    return this.errors;
  }

  checkAndRegisterGlobalDefs(): void {
    const globalDefs: ast.GlobalDef[] = this.file.filter(isGlobalDef);

    if (globalDefs.length >= 2) {
      this.errors.push({ kind: TypeErrorKind.MultipleGlobalDefs });
    }

    if (globalDefs.length > 0 && this.file[0].kind !== "global_def") {
      this.errors.push({ kind: TypeErrorKind.GlobalDefNotFirst });
    }

    for (const def of globalDefs) {
      this.checkAndRegisterGlobalDef(def);
    }
  }

  checkAndRegisterGlobalDef(def: ast.GlobalDef): void {
    for (const command of def.body.commands) {
      this.checkCommand(command, null);
      this.checkCommandIsLegalGlobalDefBodyCommand(command);
    }
  }

  checkCommandIsLegalGlobalDefBodyCommand(command: ast.Command): void {
    const signature = getCommandSignature(command);
    if (!LEGAL_GLOBAL_DEF_BODY_COMMAND_SIGNATURE_STRINGS.has(signature)) {
      this.errors.push({
        kind: TypeErrorKind.IllegalCommandInGlobalDef,
        command,
      });
    }
  }

  checkAndRegisterQueryDefs(): void {
    for (const def of this.file) {
      if (def.kind === "query_def") {
        this.checkAndRegisterQueryDef(def);
      }
    }
  }

  checkAndRegisterQueryDef(def: ast.QueryDef): void {
    this.checkFuncDefSignatureIsAvailable(def);
    this.checkFuncDefSignatureParamNamesAreValid(def.signature);
    this.stack.push(getStackEntryWithUncheckedSignatureParams(def.signature));

    for (const command of def.body.commands) {
      this.checkCommand(command, def.returnType.value);
      this.checkCommandIsLegalQueryDefBodyCommand(command);
    }

    this.checkQueryDefBodyHasInevitableReturn(def);

    this.stack.pop();

    this.userQueryDefs.set(getFunctionDefSignature(def.signature), def);
  }

  checkFuncDefSignatureIsAvailable(
    funcDef: ast.QueryDef | ast.CommandDef
  ): void {
    const signature = getFunctionDefSignature(funcDef.signature);

    const conflictingVar = this.lookupVar(signature);
    if (conflictingVar !== null) {
      this.errors.push({
        kind: TypeErrorKind.NameClash,
        existingDef: conflictingVar.def,
        newDef: funcDef,
      });
      return;
    }

    const conflictingList = this.lookupList(signature);
    if (conflictingList !== null) {
      this.errors.push({
        kind: TypeErrorKind.NameClash,
        existingDef: conflictingList.def,
        newDef: funcDef,
      });
      return;
    }

    const conflictingUserQueryDef = this.userQueryDefs.get(signature);
    if (conflictingUserQueryDef !== undefined) {
      this.errors.push({
        kind: TypeErrorKind.NameClash,
        existingDef: conflictingUserQueryDef,
        newDef: funcDef,
      });
      return;
    }

    const conflictingUserCommandDef = this.userCommandDefs.get(signature);
    if (conflictingUserCommandDef !== undefined) {
      this.errors.push({
        kind: TypeErrorKind.NameClash,
        existingDef: conflictingUserCommandDef,
        newDef: funcDef,
      });
      return;
    }
  }

  checkFuncDefSignatureParamNamesAreValid(
    signature: readonly ast.FuncSignaturePart[]
  ): void {
    const paramDefMap = new Map<string, ast.FuncParamDef>();

    for (const part of signature) {
      if (part.kind === "identifier") {
        continue;
      }

      const name = stringifyIdentifierSequence(part.name);

      const conflictingVar = this.lookupVar(name);
      if (conflictingVar !== null) {
        this.errors.push({
          kind: TypeErrorKind.NameClash,
          existingDef: conflictingVar.def,
          newDef: part,
        });
        return;
      }

      const conflictingList = this.lookupList(name);
      if (conflictingList !== null) {
        this.errors.push({
          kind: TypeErrorKind.NameClash,
          existingDef: conflictingList.def,
          newDef: part,
        });
        return;
      }

      const conflictingUserQueryDef = this.userQueryDefs.get(name);
      if (conflictingUserQueryDef !== undefined) {
        this.errors.push({
          kind: TypeErrorKind.NameClash,
          existingDef: conflictingUserQueryDef,
          newDef: part,
        });
        return;
      }

      const conflictingUserCommandDef = this.userCommandDefs.get(name);
      if (conflictingUserCommandDef !== undefined) {
        this.errors.push({
          kind: TypeErrorKind.NameClash,
          existingDef: conflictingUserCommandDef,
          newDef: part,
        });
        return;
      }

      const conflictingParamDef = paramDefMap.get(name);
      if (conflictingParamDef !== undefined) {
        this.errors.push({
          kind: TypeErrorKind.NameClash,
          existingDef: conflictingParamDef,
          newDef: part,
        });
        return;
      }

      paramDefMap.set(name, part);
    }
  }

  /**
   * You can only use a limited subset of commands within a query:
   * - `let` and `var`
   * - `create <number|string|boolean> list`
   * - LOCAL variable and list mutation, excluding parameters.
   * - You CANNOT mutate parameters.
   * - `repeat #() times`
   * - `if` and `if else`
   * - `return`
   */
  checkCommandIsLegalQueryDefBodyCommand(command: ast.Command): void {
    this.checkCommandUntypedSignatureIsLegalQueryBodyCommandSignature(command);
    this.checkCommandDoesNotMutateGlobaVariables(command);
  }

  checkCommandUntypedSignatureIsLegalQueryBodyCommandSignature(
    command: ast.Command
  ): void {
    const signature = getCommandSignature(command);
    if (!LEGAL_QUERY_DEF_BODY_COMMAND_SIGNATURE_STRINGS.has(signature)) {
      this.errors.push({
        kind: TypeErrorKind.IllegalCommandInQueryDef,
        command,
      });
    }
  }

  checkCommandDoesNotMutateGlobaVariables(command: ast.Command): void {
    const signature = getCommandSignature(command);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_args, squares, blockCommands] =
      getCommandApplicationArgsAndSquaresAndBlockCommands(command);

    if (signature === BUILTIN_COMMANDS.if_.signature) {
      this.checkBlockCommandDoesNotMutateGlobalVariables(blockCommands[0]);
      return;
    }

    if (signature === BUILTIN_COMMANDS.ifElse.signature) {
      this.checkBlockCommandDoesNotMutateGlobalVariables(blockCommands[0]);
      this.checkBlockCommandDoesNotMutateGlobalVariables(blockCommands[1]);
      return;
    }

    if (signature === BUILTIN_COMMANDS.repeat.signature) {
      this.checkBlockCommandDoesNotMutateGlobalVariables(blockCommands[0]);
      return;
    }

    if (
      !LEGAL_QUERY_DEF_BODY_MUTATING_LEAF_COMMAND_SIGNATURE_STRINGS.has(
        signature
      )
    ) {
      return;
    }

    // Every mutating leaf command that is legal in a query body
    // has exactly one square bracketed identifier sequence,
    // so we can safely assume the target is at index 0.
    const targetName = stringifyIdentifierSequence(squares[0].identifiers);

    const definingStackEntryIndex =
      this.indexOfStackEntryThatDefinesVar(targetName);
    if (definingStackEntryIndex === -1) {
      // If the variable is not defined, we won't complain.
      return;
    }

    if (definingStackEntryIndex === 0) {
      this.errors.push({
        kind: TypeErrorKind.QueryCommandMutatesGlobalVariable,
        command,
        globalVariableDef: this.stack[0].variables.get(targetName)!.def,
      });
    }
  }

  checkBlockCommandDoesNotMutateGlobalVariables(
    blockCommand: ast.BlockCommand
  ): void {
    for (const command of blockCommand.commands) {
      this.checkCommandDoesNotMutateGlobaVariables(command);
    }
  }

  checkQueryDefBodyHasInevitableReturn(def: ast.QueryDef): void {
    const hasInevitableReturn = this.doesBlockCommandHaveInevitableReturn(
      def.body
    );
    if (!hasInevitableReturn) {
      this.errors.push({
        kind: TypeErrorKind.QueryDefBodyLacksInevitableReturn,
        def,
      });
    }
  }

  doesBlockCommandHaveInevitableReturn(
    blockCommand: ast.BlockCommand
  ): boolean {
    for (const command of blockCommand.commands) {
      if (this.doesCommandHaveInevitableReturn(command)) {
        return true;
      }
    }
    return false;
  }

  doesCommandHaveInevitableReturn(command: ast.Command): boolean {
    const signature = getCommandSignature(command);

    if (
      signature === BUILTIN_COMMANDS.valReturn.signature ||
      signature === BUILTIN_COMMANDS.voidReturn.signature
    ) {
      return true;
    }

    if (signature === BUILTIN_COMMANDS.ifElse.signature) {
      const blockCommands =
        getCommandApplicationArgsAndSquaresAndBlockCommands(command)[2];
      return (
        this.doesBlockCommandHaveInevitableReturn(blockCommands[0]) &&
        this.doesBlockCommandHaveInevitableReturn(blockCommands[1])
      );
    }

    return false;
  }

  checkAndRegisterCommandDefs(): void {
    // We need to check and register the signatures before we
    // check the bodies so that recursive references
    // (possibly including mutually recursive references)
    // will work properly.
    this.checkAndRegisterCommandDefSignatures();
    this.checkCommandDefBodies();
  }

  checkAndRegisterCommandDefSignatures(): void {
    for (const def of this.file) {
      if (def.kind === "command_def") {
        this.checkAndRegisterCommandDefSignature(def);
      }
    }
  }

  checkAndRegisterCommandDefSignature(def: ast.CommandDef): void {
    this.checkFuncDefSignatureIsAvailable(def);
    this.checkFuncDefSignatureParamNamesAreValid(def.signature);
    this.userCommandDefs.set(getFunctionDefSignature(def.signature), def);
  }

  checkCommandDefBodies(): void {
    for (const def of this.file) {
      if (def.kind === "command_def") {
        this.checkCommandDefBody(def);
      }
    }
  }

  checkCommandDefBody(def: ast.CommandDef): void {
    this.stack.push(getStackEntryWithUncheckedSignatureParams(def.signature));

    for (const command of def.body.commands) {
      this.checkCommand(command, null);
    }

    this.stack.pop();
  }

  checkCommand(
    command: ast.Command,
    expectedReturnType: null | ast.NingType
  ): void {
    this.checkThatCommandSignatureIsRecognized(command);

    const signature = getCommandSignature(command);
    const [args, squares, blockCommands] =
      getCommandApplicationArgsAndSquaresAndBlockCommands(command);

    const argTypes: (ast.NingType | null)[] = args.map((arg) =>
      this.checkExpressionAndGetType(arg)
    );

    const squareTypes: (SquareType | null)[] = squares.map((square) =>
      this.checkSquareAndGetType(square)
    );

    for (const blockCommand of blockCommands) {
      this.checkBlockCommand(blockCommand, expectedReturnType);
    }

    if (signature === BUILTIN_COMMANDS.valReturn.signature) {
      // TODO: Check return type.
    } else if (signature === BUILTIN_COMMANDS.voidReturn.signature) {
      // TODO: Check return type.
    }

    if (signature === BUILTIN_COMMANDS.assign.signature) {
      // TODO: Check that the target is mutable.
    }

    // TODO: Check input types.

    // TODO: Register variable or list def, if the command `let`, `var`, or `create * list`.
  }

  checkBlockCommand(
    blockCommand: ast.BlockCommand,
    expectedReturnType: null | ast.NingType
  ): void {
    for (const command of blockCommand.commands) {
      this.checkCommand(command, expectedReturnType);
    }
  }

  checkExpressionAndGetType(expr: ast.Expression): ast.NingType | null {
    // TODO
    return null;
  }

  checkSquareAndGetType(
    square: ast.SquareBracketedIdentifierSequence
  ): SquareType | null {
    // TODO
    const name = stringifyIdentifierSequence(square.identifiers);

    for (let i = this.stack.length - 1; i >= 0; --i) {
      const entry = this.stack[i];
      const info = entry.variables.get(name);
      if (info !== undefined) {
        return { isList: false, typeOrElementType: info.valType };
      }
    }

    for (let i = this.stack.length - 1; i >= 0; --i) {
      const entry = this.stack[i];
      const info = entry.lists.get(name);
      if (info !== undefined) {
        return { isList: true, typeOrElementType: info.elementType };
      }
    }

    return null;
  }

  checkThatCommandSignatureIsRecognized(command: ast.Command): void {
    // TODO: Check builtins and userCommands.
  }

  lookupVar(name: string): VariableInfo | null {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const entry = this.stack[i];
      const info = entry.variables.get(name);
      if (info !== undefined) {
        return info;
      }
    }
    return null;
  }

  indexOfStackEntryThatDefinesVar(name: string): number {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const entry = this.stack[i];
      const info = entry.variables.get(name);
      if (info !== undefined) {
        return i;
      }
    }
    return -1;
  }

  lookupList(name: string): ListInfo | null {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const entry = this.stack[i];
      const info = entry.lists.get(name);
      if (info !== undefined) {
        return info;
      }
    }
    return null;
  }
}

function isGlobalDef(def: ast.Def): def is ast.GlobalDef {
  return def.kind === "global_def";
}

interface StackEntry {
  variables: Map<string, VariableInfo>;
  lists: Map<string, ListInfo>;
}

interface VariableInfo {
  valType: ast.NingType;
  mutable: boolean;
  def: NameDef;
}

interface ListInfo {
  elementType: ast.NingType;
  def: ast.Command;
}

interface SquareType {
  isList: boolean;
  typeOrElementType: ast.NingType;
}

function getEmptyStackEntry(): StackEntry {
  return { variables: new Map(), lists: new Map() };
}

function getStackEntryWithUncheckedSignatureParams(
  signature: readonly ast.FuncSignaturePart[]
): StackEntry {
  const variables = new Map<string, VariableInfo>();

  for (const part of signature) {
    if (part.kind === "func_param_def") {
      variables.set(stringifyIdentifierSequence(part.name), {
        valType: part.paramType.value,
        mutable: false,
        def: part,
      });
    }
  }

  return { variables, lists: new Map() };
}

// Difference between commands and queries:
// - Commands have side effects, but do not return a value.
//   Commands may not terminate.
// - Queries return a value, and have no side effects.
//   Queries always terminate.
//   However, queries may not be "pure" in the sense that they
//   may return different outputs for the same inputs.
//   You can only use a limited subset of commands within a query:
//   * `let` and `var`
//   * `create <number|string|boolean> list`
//   * LOCAL variable and list mutation, excluding parameters.
//     You CANNOT mutate parameters.
//   * `repeat #() times` (the finite version)
//   * `if` and `else`
//   * `return`
//   Queries have the additional following restrictions:
//   * Queries cannot circularly depend on each other.
//   * Queries must have a return statement covering the end of
//     every possible branch.
