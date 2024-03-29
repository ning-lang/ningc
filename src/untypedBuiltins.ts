export const UNTYPED_SENTINEL = "()";

export const UNTYPED_BUILTINS = {
  // Control
  if_: {
    isQuery: false,
    signature: ["if", UNTYPED_SENTINEL, UNTYPED_SENTINEL],
  },
  ifElse: {
    isQuery: false,
    signature: [
      "if",
      UNTYPED_SENTINEL,
      UNTYPED_SENTINEL,
      "else",
      UNTYPED_SENTINEL,
    ],
  },
  while_: {
    isQuery: false,
    signature: ["while", UNTYPED_SENTINEL, UNTYPED_SENTINEL],
  },
  repeatUntil: {
    isQuery: false,
    signature: ["repeat until", UNTYPED_SENTINEL, UNTYPED_SENTINEL],
  },
  forever: {
    isQuery: false,
    signature: ["forever", UNTYPED_SENTINEL],
  },
  repeat: {
    isQuery: false,
    signature: ["repeat", UNTYPED_SENTINEL, "times", UNTYPED_SENTINEL],
  },
  return_: {
    isQuery: false,
    signature: ["return", UNTYPED_SENTINEL],
  },

  // Variables
  let_: {
    isQuery: false,
    signature: ["let", UNTYPED_SENTINEL, "=", UNTYPED_SENTINEL],
  },
  var_: {
    isQuery: false,
    signature: ["var", UNTYPED_SENTINEL, "=", UNTYPED_SENTINEL],
  },
  assign: {
    isQuery: false,
    signature: ["set", UNTYPED_SENTINEL, "to", UNTYPED_SENTINEL],
  },
  increase: {
    isQuery: false,
    signature: ["change", UNTYPED_SENTINEL, "by", UNTYPED_SENTINEL],
  },

  // Lists
  numberListCreate: {
    isQuery: false,
    signature: ["create number list", UNTYPED_SENTINEL],
  },
  stringListCreate: {
    isQuery: false,
    signature: ["create string list", UNTYPED_SENTINEL],
  },
  booleanListCreate: {
    isQuery: false,
    signature: ["create boolean list", UNTYPED_SENTINEL],
  },

  listOrStringLength: {
    returnType: UNTYPED_SENTINEL,
    signature: ["length of", UNTYPED_SENTINEL],
  },

  listItemOf: {
    isQuery: true,
    signature: ["item", UNTYPED_SENTINEL, "of", UNTYPED_SENTINEL],
  },

  listOrStringIndexOf: {
    isQuery: true,
    signature: ["index of", UNTYPED_SENTINEL, "in", UNTYPED_SENTINEL],
  },

  listOrStringContains: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "contains", UNTYPED_SENTINEL, "?"],
  },

  listReplaceItem: {
    isQuery: false,
    signature: [
      "replace item",
      UNTYPED_SENTINEL,
      "of",
      UNTYPED_SENTINEL,
      "with",
      UNTYPED_SENTINEL,
    ],
  },
  listInsert: {
    isQuery: false,
    signature: [
      "insert",
      UNTYPED_SENTINEL,
      "at",
      UNTYPED_SENTINEL,
      "of",
      UNTYPED_SENTINEL,
    ],
  },
  listDeleteItem: {
    isQuery: false,
    signature: ["delete item", UNTYPED_SENTINEL, "of", UNTYPED_SENTINEL],
  },
  listDeleteAll: {
    isQuery: false,
    signature: ["delete all of", UNTYPED_SENTINEL],
  },
  listAdd: {
    isQuery: false,
    signature: ["add", UNTYPED_SENTINEL, "to", UNTYPED_SENTINEL],
  },

  // Operators
  opAdd: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "+", UNTYPED_SENTINEL],
  },
  opSub: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "-", UNTYPED_SENTINEL],
  },
  opMul: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "*", UNTYPED_SENTINEL],
  },
  opDiv: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "/", UNTYPED_SENTINEL],
  },
  opMod: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "mod", UNTYPED_SENTINEL],
  },
  opPow: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "to the power of", UNTYPED_SENTINEL],
  },

  opEq: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "==", UNTYPED_SENTINEL],
  },
  opNe: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "!=", UNTYPED_SENTINEL],
  },
  opLt: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "<", UNTYPED_SENTINEL],
  },
  opLe: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "<=", UNTYPED_SENTINEL],
  },
  opGt: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, ">", UNTYPED_SENTINEL],
  },
  opGe: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, ">=", UNTYPED_SENTINEL],
  },

  opExp: {
    isQuery: true,
    signature: ["exp", UNTYPED_SENTINEL],
  },
  opLn: {
    isQuery: true,
    signature: ["ln", UNTYPED_SENTINEL],
  },
  opSinDeg: {
    isQuery: true,
    signature: ["sin of", UNTYPED_SENTINEL, "degrees"],
  },
  opCosDeg: {
    isQuery: true,
    signature: ["cos of", UNTYPED_SENTINEL, "degrees"],
  },
  opTanDeg: {
    isQuery: true,
    signature: ["tan of", UNTYPED_SENTINEL, "degrees"],
  },
  opAsinDeg: {
    isQuery: true,
    signature: ["asin degrees of", UNTYPED_SENTINEL],
  },
  opAcosDeg: {
    isQuery: true,
    signature: ["acos degrees of", UNTYPED_SENTINEL],
  },
  opAtanDeg: {
    isQuery: true,
    signature: ["atan degrees of", UNTYPED_SENTINEL],
  },
  opSinRad: {
    isQuery: true,
    signature: ["sin of", UNTYPED_SENTINEL, "radians"],
  },
  opCosRad: {
    isQuery: true,
    signature: ["cos of", UNTYPED_SENTINEL, "radians"],
  },
  opTanRad: {
    isQuery: true,
    signature: ["tan of", UNTYPED_SENTINEL, "radians"],
  },
  opAsinRad: {
    isQuery: true,
    signature: ["asin radians of", UNTYPED_SENTINEL],
  },
  opAcosRad: {
    isQuery: true,
    signature: ["acos radians of", UNTYPED_SENTINEL],
  },
  opAtanRad: {
    isQuery: true,
    signature: ["atan radians of", UNTYPED_SENTINEL],
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
    signature: ["floor", UNTYPED_SENTINEL],
  },
  opCeil: {
    isQuery: true,
    signature: ["ceiling", UNTYPED_SENTINEL],
  },
  opRound: {
    isQuery: true,
    signature: ["round", UNTYPED_SENTINEL],
  },
  opAbs: {
    isQuery: true,
    signature: ["abs", UNTYPED_SENTINEL],
  },
  opMin: {
    isQuery: true,
    signature: ["min of", UNTYPED_SENTINEL, "and", UNTYPED_SENTINEL],
  },
  opMax: {
    isQuery: true,
    signature: ["max of", UNTYPED_SENTINEL, "and", UNTYPED_SENTINEL],
  },
  opClamp: {
    isQuery: true,
    signature: [
      "clamp",
      UNTYPED_SENTINEL,
      "between",
      UNTYPED_SENTINEL,
      "and",
      UNTYPED_SENTINEL,
    ],
  },

  opAnd: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "and", UNTYPED_SENTINEL],
  },
  opOr: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "or", UNTYPED_SENTINEL],
  },
  opNot: {
    isQuery: true,
    signature: ["not", UNTYPED_SENTINEL],
  },

  opConcat: {
    isQuery: true,
    signature: [UNTYPED_SENTINEL, "++", UNTYPED_SENTINEL],
  },
  stringLetter: {
    isQuery: true,
    signature: ["letter", UNTYPED_SENTINEL, "of", UNTYPED_SENTINEL],
  },
  stringSubstring: {
    isQuery: true,
    signature: [
      "substring of",
      UNTYPED_SENTINEL,
      "from",
      UNTYPED_SENTINEL,
      "to",
      UNTYPED_SENTINEL,
    ],
  },

  ternary: {
    isQuery: true,
    signature: [
      "if",
      UNTYPED_SENTINEL,
      "then",
      UNTYPED_SENTINEL,
      "else",
      UNTYPED_SENTINEL,
    ],
  },

  parseNumber: {
    isQuery: true,
    signature: ["parse", UNTYPED_SENTINEL, "as number"],
  },

  numberOrBooleanToString: {
    isQuery: true,
    signature: ["convert", UNTYPED_SENTINEL, "to string"],
  },

  stringCanBeParsedAsNumber: {
    isQuery: true,
    signature: ["can", UNTYPED_SENTINEL, "be parsed as a number?"],
  },
  stringCanBeParsedAsRealNumber: {
    isQuery: true,
    signature: ["can", UNTYPED_SENTINEL, "be parsed as a real number?"],
  },
  stringCanBeParsedAsInteger: {
    isQuery: true,
    signature: ["can", UNTYPED_SENTINEL, "be parsed as an integer?"],
  },

  // Sensing
  screenMouseX: {
    isQuery: true,
    signature: ["screen mouse x"],
  },
  screenMouseY: {
    isQuery: true,
    signature: ["screen mouse y"],
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

  screenWidth: {
    isQuery: true,
    signature: ["screen width"],
  },
  screenHeight: {
    isQuery: true,
    signature: ["screen height"],
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
    signature: ["key", UNTYPED_SENTINEL, "pressed?"],
  },

  // Looks
  resizeCanvas: {
    isQuery: false,
    signature: [
      "resize canvas to width",
      UNTYPED_SENTINEL,
      "height",
      UNTYPED_SENTINEL,
    ],
  },
  drawImage: {
    isQuery: false,
    signature: [
      "draw image",
      UNTYPED_SENTINEL,
      "at x",
      UNTYPED_SENTINEL,
      "y",
      UNTYPED_SENTINEL,
      "with width",
      UNTYPED_SENTINEL,
      "height",
      UNTYPED_SENTINEL,
    ],
  },
} as const;
