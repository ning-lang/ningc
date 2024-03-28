export const NUMBER_SENTRY = "(Number)";
export const STRING_SENTRY = "(String)";
export const BOOLEAN_SENTRY = "(Boolean)";
export const NUMBER_LIST_SENTRY = "(Number List)";
export const STRING_LIST_SENTRY = "(String List)";
export const BOOLEAN_LIST_SENTRY = "(Boolean List)";
export const COMMAND_SENTRY = "(Command)";
export const NUMBER_REF_SENTRY = "[Number]";
export const STRING_REF_SENTRY = "[String]";
export const BOOLEAN_REF_SENTRY = "[Boolean]";
export const NUMBER_LIST_REF_SENTRY = "[Number List]";
export const STRING_LIST_REF_SENTRY = "[String List]";
export const BOOLEAN_LIST_REF_SENTRY = "[Boolean List]";

export const TYPED_BUILTINS = {
  // Control
  if_: {
    returnType: null,
    signature: ["if", BOOLEAN_SENTRY, COMMAND_SENTRY],
  },
  ifElse: {
    returnType: null,
    signature: [
      "if",
      BOOLEAN_LIST_SENTRY,
      COMMAND_SENTRY,
      "else",
      COMMAND_SENTRY,
    ],
  },
  while_: {
    returnType: null,
    signature: ["while", BOOLEAN_SENTRY, COMMAND_SENTRY],
  },
  repeatUntil: {
    returnType: null,
    signature: ["repeat until", BOOLEAN_SENTRY, COMMAND_SENTRY],
  },
  forever: {
    returnType: null,
    signature: ["forever", COMMAND_SENTRY],
  },
  repeat: {
    returnType: null,
    signature: ["repeat", NUMBER_SENTRY, "times", COMMAND_SENTRY],
  },

  // Variables
  numberLet: {
    returnType: null,
    signature: ["let", NUMBER_REF_SENTRY, "=", NUMBER_SENTRY],
  },
  stringLet: {
    returnType: null,
    signature: ["let", STRING_REF_SENTRY, "=", STRING_SENTRY],
  },
  booleanLet: {
    returnType: null,
    signature: ["let", BOOLEAN_REF_SENTRY, "=", BOOLEAN_SENTRY],
  },
  numberVar: {
    returnType: null,
    signature: ["var", NUMBER_REF_SENTRY, "=", NUMBER_SENTRY],
  },
  stringVar: {
    returnType: null,
    signature: ["var", STRING_REF_SENTRY, "=", STRING_SENTRY],
  },
  booleanVar: {
    returnType: null,
    signature: ["var", BOOLEAN_REF_SENTRY, "=", BOOLEAN_SENTRY],
  },
  numberAssign: {
    returnType: null,
    signature: ["set", NUMBER_REF_SENTRY, "to", NUMBER_SENTRY],
  },
  stringAssign: {
    returnType: null,
    signature: ["set", STRING_REF_SENTRY, "to", STRING_SENTRY],
  },
  booleanAssign: {
    returnType: null,
    signature: ["set", BOOLEAN_REF_SENTRY, "to", BOOLEAN_SENTRY],
  },
  numberIncrease: {
    returnType: null,
    signature: ["change", NUMBER_REF_SENTRY, "by", NUMBER_SENTRY],
  },

  // Lists
  numberListCreate: {
    returnType: null,
    signature: ["create number list", NUMBER_LIST_REF_SENTRY],
  },
  stringListCreate: {
    returnType: null,
    signature: ["create string list", STRING_LIST_REF_SENTRY],
  },
  booleanListCreate: {
    returnType: null,
    signature: ["create boolean list", BOOLEAN_LIST_REF_SENTRY],
  },

  numberListLength: {
    returnType: NUMBER_SENTRY,
    signature: ["length of", NUMBER_LIST_SENTRY],
  },
  stringListLength: {
    returnType: NUMBER_SENTRY,
    signature: ["length of", STRING_LIST_SENTRY],
  },
  booleanListLength: {
    returnType: NUMBER_SENTRY,
    signature: ["length of", BOOLEAN_LIST_SENTRY],
  },

  numberListItemOf: {
    returnType: NUMBER_SENTRY,
    signature: ["item", NUMBER_SENTRY, "of", NUMBER_LIST_SENTRY],
  },
  stringListItemOf: {
    returnType: STRING_SENTRY,
    signature: ["item", NUMBER_SENTRY, "of", STRING_LIST_SENTRY],
  },
  booleanListItemOf: {
    returnType: BOOLEAN_SENTRY,
    signature: ["item", NUMBER_SENTRY, "of", BOOLEAN_LIST_SENTRY],
  },

  numberListIndexOf: {
    returnType: NUMBER_SENTRY,
    signature: ["index of", NUMBER_SENTRY, "in", NUMBER_LIST_SENTRY],
  },
  stringListIndexOf: {
    returnType: NUMBER_SENTRY,
    signature: ["index of", STRING_SENTRY, "in", STRING_LIST_SENTRY],
  },
  booleanListIndexOf: {
    returnType: NUMBER_SENTRY,
    signature: ["index of", BOOLEAN_SENTRY, "in", BOOLEAN_LIST_SENTRY],
  },

  numberListContains: {
    returnType: BOOLEAN_SENTRY,
    signature: [NUMBER_LIST_SENTRY, "contains", NUMBER_SENTRY, "?"],
  },
  stringListContains: {
    returnType: BOOLEAN_SENTRY,
    signature: [STRING_LIST_SENTRY, "contains", STRING_SENTRY, "?"],
  },
  booleanListContains: {
    returnType: BOOLEAN_SENTRY,
    signature: [BOOLEAN_LIST_SENTRY, "contains", BOOLEAN_SENTRY, "?"],
  },

  numberListReplaceItem: {
    returnType: null,
    signature: [
      "replace item",
      NUMBER_SENTRY,
      "of",
      NUMBER_LIST_REF_SENTRY,
      "with",
      NUMBER_SENTRY,
    ],
  },
  stringListReplaceItem: {
    returnType: null,
    signature: [
      "replace item",
      NUMBER_SENTRY,
      "of",
      STRING_LIST_REF_SENTRY,
      "with",
      STRING_SENTRY,
    ],
  },
  booleanListReplaceItem: {
    returnType: null,
    signature: [
      "replace item",
      NUMBER_SENTRY,
      "of",
      BOOLEAN_LIST_REF_SENTRY,
      "with",
      BOOLEAN_SENTRY,
    ],
  },
  numberListInsert: {
    returnType: null,
    signature: [
      "insert",
      NUMBER_SENTRY,
      "at",
      NUMBER_SENTRY,
      "of",
      NUMBER_LIST_REF_SENTRY,
    ],
  },
  stringListInsert: {
    returnType: null,
    signature: [
      "insert",
      STRING_SENTRY,
      "at",
      NUMBER_SENTRY,
      "of",
      STRING_LIST_REF_SENTRY,
    ],
  },
  booleanListInsert: {
    returnType: null,
    signature: [
      "insert",
      BOOLEAN_SENTRY,
      "at",
      NUMBER_SENTRY,
      "of",
      BOOLEAN_LIST_REF_SENTRY,
    ],
  },
  numberListDeleteItem: {
    returnType: null,
    signature: ["delete item", NUMBER_SENTRY, "of", NUMBER_LIST_REF_SENTRY],
  },
  stringListDeleteItem: {
    returnType: null,
    signature: ["delete item", NUMBER_SENTRY, "of", STRING_LIST_REF_SENTRY],
  },
  booleanListDeleteItem: {
    returnType: null,
    signature: ["delete item", NUMBER_SENTRY, "of", BOOLEAN_LIST_REF_SENTRY],
  },
  numberListDeleteAll: {
    returnType: null,
    signature: ["delete all of", NUMBER_LIST_REF_SENTRY],
  },
  stringListDeleteAll: {
    returnType: null,
    signature: ["delete all of", STRING_LIST_REF_SENTRY],
  },
  booleanListDeleteAll: {
    returnType: null,
    signature: ["delete all of", BOOLEAN_LIST_REF_SENTRY],
  },
  numberListAdd: {
    returnType: null,
    signature: ["add", NUMBER_SENTRY, "to", NUMBER_LIST_REF_SENTRY],
  },
  stringListAdd: {
    returnType: null,
    signature: ["add", STRING_SENTRY, "to", STRING_LIST_REF_SENTRY],
  },
  booleanListAdd: {
    returnType: null,
    signature: ["add", BOOLEAN_SENTRY, "to", BOOLEAN_LIST_REF_SENTRY],
  },

  // Operators
  opAdd: {
    returnType: NUMBER_SENTRY,
    signature: [NUMBER_SENTRY, "+", NUMBER_SENTRY],
  },
  opSub: {
    returnType: NUMBER_SENTRY,
    signature: [NUMBER_SENTRY, "-", NUMBER_SENTRY],
  },
  opMul: {
    returnType: NUMBER_SENTRY,
    signature: [NUMBER_SENTRY, "*", NUMBER_SENTRY],
  },
  opDiv: {
    returnType: NUMBER_SENTRY,
    signature: [NUMBER_SENTRY, "/", NUMBER_SENTRY],
  },
  opMod: {
    returnType: NUMBER_SENTRY,
    signature: [NUMBER_SENTRY, "mod", NUMBER_SENTRY],
  },
  opPow: {
    returnType: NUMBER_SENTRY,
    signature: [NUMBER_SENTRY, "to the power of", NUMBER_SENTRY],
  },

  opEq: {
    returnType: BOOLEAN_SENTRY,
    signature: [NUMBER_SENTRY, "==", NUMBER_SENTRY],
  },
  opNe: {
    returnType: BOOLEAN_SENTRY,
    signature: [NUMBER_SENTRY, "!=", NUMBER_SENTRY],
  },
  opLt: {
    returnType: BOOLEAN_SENTRY,
    signature: [NUMBER_SENTRY, "<", NUMBER_SENTRY],
  },
  opLe: {
    returnType: BOOLEAN_SENTRY,
    signature: [NUMBER_SENTRY, "<=", NUMBER_SENTRY],
  },
  opGt: {
    returnType: BOOLEAN_SENTRY,
    signature: [NUMBER_SENTRY, ">", NUMBER_SENTRY],
  },
  opGe: {
    returnType: BOOLEAN_SENTRY,
    signature: [NUMBER_SENTRY, ">=", NUMBER_SENTRY],
  },

  opExp: {
    returnType: NUMBER_SENTRY,
    signature: ["exp", NUMBER_SENTRY],
  },
  opLn: {
    returnType: NUMBER_SENTRY,
    signature: ["ln", NUMBER_SENTRY],
  },
  opSinDeg: {
    returnType: NUMBER_SENTRY,
    signature: ["sin of", NUMBER_SENTRY, "degrees"],
  },
  opCosDeg: {
    returnType: NUMBER_SENTRY,
    signature: ["cos of", NUMBER_SENTRY, "degrees"],
  },
  opTanDeg: {
    returnType: NUMBER_SENTRY,
    signature: ["tan of", NUMBER_SENTRY, "degrees"],
  },
  opAsinDeg: {
    returnType: NUMBER_SENTRY,
    signature: ["asin degrees of", NUMBER_SENTRY],
  },
  opAcosDeg: {
    returnType: NUMBER_SENTRY,
    signature: ["acos degrees of", NUMBER_SENTRY],
  },
  opAtanDeg: {
    returnType: NUMBER_SENTRY,
    signature: ["atan degrees of", NUMBER_SENTRY],
  },
  opSinRad: {
    returnType: NUMBER_SENTRY,
    signature: ["sin of", NUMBER_SENTRY, "radians"],
  },
  opCosRad: {
    returnType: NUMBER_SENTRY,
    signature: ["cos of", NUMBER_SENTRY, "radians"],
  },
  opTanRad: {
    returnType: NUMBER_SENTRY,
    signature: ["tan of", NUMBER_SENTRY, "radians"],
  },
  opAsinRad: {
    returnType: NUMBER_SENTRY,
    signature: ["asin radians of", NUMBER_SENTRY],
  },
  opAcosRad: {
    returnType: NUMBER_SENTRY,
    signature: ["acos radians of", NUMBER_SENTRY],
  },
  opAtanRad: {
    returnType: NUMBER_SENTRY,
    signature: ["atan radians of", NUMBER_SENTRY],
  },
  opPi: {
    returnType: NUMBER_SENTRY,
    signature: ["pi"],
  },
  opNaN: {
    returnType: NUMBER_SENTRY,
    signature: ["NaN"],
  },
  opInfinity: {
    returnType: NUMBER_SENTRY,
    signature: ["Infinity"],
  },
  opNegInfinity: {
    returnType: NUMBER_SENTRY,
    signature: ["-Infinity"],
  },

  opFloor: {
    returnType: NUMBER_SENTRY,
    signature: ["floor", NUMBER_SENTRY],
  },
  opCeil: {
    returnType: NUMBER_SENTRY,
    signature: ["ceiling", NUMBER_SENTRY],
  },
  opRound: {
    returnType: NUMBER_SENTRY,
    signature: ["round", NUMBER_SENTRY],
  },
  opAbs: {
    returnType: NUMBER_SENTRY,
    signature: ["abs", NUMBER_SENTRY],
  },
  opMin: {
    returnType: NUMBER_SENTRY,
    signature: ["min of", NUMBER_SENTRY, "and", NUMBER_SENTRY],
  },
  opMax: {
    returnType: NUMBER_SENTRY,
    signature: ["max of", NUMBER_SENTRY, "and", NUMBER_SENTRY],
  },
  opClamp: {
    returnType: NUMBER_SENTRY,
    signature: [
      "clamp",
      NUMBER_SENTRY,
      "between",
      NUMBER_SENTRY,
      "and",
      NUMBER_SENTRY,
    ],
  },

  opAnd: {
    returnType: BOOLEAN_SENTRY,
    signature: [BOOLEAN_SENTRY, "and", BOOLEAN_SENTRY],
  },
  opOr: {
    returnType: BOOLEAN_SENTRY,
    signature: [BOOLEAN_SENTRY, "or", BOOLEAN_SENTRY],
  },
  opNot: {
    returnType: BOOLEAN_SENTRY,
    signature: ["not", BOOLEAN_SENTRY],
  },

  opConcat: {
    returnType: STRING_SENTRY,
    signature: [STRING_SENTRY, "++", STRING_SENTRY],
  },
  stringLength: {
    returnType: NUMBER_SENTRY,
    signature: ["length of", STRING_SENTRY],
  },
  stringLetter: {
    returnType: STRING_SENTRY,
    signature: ["letter", NUMBER_SENTRY, "of", STRING_SENTRY],
  },
  stringSubstring: {
    returnType: STRING_SENTRY,
    signature: [
      "substring of",
      STRING_SENTRY,
      "from",
      NUMBER_SENTRY,
      "to",
      NUMBER_SENTRY,
    ],
  },
  stringContains: {
    returnType: BOOLEAN_SENTRY,
    signature: [STRING_SENTRY, "contains", STRING_SENTRY, "?"],
  },
  stringIndexOf: {
    returnType: NUMBER_SENTRY,
    signature: ["index of", STRING_SENTRY, "in", STRING_SENTRY],
  },

  numberTernary: {
    returnType: NUMBER_SENTRY,
    signature: [
      "if",
      BOOLEAN_SENTRY,
      "then",
      NUMBER_SENTRY,
      "else",
      NUMBER_SENTRY,
    ],
  },
  stringTernary: {
    returnType: STRING_SENTRY,
    signature: [
      "if",
      BOOLEAN_SENTRY,
      "then",
      STRING_SENTRY,
      "else",
      STRING_SENTRY,
    ],
  },
  booleanTernary: {
    returnType: BOOLEAN_SENTRY,
    signature: [
      "if",
      BOOLEAN_SENTRY,
      "then",
      BOOLEAN_SENTRY,
      "else",
      BOOLEAN_SENTRY,
    ],
  },

  parseNumber: {
    returnType: NUMBER_SENTRY,
    signature: ["parse", STRING_SENTRY, "as number"],
  },

  numberToString: {
    returnType: STRING_SENTRY,
    signature: ["convert", NUMBER_SENTRY, "to string"],
  },
  booleanToString: {
    returnType: STRING_SENTRY,
    signature: ["convert", BOOLEAN_SENTRY, "to string"],
  },

  stringCanBeParsedAsNumber: {
    returnType: BOOLEAN_SENTRY,
    signature: ["can", STRING_SENTRY, "be parsed as a number?"],
  },
  stringCanBeParsedAsRealNumber: {
    returnType: BOOLEAN_SENTRY,
    signature: ["can", STRING_SENTRY, "be parsed as a real number?"],
  },
  stringCanBeParsedAsInteger: {
    returnType: BOOLEAN_SENTRY,
    signature: ["can", STRING_SENTRY, "be parsed as an integer?"],
  },

  // Sensing
  screenMouseX: {
    returnType: NUMBER_SENTRY,
    signature: ["screen mouse x"],
  },
  screenMouseY: {
    returnType: NUMBER_SENTRY,
    signature: ["screen mouse y"],
  },
  canvasMouseX: {
    returnType: NUMBER_SENTRY,
    signature: ["canvas mouse x"],
  },
  canvasMouseY: {
    returnType: NUMBER_SENTRY,
    signature: ["canvas mouse y"],
  },
  mouseDown: {
    returnType: BOOLEAN_SENTRY,
    signature: ["mouse down?"],
  },

  screenWidth: {
    returnType: NUMBER_SENTRY,
    signature: ["screen width"],
  },
  screenHeight: {
    returnType: NUMBER_SENTRY,
    signature: ["screen height"],
  },
  canvasWidth: {
    returnType: NUMBER_SENTRY,
    signature: ["canvas width"],
  },
  canvasHeight: {
    returnType: NUMBER_SENTRY,
    signature: ["canvas height"],
  },

  millisecondsSinceUnixEpoch: {
    returnType: NUMBER_SENTRY,
    signature: ["milliseconds since unix epoch"],
  },
  currentYear: {
    returnType: NUMBER_SENTRY,
    signature: ["current year"],
  },
  currentMonth: {
    returnType: NUMBER_SENTRY,
    signature: ["current month"],
  },
  currentDate: {
    returnType: NUMBER_SENTRY,
    signature: ["current date"],
  },
  currentDayOfWeek: {
    returnType: NUMBER_SENTRY,
    signature: ["current day of the week"],
  },
  currentHour: {
    returnType: NUMBER_SENTRY,
    signature: ["current hour"],
  },
  currentMinute: {
    returnType: NUMBER_SENTRY,
    signature: ["current minute"],
  },
  currentSecond: {
    returnType: NUMBER_SENTRY,
    signature: ["current second"],
  },

  keyPressed: {
    returnType: BOOLEAN_SENTRY,
    signature: ["key", STRING_SENTRY, "pressed?"],
  },

  // Looks
  resizeCanvas: {
    returnType: null,
    signature: [
      "resize canvas to width",
      NUMBER_SENTRY,
      "height",
      NUMBER_SENTRY,
    ],
  },
  drawImage: {
    returnType: null,
    signature: [
      "draw image",
      STRING_SENTRY,
      "at x",
      NUMBER_SENTRY,
      "y",
      NUMBER_SENTRY,
      "with width",
      NUMBER_SENTRY,
      "height",
      NUMBER_SENTRY,
    ],
  },
} as const;
