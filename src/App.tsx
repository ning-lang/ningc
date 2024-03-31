import React from "react";
import "./App.css";
import { ParseResult, parse } from "./parser";
import { TypecheckResult, typecheck } from "./typecheck";
import { ExecutionEnvironment, Program, getUncheckedProgram } from "./program";
import { NingKey, codeToKey } from "./key";

export interface State {
  readonly code: string;
  readonly parseResultCache: ParseResult;
  readonly typecheckResultCache: null | TypecheckResult;
}

export class App extends React.Component<{}, State> {
  program: Program | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;

  mouseClientX: number;
  mouseClientY: number;
  mouseDown: boolean;
  keysPressed: Set<NingKey>;

  placeholder_background: HTMLImageElement;
  placeholder_paddle: HTMLImageElement;
  placeholder_ball: HTMLImageElement;

  constructor(props: {}) {
    super(props);

    this.program = null;
    this.canvasRef = React.createRef();

    this.mouseClientX = 0;
    this.mouseClientY = 0;
    this.mouseDown = false;
    this.keysPressed = new Set();

    const defaultCode = "";
    const parseResult = parse(defaultCode);
    const typecheckResult = parseResult.succeeded
      ? typecheck(parseResult.value)
      : null;
    this.state = {
      code: defaultCode,
      parseResultCache: parseResult,
      typecheckResultCache: typecheckResult,
    };

    this.bindMethods();

    this.placeholder_background = new Image();
    this.placeholder_background.src = "background.png";
    this.placeholder_paddle = new Image();
    this.placeholder_paddle.src = "paddle.png";
    this.placeholder_ball = new Image();
    this.placeholder_ball.src = "ball.png";

    (window as any).app = this;
  }

  bindMethods() {
    this.onCodeChanged = this.onCodeChanged.bind(this);
    this.onRunButtonClicked = this.onRunButtonClicked.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.getWindowMouseX = this.getWindowMouseX.bind(this);
    this.getWindowMouseY = this.getWindowMouseY.bind(this);
    this.getCanvasMouseX = this.getCanvasMouseX.bind(this);
    this.getCanvasMouseY = this.getCanvasMouseY.bind(this);
    this.isMouseDown = this.isMouseDown.bind(this);
    this.getWindowWidth = this.getWindowWidth.bind(this);
    this.getWindowHeight = this.getWindowHeight.bind(this);
    this.isKeyPressed = this.isKeyPressed.bind(this);
  }

  componentDidMount(): void {
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  render() {
    return (
      <div className="App">
        {/* The design for the CodeInput is inspired by https://codersblock.com/blog/highlight-text-inside-a-textarea/ */}
        <div className="CodeInput__Container">
          <div className="CodeInput__Backdrop">
            <div className="CodeInput__Highlight">
              {highlight(this.state.code)}
            </div>
          </div>

          <textarea
            className="CodeInput__Textarea"
            value={this.state.code}
            onChange={this.onCodeChanged}
          ></textarea>
        </div>

        <button
          disabled={!this.state.typecheckResultCache?.succeeded}
          onClick={this.onRunButtonClicked}
        >
          Run
        </button>

        <canvas ref={this.canvasRef}></canvas>
      </div>
    );
  }

  onCodeChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const code = event.target.value;
    const parseResult = parse(code);
    const typecheckResult = parseResult.succeeded
      ? typecheck(parseResult.value)
      : null;
    this.setState({
      code,
      parseResultCache: parseResult,
      typecheckResultCache: typecheckResult,
    });
  }

  onRunButtonClicked(): void {
    const typecheckResult = this.state.typecheckResultCache;
    const parseResult = this.state.parseResultCache;
    if (
      !parseResult.succeeded ||
      typecheckResult === null ||
      !typecheckResult.succeeded
    ) {
      return;
    }

    if (this.program !== null) {
      this.program.stop();
    }

    const env = this.getExecutionEnv();
    if (env === null) {
      return;
    }

    const program = getUncheckedProgram(parseResult.value);
    program.start(env);

    this.program = program;
  }

  getExecutionEnv(): null | ExecutionEnvironment {
    const canvas = this.canvasRef.current;
    if (canvas === null) {
      return null;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("Could not get 2d context");
    }

    const imageLibrary = new Map<string, HTMLImageElement>();
    imageLibrary.set("background.png", this.placeholder_background);
    imageLibrary.set("left_paddle.png", this.placeholder_paddle);
    imageLibrary.set("right_paddle.png", this.placeholder_paddle);
    imageLibrary.set("ball.png", this.placeholder_ball);

    return {
      ctx,
      imageLibrary,
      getWindowMouseX: this.getWindowMouseX,
      getWindowMouseY: this.getWindowMouseY,
      getCanvasMouseX: this.getCanvasMouseX,
      getCanvasMouseY: this.getCanvasMouseY,
      isMouseDown: this.isMouseDown,
      getWindowWidth: this.getWindowWidth,
      getWindowHeight: this.getWindowHeight,
      isKeyPressed: this.isKeyPressed,
    };
  }

  getWindowMouseX(): number {
    return this.mouseClientX;
  }

  getWindowMouseY(): number {
    return this.mouseClientY;
  }

  getCanvasMouseX(): number {
    const canvas = this.canvasRef.current;
    if (canvas === null) {
      return 0;
    }

    const rect = canvas.getBoundingClientRect();
    return this.mouseClientX - rect.left;
  }

  getCanvasMouseY(): number {
    const canvas = this.canvasRef.current;
    if (canvas === null) {
      return 0;
    }

    const rect = canvas.getBoundingClientRect();
    return this.mouseClientY - rect.top;
  }

  isMouseDown(): boolean {
    return this.mouseDown;
  }

  getWindowWidth(): number {
    return window.innerWidth;
  }

  getWindowHeight(): number {
    return window.innerHeight;
  }

  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key as NingKey);
  }

  onMouseMove(event: MouseEvent): void {
    this.mouseClientX = event.clientX;
    this.mouseClientY = event.clientY;
  }

  onMouseDown(event: MouseEvent): void {
    this.mouseDown = true;
  }

  onMouseUp(event: MouseEvent): void {
    this.mouseDown = false;
  }

  onKeyDown(event: KeyboardEvent): void {
    const keyName = this.getNingKeyName(event.code);
    if (keyName !== null) {
      this.keysPressed.add(keyName);
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    const keyName = this.getNingKeyName(event.code);
    if (keyName !== null) {
      this.keysPressed.delete(keyName);
    }
  }

  // This shouldn't need to be a method.
  // However, for some strange reason, when
  // I made it a function, it resulted in a runtime
  // error saying the name `getNingKeyName` was not found.
  // I think this is a bug in the TypeScript compiler
  // handling `bind`.
  getNingKeyName(code: string): null | NingKey {
    return codeToKey(code);
  }
}

function highlight(code: string): React.ReactElement[] {
  const result = parse(code);
  return [
    <mark key={0} style={{ color: result.succeeded ? "purple" : "red" }}>
      {code}
    </mark>,
  ];
}
