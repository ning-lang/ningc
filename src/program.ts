import * as ast from "./types/tysonTypeDict";
import { UNTYPED_BUILTINS, UNTYPED_SENTINEL } from "./untypedBuiltins";

export interface Program {
  execute(env: ExecutionEnvironment): void;
  stop(): void;
}

export interface ExecutionEnvironment {
  ctx: CanvasRenderingContext2D;
}

type NingVal = number | string | boolean | number[] | string[] | boolean[];

export function buildUncheckedProgram(file: ast.Def[]): Program {
  return new ProgramImpl(file);
}

class ProgramImpl implements Program {
  animationFrameId: number | null;
  env: ExecutionEnvironment;
  stack: Map<string, NingVal>[];
  queryDefs: Map<string, ast.QueryDef>;

  constructor(private readonly defs: ast.Def[]) {
    this.bindMethods();
    this.animationFrameId = null;
    this.env = { ctx: document.createElement("canvas").getContext("2d")! };
    this.stack = [new Map()];
    this.queryDefs = new Map();
  }

  bindMethods(): void {
    this.tick = this.tick.bind(this);
  }

  execute(env: ExecutionEnvironment): void {
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
    this.stack = [new Map()];
    this.queryDefs = new Map();
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

    this.createVariable(varName, varValue);
  }

  update(): void {
    // TODO
  }

  render(): void {
    // TODO
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

      const varVal = this.getVarValOrNull(name);
      if (varVal !== null) {
        return varVal;
      }
    }

    return this.evalQueryApplication(expr);
  }

  getVarValOrNull(name: string): null | NingVal {
    for (let i = this.stack.length - 1; i >= 0; --i) {
      const val = this.stack[i].get(name);
      if (val !== undefined) {
        return val;
      }
    }
    return null;
  }

  evalQueryApplication(expr: ast.CompoundExpression): NingVal {
    const signature = getUntypedQueryApplicationSignatureString(expr);
    const queryDef = this.queryDefs.get(signature);
    if (queryDef === undefined) {
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
    return this.evalQueryApplicationUsingArgVals(queryDef, argVals);
  }

  evalQueryApplicationUsingArgVals(
    def: ast.QueryDef,
    argVals: NingVal[]
  ): NingVal {
    const argMap = getStackEntryWithArgs(def.signature, argVals);
    this.stack.push(argMap);

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
    // const commandSignatureString =
    //   getUntypedCommandApplicationSignatureString(command);
    // const args = getCommandApplicationArgs(command);
    // const argVals = args.map((arg) => this.evalExpr(arg));
    return null;
    // todo
  }

  createVariable(name: string, value: NingVal): void {
    this.stack[this.stack.length - 1].set(name, value);
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

function getStackEntryWithArgs(
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