import {
  getUntypedFunctionSignatureString,
  stringifyIdentifierSequence,
} from "./funcSignatureString";
import { TysonTypeDict } from "./types/tysonTypeDict";
import type * as ast from "./types/tysonTypeDict";

export type NingTypeError =
  | GlobalDefNotFirstError
  | MultipleGlobalDefsError
  | InvalidVariableNameError;

export enum TypeErrorKind {
  GlobalDefNotFirst = "global_def_not_first",
  MultipleGlobalDefs = "multiple_global_defs",
  InvalidVariableName = "invalid_variable_name",
}

export interface GlobalDefNotFirstError {
  kind: TypeErrorKind.GlobalDefNotFirst;
}

export interface MultipleGlobalDefsError {
  kind: TypeErrorKind.MultipleGlobalDefs;
}

export interface InvalidVariableNameError {
  kind: TypeErrorKind.InvalidVariableName;
  attemptedName: ast.NonIdentifierCommandPart;
}

export function typecheck(file: TysonTypeDict["file"]): NingTypeError[] {
  return new Typechecker(file).typecheck();
}

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

  checkAndRegisterGlobalDefs() {
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

  checkAndRegisterGlobalDef(def: ast.GlobalDef) {
    // TODO
    // for (const command of def.body.commands) {
    // }
  }

  checkAndRegisterQueryDefs() {
    for (const def of this.file) {
      if (def.kind === "query_def") {
        this.checkRegisterQueryDef(def);
      }
    }
  }

  checkRegisterQueryDef(def: ast.QueryDef) {
    this.checkSignatureIsAvailable(def.signature);
    this.checkSignatureParamNamesAreValid(def.signature);
    this.stack.push(getStackEntryWithUncheckedSignatureParams(def.signature));

    for (const command of def.body.commands) {
      this.checkCommand(command, def.returnType.value);
      this.checkCommandIsLegalQueryCommand(command);
    }

    this.checkReturnInEveryBranch(def);

    this.stack.pop();
  }

  checkSignatureIsAvailable(signature: readonly ast.FuncSignaturePart[]) {
    // TODO
  }

  checkSignatureParamNamesAreValid(
    signature: readonly ast.FuncSignaturePart[]
  ) {
    // TODO
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
  checkCommandIsLegalQueryCommand(command: ast.Command) {
    // TODO
  }

  checkReturnInEveryBranch(def: ast.QueryDef) {
    // TODO
  }

  checkAndRegisterCommandDefs() {
    // TODO
  }

  checkCommand(
    command: ast.Command,
    expectedReturnType: null | ast.NingValKind
  ) {
    // TODO
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
  valType: ast.NingValKind;
  mutable: boolean;
}

interface ListInfo {
  elementType: ast.NingValKind;
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
