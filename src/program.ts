import * as ast from "./types/tysonTypeDict";
import { UNTYPED_BUILTINS, UNTYPED_SENTINEL } from "./untypedBuiltins";

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

type NingAtom = number | string | boolean;

interface DrawRequest {
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
  desiredCanvasWidth: number;
  desiredCanvasHeight: number;
  drawQueue: DrawRequest[];

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
    this.desiredCanvasWidth = 0;
    this.desiredCanvasHeight = 0;
    this.drawQueue = [];
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
    this.desiredCanvasWidth = 0;
    this.desiredCanvasHeight = 0;
    this.drawQueue = [];
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
    let match = getCommandMatchStatus(command, UNTYPED_BUILTINS.let_.signature);
    if (!match.succeeded) {
      match = getCommandMatchStatus(command, UNTYPED_BUILTINS.var_.signature);
    }
    if (!match.succeeded) {
      return;
    }

    const varName = getStaticSquareName(match.args[0]);
    if (varName === null) {
      throw new Error("Invalid variable name: " + stringifyCommand(command));
    }

    const varValueNode = getExprFromCommandPart(match.args[1]);
    if (varValueNode === null) {
      throw new Error("Invalid variable value: " + stringifyCommand(command));
    }

    const varValue = this.evalExpr(varValueNode);

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
    const { ctx } = this.env;
    const { canvas } = ctx;
    if (
      !(
        canvas.width === this.desiredCanvasWidth &&
        canvas.height === this.desiredCanvasHeight
      )
    ) {
      canvas.width = this.desiredCanvasWidth;
      canvas.height = this.desiredCanvasHeight;
    }

    this.drawQueue = [];

    const renderCommandDef = this.userCommandDefs.get(RENDER_COMMAND_SIGNATURE);
    if (renderCommandDef === undefined) {
      throw new Error("Could not find `render` command definition.");
    }
    this.evalUserCommandApplicationUsingArgVals(renderCommandDef, []);

