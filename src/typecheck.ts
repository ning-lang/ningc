import { TYPED_BUILTINS } from "./typedBuiltins";
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
  globals: VariableInfo[];

  constructor(private file: TysonTypeDict["file"]) {
    this.errors = [];
    this.globals = [];
  }

  reset(): void {
    this.errors = [];
    this.globals = [];
  }

  typecheck(): NingTypeError[] {
    this.reset();
    this.checkGlobalDefs();

    // TODO: Properly implement this.
    return [];
  }

  checkGlobalDefs() {
    const globalDefs: ast.GlobalDef[] = this.file.filter(isGlobalDef);

    if (globalDefs.length >= 2) {
      this.errors.push({ kind: TypeErrorKind.MultipleGlobalDefs });
    }

    if (globalDefs.length > 0 && this.file[0].kind !== "global_def") {
      this.errors.push({ kind: TypeErrorKind.GlobalDefNotFirst });
    }

    for (const def of globalDefs) {
      this.checkGlobalDef(def);
    }
  }

  checkGlobalDef(def: ast.GlobalDef) {
    for (const command of def.body.commands) {
      this.checkGlobalBodyCommand(command);
    }
  }

  checkGlobalBodyCommand(command: ast.Command) {
    if (this.checkGlobalBodyCommandNumberLetCase(command)) {
      return;
    }

    // TODO
  }

  // Returns true if the command is a (possibly malformed) number let command, false otherwise.
  checkGlobalBodyCommandNumberLetCase(command: ast.Command): boolean {
    const commandMatch = checkCommandMatch(
      command,
      TYPED_BUILTINS.numberLet.signature
    );
    if (!commandMatch.succeeded) {
      return false;
    }

    const square = checkStaticSquare(commandMatch.args[0]);
    if (!square.succeeded) {
      this.errors.push({
        kind: TypeErrorKind.InvalidVariableName,
        attemptedName: commandMatch.args[0],
      });
      return true;
    }

    // TODO: Properly implement this.
    return true;

    // TODO check for name conflict, and if there is none, define the variable.
  }
}

function isGlobalDef(def: ast.Def): def is ast.GlobalDef {
  return def.kind === "global_def";
}

type CommandMatchResult = CommandMatchOk | CommandMatchErr;

export interface CommandMatchOk {
  succeeded: true;
  args: ast.NonIdentifierCommandPart[];
}

export interface CommandMatchErr {
  succeeded: false;
}

function checkCommandMatch(
  command: ast.Command,
  signature: readonly string[]
): CommandMatchResult {
  // TODO: Properly implement this.
  return { succeeded: false };
}

interface VariableInfo {
  name: string;
  mutable: boolean;
}

type StaticSquareResult = StaticSquareOk | StaticSquareErr;

export interface StaticSquareOk {
  succeeded: true;
  nameParts: ast.Identifier[];
}

export interface StaticSquareErr {
  succeeded: false;
}

function checkStaticSquare(part: ast.CommandPart): StaticSquareResult {
  if (!(part.kind === "square_bracketed_identifier_sequence")) {
    return { succeeded: false };
  }

  return { succeeded: true, nameParts: part.identifiers };
}
