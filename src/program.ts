import * as ast from "./types/tysonTypeDict";
import {
  UNTYPED_BUILTINS,
  UNTYPED_VAL_SENTINEL,
  UNTYPED_REF_SENTINEL,
  UNTYPED_BLOCK_SENTINEL,
} from "./untypedBuiltins";

const RENDER_COMMAND_SIGNATURE = "render";
const UPDATE_COMMAND_SIGNATURE = "update";

export interface Program {
  start(env: ExecutionEnvironment): void;
  stop(): void;
}

export interface ExecutionEnvironment {
  ctx: CanvasRenderingContext2D;
  imageLibrary: Map<string, HTMLImageElement>;
}

type NingVal = number | string | boolean;

type RenderRequest = ResizeRequest | DrawRequest;

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

export function getUncheckedProgram(file: ast.Def[]): Program {
  return new ProgramImpl(file);
}

class ProgramImpl implements Program {
  animationFrameId: number | null;
  env: ExecutionEnvironment;
  stack: StackEntry[];
  /** A map of signature strings to their corresponding query definitions. */
  userQueryDefs: Map<string, ast.QueryDef>;
  /** A map of signature strings to their corresponding command definitions. */
  userCommandDefs: Map<string, ast.CommandDef>;
  renderQueue: RenderRequest[];

  constructor(private readonly defs: ast.Def[]) {
    this.bindMethods();
    this.animationFrameId = null;
    this.env = {
      ctx: document.createElement("canvas").getContext("2d")!,
      imageLibrary: new Map(),
    };
    this.stack = [getEmptyStackEntry()];
    this.userQueryDefs = new Map();
    this.userCommandDefs = new Map();
    this.renderQueue = [];
  }

  bindMethods(): void {
    this.tick = this.tick.bind(this);
  }

