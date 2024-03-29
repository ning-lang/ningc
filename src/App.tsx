import React from "react";
import "./App.css";
import { ParseResult, parse } from "./parser";
import { TypecheckResult, typecheck } from "./typecheck";
import { Program, getUncheckedProgram } from "./program";

export interface State {
  readonly code: string;
  readonly parseResultCache: ParseResult;
  readonly typecheckResultCache: null | TypecheckResult;
}

export class App extends React.Component<{}, State> {
  program: Program | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;

  constructor(props: {}) {
    super(props);

    this.program = null;
    this.canvasRef = React.createRef();

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
  }

  bindMethods() {
    this.onCodeChanged = this.onCodeChanged.bind(this);
    this.onRunButtonClicked = this.onRunButtonClicked.bind(this);
  }

  render() {
    return (
      <div className="App">
        <textarea
          value={this.state.code}
          onChange={this.onCodeChanged}
        ></textarea>

        <div className="highlightedCode">{highlight(this.state.code)}</div>

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

    const canvas = this.canvasRef.current;
    if (canvas === null) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("Could not get 2d context");
    }

    if (this.program !== null) {
      this.program.stop();
    }

    const program = getUncheckedProgram(parseResult.value);
    program.start({ ctx, imageLibrary: new Map() });

    this.program = program;
  }
}

function highlight(code: string): React.ReactElement[] {
  const result = parse(code);
  return [
    <span key={0} style={{ color: result.succeeded ? "" : "red" }}>
      {code}
    </span>,
  ];
}
