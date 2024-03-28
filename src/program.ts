import * as ast from "./types/tysonTypeDict";
import { UNTYPED_BUILTINS, UNTYPED_SENTINEL } from "./untpedBuiltins";

export interface Program {
  execute(env: ExecutionEnvironment): void;
  stop(): void;
}

export interface ExecutionEnvironment {
  canvas: HTMLCanvasElement;
}

type NingPrimitive = number | string | boolean;

export function buildUncheckedProgram(file: ast.Def[]): Program {
  return new ProgramImpl(file);
}

class ProgramImpl implements Program {
  animationFrameId: number | null;
  ctx: CanvasRenderingContext2D;
  stack: { [variable: string]: NingPrimitive }[];

  constructor(private readonly defs: ast.Def[]) {
    this.bindMethods();
    this.animationFrameId = null;
    this.ctx = document.createElement("canvas").getContext("2d")!;
    this.stack = [{}];
  }

  bindMethods(): void {
    this.tick = this.tick.bind(this);
  }

  execute(env: ExecutionEnvironment): void {
    if (this.animationFrameId !== null) {
      throw new Error("Called `execute` when program was already running.");
    }

    const ctx = env.canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("Could not get 2d context from canvas.");
    }
    this.ctx = ctx;

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
    this.stack = [{}];
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

  evalExpr(expr: ast.Expression): NingPrimitive {
    // TODO
    return 0;
  }

  createVariable(name: string, value: NingPrimitive): void {
    this.stack[this.stack.length - 1][name] = value;
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
