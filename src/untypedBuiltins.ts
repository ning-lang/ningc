export const UNTYPED_SENTINEL = "()";

export const UNTYPED_BUILTINS = {
  // Control
  if_: {
    returnsValue: false,
    signature: ["if", UNTYPED_SENTINEL, UNTYPED_SENTINEL],
  },
  ifElse: {
    returnsValue: false,
    signature: [
      "if",
      UNTYPED_SENTINEL,
      UNTYPED_SENTINEL,
      "else",
      UNTYPED_SENTINEL,
    ],
  },
  while_: {
    returnsValue: false,
    signature: ["while", UNTYPED_SENTINEL, UNTYPED_SENTINEL],
  },
  repeatUntil: {
    returnsValue: false,
    signature: ["repeat until", UNTYPED_SENTINEL, UNTYPED_SENTINEL],
  },
  forever: {
    returnsValue: false,
    signature: ["forever", UNTYPED_SENTINEL],
  },
  repeat: {
    returnsValue: false,
    signature: ["repeat", UNTYPED_SENTINEL, "times", UNTYPED_SENTINEL],
  },

  // Variables
  let_: {
    returnsValue: false,
    signature: ["let", UNTYPED_SENTINEL, "=", UNTYPED_SENTINEL],
  },
  var_: {
    returnsValue: false,
    signature: ["var", UNTYPED_SENTINEL, "=", UNTYPED_SENTINEL],
  },
  assign: {
    returnsValue: false,
    signature: ["set", UNTYPED_SENTINEL, "to", UNTYPED_SENTINEL],
  },
  increase: {
    returnsValue: false,
    signature: ["change", UNTYPED_SENTINEL, "by", UNTYPED_SENTINEL],
  },

  // Lists
  numberListCreate: {
    returnsValue: false,
    signature: ["create number list", UNTYPED_SENTINEL],
  },
  stringListCreate: {
    returnsValue: false,
    signature: ["create string list", UNTYPED_SENTINEL],
  },
  booleanListCreate: {
    returnsValue: false,
    signature: ["create boolean list", UNTYPED_SENTINEL],
  },

  listOrStringLength: {
    returnType: UNTYPED_SENTINEL,
    signature: ["length of", UNTYPED_SENTINEL],
  },

  listItemOf: {
    returnsValue: true,
    signature: ["item", UNTYPED_SENTINEL, "of", UNTYPED_SENTINEL],
  },

  listOrStringIndexOf: {
    returnsValue: true,
    signature: ["index of", UNTYPED_SENTINEL, "in", UNTYPED_SENTINEL],
  },

  listOrStringContains: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "contains", UNTYPED_SENTINEL, "?"],
  },

  listReplaceItem: {
    returnsValue: false,
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
    returnsValue: false,
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
    returnsValue: false,
    signature: ["delete item", UNTYPED_SENTINEL, "of", UNTYPED_SENTINEL],
  },
  listDeleteAll: {
    returnsValue: false,
    signature: ["delete all of", UNTYPED_SENTINEL],
  },
  listAdd: {
    returnsValue: false,
    signature: ["add", UNTYPED_SENTINEL, "to", UNTYPED_SENTINEL],
  },

  // Operators
  opAdd: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "+", UNTYPED_SENTINEL],
  },
  opSub: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "-", UNTYPED_SENTINEL],
  },
  opMul: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "*", UNTYPED_SENTINEL],
  },
  opDiv: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "/", UNTYPED_SENTINEL],
  },
  opMod: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "mod", UNTYPED_SENTINEL],
  },
  opPow: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "to the power of", UNTYPED_SENTINEL],
  },

  opEq: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "==", UNTYPED_SENTINEL],
  },
  opNe: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "!=", UNTYPED_SENTINEL],
  },
  opLt: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "<", UNTYPED_SENTINEL],
  },
  opLe: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "<=", UNTYPED_SENTINEL],
  },
  opGt: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, ">", UNTYPED_SENTINEL],
  },
  opGe: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, ">=", UNTYPED_SENTINEL],
  },

  opExp: {
    returnsValue: true,
    signature: ["exp", UNTYPED_SENTINEL],
  },
  opLn: {
    returnsValue: true,
    signature: ["ln", UNTYPED_SENTINEL],
  },
  opSinDeg: {
    returnsValue: true,
    signature: ["sin of", UNTYPED_SENTINEL, "degrees"],
  },
  opCosDeg: {
    returnsValue: true,
    signature: ["cos of", UNTYPED_SENTINEL, "degrees"],
  },
  opTanDeg: {
    returnsValue: true,
    signature: ["tan of", UNTYPED_SENTINEL, "degrees"],
  },
  opAsinDeg: {
    returnsValue: true,
    signature: ["asin degrees of", UNTYPED_SENTINEL],
  },
  opAcosDeg: {
    returnsValue: true,
    signature: ["acos degrees of", UNTYPED_SENTINEL],
  },
  opAtanDeg: {
    returnsValue: true,
    signature: ["atan degrees of", UNTYPED_SENTINEL],
  },
  opSinRad: {
    returnsValue: true,
    signature: ["sin of", UNTYPED_SENTINEL, "radians"],
  },
  opCosRad: {
    returnsValue: true,
    signature: ["cos of", UNTYPED_SENTINEL, "radians"],
  },
  opTanRad: {
    returnsValue: true,
    signature: ["tan of", UNTYPED_SENTINEL, "radians"],
  },
  opAsinRad: {
    returnsValue: true,
    signature: ["asin radians of", UNTYPED_SENTINEL],
  },
  opAcosRad: {
    returnsValue: true,
    signature: ["acos radians of", UNTYPED_SENTINEL],
  },
  opAtanRad: {
    returnsValue: true,
    signature: ["atan radians of", UNTYPED_SENTINEL],
  },
  opPi: {
    returnsValue: true,
    signature: ["pi"],
  },
  opNaN: {
    returnsValue: true,
    signature: ["NaN"],
  },
  opInfinity: {
    returnsValue: true,
    signature: ["Infinity"],
  },
  opNegInfinity: {
    returnsValue: true,
    signature: ["-Infinity"],
  },

  opFloor: {
    returnsValue: true,
    signature: ["floor", UNTYPED_SENTINEL],
  },
  opCeil: {
    returnsValue: true,
    signature: ["ceiling", UNTYPED_SENTINEL],
  },
  opRound: {
    returnsValue: true,
    signature: ["round", UNTYPED_SENTINEL],
  },
  opAbs: {
    returnsValue: true,
    signature: ["abs", UNTYPED_SENTINEL],
  },
  opMin: {
    returnsValue: true,
    signature: ["min of", UNTYPED_SENTINEL, "and", UNTYPED_SENTINEL],
  },
  opMax: {
    returnsValue: true,
    signature: ["max of", UNTYPED_SENTINEL, "and", UNTYPED_SENTINEL],
  },
  opClamp: {
    returnsValue: true,
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
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "and", UNTYPED_SENTINEL],
  },
  opOr: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "or", UNTYPED_SENTINEL],
  },
  opNot: {
    returnsValue: true,
    signature: ["not", UNTYPED_SENTINEL],
  },

  opConcat: {
    returnsValue: true,
    signature: [UNTYPED_SENTINEL, "++", UNTYPED_SENTINEL],
  },
  stringLetter: {
    returnsValue: true,
    signature: ["letter", UNTYPED_SENTINEL, "of", UNTYPED_SENTINEL],
  },
  stringSubstring: {
    returnsValue: true,
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
    returnsValue: true,
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
    returnsValue: true,
    signature: ["parse", UNTYPED_SENTINEL, "as number"],
  },

  numberOrBooleanToString: {
    returnsValue: true,
    signature: ["convert", UNTYPED_SENTINEL, "to string"],
  },

  stringCanBeParsedAsNumber: {
    returnsValue: true,
    signature: ["can", UNTYPED_SENTINEL, "be parsed as a number?"],
  },
  stringCanBeParsedAsRealNumber: {
    returnsValue: true,
    signature: ["can", UNTYPED_SENTINEL, "be parsed as a real number?"],
  },
  stringCanBeParsedAsInteger: {
    returnsValue: true,
    signature: ["can", UNTYPED_SENTINEL, "be parsed as an integer?"],
  },

  // Sensing
  screenMouseX: {
    returnsValue: true,
    signature: ["screen mouse x"],
  },
  screenMouseY: {
    returnsValue: true,
    signature: ["screen mouse y"],
  },
  canvasMouseX: {
    returnsValue: true,
    signature: ["canvas mouse x"],
  },
  canvasMouseY: {
    returnsValue: true,
    signature: ["canvas mouse y"],
  },
  mouseDown: {
    returnsValue: true,
    signature: ["mouse down?"],
  },

  screenWidth: {
    returnsValue: true,
    signature: ["screen width"],
  },
  screenHeight: {
    returnsValue: true,
    signature: ["screen height"],
  },
  canvasWidth: {
    returnsValue: true,
    signature: ["canvas width"],
  },
  canvasHeight: {
    returnsValue: true,
    signature: ["canvas height"],
  },

  millisecondsSinceUnixEpoch: {
    returnsValue: true,
    signature: ["milliseconds since unix epoch"],
  },
  currentYear: {
    returnsValue: true,
    signature: ["current year"],
  },
  currentMonth: {
    returnsValue: true,
    signature: ["current month"],
  },
  currentDate: {
    returnsValue: true,
    signature: ["current date"],
  },
  currentDayOfWeek: {
    returnsValue: true,
    signature: ["current day of the week"],
  },
  currentHour: {
    returnsValue: true,
    signature: ["current hour"],
  },
  currentMinute: {
    returnsValue: true,
    signature: ["current minute"],
  },
  currentSecond: {
    returnsValue: true,
    signature: ["current second"],
  },

  keyPressed: {
    returnsValue: true,
    signature: ["key", UNTYPED_SENTINEL, "pressed?"],
  },

  // Looks
  resizeCanvas: {
    returnsValue: false,
    signature: [
      "resize canvas to width",
      UNTYPED_SENTINEL,
      "height",
      UNTYPED_SENTINEL,
    ],
  },
  drawImage: {
    returnsValue: false,
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
