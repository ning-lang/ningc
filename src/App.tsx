import React from "react";
import "./App.css";
import { parse } from "./parser";
import { typecheck } from "./typecheck";

export interface State {
  readonly code: string;
}

export class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      code: "",
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

        <button onClick={this.onRunButtonClicked}>Run</button>
      </div>
    );
  }

  onCodeChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ code: event.target.value });
  }

  onRunButtonClicked(): void {
    const parseResult = parse(this.state.code);
    if (!parseResult.succeeded) {
      return;
    }

    const typecheckResult = typecheck(parseResult.value);
    if (!typecheckResult.succeeded) {
      return;
    }

    // TODO: Run the program
  }
}

function highlight(code: string): React.ReactElement[] {
  const result = parse(code);
  return [<span style={{ color: result.succeeded ? "" : "red" }}>{code}</span>];
}
