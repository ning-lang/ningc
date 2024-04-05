import {
  getCommandApplicationArgsAndSquaresAndBlockCommands,
  getQueryApplicationArgsAndSquares,
} from "./funcApplicationInputs";
import {
  getUntypedCommandApplicationSignatureString,
  getUntypedFunctionSignatureString,
  getUntypedQueryApplicationSignatureString,
} from "./funcSignatureString";
import * as ast from "./types/tysonTypeDict";
import { BUILTIN_COMMANDS, BUILTIN_QUERIES } from "./builtins";

const RENDER_COMMAND_SIGNATURE = "render";
const UPDATE_COMMAND_SIGNATURE = "update";
const VOID_RETURN_SENTINEL = Symbol("VOID_RETURN_SENTINEL");

export interface Program {
  start(env: ExecutionEnvironment): void;
  stop(): void;
}

export interface ExecutionEnvironment {
  ctx: CanvasRenderingContext2D;
  imageLibrary: Map<string, HTMLImageElement>;

  getWindowMouseX(): number;
  getWindowMouseY(): number;
  getCanvasMouseX(): number;
  getCanvasMouseY(): number;
  isMouseDown(): boolean;
  getWindowWidth(): number;
  getWindowHeight(): number;
  isKeyPressed(key: string): boolean;
}

type NingVal = number | string | boolean;

type RenderRequest = ResizeRequest | DrawRequest | ClearRectRequest;

interface ResizeRequest {
  kind: "resize";
  width: number;
  height: number;
}

