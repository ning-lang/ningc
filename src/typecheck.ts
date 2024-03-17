import { BUILTINS } from "./builtins";
import { TysonTypeDict } from "./types/tysonTypeDict";
import type * as ast from "./types/tysonTypeDict";

export interface Program {
  execute(env: ExecutionEnvironment): void;
  stop(): void;
}

export interface ExecutionEnvironment {
  canvas: HTMLCanvasElement;
}

export type TypecheckResult = TypecheckOk | TypecheckErr;

export interface TypecheckOk {
  succeeded: true;
  value: Program;
}

export interface TypecheckErr {
  succeeded: false;
  errors: TypeError[];
}

export type TypeError = GlobalDefNotFirstError | MultipleGlobalDefsError;

export enum TypeErrorKind {
  GlobalDefNotFirst = "global_def_not_first",
  MultipleGlobalDefs = "multiple_global_defs",
}

export interface GlobalDefNotFirstError {
  kind: TypeErrorKind.GlobalDefNotFirst;
}

export interface MultipleGlobalDefsError {
  kind: TypeErrorKind.MultipleGlobalDefs;
}

export function typecheck(file: TysonTypeDict["file"]): TypecheckResult {
  return new Typechecker(file).typecheck();
}

class Typechecker {
  errors: TypeError[] = [];

  constructor(private file: TysonTypeDict["file"]) {
    this.errors = [];
  }

  typecheck(): TypecheckResult {
    this.checkGlobalDefs();
    // TODO
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
    if (commandMatches(command, BUILTINS.numberVar.signature)) {
      // TODO check for name conflict, and if there is none, define the variable.
    }
  }
}

function isGlobalDef(def: ast.Def): def is ast.GlobalDef {
  return def.kind === "global_def";
}

function commandMatches(
  command: ast.Command,
  signature: readonly string[]
): boolean {
  // TODO
}
