import { SquareType } from "./typecheck";
import * as ast from "./types/tysonTypeDict";

export const UNTYPED_VAL_SENTINEL = "()";
export const UNTYPED_REF_SENTINEL = "[]";
export const UNTYPED_BLOCK_SENTINEL = "{}";

export const SPECIAL_TYPE_RULES = Symbol("SPECIAL_TYPE_RULES");

export type TypeSet = readonly ast.NingType[];
export type SquareTypeSet = readonly SquareType[];

export const ANY_LIST = [
  { isList: true, typeOrElementType: "boolean" },
  { isList: true, typeOrElementType: "number" },
  { isList: true, typeOrElementType: "string" },
] as const;

export const ANY_ATOM = [
  { isList: false, typeOrElementType: "boolean" },
  { isList: false, typeOrElementType: "number" },
  { isList: false, typeOrElementType: "string" },
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
    squareTypeSets: SPECIAL_TYPE_RULES,
  },
  var_: {
    signature: "var [] = ()",
    argTypeSets: [["boolean", "number", "string"]],
    squareTypeSets: SPECIAL_TYPE_RULES,
  },
  assign: {
    signature: "set [] to ()",
    argTypeSets: SPECIAL_TYPE_RULES,
    squareTypeSets: SPECIAL_TYPE_RULES,
  },
  increase: {
    signature: "increase [] by ()",
    argTypeSets: [["number"]],
    squareTypeSets: [[{ isList: false, typeOrElementType: "number" }]],
  },

  // Lists

  numberListCreate: {
    signature: "create number list []",
    squareTypeSets: SPECIAL_TYPE_RULES,
  },
  stringListCreate: {
    signature: "create string list []",
    squareTypeSets: SPECIAL_TYPE_RULES,
  },
  booleanListCreate: {
    signature: "create boolean list []",
    squareTypeSets: SPECIAL_TYPE_RULES,
  },

  listReplaceItem: {
    signature: "replace item () of [] with ()",
    argTypeSets: SPECIAL_TYPE_RULES,
    squareTypeSets: SPECIAL_TYPE_RULES,
  },
  listInsert: {
    signature: "insert () at () of []",
    argTypeSets: SPECIAL_TYPE_RULES,
    squareTypeSets: SPECIAL_TYPE_RULES,
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
    argTypeSets: SPECIAL_TYPE_RULES,
    squareTypeSets: SPECIAL_TYPE_RULES,
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
    outputType: "number",
  },
  listItemOf: {
    signature: "item () of []",
    argTypeSets: [["number"]],
    squareTypeSets: [ANY_LIST],
    outputType: SPECIAL_TYPE_RULES,
  },
  listIndexOf: {
    signature: "index of () in []",
    argTypeSets: SPECIAL_TYPE_RULES,
    squareTypeSets: SPECIAL_TYPE_RULES,
    outputType: "number",
  },
  listContains: {
    signature: "[] contains ()?",
    argTypeSets: SPECIAL_TYPE_RULES,
    squareTypeSets: SPECIAL_TYPE_RULES,
    outputType: "boolean",
  },

  // Operators

  opAdd: {
    signature: "() + ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },
  opSub: {
    signature: "() - ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },
  opMul: {
    signature: "() * ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },
  opDiv: {
    signature: "() / ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },
  opMod: {
    signature: "() mod ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },
  opPow: {
    signature: "() to the power of ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },

  opEq: {
    signature: "() == ()",
    argTypeSets: SPECIAL_TYPE_RULES,
    outputType: "boolean",
  },
  opNe: {
    signature: "() != ()",
    argTypeSets: SPECIAL_TYPE_RULES,
    outputType: "boolean",
  },
  opLt: {
    signature: "() < ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "boolean",
  },
  opLe: {
    signature: "() <= ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "boolean",
  },
  opGt: {
    signature: "() > ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "boolean",
  },
  opGe: {
    signature: "() >= ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "boolean",
  },

  opExp: {
    signature: "exp ()",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opLn: { signature: "ln ()", argTypeSets: [["number"]], outputType: "number" },
  opSinRad: {
    signature: "sin of () radians",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opCosRad: {
    signature: "cos of () radians",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opTanRad: {
    signature: "tan of () radians",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opAsinRad: {
    signature: "asin of () in radians",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opAcosRad: {
    signature: "acos of () in radians",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opAtanRad: {
    signature: "atan of () in radians",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opAtan2Rad: {
    signature: "atan2 of y () x () in radians",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },
  opPi: { signature: "pi", outputType: "number" },
  opNaN: { signature: "NaN", outputType: "number" },
  opInfinity: { signature: "Infinity", outputType: "number" },
  opNegInfinity: { signature: "-Infinity", outputType: "number" },
  opTrue: { signature: "true", outputType: "boolean" },
  opFalse: { signature: "false", outputType: "boolean" },

  opFloor: {
    signature: "floor ()",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opCeil: {
    signature: "ceiling ()",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opRound: {
    signature: "round ()",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opAbs: {
    signature: "abs ()",
    argTypeSets: [["number"]],
    outputType: "number",
  },
  opMin: {
    signature: "min of () and ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },
  opMax: {
    signature: "max of () and ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },

  opAnd: {
    signature: "() and ()",
    argTypeSets: [["boolean"], ["boolean"]],
    outputType: "boolean",
  },
  opOr: {
    signature: "() or ()",
    argTypeSets: [["boolean"], ["boolean"]],
    outputType: "boolean",
  },
  opNot: {
    signature: "not ()",
    argTypeSets: [["boolean"]],
    outputType: "boolean",
  },

  opConcat: {
    signature: "() ++ ()",
    argTypeSets: [["string"], ["string"]],
    outputType: "string",
  },
  stringLength: {
    signature: "length of ()",
    argTypeSets: [["string"]],
    outputType: "number",
  },
  stringLetter: {
    signature: "letter () of ()",
    argTypeSets: [["number"], ["string"]],
    outputType: "string",
  },
  stringSubstring: {
    signature: "substring of () from () to ()",
    argTypeSets: [["string"], ["number"], ["number"]],
    outputType: "string",
  },
  stringContains: {
    signature: "() contains ()?",
    argTypeSets: [["string"], ["string"]],
    outputType: "boolean",
  },
  stringIndexOf: {
    signature: "index of () in ()",
    argTypeSets: [["string"], ["string"]],
    outputType: "number",
  },

  ternary: {
    signature: "if () then () else ()",
    argTypeSets: SPECIAL_TYPE_RULES,
    outputType: SPECIAL_TYPE_RULES,
  },

  parseNumber: {
    signature: "parse () as number",
    argTypeSets: [["string"]],
    outputType: "number",
  },

  numberOrBooleanToString: {
    signature: "convert () to string",
    argTypeSets: [["boolean", "number"]],
    outputType: "string",
  },

  randomInt: {
    signature: "random integer from () up to but not including ()",
    argTypeSets: [["number"], ["number"]],
    outputType: "number",
  },

  // Sensing

  windowMouseX: { signature: "window mouse x", outputType: "number" },
  windowMouseY: { signature: "window mouse y", outputType: "number" },
  canvasMouseX: { signature: "canvas mouse x", outputType: "number" },
  canvasMouseY: { signature: "canvas mouse y", outputType: "number" },
  mouseDown: { signature: "mouse down?", outputType: "boolean" },

  windowWidth: { signature: "window width", outputType: "number" },
  windowHeight: { signature: "window height", outputType: "number" },
  canvasWidth: { signature: "canvas width", outputType: "number" },
  canvasHeight: { signature: "canvas height", outputType: "number" },

  millisecondsSinceUnixEpoch: {
    signature: "milliseconds since unix epoch",
    outputType: "number",
  },
  currentYear: { signature: "current year", outputType: "number" },
  currentMonth: { signature: "current month", outputType: "number" },
  currentDate: { signature: "current date", outputType: "number" },
  currentDayOfWeek: {
    signature: "current day of the week",
    outputType: "number",
  },
  currentHour: { signature: "current hour", outputType: "number" },
  currentMinute: { signature: "current minute", outputType: "number" },
  currentSecond: { signature: "current second", outputType: "number" },

  keyPressed: {
    signature: "key () pressed?",
    argTypeSets: [["string"]],
    outputType: "boolean",
  },
} as const;

export const BUILTIN_SIGNATURES: ReadonlySet<string> = new Set(
  Object.values(BUILTIN_COMMANDS)
    .map((def): string => def.signature)
    .concat(Object.values(BUILTIN_QUERIES).map((def): string => def.signature))
);
