export const UNTYPED_VAL_SENTINEL = "()";
export const UNTYPED_REF_SENTINEL = "[]";
export const UNTYPED_BLOCK_SENTINEL = "{}";

export const UNTYPED_BUILTINS = {
  // Control

  if_: {
    isQuery: false,
    signature: "if () {}",
  },
  ifElse: {
    isQuery: false,
    signature: "if () {} else {}",
  },
  while_: {
    isQuery: false,
    signature: "while () {}",
  },
  repeat: {
    isQuery: false,
    signature: "repeat () times {}",
  },
  valReturn: {
    isQuery: false,
    signature: "return ()",
  },
  voidReturn: {
    isQuery: false,
    signature: "return",
  },

  // Variables

  let_: {
    isQuery: false,
    signature: "let [] = ()",
  },
  var_: {
    isQuery: false,
    signature: "var [] = ()",
  },
  assign: {
    isQuery: false,
    signature: "set [] to ()",
  },
  increase: {
    isQuery: false,
    signature: "increase [] by ()",
  },

  // Lists

  numberListCreate: {
    isQuery: false,
    signature: "create number list []",
  },
  stringListCreate: {
    isQuery: false,
    signature: "create string list []",
  },
  booleanListCreate: {
    isQuery: false,
    signature: "create boolean list []",
  },

  listLength: {
    isQuery: true,
    signature: "length of []",
  },

  listItemOf: {
    isQuery: true,
    signature: "item () of []",
  },

  listOrIndexOf: {
    isQuery: true,
    signature: "index of () in []",
  },

  listContains: {
    isQuery: true,
    signature: "[] contains ()?",
  },

  listReplaceItem: {
    isQuery: false,
    signature: "replace item () of [] with ()",
  },
  listInsert: {
    isQuery: false,
    signature: "insert () at () of []",
  },
  listDeleteItem: {
    isQuery: false,
    signature: "delete item () of []",
  },
  listDeleteAll: {
    isQuery: false,
    signature: "delete all of []",
  },
  listAdd: {
    isQuery: false,
    signature: "add () to []",
  },

  // Operators

  opAdd: { isQuery: true, signature: "() + ()" },
  opSub: { isQuery: true, signature: "() - ()" },
  opMul: { isQuery: true, signature: "() * ()" },
  opDiv: { isQuery: true, signature: "() / ()" },
  opMod: { isQuery: true, signature: "() mod ()" },
  opPow: { isQuery: true, signature: "() to the power of ()" },

  opEq: { isQuery: true, signature: "() == ()" },
  opNe: { isQuery: true, signature: "() != ()" },
  opLt: { isQuery: true, signature: "() < ()" },
  opLe: { isQuery: true, signature: "() <= ()" },
  opGt: { isQuery: true, signature: "() > ()" },
  opGe: { isQuery: true, signature: "() >= ()" },

  opExp: { isQuery: true, signature: "exp ()" },
  opLn: { isQuery: true, signature: "ln ()" },
  opSinRad: { isQuery: true, signature: "sin of () radians" },
  opCosRad: { isQuery: true, signature: "cos of () radians" },
  opTanRad: { isQuery: true, signature: "tan of () radians" },
  opAsinRad: { isQuery: true, signature: "asin of () in radians" },
  opAcosRad: { isQuery: true, signature: "acos of () in radians" },
  opAtanRad: { isQuery: true, signature: "atan of () in radians" },
  opAtan2Rad: { isQuery: true, signature: "atan2 of y () x () in radians" },
  opPi: { isQuery: true, signature: "pi" },
  opNaN: { isQuery: true, signature: "NaN" },
  opInfinity: { isQuery: true, signature: "Infinity" },
  opNegInfinity: { isQuery: true, signature: "-Infinity" },

  opFloor: { isQuery: true, signature: "floor ()" },
  opCeil: { isQuery: true, signature: "ceiling ()" },
  opRound: { isQuery: true, signature: "round ()" },
  opAbs: { isQuery: true, signature: "abs ()" },
  opMin: { isQuery: true, signature: "min of () and ()" },
  opMax: { isQuery: true, signature: "max of () and ()" },

  opAnd: { isQuery: true, signature: "() and ()" },
  opOr: { isQuery: true, signature: "() or ()" },
  opNot: { isQuery: true, signature: "not ()" },

  opConcat: { isQuery: true, signature: "() ++ ()" },
  stringLength: { isQuery: true, signature: "length of ()" },
  stringLetter: { isQuery: true, signature: "letter () of ()" },
  stringSubstring: {
    isQuery: true,
    signature: "substring of () from () to ()",
  },
  stringContains: { isQuery: true, signature: "() contains ()?" },
  stringIndexOf: { isQuery: true, signature: "index of () in ()" },

  ternary: { isQuery: true, signature: "if () then () else ()" },

  parseNumber: { isQuery: true, signature: "parse () as number" },

  numberOrBooleanToString: { isQuery: true, signature: "convert () to string" },

  randomInt: { isQuery: true, signature: "random integer from () to ()" },

  // Sensing

  windowMouseX: { isQuery: true, signature: "window mouse x" },
  windowMouseY: { isQuery: true, signature: "window mouse y" },
  canvasMouseX: { isQuery: true, signature: "canvas mouse x" },
  canvasMouseY: { isQuery: true, signature: "canvas mouse y" },
  mouseDown: { isQuery: true, signature: "mouse down?" },

  windowWidth: { isQuery: true, signature: "window width" },
  windowHeight: { isQuery: true, signature: "window height" },
  canvasWidth: { isQuery: true, signature: "canvas width" },
  canvasHeight: { isQuery: true, signature: "canvas height" },

  millisecondsSinceUnixEpoch: {
    isQuery: true,
    signature: "milliseconds since unix epoch",
  },
  currentYear: { isQuery: true, signature: "current year" },
  currentMonth: { isQuery: true, signature: "current month" },
  currentDate: { isQuery: true, signature: "current date" },
  currentDayOfWeek: { isQuery: true, signature: "current day of the week" },
  currentHour: { isQuery: true, signature: "current hour" },
  currentMinute: { isQuery: true, signature: "current minute" },
  currentSecond: { isQuery: true, signature: "current second" },

  keyPressed: { isQuery: true, signature: "key () pressed?" },

  // Looks

  resizeCanvas: {
    isQuery: false,
    signature: "resize canvas to width () height () and erase everything",
  },
  drawImage: {
    isQuery: false,
    signature: "draw image () at x () y () with width () height ()",
  },
  clearRect: {
    isQuery: false,
    signature: "erase rectangle at x () y () width () height ()",
  },
} as const;
