export const NUMBER_SENTINEL = "(Number)";
export const STRING_SENTINEL = "(String)";
export const BOOLEAN_SENTINEL = "(Boolean)";
export const NUMBER_LIST_SENTINEL = "(Number List)";
export const STRING_LIST_SENTINEL = "(String List)";
export const BOOLEAN_LIST_SENTINEL = "(Boolean List)";
export const COMMAND_SENTINEL = "(Command)";
export const NUMBER_REF_SENTINEL = "[Number]";
export const STRING_REF_SENTINEL = "[String]";
export const BOOLEAN_REF_SENTINEL = "[Boolean]";
export const NUMBER_LIST_REF_SENTINEL = "[Number List]";
export const STRING_LIST_REF_SENTINEL = "[String List]";
export const BOOLEAN_LIST_REF_SENTINEL = "[Boolean List]";

export const TYPED_BUILTINS = {
  // Control
  if_: {
    returnType: null,
    signature: ["if", BOOLEAN_SENTINEL, COMMAND_SENTINEL],
  },
  ifElse: {
    returnType: null,
    signature: [
      "if",
      BOOLEAN_LIST_SENTINEL,
      COMMAND_SENTINEL,
      "else",
      COMMAND_SENTINEL,
    ],
  },
  while_: {
    returnType: null,
    signature: ["while", BOOLEAN_SENTINEL, COMMAND_SENTINEL],
  },
  repeatUntil: {
    returnType: null,
    signature: ["repeat until", BOOLEAN_SENTINEL, COMMAND_SENTINEL],
  },
  forever: {
    returnType: null,
    signature: ["forever", COMMAND_SENTINEL],
  },
  repeat: {
    returnType: null,
    signature: ["repeat", NUMBER_SENTINEL, "times", COMMAND_SENTINEL],
  },
  numberReturn: {
    returnType: null,
    signature: ["return", NUMBER_SENTINEL],
  },
  stringReturn: {
    returnType: null,
    signature: ["return", STRING_SENTINEL],
  },
  booleanReturn: {
    returnType: null,
    signature: ["return", BOOLEAN_SENTINEL],
  },

  // Variables
  numberLet: {
    returnType: null,
    signature: ["let", NUMBER_REF_SENTINEL, "=", NUMBER_SENTINEL],
  },
  stringLet: {
    returnType: null,
    signature: ["let", STRING_REF_SENTINEL, "=", STRING_SENTINEL],
  },
  booleanLet: {
    returnType: null,
    signature: ["let", BOOLEAN_REF_SENTINEL, "=", BOOLEAN_SENTINEL],
  },
  numberVar: {
    returnType: null,
    signature: ["var", NUMBER_REF_SENTINEL, "=", NUMBER_SENTINEL],
  },
  stringVar: {
    returnType: null,
    signature: ["var", STRING_REF_SENTINEL, "=", STRING_SENTINEL],
  },
  booleanVar: {
    returnType: null,
    signature: ["var", BOOLEAN_REF_SENTINEL, "=", BOOLEAN_SENTINEL],
  },
  numberAssign: {
    returnType: null,
    signature: ["set", NUMBER_REF_SENTINEL, "to", NUMBER_SENTINEL],
  },
  stringAssign: {
    returnType: null,
    signature: ["set", STRING_REF_SENTINEL, "to", STRING_SENTINEL],
  },
  booleanAssign: {
    returnType: null,
    signature: ["set", BOOLEAN_REF_SENTINEL, "to", BOOLEAN_SENTINEL],
  },
  numberIncrease: {
    returnType: null,
    signature: ["change", NUMBER_REF_SENTINEL, "by", NUMBER_SENTINEL],
  },

  // Lists
  numberListCreate: {
    returnType: null,
    signature: ["create number list", NUMBER_LIST_REF_SENTINEL],
  },
  stringListCreate: {
    returnType: null,
    signature: ["create string list", STRING_LIST_REF_SENTINEL],
  },
  booleanListCreate: {
    returnType: null,
    signature: ["create boolean list", BOOLEAN_LIST_REF_SENTINEL],
  },

  numberListLength: {
    returnType: NUMBER_SENTINEL,
    signature: ["length of", NUMBER_LIST_SENTINEL],
  },
  stringListLength: {
    returnType: NUMBER_SENTINEL,
    signature: ["length of", STRING_LIST_SENTINEL],
  },
  booleanListLength: {
    returnType: NUMBER_SENTINEL,
    signature: ["length of", BOOLEAN_LIST_SENTINEL],
  },

  numberListItemOf: {
    returnType: NUMBER_SENTINEL,
    signature: ["item", NUMBER_SENTINEL, "of", NUMBER_LIST_SENTINEL],
  },
  stringListItemOf: {
    returnType: STRING_SENTINEL,
    signature: ["item", NUMBER_SENTINEL, "of", STRING_LIST_SENTINEL],
  },
  booleanListItemOf: {
    returnType: BOOLEAN_SENTINEL,
    signature: ["item", NUMBER_SENTINEL, "of", BOOLEAN_LIST_SENTINEL],
  },

  numberListIndexOf: {
    returnType: NUMBER_SENTINEL,
    signature: ["index of", NUMBER_SENTINEL, "in", NUMBER_LIST_SENTINEL],
  },
  stringListIndexOf: {
    returnType: NUMBER_SENTINEL,
    signature: ["index of", STRING_SENTINEL, "in", STRING_LIST_SENTINEL],
  },
  booleanListIndexOf: {
    returnType: NUMBER_SENTINEL,
    signature: ["index of", BOOLEAN_SENTINEL, "in", BOOLEAN_LIST_SENTINEL],
  },

  numberListContains: {
    returnType: BOOLEAN_SENTINEL,
    signature: [NUMBER_LIST_SENTINEL, "contains", NUMBER_SENTINEL, "?"],
  },
  stringListContains: {
    returnType: BOOLEAN_SENTINEL,
    signature: [STRING_LIST_SENTINEL, "contains", STRING_SENTINEL, "?"],
  },
  booleanListContains: {
    returnType: BOOLEAN_SENTINEL,
    signature: [BOOLEAN_LIST_SENTINEL, "contains", BOOLEAN_SENTINEL, "?"],
  },

  numberListReplaceItem: {
    returnType: null,
    signature: [
      "replace item",
      NUMBER_SENTINEL,
      "of",
      NUMBER_LIST_REF_SENTINEL,
      "with",
      NUMBER_SENTINEL,
    ],
  },
  stringListReplaceItem: {
    returnType: null,
    signature: [
      "replace item",
      NUMBER_SENTINEL,
      "of",
      STRING_LIST_REF_SENTINEL,
      "with",
      STRING_SENTINEL,
    ],
  },
  booleanListReplaceItem: {
    returnType: null,
    signature: [
      "replace item",
      NUMBER_SENTINEL,
      "of",
      BOOLEAN_LIST_REF_SENTINEL,
      "with",
      BOOLEAN_SENTINEL,
    ],
  },
  numberListInsert: {
    returnType: null,
    signature: [
      "insert",
      NUMBER_SENTINEL,
      "at",
      NUMBER_SENTINEL,
      "of",
      NUMBER_LIST_REF_SENTINEL,
    ],
  },
  stringListInsert: {
    returnType: null,
    signature: [
      "insert",
      STRING_SENTINEL,
      "at",
      NUMBER_SENTINEL,
      "of",
      STRING_LIST_REF_SENTINEL,
    ],
  },
  booleanListInsert: {
    returnType: null,
    signature: [
      "insert",
      BOOLEAN_SENTINEL,
      "at",
      NUMBER_SENTINEL,
      "of",
      BOOLEAN_LIST_REF_SENTINEL,
    ],
  },
  numberListDeleteItem: {
    returnType: null,
    signature: ["delete item", NUMBER_SENTINEL, "of", NUMBER_LIST_REF_SENTINEL],
  },
  stringListDeleteItem: {
    returnType: null,
    signature: ["delete item", NUMBER_SENTINEL, "of", STRING_LIST_REF_SENTINEL],
  },
  booleanListDeleteItem: {
    returnType: null,
    signature: [
      "delete item",
      NUMBER_SENTINEL,
      "of",
      BOOLEAN_LIST_REF_SENTINEL,
    ],
  },
  numberListDeleteAll: {
    returnType: null,
    signature: ["delete all of", NUMBER_LIST_REF_SENTINEL],
  },
  stringListDeleteAll: {
    returnType: null,
    signature: ["delete all of", STRING_LIST_REF_SENTINEL],
  },
  booleanListDeleteAll: {
    returnType: null,
    signature: ["delete all of", BOOLEAN_LIST_REF_SENTINEL],
  },
  numberListAdd: {
    returnType: null,
    signature: ["add", NUMBER_SENTINEL, "to", NUMBER_LIST_REF_SENTINEL],
  },
  stringListAdd: {
    returnType: null,
    signature: ["add", STRING_SENTINEL, "to", STRING_LIST_REF_SENTINEL],
  },
  booleanListAdd: {
    returnType: null,
    signature: ["add", BOOLEAN_SENTINEL, "to", BOOLEAN_LIST_REF_SENTINEL],
  },

  // Operators
  opAdd: {
    returnType: NUMBER_SENTINEL,
    signature: [NUMBER_SENTINEL, "+", NUMBER_SENTINEL],
  },
  opSub: {
    returnType: NUMBER_SENTINEL,
    signature: [NUMBER_SENTINEL, "-", NUMBER_SENTINEL],
  },
  opMul: {
    returnType: NUMBER_SENTINEL,
    signature: [NUMBER_SENTINEL, "*", NUMBER_SENTINEL],
  },
  opDiv: {
    returnType: NUMBER_SENTINEL,
    signature: [NUMBER_SENTINEL, "/", NUMBER_SENTINEL],
  },
  opMod: {
    returnType: NUMBER_SENTINEL,
    signature: [NUMBER_SENTINEL, "mod", NUMBER_SENTINEL],
  },
  opPow: {
    returnType: NUMBER_SENTINEL,
    signature: [NUMBER_SENTINEL, "to the power of", NUMBER_SENTINEL],
  },

  opEq: {
    returnType: BOOLEAN_SENTINEL,
    signature: [NUMBER_SENTINEL, "==", NUMBER_SENTINEL],
  },
  opNe: {
    returnType: BOOLEAN_SENTINEL,
    signature: [NUMBER_SENTINEL, "!=", NUMBER_SENTINEL],
  },
  opLt: {
    returnType: BOOLEAN_SENTINEL,
    signature: [NUMBER_SENTINEL, "<", NUMBER_SENTINEL],
  },
  opLe: {
    returnType: BOOLEAN_SENTINEL,
    signature: [NUMBER_SENTINEL, "<=", NUMBER_SENTINEL],
  },
  opGt: {
    returnType: BOOLEAN_SENTINEL,
    signature: [NUMBER_SENTINEL, ">", NUMBER_SENTINEL],
  },
  opGe: {
    returnType: BOOLEAN_SENTINEL,
    signature: [NUMBER_SENTINEL, ">=", NUMBER_SENTINEL],
  },

  opExp: {
    returnType: NUMBER_SENTINEL,
    signature: ["exp", NUMBER_SENTINEL],
  },
  opLn: {
    returnType: NUMBER_SENTINEL,
    signature: ["ln", NUMBER_SENTINEL],
  },
  opSinDeg: {
    returnType: NUMBER_SENTINEL,
    signature: ["sin of", NUMBER_SENTINEL, "degrees"],
  },
  opCosDeg: {
    returnType: NUMBER_SENTINEL,
    signature: ["cos of", NUMBER_SENTINEL, "degrees"],
  },
  opTanDeg: {
    returnType: NUMBER_SENTINEL,
    signature: ["tan of", NUMBER_SENTINEL, "degrees"],
  },
  opAsinDeg: {
    returnType: NUMBER_SENTINEL,
    signature: ["asin degrees of", NUMBER_SENTINEL],
  },
  opAcosDeg: {
    returnType: NUMBER_SENTINEL,
    signature: ["acos degrees of", NUMBER_SENTINEL],
  },
  opAtanDeg: {
    returnType: NUMBER_SENTINEL,
    signature: ["atan degrees of", NUMBER_SENTINEL],
  },
  opSinRad: {
    returnType: NUMBER_SENTINEL,
    signature: ["sin of", NUMBER_SENTINEL, "radians"],
  },
  opCosRad: {
    returnType: NUMBER_SENTINEL,
    signature: ["cos of", NUMBER_SENTINEL, "radians"],
  },
  opTanRad: {
    returnType: NUMBER_SENTINEL,
    signature: ["tan of", NUMBER_SENTINEL, "radians"],
  },
  opAsinRad: {
    returnType: NUMBER_SENTINEL,
    signature: ["asin radians of", NUMBER_SENTINEL],
  },
  opAcosRad: {
    returnType: NUMBER_SENTINEL,
    signature: ["acos radians of", NUMBER_SENTINEL],
  },
  opAtanRad: {
    returnType: NUMBER_SENTINEL,
    signature: ["atan radians of", NUMBER_SENTINEL],
  },
  opPi: {
    returnType: NUMBER_SENTINEL,
    signature: ["pi"],
  },
  opNaN: {
    returnType: NUMBER_SENTINEL,
    signature: ["NaN"],
  },
  opInfinity: {
    returnType: NUMBER_SENTINEL,
    signature: ["Infinity"],
  },
  opNegInfinity: {
    returnType: NUMBER_SENTINEL,
    signature: ["-Infinity"],
  },

  opFloor: {
    returnType: NUMBER_SENTINEL,
    signature: ["floor", NUMBER_SENTINEL],
  },
  opCeil: {
    returnType: NUMBER_SENTINEL,
    signature: ["ceiling", NUMBER_SENTINEL],
  },
  opRound: {
    returnType: NUMBER_SENTINEL,
    signature: ["round", NUMBER_SENTINEL],
  },
  opAbs: {
    returnType: NUMBER_SENTINEL,
    signature: ["abs", NUMBER_SENTINEL],
  },
  opMin: {
    returnType: NUMBER_SENTINEL,
    signature: ["min of", NUMBER_SENTINEL, "and", NUMBER_SENTINEL],
  },
  opMax: {
    returnType: NUMBER_SENTINEL,
    signature: ["max of", NUMBER_SENTINEL, "and", NUMBER_SENTINEL],
  },
  opClamp: {
    returnType: NUMBER_SENTINEL,
    signature: [
      "clamp",
      NUMBER_SENTINEL,
      "between",
      NUMBER_SENTINEL,
      "and",
      NUMBER_SENTINEL,
    ],
  },

  opAnd: {
    returnType: BOOLEAN_SENTINEL,
    signature: [BOOLEAN_SENTINEL, "and", BOOLEAN_SENTINEL],
  },
  opOr: {
    returnType: BOOLEAN_SENTINEL,
    signature: [BOOLEAN_SENTINEL, "or", BOOLEAN_SENTINEL],
  },
  opNot: {
    returnType: BOOLEAN_SENTINEL,
    signature: ["not", BOOLEAN_SENTINEL],
  },

  opConcat: {
    returnType: STRING_SENTINEL,
    signature: [STRING_SENTINEL, "++", STRING_SENTINEL],
  },
  stringLength: {
    returnType: NUMBER_SENTINEL,
    signature: ["length of", STRING_SENTINEL],
  },
  stringLetter: {
    returnType: STRING_SENTINEL,
    signature: ["letter", NUMBER_SENTINEL, "of", STRING_SENTINEL],
  },
  stringSubstring: {
    returnType: STRING_SENTINEL,
    signature: [
      "substring of",
      STRING_SENTINEL,
      "from",
      NUMBER_SENTINEL,
      "to",
      NUMBER_SENTINEL,
    ],
  },
  stringContains: {
    returnType: BOOLEAN_SENTINEL,
    signature: [STRING_SENTINEL, "contains", STRING_SENTINEL, "?"],
  },
  stringIndexOf: {
    returnType: NUMBER_SENTINEL,
    signature: ["index of", STRING_SENTINEL, "in", STRING_SENTINEL],
  },

  numberTernary: {
    returnType: NUMBER_SENTINEL,
    signature: [
      "if",
      BOOLEAN_SENTINEL,
      "then",
      NUMBER_SENTINEL,
      "else",
      NUMBER_SENTINEL,
    ],
  },
  stringTernary: {
    returnType: STRING_SENTINEL,
    signature: [
      "if",
      BOOLEAN_SENTINEL,
      "then",
      STRING_SENTINEL,
      "else",
      STRING_SENTINEL,
    ],
  },
  booleanTernary: {
    returnType: BOOLEAN_SENTINEL,
    signature: [
      "if",
      BOOLEAN_SENTINEL,
      "then",
      BOOLEAN_SENTINEL,
      "else",
      BOOLEAN_SENTINEL,
    ],
  },

  parseNumber: {
    returnType: NUMBER_SENTINEL,
    signature: ["parse", STRING_SENTINEL, "as number"],
  },

  numberToString: {
    returnType: STRING_SENTINEL,
    signature: ["convert", NUMBER_SENTINEL, "to string"],
  },
  booleanToString: {
    returnType: STRING_SENTINEL,
    signature: ["convert", BOOLEAN_SENTINEL, "to string"],
  },

  stringCanBeParsedAsNumber: {
    returnType: BOOLEAN_SENTINEL,
    signature: ["can", STRING_SENTINEL, "be parsed as a number?"],
  },
  stringCanBeParsedAsInteger: {
    returnType: BOOLEAN_SENTINEL,
    signature: ["can", STRING_SENTINEL, "be parsed as an integer?"],
  },

  // Sensing
  screenMouseX: {
    returnType: NUMBER_SENTINEL,
    signature: ["screen mouse x"],
  },
  screenMouseY: {
    returnType: NUMBER_SENTINEL,
    signature: ["screen mouse y"],
  },
  canvasMouseX: {
    returnType: NUMBER_SENTINEL,
    signature: ["canvas mouse x"],
  },
  canvasMouseY: {
    returnType: NUMBER_SENTINEL,
    signature: ["canvas mouse y"],
  },
  mouseDown: {
    returnType: BOOLEAN_SENTINEL,
    signature: ["mouse down?"],
  },

  screenWidth: {
    returnType: NUMBER_SENTINEL,
    signature: ["screen width"],
  },
  screenHeight: {
    returnType: NUMBER_SENTINEL,
    signature: ["screen height"],
  },
  canvasWidth: {
    returnType: NUMBER_SENTINEL,
    signature: ["canvas width"],
  },
  canvasHeight: {
    returnType: NUMBER_SENTINEL,
    signature: ["canvas height"],
  },

  millisecondsSinceUnixEpoch: {
    returnType: NUMBER_SENTINEL,
    signature: ["milliseconds since unix epoch"],
  },
  currentYear: {
    returnType: NUMBER_SENTINEL,
    signature: ["current year"],
  },
  currentMonth: {
    returnType: NUMBER_SENTINEL,
    signature: ["current month"],
  },
  currentDate: {
    returnType: NUMBER_SENTINEL,
    signature: ["current date"],
  },
  currentDayOfWeek: {
    returnType: NUMBER_SENTINEL,
    signature: ["current day of the week"],
  },
  currentHour: {
    returnType: NUMBER_SENTINEL,
    signature: ["current hour"],
  },
  currentMinute: {
    returnType: NUMBER_SENTINEL,
    signature: ["current minute"],
  },
  currentSecond: {
    returnType: NUMBER_SENTINEL,
    signature: ["current second"],
  },

  keyPressed: {
    returnType: BOOLEAN_SENTINEL,
    signature: ["key", STRING_SENTINEL, "pressed?"],
  },

  // Looks
  resizeCanvas: {
    returnType: null,
    signature: [
      "resize canvas to width",
      NUMBER_SENTINEL,
      "height",
      NUMBER_SENTINEL,
    ],
  },
  drawImage: {
    returnType: null,
    signature: [
      "draw image",
      STRING_SENTINEL,
      "at x",
      NUMBER_SENTINEL,
      "y",
      NUMBER_SENTINEL,
      "with width",
      NUMBER_SENTINEL,
      "height",
      NUMBER_SENTINEL,
    ],
  },
} as const;