interface DrawRequest {
  kind: "draw";
  imageName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ClearRectRequest {
  kind: "clear_rect";
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getUncheckedProgram(file: ast.Def[]): Program {
  return new ProgramImpl(file);
}

class ProgramImpl implements Program {
  animationFrameId: number | null;
  env: ExecutionEnvironment;
  stack: StackEntry[];
  /** A map of signature strings to their corresponding query definitions. */
  readonly userQueryDefs: ReadonlyMap<string, ast.QueryDef>;
  /** A map of signature strings to their corresponding command definitions. */
  readonly userCommandDefs: ReadonlyMap<string, ast.CommandDef>;
  renderQueue: RenderRequest[];

  constructor(private readonly defs: ast.Def[]) {
    this.bindMethods();
    this.animationFrameId = null;
    this.env = getDummyEnv();
    this.stack = [getEmptyStackEntry()];
    this.userQueryDefs = getUserQueryDefs(defs);
    this.userCommandDefs = getUserCommandDefs(defs);
    this.renderQueue = [];
  }

  bindMethods(): void {
    this.tick = this.tick.bind(this);
  }

  start(env: ExecutionEnvironment): void {
    (window as any).program = this;

    if (this.animationFrameId !== null) {
      throw new Error("Called `execute` when program was already running.");
    }

    this.reset(env);
    this.initGlobals();

    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  tick(): void {
    this.update();
    this.render();

    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.animationFrameId === null) {
      throw new Error("Called `stop` when program was already stopped.");
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  reset(env: ExecutionEnvironment): void {
    this.animationFrameId = null;
    this.env = env;
    this.stack = [getEmptyStackEntry()];
    this.renderQueue = [];
  }

  initGlobals(): void {
    for (const def of this.defs.filter(
      (d): d is ast.GlobalDef => d.kind === "global_def"
    )) {
      this.updateGlobalsBasedOnGlobalDef(def);
    }
  }

  updateGlobalsBasedOnGlobalDef(def: ast.GlobalDef): void {
    // This code is very similar to `evalUserCommandApplicationUsingArgVals`.
    // The main difference is that we don't modify push a stack entry
    // at the beginning and we don't pop a stack entry at the end,
    // since the whole purpose is to initialize variables in the global scope.
    for (const command of def.body.commands) {
      const returnVal = this.executeCommandAndGetReturnValue(command);
      if (returnVal !== null) {
        return;
      }
    }
  }

  update(): void {
    const updateCommandDef = this.userCommandDefs.get(UPDATE_COMMAND_SIGNATURE);
    if (updateCommandDef === undefined) {
      throw new Error("Could not find `update` command definition.");
    }
    this.evalUserCommandApplicationUsingArgVals(updateCommandDef, []);
  }

  render(): void {
    this.renderQueue = [];

    const renderCommandDef = this.userCommandDefs.get(RENDER_COMMAND_SIGNATURE);
    if (renderCommandDef === undefined) {
      throw new Error("Could not find `render` command definition.");
    }
    this.evalUserCommandApplicationUsingArgVals(renderCommandDef, []);

    this.processRenderQueue();
  }

  processRenderQueue(): void {
    for (const req of this.renderQueue) {
      this.processRenderRequest(req);
    }
  }

  processRenderRequest(req: RenderRequest): void {
    if (req.kind === "resize") {
      this.env.ctx.canvas.width = req.width;
      this.env.ctx.canvas.height = req.height;
      return;
    }

    if (req.kind === "draw") {
      const { imageName, x, y, width, height } = req;
      const image = this.env.imageLibrary.get(imageName);
      if (image === undefined) {
        throw new Error("Attempted to draw non-existent image: " + imageName);
      }
      this.env.ctx.drawImage(image, x, y, width, height);
      return;
    }

    if (req.kind === "clear_rect") {
      const { x, y, width, height } = req;
      this.env.ctx.clearRect(x, y, width, height);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exhaustivenessCheck: never = req;
  }

  evalExpr(expr: ast.Expression): NingVal {
    if (expr.kind === "string_literal") {
      return parseNingString(expr.source);
    }

    if (expr.kind === "compound_expression") {
      return this.evalCompoundExpr(expr);
    }

    // Unreachable.
    return expr;
  }

  evalCompoundExpr(expr: ast.CompoundExpression): NingVal {
    if (expr.parts.every((p): p is ast.Identifier => p.kind === "identifier")) {
      const name = expr.parts.map((p) => p.name).join(" ");

      if (name === "true") {
        return true;
      }
      if (name === "false") {
        return false;
      }

      if (getNingNumberLiteralRegex().test(name)) {
        return Number.parseFloat(name);
      }

      const varVal = this.getVarValOrNull(name);
      if (varVal !== null) {
        return varVal;
      }
    }

    return this.evalQueryApplication(expr);
  }

  getVarValOrNull(name: string): null | NingVal {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const val = this.stack[i].variables.get(name);
      if (val !== undefined) {
        return val;
      }
    }
    return null;
  }

  evalQueryApplication(expr: ast.CompoundExpression): NingVal {
    const sigString = getUntypedQueryApplicationSignatureString(expr);
    const [args, squares] = getQueryApplicationArgsAndSquares(expr);

    if (sigString === BUILTIN_QUERIES.listLength.signature) {
      const listName = squares[0].identifiers.map((i) => i.name).join(" ");
      const list = this.getMutableList(listName);
      return list.items.length;
    }

    if (sigString === BUILTIN_QUERIES.listItemOf.signature) {
      const index = this.evalExpr(args[0]);
      const listName = squares[0].identifiers.map((i) => i.name).join(" ");
      const list = this.getMutableList(listName);
      if (
        typeof index === "number" &&
        index === Math.floor(index) &&
        index >= 0 &&
        index < list.items.length
      ) {
        return list.items[index];
      }
      return getDefaultValueOfKind(list.kind);
    }

    if (sigString === BUILTIN_QUERIES.listOrIndexOf.signature) {
      const item = this.evalExpr(args[0]);
      const listName = squares[0].identifiers.map((i) => i.name).join(" ");
      const list = this.getMutableList(listName);
      return list.items.indexOf(item);
    }

    if (sigString === BUILTIN_QUERIES.listContains.signature) {
      const item = this.evalExpr(args[0]);
      const listName = squares[0].identifiers.map((i) => i.name).join(" ");
      const list = this.getMutableList(listName);
      return list.items.includes(item);
    }

    if (sigString === BUILTIN_QUERIES.opAdd.signature) {
      return (this.evalExpr(args[0]) as any) + (this.evalExpr(args[1]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opSub.signature) {
      return (this.evalExpr(args[0]) as any) - (this.evalExpr(args[1]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opMul.signature) {
      return (this.evalExpr(args[0]) as any) * (this.evalExpr(args[1]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opDiv.signature) {
      return (this.evalExpr(args[0]) as any) / (this.evalExpr(args[1]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opMod.signature) {
      return (this.evalExpr(args[0]) as any) % (this.evalExpr(args[1]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opPow.signature) {
      return (this.evalExpr(args[0]) as any) ** (this.evalExpr(args[1]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opEq.signature) {
      return ningEq(this.evalExpr(args[0]), this.evalExpr(args[1]));
    }

    if (sigString === BUILTIN_QUERIES.opNe.signature) {
      return !ningEq(this.evalExpr(args[0]), this.evalExpr(args[1]));
    }

    if (sigString === BUILTIN_QUERIES.opLt.signature) {
      return this.evalExpr(args[0]) < this.evalExpr(args[1]);
    }

    if (sigString === BUILTIN_QUERIES.opLe.signature) {
      return this.evalExpr(args[0]) <= this.evalExpr(args[1]);
    }

    if (sigString === BUILTIN_QUERIES.opGt.signature) {
      return this.evalExpr(args[0]) > this.evalExpr(args[1]);
    }

    if (sigString === BUILTIN_QUERIES.opGe.signature) {
      return this.evalExpr(args[0]) >= this.evalExpr(args[1]);
    }

    if (sigString === BUILTIN_QUERIES.opExp.signature) {
      return Math.exp(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opLn.signature) {
      return Math.log(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opSinRad.signature) {
      const rad = this.evalExpr(args[0]) as any;
      return Math.sin(rad);
    }

    if (sigString === BUILTIN_QUERIES.opCosRad.signature) {
      const rad = this.evalExpr(args[0]) as any;
      return Math.cos(rad);
    }

    if (sigString === BUILTIN_QUERIES.opTanRad.signature) {
      const rad = this.evalExpr(args[0]) as any;
      return Math.tan(rad);
    }

    if (sigString === BUILTIN_QUERIES.opAsinRad.signature) {
      return Math.asin(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opAcosRad.signature) {
      return Math.acos(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opAtanRad.signature) {
      return Math.atan(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opAtan2Rad.signature) {
      const y = this.evalExpr(args[0]) as any;
      const x = this.evalExpr(args[1]) as any;
      return Math.atan2(y, x);
    }

    if (sigString === BUILTIN_QUERIES.opPi.signature) {
      return Math.PI;
    }

    if (sigString === BUILTIN_QUERIES.opNaN.signature) {
      return NaN;
    }

    if (sigString === BUILTIN_QUERIES.opInfinity.signature) {
      return Infinity;
    }

    if (sigString === BUILTIN_QUERIES.opNegInfinity.signature) {
      return -Infinity;
    }

    if (sigString === BUILTIN_QUERIES.opFloor.signature) {
      return Math.floor(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opCeil.signature) {
      return Math.ceil(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opRound.signature) {
      return Math.round(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opAbs.signature) {
      return Math.abs(this.evalExpr(args[0]) as any);
    }

    if (sigString === BUILTIN_QUERIES.opMin.signature) {
      return Math.min(
        this.evalExpr(args[0]) as any,
        this.evalExpr(args[1]) as any
      );
    }

    if (sigString === BUILTIN_QUERIES.opMax.signature) {
      return Math.max(
        this.evalExpr(args[0]) as any,
        this.evalExpr(args[1]) as any
      );
    }

    if (sigString === BUILTIN_QUERIES.opAnd.signature) {
      const a = this.evalExpr(args[0]);
      const b = this.evalExpr(args[1]);
      return Boolean(a && b);
    }

    if (sigString === BUILTIN_QUERIES.opOr.signature) {
      const a = this.evalExpr(args[0]);
      const b = this.evalExpr(args[1]);
      return Boolean(a || b);
    }

    if (sigString === BUILTIN_QUERIES.opNot.signature) {
      return !this.evalExpr(args[0]);
    }

    if (sigString === BUILTIN_QUERIES.opConcat.signature) {
      return (this.evalExpr(args[0]) as any) + (this.evalExpr(args[1]) as any);
    }

    if (sigString === BUILTIN_QUERIES.stringLength.signature) {
      return (this.evalExpr(args[0]) as string).length;
    }

    if (sigString === BUILTIN_QUERIES.stringLetter.signature) {
      const s = this.evalExpr(args[0]) as string;
      const index = this.evalExpr(args[1]);
      if (
        Number.isFinite(index) &&
        index === Math.floor(index as number) &&
        index >= 0 &&
        index < s.length
      ) {
        return s.charAt(index);
      }

      return getDefaultValueOfKind("string");
    }

    if (sigString === BUILTIN_QUERIES.stringSubstring.signature) {
      const s = this.evalExpr(args[0]) as string;
      const start = this.evalExpr(args[1]);
      const end = this.evalExpr(args[2]);
      if (
        Number.isFinite(start) &&
        start === Math.floor(start as number) &&
        Number.isFinite(end) &&
        end === Math.floor(end as number)
      ) {
        return s.slice(start as number, end as number);
      }

      return getDefaultValueOfKind("string");
    }

    if (sigString === BUILTIN_QUERIES.stringContains.signature) {
      const haystack = this.evalExpr(args[0]) as string;
      const needle = this.evalExpr(args[1]);
      return haystack.includes(needle as any);
    }

    if (sigString === BUILTIN_QUERIES.stringIndexOf.signature) {
      const haystack = this.evalExpr(args[0]) as string;
      const needle = this.evalExpr(args[1]);
      return haystack.indexOf(needle as any);
    }

    if (sigString === BUILTIN_QUERIES.ternary.signature) {
      const question = this.evalExpr(args[0]);
      const answer = this.evalExpr(args[1]);
      const else_ = this.evalExpr(args[2]);
      return question ? answer : else_;
    }

    if (sigString === BUILTIN_QUERIES.parseNumber.signature) {
      const s = this.evalExpr(args[0]) as string;
      if (getNingNumberLiteralRegex().test(s)) {
        return parseFloat(s);
      }

      return NaN;
    }

    if (sigString === BUILTIN_QUERIES.numberOrBooleanToString.signature) {
      return String(this.evalExpr(args[0]));
    }

    if (sigString === BUILTIN_QUERIES.randomInt.signature) {
      const min = Math.floor(this.evalExpr(args[0]) as number);
      const max = Math.floor(this.evalExpr(args[1]) as number);
      return min + Math.floor(Math.random() * (max - min));
    }

    if (sigString === BUILTIN_QUERIES.windowMouseX.signature) {
      return this.env.getWindowMouseX();
    }

    if (sigString === BUILTIN_QUERIES.windowMouseY.signature) {
      return this.env.getWindowMouseY();
    }

    if (sigString === BUILTIN_QUERIES.canvasMouseX.signature) {
      return this.env.getCanvasMouseX();
    }

    if (sigString === BUILTIN_QUERIES.canvasMouseY.signature) {
      return this.env.getCanvasMouseY();
    }

    if (sigString === BUILTIN_QUERIES.mouseDown.signature) {
      return this.env.isMouseDown();
    }

    if (sigString === BUILTIN_QUERIES.windowHeight.signature) {
      return this.env.getWindowWidth();
    }

    if (sigString === BUILTIN_QUERIES.windowHeight.signature) {
      return this.env.getWindowHeight();
    }

    if (sigString === BUILTIN_QUERIES.canvasWidth.signature) {
      return this.env.ctx.canvas.width;
    }

    if (sigString === BUILTIN_QUERIES.canvasHeight.signature) {
      return this.env.ctx.canvas.height;
    }

    if (sigString === BUILTIN_QUERIES.millisecondsSinceUnixEpoch.signature) {
      return Date.now();
    }

    if (sigString === BUILTIN_QUERIES.currentYear.signature) {
      return new Date().getFullYear();
    }

    if (sigString === BUILTIN_QUERIES.currentMonth.signature) {
      return new Date().getMonth();
    }

    if (sigString === BUILTIN_QUERIES.currentDate.signature) {
      return new Date().getDate();
    }

    if (sigString === BUILTIN_QUERIES.currentDayOfWeek.signature) {
      return new Date().getDay();
    }

    if (sigString === BUILTIN_QUERIES.currentHour.signature) {
      return new Date().getHours();
    }

    if (sigString === BUILTIN_QUERIES.currentMinute.signature) {
      return new Date().getMinutes();
    }

    if (sigString === BUILTIN_QUERIES.currentSecond.signature) {
      return new Date().getSeconds();
    }

    if (sigString === BUILTIN_QUERIES.keyPressed.signature) {
      const key = this.evalExpr(args[0]);
      if (typeof key !== "string") {
        throw new Error(
          "Attempted to evaluate `" +
            stringifyExpression(expr) +
            "`, but the key was not a string."
        );
      }
      return this.env.isKeyPressed(key);
    }

    const userQueryDef = this.userQueryDefs.get(sigString);
    if (userQueryDef === undefined) {
      throw new Error(
        "Attempted to evaluate " +
          stringifyExpression(expr) +
          " but could not find a query with signature `" +
          sigString +
          "`"
      );
    }
    const argVals = args.map((arg) => this.evalExpr(arg));
    return this.evalUserQueryApplicationUsingArgVals(userQueryDef, argVals);
  }

  evalUserQueryApplicationUsingArgVals(
    def: ast.QueryDef,
    argVals: NingVal[]
  ): NingVal {
    const argMap = getVariableMapWithArgs(def.signature, argVals);
    this.stack.push({ variables: argMap, lists: new Map() });

    for (const command of def.body.commands) {
      const returnVal = this.executeCommandAndGetReturnValue(command);
      if (returnVal !== null) {
        this.stack.pop();
        if (returnVal === VOID_RETURN_SENTINEL) {
          throw new Error(
            "Attempted to evaluate the query `" +
              getUntypedFunctionSignatureString(def.signature) +
              "` with args (" +
              argVals.map((v) => JSON.stringify(v)).join(", ") +
              ") but a void `return` statement (i.e., one with no return value) was reached."
          );
        }
        return returnVal;
      }
    }
    throw new Error(
      "Attempted to evaluate the query `" +
        getUntypedFunctionSignatureString(def.signature) +
        "` with args (" +
        argVals.map((v) => JSON.stringify(v)).join(", ") +
        ") but no `return` command was executed."
    );
  }

  // If a `return` command is reached, this function will stop execution and return the value.
  // Otherwise, it will return `null`.
  executeCommandAndGetReturnValue(
    command: ast.Command
  ): null | typeof VOID_RETURN_SENTINEL | NingVal {
    const commandSignatureString =
      getUntypedCommandApplicationSignatureString(command);
    const [args, squares, blockCommands] =
      getCommandApplicationArgsAndSquaresAndBlockCommands(command);

    if (commandSignatureString === BUILTIN_COMMANDS.if_.signature) {
      if (this.evalExpr(args[0])) {
        return this.executeBlockCommandAndGetReturnValue(blockCommands[0]);
      }
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.ifElse.signature) {
      if (this.evalExpr(args[0])) {
        return this.executeBlockCommandAndGetReturnValue(blockCommands[0]);
      }
      return this.executeBlockCommandAndGetReturnValue(blockCommands[1]);
    }

    if (commandSignatureString === BUILTIN_COMMANDS.while_.signature) {
      while (this.evalExpr(args[0])) {
        const returnVal = this.executeBlockCommandAndGetReturnValue(
          blockCommands[0]
        );
        if (returnVal !== null) {
          return returnVal;
        }
      }
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.repeat.signature) {
      const rawTimes = this.evalExpr(args[0]);
      if (!Number.isFinite(rawTimes)) {
        throw new Error("Repeat iteration count was not a finite number.");
      }
      const times = Math.floor(rawTimes as number);

      for (let i = 0; i < times; ++i) {
        const returnVal = this.executeBlockCommandAndGetReturnValue(
          blockCommands[0]
        );
        if (returnVal !== null) {
          return returnVal;
        }
      }
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.valReturn.signature) {
      return this.evalExpr(args[0]);
    }

    if (commandSignatureString === BUILTIN_COMMANDS.voidReturn.signature) {
      return VOID_RETURN_SENTINEL;
    }

    if (
      commandSignatureString === BUILTIN_COMMANDS.let_.signature ||
      commandSignatureString === BUILTIN_COMMANDS.var_.signature
    ) {
      const varName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const varValue = this.evalExpr(args[0]);
      this.createVariableInTopStackEntry(varName, varValue);
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.assign.signature) {
      const varName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const varValue = this.evalExpr(args[0]);
      this.setExistingVariable(varName, varValue);
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.increase.signature) {
      const varName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const varValue = this.evalExpr(args[0]);
      this.increaseExistingVariable(varName, varValue);
      return null;
    }

    if (
      commandSignatureString === BUILTIN_COMMANDS.numberListCreate.signature
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.createListInTopStackEntry(listName, "number");
      return null;
    }

    if (
      commandSignatureString === BUILTIN_COMMANDS.stringListCreate.signature
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.createListInTopStackEntry(listName, "string");
      return null;
    }

    if (
      commandSignatureString === BUILTIN_COMMANDS.booleanListCreate.signature
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.createListInTopStackEntry(listName, "boolean");
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.listReplaceItem.signature) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const index = this.evalExpr(args[0]);
      const newItem = this.evalExpr(args[1]);
      this.replaceListItemIfPossible(listName, index, newItem);
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.listInsert.signature) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const index = this.evalExpr(args[1]);
      const newItem = this.evalExpr(args[0]);
      this.insertListItemIfPossible(listName, index, newItem);
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.listDeleteItem.signature) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const index = this.evalExpr(args[0]);
      this.deleteListItemIfPossible(listName, index);
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.listDeleteAll.signature) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.getMutableList(listName).items.splice(0, Infinity);
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.listAdd.signature) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const item = this.evalExpr(args[0]);
      this.getMutableList(listName).items.push(item);
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.resizeCanvas.signature) {
      const width = Math.floor(this.evalExpr(args[0]) as any);
      const height = Math.floor(this.evalExpr(args[1]) as any);

      if (!(Number.isFinite(width) && Number.isFinite(height))) {
        return null;
      }

      this.renderQueue.push({ kind: "resize", width, height });
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.drawImage.signature) {
      const imageName = getStringValueIfExprIsString(args[0]);
      if (imageName === null) {
        throw new Error("Invalid image name: " + stringifyExpression(args[0]));
      }

      const x = Math.floor(this.evalExpr(args[1]) as any);
      const y = Math.floor(this.evalExpr(args[2]) as any);
      const width = Math.floor(this.evalExpr(args[3]) as any);
      const height = Math.floor(this.evalExpr(args[4]) as any);
      if (
        !(
          Number.isFinite(x) &&
          Number.isFinite(y) &&
          Number.isFinite(width) &&
          Number.isFinite(height) &&
          width > 0 &&
          height > 0
        )
      ) {
        return null;
      }

      this.renderQueue.push({ kind: "draw", imageName, x, y, width, height });
      return null;
    }

    if (commandSignatureString === BUILTIN_COMMANDS.clearRect.signature) {
      const imageName = getStringValueIfExprIsString(args[0]);
      if (imageName === null) {
        throw new Error("Invalid image name: " + stringifyExpression(args[0]));
      }

      const x = Math.floor(this.evalExpr(args[1]) as any);
      const y = Math.floor(this.evalExpr(args[2]) as any);
      const width = Math.floor(this.evalExpr(args[3]) as any);
      const height = Math.floor(this.evalExpr(args[4]) as any);
      if (
        !(
          Number.isFinite(x) &&
          Number.isFinite(y) &&
          Number.isFinite(width) &&
          Number.isFinite(height) &&
          width > 0 &&
          height > 0
        )
      ) {
        return null;
      }

      this.renderQueue.push({ kind: "clear_rect", x, y, width, height });
      return null;
    }

    const sigString = getUntypedCommandApplicationSignatureString(command);
    const userCommandDef = this.userCommandDefs.get(sigString);
    if (userCommandDef !== undefined) {
      const argVals = args.map((arg) => this.evalExpr(arg));
      this.evalUserCommandApplicationUsingArgVals(userCommandDef, argVals);
      return null;
    }

    throw new Error(
      "Attempted to evaluate " +
        stringifyCommand(command) +
        " but could not find a command with signature `" +
        sigString +
        "`"
    );
  }

  // If a `return` command is reached, this function will stop execution and return the value.
  // Otherwise, it will return `null`.
  executeBlockCommandAndGetReturnValue(
    command: ast.BlockCommand
  ): null | typeof VOID_RETURN_SENTINEL | NingVal {
    this.stack.push(getEmptyStackEntry());
    for (const subCommand of command.commands) {
      const returnVal = this.executeCommandAndGetReturnValue(subCommand);
      if (returnVal !== null) {
        this.stack.pop();
        return returnVal;
      }
    }

    this.stack.pop();
    return null;
  }

  evalUserCommandApplicationUsingArgVals(
    def: ast.CommandDef,
    argVals: NingVal[]
  ): void {
    const argMap = getVariableMapWithArgs(def.signature, argVals);
    this.stack.push({ variables: argMap, lists: new Map() });

    for (const command of def.body.commands) {
      const returnVal = this.executeCommandAndGetReturnValue(command);
      if (returnVal !== null) {
        this.stack.pop();
        return;
      }
    }

    this.stack.pop();
  }

  createVariableInTopStackEntry(name: string, value: NingVal): void {
    this.stack[this.stack.length - 1].variables.set(name, value);
  }

  setExistingVariable(name: string, value: NingVal): void {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      if (this.stack[i].variables.has(name)) {
        this.stack[i].variables.set(name, value);
        return;
      }
    }
    throw new Error("Attempted to set value of non-existent variable: " + name);
  }

  increaseExistingVariable(name: string, amount: NingVal): void {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      if (this.stack[i].variables.has(name)) {
        this.stack[i].variables.set(
          name,
          (this.stack[i].variables.get(name) as number) + (amount as number)
        );
        return;
      }
    }
    throw new Error("Attempted to set value of non-existent variable: " + name);
  }

  createListInTopStackEntry(name: string, kind: ast.NingType): void {
    console.log({ name, kind });
    this.stack[this.stack.length - 1].lists.set(name, { kind, items: [] });
  }

  // If the index is invalid, this is a no-op.
  replaceListItemIfPossible(name: string, index: NingVal, item: NingVal): void {
    const list = this.getMutableList(name);
    if (
      typeof index === "number" &&
      index === Math.floor(index) &&
      index >= 0 &&
      index < list.items.length
    ) {
      list.items[index] = item;
      return;
    }
  }

  // If the index is invalid, this is a no-op.
  insertListItemIfPossible(name: string, index: NingVal, item: NingVal): void {
    const list = this.getMutableList(name);
    if (
      typeof index === "number" &&
      index === Math.floor(index) &&
      index >= 0 &&
      index < list.items.length
    ) {
      list.items.splice(index, 0, item);
      return;
    }
  }

  // If the index is invalid, this is a no-op.
  deleteListItemIfPossible(name: string, index: NingVal): void {
    const list = this.getMutableList(name);
    if (
      typeof index === "number" &&
      index === Math.floor(index) &&
      index >= 0 &&
      index < list.items.length
    ) {
      list.items.splice(index, 1);
      return;
    }
  }

  getMutableList(name: string): NingList {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const list = this.stack[i].lists.get(name);
      if (list !== undefined) {
        return list;
      }
    }
    throw new Error("Attempted to access non-existent list: " + name);
  }
}

function stringifyCommand(command: ast.Command): string {
  return "TODO IMPLEMENT stringifyCommand;";
}

function parseNingString(source: string): string {
  if (source.charAt(0) !== '"' || source.charAt(source.length - 1) !== '"') {
    throw new Error(
      "Invalid string literal: `" +
        source +
        "`. String literals must start and end in quotes. "
    );
  }

  let out = "";
  let i = 1;
  while (i < source.length - 1) {
    if (source.charAt(i) === '"') {
      throw new Error(
        "Invalid string literal: `" +
          source +
          "`. String literals must not contain quotes, except at the beginning and end."
      );
    }

    if (source.charAt(i) === "{") {
      const nextRCurlyIndex = source.indexOf("}", i);
      if (nextRCurlyIndex === -1) {
        throw new Error(
          "Invalid string literal: `" + source + "`. Missing `}`."
        );
      }
      const escape = source.slice(i + 1, nextRCurlyIndex);
      out += parseNingStringEscapeCodeWithoutCurlyBraces(escape);
      i = nextRCurlyIndex + 1;
      continue;
    }

    out += source.charAt(i);
    ++i;
  }

  return out;
}

function parseNingStringEscapeCodeWithoutCurlyBraces(escape: string): string {
  if (!/^0x[0-9a-fA-F]+$/.test(escape)) {
    throw new Error(
      "Invalid escape code: `" +
        escape +
        "`. Escape codes must match the pattern /^0x[0-9a-fA-F]+$/."
    );
  }

  const hex = escape.slice(2);
  const parsed = parseInt(hex, 16);
  if (Number.isNaN(parsed)) {
    throw new Error(
      "Invalid escape code: `" +
        escape +
        "`. Could not parse as hexadecimal number."
    );
  }

  return String.fromCodePoint(parsed);
}

function stringifyExpression(expr: ast.Expression): string {
  return "TODO IMPLEMENT stringifyExpression";
}

function getVariableMapWithArgs(
  signature: ast.FuncSignaturePart[],
  argVals: NingVal[]
): Map<string, NingVal> {
  const argMap = new Map<string, NingVal>();
  let numberOfArgsAdded = 0;
  for (let i = 0; i < signature.length; ++i) {
    const part = signature[i];
    if (part.kind === "func_param_def") {
      argMap.set(
        part.name.map((ident) => ident.name).join(" "),
        argVals[numberOfArgsAdded]
      );
      ++numberOfArgsAdded;
    }
  }
  return argMap;
}

interface StackEntry {
  variables: Map<string, NingVal>;
  lists: Map<string, NingList>;
}

interface NingList {
  kind: ast.NingType;
  items: NingVal[];
}

function getEmptyStackEntry(): StackEntry {
  return { variables: new Map(), lists: new Map() };
}

// If `expr` is a string literal, this function returns the string value.
// Otherwise, it returns `null`.
function getStringValueIfExprIsString(expr: ast.Expression): null | string {
  if (expr.kind === "string_literal") {
    return parseNingString(expr.source);
  }
  return null;
}

function getDefaultValueOfKind(kind: ast.NingType): NingVal {
  if (kind === "number") {
    return 0;
  }
  if (kind === "string") {
    return "";
  }
  if (kind === "boolean") {
    return false;
  }

  const exhaustivenessCheck: never = kind;
  return exhaustivenessCheck;
}

function getNingNumberLiteralRegex(): RegExp {
  return /^-?[0-9]+(?:\.[0-9]+)?(?:e-?[0-9]+)?$/;
}

function getDummyEnv(): ExecutionEnvironment {
  return {
    ctx: document.createElement("canvas").getContext("2d")!,
    imageLibrary: new Map(),

    getWindowMouseX: () => 0,
    getWindowMouseY: () => 0,
    getCanvasMouseX: () => 0,
    getCanvasMouseY: () => 0,
    isMouseDown: () => false,

    getWindowWidth: () => window.innerWidth,
    getWindowHeight: () => window.innerHeight,
    isKeyPressed: () => false,
  };
}

function getUserQueryDefs(defs: ast.Def[]): Map<string, ast.QueryDef> {
  const out: Map<string, ast.QueryDef> = new Map();

  for (const def of defs) {
    if (def.kind === "query_def") {
      const sigString = getUntypedFunctionSignatureString(def.signature);
      out.set(sigString, def);
    }
  }

  return out;
}

function getUserCommandDefs(defs: ast.Def[]): Map<string, ast.CommandDef> {
  const out: Map<string, ast.CommandDef> = new Map();

  for (const def of defs) {
    if (def.kind === "command_def") {
      const sigString = getUntypedFunctionSignatureString(def.signature);
      out.set(sigString, def);
    }
  }

  return out;
}

/**
 * Equality is defined slightly different in Ning than in JavaScript.
 * Namely, `NaN` is equal to `NaN`.
 */
function ningEq(a: NingVal, b: NingVal): boolean {
  return a === b || (Number.isNaN(a) && Number.isNaN(b));
}
