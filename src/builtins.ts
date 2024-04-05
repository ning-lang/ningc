export const UNTYPED_VAL_SENTINEL = "()";
export const UNTYPED_REF_SENTINEL = "[]";
export const UNTYPED_BLOCK_SENTINEL = "{}";

export const BUILTIN_COMMANDS = {
  // Control

  if_: {
    signature: "if () {}",
  },
  ifElse: {
    signature: "if () {} else {}",
  },
  while_: {
    signature: "while () {}",
  },
  repeat: {
    signature: "repeat () times {}",
  },
  valReturn: {
    signature: "return ()",
  },
  voidReturn: {
    signature: "return",
  },

  // Variables

  let_: {
    signature: "let [] = ()",
  },
  var_: {
    signature: "var [] = ()",
  },
  assign: {
    signature: "set [] to ()",
  },
  increase: {
    signature: "increase [] by ()",
  },

  // Lists

  numberListCreate: {
    signature: "create number list []",
  },
  stringListCreate: {
    signature: "create string list []",
  },
  booleanListCreate: {
    signature: "create boolean list []",
  },

  listReplaceItem: {
    signature: "replace item () of [] with ()",
  },
  listInsert: {
    signature: "insert () at () of []",
  },
  listDeleteItem: {
    signature: "delete item () of []",
  },
  listDeleteAll: {
    signature: "delete all of []",
  },
  listAdd: {
    signature: "add () to []",
  },

  // Looks

  resizeCanvas: {
    signature: "resize canvas to width () height () and erase everything",
  },
  drawImage: {
    signature: "draw image () at x () y () with width () height ()",
  },
  clearRect: {
    signature: "erase rectangle at x () y () width () height ()",
  },
} as const;

export const BUILTIN_QUERIES = {
  // Lists

  listLength: {
    signature: "length of []",
  },
  listItemOf: {
    signature: "item () of []",
  },
  listOrIndexOf: {
    signature: "index of () in []",
  },
  listContains: {
    signature: "[] contains ()?",
  },

  // Operators

  opAdd: { signature: "() + ()" },
  opSub: { signature: "() - ()" },
  opMul: { signature: "() * ()" },
  opDiv: { signature: "() / ()" },
  opMod: { signature: "() mod ()" },
  opPow: { signature: "() to the power of ()" },

  opEq: { signature: "() == ()" },
  opNe: { signature: "() != ()" },
  opLt: { signature: "() < ()" },
  opLe: { signature: "() <= ()" },
  opGt: { signature: "() > ()" },
  opGe: { signature: "() >= ()" },

  opExp: { signature: "exp ()" },
  opLn: { signature: "ln ()" },
  opSinRad: { signature: "sin of () radians" },
  opCosRad: { signature: "cos of () radians" },
  opTanRad: { signature: "tan of () radians" },
  opAsinRad: { signature: "asin of () in radians" },
  opAcosRad: { signature: "acos of () in radians" },
  opAtanRad: { signature: "atan of () in radians" },
  opAtan2Rad: { signature: "atan2 of y () x () in radians" },
  opPi: { signature: "pi" },
  opNaN: { signature: "NaN" },
  opInfinity: { signature: "Infinity" },
  opNegInfinity: { signature: "-Infinity" },

  opFloor: { signature: "floor ()" },
  opCeil: { signature: "ceiling ()" },
  opRound: { signature: "round ()" },
  opAbs: { signature: "abs ()" },
  opMin: { signature: "min of () and ()" },
  opMax: { signature: "max of () and ()" },

  opAnd: { signature: "() and ()" },
  opOr: { signature: "() or ()" },
  opNot: { signature: "not ()" },

  opConcat: { signature: "() ++ ()" },
  stringLength: { signature: "length of ()" },
  stringLetter: { signature: "letter () of ()" },
  stringSubstring: {
    signature: "substring of () from () to ()",
  },
  stringContains: { signature: "() contains ()?" },
  stringIndexOf: { signature: "index of () in ()" },

  ternary: { signature: "if () then () else ()" },

  parseNumber: { signature: "parse () as number" },

  numberOrBooleanToString: { signature: "convert () to string" },

  randomInt: { signature: "random integer from () up to but not including ()" },

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

  keyPressed: { signature: "key () pressed?" },
} as const;
