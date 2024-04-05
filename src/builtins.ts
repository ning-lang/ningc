import { SquareType } from "./typecheck";
import * as ast from "./types/tysonTypeDict";

export const UNTYPED_VAL_SENTINEL = "()";
export const UNTYPED_REF_SENTINEL = "[]";
export const UNTYPED_BLOCK_SENTINEL = "{}";

export const SPECIAL_TYPE_SETS = Symbol("SPECIAL_TYPE_SETS");

export type TypeSet = readonly ast.NingType[];
export type SquareTypeSet = readonly SquareType[];

const ANY_LIST = [
  { isList: true, typeOrElementType: "boolean" },
  { isList: true, typeOrElementType: "number" },
  { isList: true, typeOrElementType: "string" },
] as const;

export const BUILTIN_COMMANDS = {
  // Control

  if_: {
    signature: "if () {}",
    argTypeSets: [["boolean"]],
  },
  ifElse: {
    signature: "if () {} else {}",
    argTypeSets: [["boolean"]],
  },
  while_: {
    signature: "while () {}",
    argTypeSets: [["boolean"]],
  },
  repeat: {
    signature: "repeat () times {}",
    argTypeSets: [["number"]],
  },
  valReturn: {
    signature: "return ()",
    argTypeSets: [["boolean", "number", "string"]],
  },
  voidReturn: {
    signature: "return",
  },

  // Variables

  let_: {
    signature: "let [] = ()",
    argTypeSets: [["boolean", "number", "string"]],
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  var_: {
    signature: "var [] = ()",
    argTypeSets: [["boolean", "number", "string"]],
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  assign: {
    signature: "set [] to ()",
    argTypeSets: SPECIAL_TYPE_SETS,
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  increase: {
    signature: "increase [] by ()",
    argTypeSets: [["number"]],
    squareTypeSets: [[{ isList: false, typeOrElementType: "number" }]],
  },

  // Lists

  numberListCreate: {
    signature: "create number list []",
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  stringListCreate: {
    signature: "create string list []",
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  booleanListCreate: {
    signature: "create boolean list []",
    squareTypeSets: SPECIAL_TYPE_SETS,
  },

  listReplaceItem: {
    signature: "replace item () of [] with ()",
    argTypeSets: SPECIAL_TYPE_SETS,
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  listInsert: {
    signature: "insert () at () of []",
    argTypeSets: SPECIAL_TYPE_SETS,
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  listDeleteItem: {
    signature: "delete item () of []",
    argTypeSets: [["number"]],
    squareTypeSets: [ANY_LIST],
  },
  listDeleteAll: {
    signature: "delete all of []",
    squareTypeSets: [ANY_LIST],
  },
  listAdd: {
    signature: "add () to []",
    argTypeSets: SPECIAL_TYPE_SETS,
    squareTypeSets: SPECIAL_TYPE_SETS,
  },

  // Looks

  resizeCanvas: {
    signature: "resize canvas to width () height () and erase everything",
    argTypeSets: [["number"], ["number"]],
  },
  drawImage: {
    signature: "draw image () at x () y () with width () height ()",
    argTypeSets: [["string"], ["number"], ["number"], ["number"], ["number"]],
  },
  clearRect: {
    signature: "erase rectangle at x () y () width () height ()",
  },
} as const;

export const BUILTIN_QUERIES = {
  // Lists

  listLength: {
    signature: "length of []",
    squareTypeSets: [ANY_LIST],
  },
  listItemOf: {
    signature: "item () of []",
    argTypeSets: [["number"]],
    squareTypeSets: [ANY_LIST],
  },
  listOrIndexOf: {
    signature: "index of () in []",
    argTypeSets: SPECIAL_TYPE_SETS,
    squareTypeSets: SPECIAL_TYPE_SETS,
  },
  listContains: {
    signature: "[] contains ()?",
    argTypeSets: SPECIAL_TYPE_SETS,
    squareTypeSets: SPECIAL_TYPE_SETS,
  },

  // Operators

  opAdd: { signature: "() + ()", argTypeSets: [["number"], ["number"]] },
  opSub: { signature: "() - ()", argTypeSets: [["number"], ["number"]] },
  opMul: { signature: "() * ()", argTypeSets: [["number"], ["number"]] },
  opDiv: { signature: "() / ()", argTypeSets: [["number"], ["number"]] },
  opMod: { signature: "() mod ()", argTypeSets: [["number"], ["number"]] },
  opPow: {
    signature: "() to the power of ()",
    argTypeSets: [["number"], ["number"]],
  },

  opEq: { signature: "() == ()", argTypeSets: SPECIAL_TYPE_SETS },
  opNe: { signature: "() != ()", argTypeSets: SPECIAL_TYPE_SETS },
  opLt: { signature: "() < ()", argTypeSets: [["number"], ["number"]] },
  opLe: { signature: "() <= ()", argTypeSets: [["number"], ["number"]] },
  opGt: { signature: "() > ()", argTypeSets: [["number"], ["number"]] },
  opGe: { signature: "() >= ()", argTypeSets: [["number"], ["number"]] },

  opExp: { signature: "exp ()", argTypeSets: [["number"]] },
  opLn: { signature: "ln ()", argTypeSets: [["number"]] },
  opSinRad: { signature: "sin of () radians", argTypeSets: [["number"]] },
  opCosRad: { signature: "cos of () radians", argTypeSets: [["number"]] },
  opTanRad: { signature: "tan of () radians", argTypeSets: [["number"]] },
  opAsinRad: { signature: "asin of () in radians", argTypeSets: [["number"]] },
  opAcosRad: { signature: "acos of () in radians", argTypeSets: [["number"]] },
  opAtanRad: { signature: "atan of () in radians", argTypeSets: [["number"]] },
  opAtan2Rad: {
    signature: "atan2 of y () x () in radians",
    argTypeSets: [["number"], ["number"]],
  },
  opPi: { signature: "pi" },
  opNaN: { signature: "NaN" },
  opInfinity: { signature: "Infinity" },
  opNegInfinity: { signature: "-Infinity" },

  opFloor: { signature: "floor ()", argTypeSets: [["number"]] },
  opCeil: { signature: "ceiling ()", argTypeSets: [["number"]] },
  opRound: { signature: "round ()", argTypeSets: [["number"]] },
  opAbs: { signature: "abs ()", argTypeSets: [["number"]] },
  opMin: {
    signature: "min of () and ()",
    argTypeSets: [["number"], ["number"]],
  },
  opMax: {
    signature: "max of () and ()",
    argTypeSets: [["number"], ["number"]],
  },

  opAnd: { signature: "() and ()", argTypeSets: [["boolean"], ["boolean"]] },
  opOr: { signature: "() or ()", argTypeSets: [["boolean"], ["boolean"]] },
  opNot: { signature: "not ()", argTypeSets: [["boolean"]] },

  opConcat: { signature: "() ++ ()", argTypeSets: [["string"], ["string"]] },
  stringLength: { signature: "length of ()", argTypeSets: [["string"]] },
  stringLetter: {
    signature: "letter () of ()",
    argTypeSets: [["number"], ["string"]],
  },
  stringSubstring: {
    signature: "substring of () from () to ()",
    argTypeSets: [["string"], ["number"], ["number"]],
  },
  stringContains: {
    signature: "() contains ()?",
    argTypeSets: [["string"], ["string"]],
  },
  stringIndexOf: {
    signature: "index of () in ()",
    argTypeSets: [["string"], ["string"]],
  },

  ternary: {
    signature: "if () then () else ()",
    argTypeSets: SPECIAL_TYPE_SETS,
  },

  parseNumber: { signature: "parse () as number", argTypeSets: [["string"]] },

  numberOrBooleanToString: {
    signature: "convert () to string",
    argTypeSets: [["boolean", "number"]],
  },

  randomInt: {
    signature: "random integer from () up to but not including ()",
    argTypeSets: [["number"], ["number"]],
  },

  // Sensing

  windowMouseX: { signature: "window mouse x" },
  windowMouseY: { signature: "window mouse y" },
  canvasMouseX: { signature: "canvas mouse x" },
  canvasMouseY: { signature: "canvas mouse y" },
  mouseDown: { signature: "mouse down?" },

  windowWidth: { signature: "window width" },
  windowHeight: { signature: "window height" },
  canvasWidth: { signature: "canvas width" },
  canvasHeight: { signature: "canvas height" },

  millisecondsSinceUnixEpoch: {
    signature: "milliseconds since unix epoch",
  },
  currentYear: { signature: "current year" },
  currentMonth: { signature: "current month" },
  currentDate: { signature: "current date" },
  currentDayOfWeek: { signature: "current day of the week" },
  currentHour: { signature: "current hour" },
  currentMinute: { signature: "current minute" },
  currentSecond: { signature: "current second" },

  keyPressed: { signature: "key () pressed?", argTypeSets: [["string"]] },
} as const;
