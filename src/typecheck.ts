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

const NUMBER_PARAM = "(Number)";
const STRING_PARAM = "(String)";
const BOOLEAN_PARAM = "(Boolean)";
const NUMBER_LIST_PARAM = "(Number List)";
const STRING_LIST_PARAM = "(String List)";
const BOOLEAN_LIST_PARAM = "(Boolean List)";
const COMMAND_PARAM = "(Command)";
const NUMBER_REF = "[Number]";
const STRING_REF = "[String]";
const BOOLEAN_REF = "[Boolean]";
const NUMBER_LIST_REF = "[Number List]";
const STRING_LIST_REF = "[String List]";
const BOOLEAN_LIST_REF = "[Boolean List]";
const BUILTINS: string[][] = [
  // Control
  ["if", BOOLEAN_PARAM, COMMAND_PARAM],
  ["if", BOOLEAN_LIST_PARAM, COMMAND_PARAM, "else", COMMAND_PARAM],
  ["while", BOOLEAN_PARAM, COMMAND_PARAM],
  ["repeat until", BOOLEAN_PARAM, COMMAND_PARAM],
  ["forever", COMMAND_PARAM],
  ["repeat", NUMBER_PARAM, "times", COMMAND_PARAM],

  // Variables
  ["let", NUMBER_REF, "=", NUMBER_PARAM],
  ["let", STRING_REF, "=", STRING_PARAM],
  ["let", BOOLEAN_REF, "=", BOOLEAN_PARAM],
  ["var", NUMBER_REF, "=", NUMBER_PARAM],
  ["var", STRING_REF, "=", STRING_PARAM],
  ["var", BOOLEAN_REF, "=", BOOLEAN_PARAM],
  ["set", NUMBER_REF, "to", NUMBER_PARAM],
  ["set", STRING_REF, "to", STRING_PARAM],
  ["set", BOOLEAN_REF, "to", BOOLEAN_PARAM],
  ["change", NUMBER_REF, "by", NUMBER_PARAM],

  // Lists
  ["create number list", NUMBER_LIST_REF],
  ["create number list", STRING_LIST_REF],
  ["create number list", BOOLEAN_LIST_REF],
  ["length of", NUMBER_LIST_PARAM],
  ["length of", STRING_LIST_PARAM],
  ["length of", BOOLEAN_LIST_PARAM],
  ["item", NUMBER_PARAM, "of", NUMBER_LIST_PARAM],
  ["item", NUMBER_PARAM, "of", STRING_LIST_PARAM],
  ["item", NUMBER_PARAM, "of", BOOLEAN_LIST_PARAM],
  ["index of", NUMBER_PARAM, "in", NUMBER_LIST_PARAM],
  ["index of", STRING_PARAM, "in", STRING_LIST_PARAM],
  ["index of", BOOLEAN_PARAM, "in", BOOLEAN_LIST_PARAM],
  [NUMBER_LIST_PARAM, "contains", NUMBER_PARAM, "?"],
  [STRING_LIST_PARAM, "contains", STRING_PARAM, "?"],
  [BOOLEAN_LIST_PARAM, "contains", BOOLEAN_PARAM, "?"],
  ["replace item", NUMBER_PARAM, "of", NUMBER_LIST_REF, "with", NUMBER_PARAM],
  ["replace item", NUMBER_PARAM, "of", STRING_LIST_REF, "with", STRING_PARAM],
  ["replace item", NUMBER_PARAM, "of", BOOLEAN_LIST_REF, "with", BOOLEAN_PARAM],
  ["insert", NUMBER_PARAM, "at", NUMBER_PARAM, "of", NUMBER_LIST_REF],
  ["insert", STRING_PARAM, "at", NUMBER_PARAM, "of", STRING_LIST_REF],
  ["insert", BOOLEAN_PARAM, "at", NUMBER_PARAM, "of", BOOLEAN_LIST_REF],
  ["delete item", NUMBER_PARAM, "of", NUMBER_LIST_REF],
  ["delete item", NUMBER_PARAM, "of", STRING_LIST_REF],
  ["delete item", NUMBER_PARAM, "of", BOOLEAN_LIST_REF],
  ["delete all of", NUMBER_LIST_REF],
  ["delete all of", STRING_LIST_REF],
  ["delete all of", BOOLEAN_LIST_REF],
  ["add", NUMBER_PARAM, "to", NUMBER_LIST_REF],
  ["add", STRING_PARAM, "to", STRING_LIST_REF],
  ["add", BOOLEAN_PARAM, "to", BOOLEAN_LIST_REF],

  // Operators
  [NUMBER_PARAM, "+", NUMBER_PARAM],
  [NUMBER_PARAM, "-", NUMBER_PARAM],
  [NUMBER_PARAM, "*", NUMBER_PARAM],
  [NUMBER_PARAM, "/", NUMBER_PARAM],
  [NUMBER_PARAM, "mod", NUMBER_PARAM],
  [NUMBER_PARAM, "to the power of", NUMBER_PARAM],

  [NUMBER_PARAM, "==", NUMBER_PARAM],
  [NUMBER_PARAM, "!=", NUMBER_PARAM],
  [NUMBER_PARAM, "<", NUMBER_PARAM],
  [NUMBER_PARAM, "<=", NUMBER_PARAM],
  [NUMBER_PARAM, ">", NUMBER_PARAM],
  [NUMBER_PARAM, ">=", NUMBER_PARAM],

  ["exp", NUMBER_PARAM],
  ["ln", NUMBER_PARAM],
  ["sin of", NUMBER_PARAM, "degrees"],
  ["cos of", NUMBER_PARAM, "degrees"],
  ["tan of", NUMBER_PARAM, "degrees"],
  ["asin degrees of", NUMBER_PARAM],
  ["acos degrees of", NUMBER_PARAM],
  ["atan degrees of", NUMBER_PARAM],
  ["sin of", NUMBER_PARAM, "radians"],
  ["cos of", NUMBER_PARAM, "radians"],
  ["tan of", NUMBER_PARAM, "radians"],
  ["asin radians of", NUMBER_PARAM],
  ["acos radians of", NUMBER_PARAM],
  ["atan radians of", NUMBER_PARAM],
  ["pi"],
  ["NaN"],
  ["Infinity"],
  ["-Infinity"],

  ["floor", NUMBER_PARAM],
  ["ceiling", NUMBER_PARAM],
  ["round", NUMBER_PARAM],
  ["abs", NUMBER_PARAM],
  ["min of", NUMBER_PARAM, "and", NUMBER_PARAM],
  ["max of", NUMBER_PARAM, "and", NUMBER_PARAM],
  ["clamp", NUMBER_PARAM, "between", NUMBER_PARAM, "and", NUMBER_PARAM],

  [BOOLEAN_PARAM, "and", BOOLEAN_PARAM],
  [BOOLEAN_PARAM, "or", BOOLEAN_PARAM],
  ["not", BOOLEAN_PARAM],

  [STRING_PARAM, "++", STRING_PARAM],
  ["length of", STRING_PARAM],
  ["letter", NUMBER_PARAM, "of", STRING_PARAM],
  ["substring of", STRING_PARAM, "from", NUMBER_PARAM, "to", NUMBER_PARAM],
  [STRING_PARAM, "contains", STRING_PARAM, "?"],
  ["index of", STRING_PARAM, "in", STRING_PARAM],

  ["if", BOOLEAN_PARAM, "then", NUMBER_PARAM, "else", NUMBER_PARAM],
  ["if", BOOLEAN_PARAM, "then", STRING_PARAM, "else", STRING_PARAM],
  ["if", BOOLEAN_PARAM, "then", BOOLEAN_PARAM, "else", BOOLEAN_PARAM],

  ["parse", STRING_PARAM, "as number"],

  ["convert", NUMBER_PARAM, "to string"],
  ["convert", BOOLEAN_PARAM, "to string"],

  ["can", STRING_PARAM, "be parsed as a number?"],
  ["can", STRING_PARAM, "be parsed as a real number?"],
  ["can", STRING_PARAM, "be parsed as an integer?"],

  // Sensing
  ["screen mouse x"],
  ["screen mouse y"],
  ["canvas mouse x"],
  ["canvas mouse y"],
  ["mouse down?"],

  ["screen width"],
  ["screen height"],
  ["canvas width"],
  ["canvas height"],

  ["milliseconds since unix epoch"],
  ["current year"],
  ["current month"],
  ["current date"],
  ["current day of the week"],
  ["current hour"],
  ["current minute"],
  ["current second"],

  ["key", STRING_PARAM, "pressed?"],
];

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
    // TODO
  }
}

function isGlobalDef(def: ast.Def): def is ast.GlobalDef {
  return def.kind === "global_def";
}
