import React from "react";
import "./App.css";
import { ParseResult, parse } from "./parser";
import { typecheck, NingTypeError } from "./typecheck";
import { ExecutionEnvironment, Program, getUncheckedProgram } from "./program";
import { NingKey, codeToKey } from "./key";
import { HELLO_WORLD_CODE } from "./helloWorldCode";

const LOCAL_STORAGE_CODE_KEY = "NingPlayground.UserCode";
const DEFAULT_CANVAS_DIMENSIONS = [480, 360];

export interface State {
  readonly code: string;
  readonly parseResultCache: ParseResult;
  readonly typeErrorsCache: NingTypeError[];
}

export class App extends React.Component<{}, State> {
  program: Program | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  codeInputBackdropRef: React.RefObject<HTMLDivElement>;
  codeInputTextareaRef: React.RefObject<HTMLTextAreaElement>;

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
    this.codeInputBackdropRef = React.createRef();
    this.codeInputTextareaRef = React.createRef();

    this.mouseClientX = 0;
    this.mouseClientY = 0;
    this.mouseDown = false;
    this.keysPressed = new Set();

    const initialCode = getInitialCodeFromLocalStorage();
    const parseResult = parse(initialCode);
    const typecheckResult = parseResult.succeeded
      ? typecheck(parseResult.value)
      : [];
    this.state = {
      code: initialCode,
      parseResultCache: parseResult,
      typeErrorsCache: typecheckResult,
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

  bindMethods(): void {
    this.onCodeChanged = this.onCodeChanged.bind(this);
    this.onCodeInputTextareaScrolled =
      this.onCodeInputTextareaScrolled.bind(this);
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

    const canvas = this.canvasRef.current;
    if (canvas !== null) {
      canvas.width = DEFAULT_CANVAS_DIMENSIONS[0];
      canvas.height = DEFAULT_CANVAS_DIMENSIONS[1];
    }
  }

  render(): React.ReactElement {
    return (
      <div className="App">
        <div className="TopBar">
          <h2 className="NingLogo">ning</h2>
        </div>

        <div className="LeftPanel">
          {/* The design for the CodeInput is inspired by https://codersblock.com/blog/highlight-text-inside-a-textarea/ */}
          <div className="CodeInput__Container">
            <div
              className="CodeInput__Backdrop"
              ref={this.codeInputBackdropRef}
            >
              <div className="CodeInput__Highlight">
                {highlight(this.state.code)}
                {
                  /**
                   * I don't why a (single) trailing newline in
                   * the textarea requires a _two_ trailing newlines
                   * in the highlighted overlay to maintain alignment.
                   * However, while I don't understand the underlying cause,
                   * the simplest solution is just to work around the issue.
                   * That is, if the code ends with a newline, we simply
                   * add an extra newline to the highlighted overlay.
                   *
                   * I first learned of this bug from https://codersblock.com/blog/highlight-text-inside-a-textarea/
                   */
                  this.state.code.endsWith("\n") ? "\n" : ""
                }
              </div>
            </div>

            <textarea
              className="CodeInput__Textarea"
              ref={this.codeInputTextareaRef}
              value={this.state.code}
              onInput={this.onCodeChanged}
              onScroll={this.onCodeInputTextareaScrolled}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            ></textarea>
          </div>
        </div>

        <div className="RightPanel">
          <button
            className="RunButton"
            disabled={
              !(
                this.state.parseResultCache.succeeded &&
                this.state.typeErrorsCache.length === 0
              )
            }
            onClick={this.onRunButtonClicked}
          >
            Run
          </button>

          <canvas className="NingCanvas" ref={this.canvasRef}></canvas>
        </div>
      </div>
    );
  }

  onCodeChanged(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    const code = event.target.value;
    const parseResult = parse(code);
    const typeErrors = parseResult.succeeded
      ? typecheck(parseResult.value)
      : [];
    this.setState({
      code,
      parseResultCache: parseResult,
      typeErrorsCache: typeErrors,
    });
    saveCodeToLocalStorage(code);
  }

  onCodeInputTextareaScrolled(): void {
    const backdrop = this.codeInputBackdropRef.current;
    const textarea = this.codeInputTextareaRef.current;
    if (!(backdrop !== null && textarea !== null)) {
      return;
    }

    backdrop.scrollTop = textarea.scrollTop;
    backdrop.scrollLeft = textarea.scrollLeft;
  }

  onRunButtonClicked(): void {
    const typeErrors = this.state.typeErrorsCache;
    const parseResult = this.state.parseResultCache;
    if (!(parseResult.succeeded && typeErrors.length === 0)) {
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
  const parseResult = parse(code);
  const noErrors =
    parseResult.succeeded && typecheck(parseResult.value).length === 0;

  if (!parseResult.succeeded) {
    console.log({ parseError: parseResult.error });
  } else {
    const typeErrors = typecheck(parseResult.value);
    if (typeErrors.length > 0) {
      console.log({ typeErrors });
    }
  }

  return [
    <span
      className="CodeInput__HighlightSpan"
      key={0}
      style={{ color: noErrors ? "#4c97ff" : "#ff6619" }}
    >
      {code}
    </span>,
  ];
}

function getInitialCodeFromLocalStorage(): string {
  const s = localStorage.getItem(LOCAL_STORAGE_CODE_KEY);
  if (s === null) {
    return HELLO_WORLD_CODE;
  }
  return s;
}

function saveCodeToLocalStorage(code: string): void {
  localStorage.setItem(LOCAL_STORAGE_CODE_KEY, code);
}