  start(env: ExecutionEnvironment): void {
    if (this.animationFrameId !== null) {
      throw new Error("Called `execute` when program was already running.");
    }

    this.env = env;

    this.reset();
    this.initGlobals();

    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  tick(): void {
    this.update();
    this.render();
  }

  stop(): void {
    if (this.animationFrameId === null) {
      throw new Error("Called `stop` when program was already stopped.");
    }

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  reset(): void {
    this.animationFrameId = null;
    this.env = {
      ctx: document.createElement("canvas").getContext("2d")!,
      imageLibrary: new Map(),
    };
    this.stack = [getEmptyStackEntry()];
    this.userQueryDefs = new Map();
    this.userCommandDefs = new Map();
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
    for (const command of def.body.commands) {
      this.updateGlobalsBasedOnGlobalDefCommand(command);
    }
  }

  updateGlobalsBasedOnGlobalDefCommand(command: ast.Command): void {
    const signature = getUntypedCommandApplicationSignatureString(command);

    if (
      !(
        signature === UNTYPED_BUILTINS.let_.signature.join(" ") ||
        signature === UNTYPED_BUILTINS.var_.signature.join(" ")
      )
    ) {
      return;
    }

    const [args, squares] =
      getCommandApplicationArgsAndSquaresAndBlockCommands(command);

    const varName = squares[0].identifiers.map((i) => i.name).join(" ");
    const varValue = this.evalExpr(args[0]);
    this.createVariableInTopStackEntry(varName, varValue);
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

      if (/^\d+(?:\.\d+)?$/.test(name)) {
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
    const signature = getUntypedQueryApplicationSignatureString(expr);
    const [args, squares] = getQueryApplicationArgsAndSquares(expr);

    // TODO: Check if the signature matches a builtin.

    if (signature === UNTYPED_BUILTINS.listLength.signature.join(" ")) {
      const listName = squares[0].identifiers.map((i) => i.name).join(" ");
      const list = this.getMutableList(listName);
      return list.items.length;
    }

    if (signature === UNTYPED_BUILTINS.listItemOf.signature.join(" ")) {
      // todo
    }

    // todo: check rest of builtins

    const userQueryDef = this.userQueryDefs.get(signature);
    if (userQueryDef === undefined) {
      throw new Error(
        "Attempted to evaluate " +
          stringifyExpression(expr) +
          " but could not find a query with signature `" +
          signature +
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
  executeCommandAndGetReturnValue(command: ast.Command): null | NingVal {
    const commandSignatureString =
      getUntypedCommandApplicationSignatureString(command);
    const [args, squares, blockCommands] =
      getCommandApplicationArgsAndSquaresAndBlockCommands(command);

    if (commandSignatureString === UNTYPED_BUILTINS.if_.signature.join(" ")) {
      if (this.evalExpr(args[0])) {
        return this.executeBlockCommandAndGetReturnValue(blockCommands[0]);
      }
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.ifElse.signature.join(" ")
    ) {
      if (this.evalExpr(args[0])) {
        return this.executeBlockCommandAndGetReturnValue(blockCommands[0]);
      }
      return this.executeBlockCommandAndGetReturnValue(blockCommands[1]);
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.while_.signature.join(" ")
    ) {
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

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.repeatUntil.signature.join(" ")
    ) {
      while (!this.evalExpr(args[0])) {
        const returnVal = this.executeBlockCommandAndGetReturnValue(
          blockCommands[0]
        );
        if (returnVal !== null) {
          return returnVal;
        }
      }
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.forever.signature.join(" ")
    ) {
      while (true) {
        const returnVal = this.executeBlockCommandAndGetReturnValue(
          blockCommands[0]
        );
        if (returnVal !== null) {
          return returnVal;
        }
      }
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.repeat.signature.join(" ")
    ) {
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

    if (
      commandSignatureString === UNTYPED_BUILTINS.return_.signature.join(" ")
    ) {
      return this.evalExpr(args[0]);
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.let_.signature.join(" ") ||
      commandSignatureString === UNTYPED_BUILTINS.var_.signature.join(" ")
    ) {
      const varName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const varValue = this.evalExpr(args[0]);
      this.createVariableInTopStackEntry(varName, varValue);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.assign.signature.join(" ")
    ) {
      const varName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const varValue = this.evalExpr(args[0]);
      this.setExistingVariable(varName, varValue);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.increase.signature.join(" ")
    ) {
      const varName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const varValue = this.evalExpr(args[0]);
      this.increaseExistingVariable(varName, varValue);
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.numberListCreate.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.createListInTopStackEntry(listName, "number");
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.stringListCreate.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.createListInTopStackEntry(listName, "string");
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.booleanListCreate.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.createListInTopStackEntry(listName, "boolean");
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.listReplaceItem.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const index = this.evalExpr(args[0]);
      const newItem = this.evalExpr(args[1]);
      this.replaceListItemIfPossible(listName, index, newItem);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.listInsert.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const index = this.evalExpr(args[1]);
      const newItem = this.evalExpr(args[0]);
      this.insertListItemIfPossible(listName, index, newItem);
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.listDeleteItem.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const index = this.evalExpr(args[0]);
      this.deleteListItemIfPossible(listName, index);
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.listDeleteAll.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      this.getMutableList(listName).items.splice(0, Infinity);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.listAdd.signature.join(" ")
    ) {
      const listName = squares[0].identifiers
        .map((ident) => ident.name)
        .join(" ");
      const item = this.evalExpr(args[0]);
      this.getMutableList(listName).items.push(item);
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.resizeCanvas.signature.join(" ")
    ) {
      const width = Math.floor(this.evalExpr(args[0]) as any);
      const height = Math.floor(this.evalExpr(args[1]) as any);

      if (!(Number.isFinite(width) && Number.isFinite(height))) {
        return null;
      }

      this.renderQueue.push({ kind: "resize", width, height });
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.drawImage.signature.join(" ")
    ) {
      const imageName = getStringValueIfExprIsString(args[0]);
      if (imageName === null) {
        throw new Error("Invalid image name: " + stringifyCommand(command));
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

    const signature = getUntypedCommandApplicationSignatureString(command);
    const userCommandDef = this.userCommandDefs.get(signature);
    if (userCommandDef !== undefined) {
      const argVals = args.map((arg) => this.evalExpr(arg));
      this.evalUserCommandApplicationUsingArgVals(userCommandDef, argVals);
      return null;
    }

    throw new Error(
      "Attempted to evaluate " +
        stringifyCommand(command) +
        " but could not find a command with signature `" +
        signature +
        "`"
    );
  }

  // If a `return` command is reached, this function will stop execution and return the value.
  // Otherwise, it will return `null`.
  executeBlockCommandAndGetReturnValue(
    command: ast.BlockCommand
  ): null | NingVal {
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

  createListInTopStackEntry(name: string, kind: ast.NingValKind): void {
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

function getUntypedQueryApplicationSignatureString(
  expr: ast.CompoundExpression
): string {
  return (
    expr.parts
      // eslint-disable-next-line array-callback-return
      .map((p): string => {
        switch (p.kind) {
          case "identifier":
            return p.name;
          case "parenthesized_expression":
            return UNTYPED_VAL_SENTINEL;
          case "square_bracketed_identifier_sequence":
            return UNTYPED_REF_SENTINEL;
        }
      })
      .join(" ")
  );
}

function getUntypedCommandApplicationSignatureString(
  expr: ast.Command
): string {
  return (
    expr.parts
      // eslint-disable-next-line array-callback-return
      .map((p): string => {
        switch (p.kind) {
          case "identifier":
            return p.name;
          case "parenthesized_expression":
            return UNTYPED_VAL_SENTINEL;
          case "square_bracketed_identifier_sequence":
            return UNTYPED_REF_SENTINEL;
          case "block_command":
            return UNTYPED_BLOCK_SENTINEL;
        }
      })
      .join(" ")
  );
}

function stringifyExpression(expr: ast.Expression): string {
  return "TODO IMPLEMENT stringifyExpression";
}

function getQueryApplicationArgsAndSquares(
  expr: ast.CompoundExpression
): [ast.Expression[], ast.SquareBracketedIdentifierSequence[]] {
  const args: ast.Expression[] = [];
  const squares: ast.SquareBracketedIdentifierSequence[] = [];
  for (const part of expr.parts) {
    if (part.kind === "identifier") {
      continue;
    }

    if (part.kind === "parenthesized_expression") {
      args.push(part.expression);
      continue;
    }

    if (part.kind === "square_bracketed_identifier_sequence") {
      squares.push(part);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exhaustivenessCheck: never = part;
  }
  return [args, squares];
}

function getCommandApplicationArgsAndSquaresAndBlockCommands(
  command: ast.Command
): [
  ast.Expression[],
  ast.SquareBracketedIdentifierSequence[],
  ast.BlockCommand[]
] {
  const args: ast.Expression[] = [];
  const squares: ast.SquareBracketedIdentifierSequence[] = [];
  const blockCommands: ast.BlockCommand[] = [];
  for (const part of command.parts) {
    if (part.kind === "identifier") {
      continue;
    }

    if (part.kind === "parenthesized_expression") {
      args.push(part.expression);
      continue;
    }

    if (part.kind === "square_bracketed_identifier_sequence") {
      squares.push(part);
      continue;
    }

    if (part.kind === "block_command") {
      blockCommands.push(part);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exhaustivenessCheck: never = part;
  }
  return [args, squares, blockCommands];
}

function getUntypedFunctionSignatureString(
  signature: ast.FuncSignaturePart[]
): string {
  return (
    signature
      // eslint-disable-next-line array-callback-return
      .map((p): string => {
        switch (p.kind) {
          case "identifier":
            return p.name;
          case "func_param_def":
            return UNTYPED_VAL_SENTINEL;
        }
      })
      .join(" ")
  );
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
  kind: ast.NingValKind;
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
