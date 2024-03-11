import React from "react";
import "./App.css";

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
  }

  render() {
    return (
      <div className="App">
        <textarea
          value={this.state.code}
          onChange={this.onCodeChanged}
        ></textarea>

        <div>{highlight(this.state.code)}</div>
      </div>
    );
  }

  onCodeChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ code: event.target.value });
  }
}

function highlight(code: string): React.ReactElement[] {
  return [<span>{code}</span>];
}

enum NodeKind {
  Doc,
  TopLevelDef,
  Label,
  Phrase,
  Param,
  BlockCommand,
  Command,
  Expression,
  MutRef,
}

interface Doc {
  kind: NodeKind.Doc;
  defs: TopLevelDef[];
}

interface TopLevelDef {
  kind: NodeKind.TopLevelDef;
  defKind: Phrase;
  signature: SignaturePart[];
  body: BlockCommand;
}

type SignaturePart = Label | Param;

interface Label {
  kind: NodeKind.Label;
  name: Phrase;
}

interface Phrase {
  kind: NodeKind.Phrase;
  originalValue: string;
  normalizedValue: string;
  span: Span;
}

enum Type {
  Number,
  String,
  Boolean,
  NumberListRef,
  StringListRef,
  BooleanListRef,
  Command,
}

interface Param {
  kind: NodeKind.Param;
  typeSigilSpan: Span;
  type: Type;
  leftDelimiterSpan: Span;
  name: Phrase;
  rightDelimiterSpan: Span;
}

interface BlockCommand {
  kind: NodeKind.BlockCommand;
  leftCurlySpan: Span;
  commands: Command[];
  rightCurlySpan: Span;
}

interface Command {
  kind: NodeKind.Command;
  parts: CommandPart[];
  semicolonSpan: Span;
}

type CommandPart = Label | Expression | MutRef | BlockCommand;

interface Expression {
  kind: NodeKind.Expression;
  leftParenSpan: Span;
  parts: ExpressionPart[];
  rightParenSpan: Span;
}

type ExpressionPart = Label | Expression;

interface MutRef {
  kind: NodeKind.MutRef;
  leftSquareSpan: Span;
  name: Phrase;
  rightSquareSpan: Span;
}

interface Span {
  start: TextPosition;
  end: TextPosition;
}

interface TextPosition {
  byteIndex: number;
  line: number;
  column: number;
}

function parse(code: string): Doc {
  throw new Error("Todo");
}
