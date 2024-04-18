import React from "react";
import "./App.css";
import { ParseResult, parse } from "./parser";
import { typecheck, NingTypeError } from "./typecheck";
import { ExecutionEnvironment, Program, getUncheckedProgram } from "./program";
import { NingKey, codeToKey } from "./key";
import { HELLO_WORLD_CODE } from "./helloWorldCode";
import { getErrorSpans as getErrorLocationBoundaries } from "./errorSpan";
import { INDENT_SIZE } from "./stringifyNingNode";

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
  codeInputHighlightBackdropRef: React.RefObject<HTMLDivElement>;
  codeInputUnderlineBackdropRef: React.RefObject<HTMLDivElement>;
  codeInputTextareaRef: React.RefObject<HTMLTextAreaElement>;

  mouseClientX: number;
  mouseClientY: number;
  mouseDown: boolean;
  keysPressed: Set<NingKey>;

  isCodeInputTextareaFocused: boolean;

  placeholder_background: HTMLImageElement;
  placeholder_paddle: HTMLImageElement;
  placeholder_ball: HTMLImageElement;

  constructor(props: {}) {
    super(props);

    this.program = null;
    this.canvasRef = React.createRef();
    this.codeInputHighlightBackdropRef = React.createRef();
    this.codeInputUnderlineBackdropRef = React.createRef();
    this.codeInputTextareaRef = React.createRef();

    this.mouseClientX = 0;
    this.mouseClientY = 0;
    this.mouseDown = false;
    this.keysPressed = new Set();

    this.isCodeInputTextareaFocused = false;

    const initialCode = getInitialCodeFromLocalStorage();
    const parseResult = parse(initialCode);
    const typecheckResult = parseResult.parseSucceeded
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
    this.onCodeInputTextareaFocused =
      this.onCodeInputTextareaFocused.bind(this);
    this.onCodeInputTextareaBlurred =
      this.onCodeInputTextareaBlurred.bind(this);
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
          <img src="./ning_logo.png" alt="Ning logo" className="NingLogo" />
        </div>

        <div className="LeftPanel">
          {/* The design for the CodeInput is inspired by https://codersblock.com/blog/highlight-text-inside-a-textarea/ */}
          <div className="CodeInput__Container">
            <div
              className="CodeInput__Backdrop CodeInput__Backdrop--highlight"
              ref={this.codeInputHighlightBackdropRef}
            >
              <div className="CodeInput__BackdropContent">
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

            <div
              className="CodeInput__Backdrop CodeInput__Backdrop--underline"
              ref={this.codeInputUnderlineBackdropRef}
            >
              <div className="CodeInput__BackdropContent CodeInput__BackdropContent--underline">
                {underlineErrors(
                  this.state.code,
                  this.state.parseResultCache,
                  this.state.typeErrorsCache
                )}
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
              onFocus={this.onCodeInputTextareaFocused}
              onBlur={this.onCodeInputTextareaBlurred}
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
                this.state.parseResultCache.parseSucceeded &&
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
    this.updateCodeAndDependents(event.target.value);
  }

  updateCodeAndDependents(
    code: string,
    onSetStateFinished: () => void = noOp
  ): void {
    const parseResult = parse(code);
    const typeErrors = parseResult.parseSucceeded
      ? typecheck(parseResult.value)
      : [];
    this.setState(
      {
        code,
        parseResultCache: parseResult,
        typeErrorsCache: typeErrors,
      },
      onSetStateFinished
    );

    saveCodeToLocalStorage(code);
  }

  onCodeInputTextareaScrolled(): void {
    this.syncCodeInputScroll();
  }

  syncCodeInputScroll(): void {
    const highlightBackdrop = this.codeInputHighlightBackdropRef.current;
    const underlineBackdrop = this.codeInputUnderlineBackdropRef.current;
    const textarea = this.codeInputTextareaRef.current;
    if (
      !(
        highlightBackdrop !== null &&
        underlineBackdrop !== null &&
        textarea !== null
      )
    ) {
      return;
    }

    highlightBackdrop.scrollTop = textarea.scrollTop;
    highlightBackdrop.scrollLeft = textarea.scrollLeft;

    underlineBackdrop.scrollTop = textarea.scrollTop;
    underlineBackdrop.scrollLeft = textarea.scrollLeft;
  }

  onCodeInputTextareaFocused(): void {
    this.isCodeInputTextareaFocused = true;
  }

  onCodeInputTextareaBlurred(): void {
    this.isCodeInputTextareaFocused = false;
  }

  onRunButtonClicked(): void {
    const typeErrors = this.state.typeErrorsCache;
    const parseResult = this.state.parseResultCache;
    if (!(parseResult.parseSucceeded && typeErrors.length === 0)) {
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
    this.syncCodeInputScroll();

    const keyName = this.getNingKeyName(event.code);
    if (keyName !== null) {
      this.keysPressed.add(keyName);
    }

    this.handleSmartEnterIfNeeded(event);
    this.handleSmartTabIfNeeded(event);
    this.handleSmartRCurlyIfNeeded(event);
  }

  handleSmartEnterIfNeeded(event: KeyboardEvent): void {
    const textarea = this.codeInputTextareaRef.current;
    if (
      !(
        textarea !== null &&
        event.code === "Enter" &&
        this.isCodeInputTextareaFocused
      )
    ) {
      return;
    }

    const { selectionStart, selectionEnd } = textarea;
    const prefix = this.state.code.slice(0, selectionStart);
    const suffix = this.state.code.slice(selectionEnd);
    const goalIndentationSpaceCount = guessIndentationSpacesAtEndOf(prefix);
    const spaceCountAfterCursorBeforeNonspace = getLeadingSpaceCount(suffix);
    const appliedIndentationSpaceCount = Math.max(
      0,
      goalIndentationSpaceCount - spaceCountAfterCursorBeforeNonspace
    );

    const newCode =
      prefix + "\n" + " ".repeat(appliedIndentationSpaceCount) + suffix;
    event.preventDefault();
    this.updateCodeAndDependents(newCode, () => {
      textarea.focus();
      textarea.selectionStart =
        selectionStart + 1 + appliedIndentationSpaceCount;
      textarea.selectionEnd = textarea.selectionStart;
    });
  }

  handleSmartTabIfNeeded(event: KeyboardEvent): void {
    const textarea = this.codeInputTextareaRef.current;
    if (
      !(
        textarea !== null &&
        event.code === "Tab" &&
        this.isCodeInputTextareaFocused
      )
    ) {
      return;
    }

    const { selectionStart, selectionEnd } = textarea;
    const prefix = this.state.code.slice(0, selectionStart);
    const suffix = this.state.code.slice(selectionEnd);
    const goalIndentationSpaceCount = guessIndentationSpacesAtEndOf(prefix);
    const column = getColumnAtEndOf(prefix);
    const appliedIndentationSpaceCount =
      column < goalIndentationSpaceCount
        ? goalIndentationSpaceCount - column
        : INDENT_SIZE - (column % INDENT_SIZE);

    const newCode = prefix + " ".repeat(appliedIndentationSpaceCount) + suffix;
    event.preventDefault();
    this.updateCodeAndDependents(newCode, () => {
      textarea.focus();
      textarea.selectionStart = selectionStart + appliedIndentationSpaceCount;
      textarea.selectionEnd = textarea.selectionStart;
    });
  }

  handleSmartRCurlyIfNeeded(event: KeyboardEvent): void {
    const textarea = this.codeInputTextareaRef.current;
    if (
      !(
        textarea !== null &&
        event.code === "BracketRight" &&
        this.isCodeInputTextareaFocused
      )
    ) {
      return;
    }

    const { selectionStart, selectionEnd } = textarea;
    const prefix = this.state.code.slice(0, selectionStart);
    const suffix = this.state.code.slice(selectionEnd);

    if (!(/(?:\n|^)\s*$/.test(prefix) && /^\s*(?:\n|$)/.test(suffix))) {
      return;
    }
    const strippedPrefix = prefix.replace(/[\t ]+$/, "");

    const goalIndentationSpaceCount = Math.max(
      0,
      guessIndentationSpacesAtEndOf(prefix) - INDENT_SIZE
    );

    const newCode =
      strippedPrefix + " ".repeat(goalIndentationSpaceCount) + "}" + suffix;

    event.preventDefault();
    this.updateCodeAndDependents(newCode, () => {
      textarea.focus();
      textarea.selectionStart = (
        strippedPrefix +
        " ".repeat(goalIndentationSpaceCount) +
        "}"
      ).length;
      textarea.selectionEnd = textarea.selectionStart;
    });
  }

  onKeyUp(event: KeyboardEvent): void {
    this.syncCodeInputScroll();

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
  interface SpanBuilder {
    className: string;
    code: string;
  }

  const out: SpanBuilder[] = [];
  let remainingCode = code;
  while (remainingCode.length > 0) {
    const lastNonWhitespaceTokenSpanBuilder = arrayFindLast(
      out,
      (builder) => !/^\s+$/.test(builder.code)
    );
    const wasLastNonWhitespaceTokenCommandOrQueryKeyword =
      lastNonWhitespaceTokenSpanBuilder !== undefined &&
      /^(?:Command|Query)$/.test(lastNonWhitespaceTokenSpanBuilder.code);
    const wasLastNonWhitespaceTokenATypeKeyword =
      lastNonWhitespaceTokenSpanBuilder !== undefined &&
      /^(?:Boolean|Number|String)$/.test(
        lastNonWhitespaceTokenSpanBuilder.code
      );

    const commentMatch = remainingCode.match(/^\/\/[^\n]*/);
    if (commentMatch !== null) {
      out.push({
        className: "CodeInput__HighlightSpan CodeInput__HighlightSpan--comment",
        code: commentMatch[0],
      });
      remainingCode = remainingCode.slice(commentMatch[0].length);
      continue;
    }

    const whitespaceMatch = remainingCode.match(/^\s+/);
    if (whitespaceMatch !== null) {
      out.push({
        className:
          "CodeInput__HighlightSpan CodeInput__HighlightSpan--whitespace",
        code: whitespaceMatch[0],
      });
      remainingCode = remainingCode.slice(whitespaceMatch[0].length);
      continue;
    }

    const parenthesizedLiteralMatch = remainingCode.match(
      /^\(\s*(?:true|false|NaN|Infinity|-Infinity|(?:-?[0-9]+(?:\.[0-9]+)?(?:e-?[0-9]+)?(?![a-zA-Z]))|(?:"(?:[^"{}]|\{0x[0-9a-fA-F]+\})*"))\s*\)/
    );
    if (parenthesizedLiteralMatch !== null) {
      out.push({
        className:
          "CodeInput__HighlightSpan CodeInput__HighlightSpan--parenthesizedLiteral",
        code: parenthesizedLiteralMatch[0],
      });
      remainingCode = remainingCode.slice(parenthesizedLiteralMatch[0].length);
      continue;
    }

    const structuralKeywordMatch = remainingCode.match(
      /^(?:Boolean|Number|String|Global|Query|Command|(?:(?:if|while|repeat|return)(?=\s*\())|(?:else(?=\s*\{))|(?:return(?=\s*;)))\b/
    );
    if (structuralKeywordMatch !== null) {
      out.push({
        className:
          "CodeInput__HighlightSpan CodeInput__HighlightSpan--structuralKeyword",
        code: structuralKeywordMatch[0],
      });
      remainingCode = remainingCode.slice(structuralKeywordMatch[0].length);
      continue;
    }

    if (!wasLastNonWhitespaceTokenCommandOrQueryKeyword) {
      const parenthesizedIdentifierSequenceMatch = remainingCode.match(
        /^\(\s*(?:NaN|Infinity|[-]Infinity|[^\s()[\]{};A-Z"]+)(?:\s+(?:NaN|Infinity|[-]Infinity|[^\s()[\]{};A-Z"]+))*\s*\)/
      );
      if (parenthesizedIdentifierSequenceMatch !== null) {
        out.push({
          className:
            "CodeInput__HighlightSpan CodeInput__HighlightSpan--parenthesizedIdentifierSequence",
          code: parenthesizedIdentifierSequenceMatch[0],
        });
        remainingCode = remainingCode.slice(
          parenthesizedIdentifierSequenceMatch[0].length
        );
        continue;
      }
    }

    const squareMatch = remainingCode.match(
      /^\[\s*(?:NaN|Infinity|[-]Infinity|[^\s()[\]{};A-Z"]+)(?:\s+(?:NaN|Infinity|[-]Infinity|[^\s()[\]{};A-Z"]+))*\s*\]/
    );
    if (squareMatch !== null) {
      out.push({
        className: "CodeInput__HighlightSpan CodeInput__HighlightSpan--square",
        code: squareMatch[0],
      });
      remainingCode = remainingCode.slice(squareMatch[0].length);
      continue;
    }

    const paramDefLeftParenMatch = remainingCode.match(
      /^\((?=\s*(?:Boolean|Number|String)\b)/
    );
    if (paramDefLeftParenMatch !== null) {
      out.push({
        className:
          "CodeInput__HighlightSpan CodeInput__HighlightSpan--paramDefLeftParen",
        code: paramDefLeftParenMatch[0],
      });
      remainingCode = remainingCode.slice(paramDefLeftParenMatch[0].length);
      continue;
    }

    if (wasLastNonWhitespaceTokenATypeKeyword) {
      const zeroOrMoreIdentifiersAndRightParamMatch = remainingCode.match(
        /^(?:(?:^|\s+)(?:NaN|Infinity|[-]Infinity|[^\s()[\]{};A-Z"]+))*\)/
      );
      if (zeroOrMoreIdentifiersAndRightParamMatch !== null) {
        out.push({
          className:
            "CodeInput__HighlightSpan CodeInput__HighlightSpan--paramDefParamNameAndRightParam",
          code: zeroOrMoreIdentifiersAndRightParamMatch[0],
        });
        remainingCode = remainingCode.slice(
          zeroOrMoreIdentifiersAndRightParamMatch[0].length
        );
        continue;
      }
    }

    const punctuationMatch = remainingCode.match(/^[()[\]{};]/);
    if (punctuationMatch !== null) {
      out.push({
        className:
          "CodeInput__HighlightSpan CodeInput__HighlightSpan--punctuation",
        code: punctuationMatch[0],
      });
      remainingCode = remainingCode.slice(punctuationMatch[0].length);
      continue;
    }

    const identifierMatch = remainingCode.match(
      /^(?:NaN|Infinity|-Infinity|[^\s()[\]{};A-Z"]+)/
    );
    if (identifierMatch !== null) {
      out.push({
        className:
          "CodeInput__HighlightSpan CodeInput__HighlightSpan--identifier",
        code: identifierMatch[0],
      });
      remainingCode = remainingCode.slice(identifierMatch[0].length);
      continue;
    }

    const badIdentifierMatch = remainingCode.match(/^[^\s()[\]{};"]+/);
    if (badIdentifierMatch !== null) {
      out.push({
        className:
          "CodeInput__HighlightSpan CodeInput__HighlightSpan--badIdentifier",
        code: badIdentifierMatch[0],
      });
      remainingCode = remainingCode.slice(badIdentifierMatch[0].length);
      continue;
    }

    out.push({
      className: "CodeInput__HighlightSpan CodeInput__HighlightSpan--lexError",
      code: remainingCode,
    });
    break;
  }

  const duplicateCount: Map<string, number> = new Map();
  return out.map((builder) => {
    const i = duplicateCount.get(builder.code) ?? 0;
    duplicateCount.set(builder.code, i + 1);
    return (
      <span className={builder.className} key={i + ":" + builder.code}>
        {builder.code}
      </span>
    );
  });
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

/**
 * For some reason, TypeScript doesn't seem to support `Array.prototype.findLast`,
 * even though tsconfig.json has `esnext` as part of `lib`.
 * So, we use this homemade version instead.
 */
function arrayFindLast<T>(
  arr: readonly T[],
  predicate: (t: T) => boolean
): T | undefined {
  for (let i = arr.length - 1; i >= 0; --i) {
    if (predicate(arr[i])) {
      return arr[i];
    }
  }
  return undefined;
}

function underlineErrors(
  code: string,
  parseResult: ParseResult,
  typeErrors: readonly NingTypeError[]
): React.ReactElement[] {
  interface ErrorLocationBoundary {
    kind: "start" | "end";
    codeIndex: number;
  }

  const boundaries: ErrorLocationBoundary[] = getErrorLocationBoundaries(
    parseResult,
    typeErrors
  ).flatMap((errorSpan) => [
    { kind: "start", codeIndex: errorSpan.startIndex },
    { kind: "end", codeIndex: errorSpan.endIndex },
  ]);
  boundaries.sort((a, b) => a.codeIndex - b.codeIndex);

  interface SpanBuilder {
    isUnderlined: boolean;
    code: string;
  }

  const out: SpanBuilder[] = [];
  let errorNestLevel = 0;
  let currentBoundaryIndex = 0;
  let lastCodeSliceEnd = 0;
  while (lastCodeSliceEnd < code.length) {
    if (currentBoundaryIndex >= boundaries.length) {
      out.push({
        isUnderlined: errorNestLevel > 0,
        code: code.slice(lastCodeSliceEnd),
      });
      break;
    }

    const boundary = boundaries[currentBoundaryIndex];
    out.push({
      isUnderlined: errorNestLevel > 0,
      code: code.slice(lastCodeSliceEnd, boundary.codeIndex),
    });

    errorNestLevel += boundary.kind === "start" ? 1 : -1;
    ++currentBoundaryIndex;
    lastCodeSliceEnd = boundary.codeIndex;
  }

  const duplicateCount: Map<string, number> = new Map();
  return out.map((builder) => {
    const i = duplicateCount.get(builder.code) ?? 0;
    duplicateCount.set(builder.code, i + 1);
    const className = builder.isUnderlined ? "CodeInput__UnderlineSpan" : "";
    return (
      <span className={className} key={i + ":" + builder.code}>
        {builder.code}
      </span>
    );
  });
}

function guessIndentationSpacesAtEndOf(code: string): number {
  let braceScore = 0;
  for (let i = 0; i < code.length; ++i) {
    if (code.charAt(i) === "{") {
      ++braceScore;
      continue;
    }

    if (code.charAt(i) === "}") {
      --braceScore;
      continue;
    }
  }

  return Math.max(0, INDENT_SIZE * braceScore);
}

function getLeadingSpaceCount(s: string): number {
  for (let i = 0; i < s.length; ++i) {
    if (s.charAt(i) !== " ") {
      return i;
    }
  }
  return s.length;
}

function noOp(): void {}

function getColumnAtEndOf(s: string): number {
  const lastNewlineIndex = s.lastIndexOf("\n");

  if (lastNewlineIndex === -1) {
    return s.length;
  }

  return s.length - lastNewlineIndex - 1;
}
