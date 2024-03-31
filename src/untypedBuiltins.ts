export const UNTYPED_VAL_SENTINEL = "()";
export const UNTYPED_REF_SENTINEL = "[]";
export const UNTYPED_BLOCK_SENTINEL = "{}";

const VAL = UNTYPED_VAL_SENTINEL;
const REF = UNTYPED_REF_SENTINEL;
const BLOCK = UNTYPED_BLOCK_SENTINEL;

export const UNTYPED_BUILTINS = {
  // Control
  if_: {
    isQuery: false,
    signature: ["if", VAL, BLOCK],
  },
  ifElse: {
    isQuery: false,
    signature: ["if", VAL, BLOCK, "else", BLOCK],
  },
  while_: {
    isQuery: false,
    signature: ["while", VAL, BLOCK],
  },
  repeat: {
    isQuery: false,
    signature: ["repeat", VAL, "times", BLOCK],
  },
  valReturn: {
    isQuery: false,
    signature: ["return", VAL],
  },
  voidReturn: {
    isQuery: false,
    signature: ["return"],
  },

  // Variables
  let_: {
    isQuery: false,
    signature: ["let", REF, "=", VAL],
  },
  var_: {
    isQuery: false,
    signature: ["var", REF, "=", VAL],
  },
  assign: {
    isQuery: false,
    signature: ["set", REF, "to", VAL],
  },
  increase: {
    isQuery: false,
    signature: ["increase", REF, "by", VAL],
  },

  // Lists
  numberListCreate: {
    isQuery: false,
    signature: ["create number list", REF],
  },
  stringListCreate: {
    isQuery: false,
    signature: ["create string list", REF],
  },
  booleanListCreate: {
    isQuery: false,
    signature: ["create boolean list", REF],
  },

  listLength: {
    isQuery: true,
    signature: ["length of", REF],
  },

  listItemOf: {
    isQuery: true,
    signature: ["item", VAL, "of", REF],
  },

  listOrIndexOf: {
    isQuery: true,
    signature: ["index of", VAL, "in", REF],
  },

  listContains: {
    isQuery: true,
    signature: [REF, "contains", VAL, "?"],
  },

  listReplaceItem: {
    isQuery: false,
    signature: ["replace item", VAL, "of", REF, "with", VAL],
  },
  listInsert: {
    isQuery: false,
    signature: ["insert", VAL, "at", VAL, "of", REF],
  },
  listDeleteItem: {
    isQuery: false,
    signature: ["delete item", VAL, "of", REF],
  },
  listDeleteAll: {
    isQuery: false,
    signature: ["delete all of", REF],
  },
  listAdd: {
    isQuery: false,
    signature: ["add", VAL, "to", REF],
  },

  // Operators
  opAdd: {
    isQuery: true,
    signature: [VAL, "+", VAL],
  },
  opSub: {
    isQuery: true,
    signature: [VAL, "-", VAL],
  },
  opMul: {
    isQuery: true,
    signature: [VAL, "*", VAL],
  },
  opDiv: {
    isQuery: true,
    signature: [VAL, "/", VAL],
  },
  opMod: {
    isQuery: true,
    signature: [VAL, "mod", VAL],
  },
  opPow: {
    isQuery: true,
    signature: [VAL, "to the power of", VAL],
  },

  opEq: {
    isQuery: true,
    signature: [VAL, "==", VAL],
  },
  opNe: {
    isQuery: true,
    signature: [VAL, "!=", VAL],
  },
  opLt: {
    isQuery: true,
    signature: [VAL, "<", VAL],
  },
  opLe: {
    isQuery: true,
    signature: [VAL, "<=", VAL],
  },
  opGt: {
    isQuery: true,
    signature: [VAL, ">", VAL],
  },
  opGe: {
    isQuery: true,
    signature: [VAL, ">=", VAL],
  },

  opExp: {
    isQuery: true,
    signature: ["exp", VAL],
  },
  opLn: {
    isQuery: true,
    signature: ["ln", VAL],
  },
  opSinRad: {
    isQuery: true,
    signature: ["sin of", VAL, "radians"],
  },
  opCosRad: {
    isQuery: true,
    signature: ["cos of", VAL, "radians"],
  },
  opTanRad: {
    isQuery: true,
    signature: ["tan of", VAL, "radians"],
  },
  opAsinRad: {
    isQuery: true,
    signature: ["asin of", VAL, "in radians"],
  },
  opAcosRad: {
    isQuery: true,
    signature: ["acos of", VAL, "in radians"],
  },
  opAtanRad: {
    isQuery: true,
    signature: ["atan of", VAL, "in radians"],
  },
  opAtan2Rad: {
    isQuery: true,
    signature: ["atan2 of y", VAL, "x", VAL, "in radians"],
  },
  opPi: {
    isQuery: true,
    signature: ["pi"],
  },
  opNaN: {
    isQuery: true,
    signature: ["NaN"],
  },
  opInfinity: {
    isQuery: true,
    signature: ["Infinity"],
  },
  opNegInfinity: {
    isQuery: true,
    signature: ["-Infinity"],
  },

  opFloor: {
    isQuery: true,
    signature: ["floor", VAL],
  },
  opCeil: {
    isQuery: true,
    signature: ["ceiling", VAL],
  },
  opRound: {
    isQuery: true,
    signature: ["round", VAL],
  },
  opAbs: {
    isQuery: true,
    signature: ["abs", VAL],
  },
  opMin: {
    isQuery: true,
    signature: ["min of", VAL, "and", VAL],
  },
  opMax: {
    isQuery: true,
    signature: ["max of", VAL, "and", VAL],
  },

  opAnd: {
    isQuery: true,
    signature: [VAL, "and", VAL],
  },
  opOr: {
    isQuery: true,
    signature: [VAL, "or", VAL],
  },
  opNot: {
    isQuery: true,
    signature: ["not", VAL],
  },

  opConcat: {
    isQuery: true,
    signature: [VAL, "++", VAL],
  },
  stringLength: {
    isQuery: true,
    signature: ["length of", VAL],
  },
  stringLetter: {
    isQuery: true,
    signature: ["letter", VAL, "of", VAL],
  },
  stringSubstring: {
    isQuery: true,
    signature: ["substring of", VAL, "from", VAL, "to", VAL],
  },
  stringContains: {
    isQuery: true,
    signature: [VAL, "contains", VAL, "?"],
  },
  stringIndexOf: {
    isQuery: true,
    signature: ["index of", VAL, "in", VAL],
  },

  ternary: {
    isQuery: true,
    signature: ["if", VAL, "then", VAL, "else", VAL],
  },

  parseNumber: {
    isQuery: true,
    signature: ["parse", VAL, "as number"],
  },

  numberOrBooleanToString: {
    isQuery: true,
    signature: ["convert", VAL, "to string"],
  },

  randomInt: {
    isQuery: true,
    signature: ["random integer from", VAL, "up to but not including", VAL],
  },

  // Sensing
  windowMouseX: {
    isQuery: true,
    signature: ["window mouse x"],
  },
  windowMouseY: {
    isQuery: true,
    signature: ["window mouse y"],
  },
  canvasMouseX: {
    isQuery: true,
    signature: ["canvas mouse x"],
  },
  canvasMouseY: {
    isQuery: true,
    signature: ["canvas mouse y"],
  },
  mouseDown: {
    isQuery: true,
    signature: ["mouse down?"],
  },

  windowWidth: {
    isQuery: true,
    signature: ["window width"],
  },
  windowHeight: {
    isQuery: true,
    signature: ["window height"],
  },
  canvasWidth: {
    isQuery: true,
    signature: ["canvas width"],
  },
  canvasHeight: {
    isQuery: true,
    signature: ["canvas height"],
  },

  millisecondsSinceUnixEpoch: {
    isQuery: true,
    signature: ["milliseconds since unix epoch"],
  },
  currentYear: {
    isQuery: true,
    signature: ["current year"],
  },
  currentMonth: {
    isQuery: true,
    signature: ["current month"],
  },
  currentDate: {
    isQuery: true,
    signature: ["current date"],
  },
  currentDayOfWeek: {
    isQuery: true,
    signature: ["current day of the week"],
  },
  currentHour: {
    isQuery: true,
    signature: ["current hour"],
  },
  currentMinute: {
    isQuery: true,
    signature: ["current minute"],
  },
  currentSecond: {
    isQuery: true,
    signature: ["current second"],
  },

  keyPressed: {
    isQuery: true,
    signature: ["key", VAL, "pressed?"],
  },

  // Looks
  resizeCanvas: {
    isQuery: false,
    signature: ["resize canvas to width", VAL, "height", VAL],
  },
  drawImage: {
    isQuery: false,
    signature: [
      "draw image",
      VAL,
      "at x",
      VAL,
      "y",
      VAL,
      "with width",
      VAL,
      "height",
      VAL,
    ],
  },
} as const;