    this.processDrawQueue();
  }

  processDrawQueue(): void {
    for (const req of this.drawQueue) {
      const { imageName, x, y, width, height } = req;
      const image = this.env.imageLibrary.get(imageName);
      if (image === undefined) {
        throw new Error("Attempted to draw non-existent image: " + imageName);
      }
      this.env.ctx.drawImage(image, x, y, width, height);
    }
  }

  evalExpr(expr: ast.Expression): NingAtom {
    if (expr.kind === "string_literal") {
      return parseNingString(expr.source);
    }

    if (expr.kind === "compound_expression") {
      return this.evalCompoundExpr(expr);
    }

    // Unreachable.
    return expr;
  }

  evalCompoundExpr(expr: ast.CompoundExpression): NingAtom {
    if (expr.parts.every((p): p is ast.Identifier => p.kind === "identifier")) {
      const name = expr.parts.map((p) => p.name).join(" ");

      if (name === "true") {
        return true;
      }
      if (name === "false") {
        return false;
      }

      const varVal = this.getVarValOrNull(name);
      if (varVal !== null) {
        return varVal;
      }
    }

    return this.evalQueryApplication(expr);
  }

  getVarValOrNull(name: string): null | NingAtom {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const val = this.stack[i].atoms.get(name);
      if (val !== undefined) {
        return val;
      }
    }
    return null;
  }

  evalQueryApplication(expr: ast.CompoundExpression): NingAtom {
    const signature = getUntypedQueryApplicationSignatureString(expr);

    if (/^\d+$/.test(signature)) {
      return Number.parseInt(signature, 10);
    }

    // TODO: Check if the signature matches a builtin.

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
    const args = getQueryApplicationArgs(expr);
    const argVals = args.map((arg) => this.evalExpr(arg));
    return this.evalUserQueryApplicationUsingArgVals(userQueryDef, argVals);
  }

  evalUserQueryApplicationUsingArgVals(
    def: ast.QueryDef,
    argVals: NingAtom[]
  ): NingAtom {
    const argMap = getVariableMapWithArgs(def.signature, argVals);
    this.stack.push({ atoms: argMap, lists: new Map() });

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
  executeCommandAndGetReturnValue(command: ast.Command): null | NingAtom {
    const commandSignatureString =
      getUntypedCommandApplicationSignatureString(command);
    const [args, blockCommands] =
      getCommandApplicationArgsAndBlockCommands(command);

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
      const varName = getIdentifierSequenceName(args[0]);
      if (varName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      const varValue = this.evalExpr(args[1]);

      this.createVariableInTopStackEntry(varName, varValue);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.assign.signature.join(" ")
    ) {
      const varName = getIdentifierSequenceName(args[0]);
      if (varName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      const varValue = this.evalExpr(args[1]);

      this.setExistingVariable(varName, varValue);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.increase.signature.join(" ")
    ) {
      const varName = getIdentifierSequenceName(args[0]);
      if (varName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      const varValue = this.evalExpr(args[1]);

      this.increaseExistingVariable(varName, varValue);
      return null;
    }

    if (
      commandSignatureString ===
        UNTYPED_BUILTINS.numberListCreate.signature.join(" ") ||
      commandSignatureString ===
        UNTYPED_BUILTINS.stringListCreate.signature.join(" ") ||
      commandSignatureString ===
        UNTYPED_BUILTINS.booleanListCreate.signature.join(" ")
    ) {
      const listName = getIdentifierSequenceName(args[0]);
      if (listName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      this.createListInTopStackEntry(listName);
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.listReplaceItem.signature.join(" ")
    ) {
      const listName = getIdentifierSequenceName(args[1]);
      if (listName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      const index = this.evalExpr(args[0]);
      const newItem = this.evalExpr(args[2]);

      this.replaceListItemIfPossible(listName, index, newItem);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.listInsert.signature.join(" ")
    ) {
      const listName = getIdentifierSequenceName(args[2]);
      if (listName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      const index = this.evalExpr(args[1]);
      const newItem = this.evalExpr(args[0]);

      this.insertListItemIfPossible(listName, index, newItem);
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.listDeleteItem.signature.join(" ")
    ) {
      const listName = getIdentifierSequenceName(args[1]);
      if (listName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      const index = this.evalExpr(args[0]);

      this.deleteListItemIfPossible(listName, index);
      return null;
    }

    if (
      commandSignatureString ===
      UNTYPED_BUILTINS.listDeleteAll.signature.join(" ")
    ) {
      const listName = getIdentifierSequenceName(args[0]);
      if (listName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      this.getMutableList(listName).splice(0, Infinity);
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.listAdd.signature.join(" ")
    ) {
      const listName = getIdentifierSequenceName(args[1]);
      if (listName === null) {
        throw new Error("Invalid variable name: " + stringifyCommand(command));
      }

      const item = this.evalExpr(args[0]);

      this.getMutableList(listName).push(item);
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

      this.desiredCanvasWidth = width;
      this.desiredCanvasHeight = height;
      return null;
    }

    if (
      commandSignatureString === UNTYPED_BUILTINS.drawImage.signature.join(" ")
    ) {
      const imageName = getStringValue(args[0]);
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

      this.drawQueue.push({ imageName, x, y, width, height });
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
  ): null | NingAtom {
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
    argVals: NingAtom[]
  ): void {
    const argMap = getVariableMapWithArgs(def.signature, argVals);
    this.stack.push({ atoms: argMap, lists: new Map() });

    for (const command of def.body.commands) {
      const returnVal = this.executeCommandAndGetReturnValue(command);
      if (returnVal !== null) {
        this.stack.pop();
        return;
      }
    }

    this.stack.pop();
  }

  createVariableInTopStackEntry(name: string, value: NingAtom): void {
    this.stack[this.stack.length - 1].atoms.set(name, value);
  }

  setExistingVariable(name: string, value: NingAtom): void {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      if (this.stack[i].atoms.has(name)) {
        this.stack[i].atoms.set(name, value);
        return;
      }
    }
    throw new Error("Attempted to set value of non-existent variable: " + name);
  }

  increaseExistingVariable(name: string, amount: NingAtom): void {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      if (this.stack[i].atoms.has(name)) {
        this.stack[i].atoms.set(
          name,
          (this.stack[i].atoms.get(name) as number) + (amount as number)
        );
        return;
      }
    }
    throw new Error("Attempted to set value of non-existent variable: " + name);
  }

  createListInTopStackEntry(name: string): void {
    this.stack[this.stack.length - 1].lists.set(name, []);
  }

  // If the index is invalid, this is a no-op.
  replaceListItemIfPossible(
    name: string,
    index: NingAtom,
    item: NingAtom
  ): void {
    const list = this.getMutableList(name);
    if (
      typeof index === "number" &&
      index === Math.floor(index) &&
      index >= 0 &&
      index < list.length
    ) {
      list[index] = item;
      return;
    }
  }

  // If the index is invalid, this is a no-op.
  insertListItemIfPossible(
    name: string,
    index: NingAtom,
    item: NingAtom
  ): void {
    const list = this.getMutableList(name);
    if (
      typeof index === "number" &&
      index === Math.floor(index) &&
      index >= 0 &&
      index < list.length
    ) {
      list.splice(index, 0, item);
      return;
    }
  }

  // If the index is invalid, this is a no-op.
  deleteListItemIfPossible(name: string, index: NingAtom): void {
    const list = this.getMutableList(name);
    if (
      typeof index === "number" &&
      index === Math.floor(index) &&
      index >= 0 &&
      index < list.length
    ) {
      list.splice(index, 1);
      return;
    }
  }

  getMutableList(name: string): NingAtom[] {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const list = this.stack[i].lists.get(name);
      if (list !== undefined) {
        return list;
      }
    }
    throw new Error("Attempted to access non-existent list: " + name);
  }
}

type CommandMatchResult = CommandMatchOk | CommandMatchErr;

interface CommandMatchOk {
  succeeded: true;
  args: ast.NonIdentifierCommandPart[];
}

interface CommandMatchErr {
  succeeded: false;
}

function getCommandMatchStatus(
  command: ast.Command,
  signature: readonly string[]
): CommandMatchResult {
  if (command.parts.length !== signature.length) {
    return { succeeded: false };
  }

  const args: ast.NonIdentifierCommandPart[] = [];

  for (let i = 0; i < command.parts.length; ++i) {
    const commandPart = command.parts[i];
    const expectedPart = signature[i];

    if (
      commandPart.kind === "identifier" &&
      commandPart.name === expectedPart
    ) {
      continue;
    }

    if (
      commandPart.kind !== "identifier" &&
      expectedPart === UNTYPED_SENTINEL
    ) {
      args.push(commandPart);
      continue;
    }

    return { succeeded: false };
  }

  return { succeeded: true, args };
}

// If `part` is a square-bracketed expression containing a sequence of `Identifier`s,
// this function returns the names of each identifier joined by spaces.
// Otherwise, it returns `null`.
function getStaticSquareName(part: ast.CommandPart): null | string {
  if (
    !(
      part.kind === "square_bracketed_expression" &&
      part.expression.kind === "compound_expression"
    )
  ) {
    return null;
  }

  const nameParts = part.expression.parts;
  if (
    !nameParts.every(
      (part): part is ast.Identifier => part.kind === "identifier"
    )
  ) {
    return null;
  }

  return nameParts.join(" ");
}

// If `expr` is a sequence of `Identifier`s, this function returns
// the names of each identifier joined by spaces.
// Otherwise, it returns `null`.
function getIdentifierSequenceName(expr: ast.Expression): null | string {
  if (expr.kind === "compound_expression") {
    const { parts } = expr;
    if (
      parts.every((part): part is ast.Identifier => part.kind === "identifier")
    ) {
      return parts.map((part) => part.name).join(" ");
    }
  }

  return null;
}

function stringifyCommand(command: ast.Command): string {
  return "TODO IMPLEMENT stringifyCommand;";
}

function getExprFromCommandPart(
  commandPart: ast.CommandPart
): null | ast.Expression {
  if (commandPart.kind === "parenthesized_expression") {
    return commandPart.expression;
  }

  if (commandPart.kind === "square_bracketed_expression") {
    return commandPart.expression;
  }

  if (
    commandPart.kind === "block_command" ||
    commandPart.kind === "identifier"
  ) {
    return null;
  }

  // Unreachable.
  // `commandPart` should have type `never`.
  return commandPart;
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
          case "square_bracketed_expression":
            return UNTYPED_SENTINEL;
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
          case "square_bracketed_expression":
          case "block_command":
            return UNTYPED_SENTINEL;
        }
      })
      .join(" ")
  );
}

function stringifyExpression(expr: ast.Expression): string {
  return "TODO IMPLEMENT stringifyExpression";
}

function getQueryApplicationArgs(
  expr: ast.CompoundExpression
): ast.Expression[] {
  return (
    expr.parts
      // eslint-disable-next-line array-callback-return
      .map((p): ast.Expression | null => {
        switch (p.kind) {
          case "identifier":
            return null;
          case "parenthesized_expression":
          case "square_bracketed_expression":
            return p.expression;
        }
      })
      .filter((arg): arg is ast.Expression => arg !== null)
  );
}

function getCommandApplicationArgsAndBlockCommands(
  command: ast.Command
): [ast.Expression[], ast.BlockCommand[]] {
  let args: ast.Expression[] = [];
  let blockCommands: ast.BlockCommand[] = [];
  for (const part of command.parts) {
    if (part.kind === "identifier") {
      continue;
    }

    if (part.kind === "block_command") {
      blockCommands.push(part);
      continue;
    }

    if (
      part.kind === "parenthesized_expression" ||
      part.kind === "square_bracketed_expression"
    ) {
      args.push(part.expression);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exhaustivenessCheck: never = part;
  }
  return [args, blockCommands];
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
            return UNTYPED_SENTINEL;
        }
      })
      .join(" ")
  );
}

function getVariableMapWithArgs(
  signature: ast.FuncSignaturePart[],
  argVals: NingAtom[]
): Map<string, NingAtom> {
  const argMap = new Map<string, NingAtom>();
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
  atoms: Map<string, NingAtom>;
  lists: Map<string, NingAtom[]>;
}

function getEmptyStackEntry(): StackEntry {
  return { atoms: new Map(), lists: new Map() };
}

// If `expr` is a string literal, this function returns the string value.
// Otherwise, it returns `null`.
function getStringValue(expr: ast.Expression): null | string {
  if (expr.kind === "string_literal") {
    return parseNingString(expr.source);
  }
  return null;
}
