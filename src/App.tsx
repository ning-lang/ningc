import React from "react";
import "./App.css";
import { ParseResult, parse } from "./parser";
import { TypecheckResult, typecheck } from "./typecheck";

export interface State {
  readonly code: string;
  readonly parseResultCache: ParseResult;
  readonly typecheckResultCache: null | TypecheckResult;
}

export class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

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
    if (typecheckResult === null || !typecheckResult.succeeded) {
      return;
    }

    // TODO: Run the program
  }
}

function highlight(code: string): React.ReactElement[] {
  const result = parse(code);
  return [<span style={{ color: result.succeeded ? "" : "red" }}>{code}</span>];
}
