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

interface Doc {
  defs: Def;
}

type Def = QueryDef | CommandDef;

enum DefKind {
  Query,
  Command,
}

interface QueryDef {
  kind: DefKind.Query;
  signature: SignaturePart[];
  body: Expression[];
  span: Span;
}

interface CommandDef {
  kind: DefKind.Command;
  signature: SignaturePart[];
  body: Expression[];
  span: Span;
}

type SignaturePart = Label | Param;

interface Label {
  isLabel: true;
  name: Phrase;
}

interface Phrase {
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
  isLabel: false;
  name: Phrase;
  type: Type;
  span: Span;
}

interface Command {
  parts: ExpressionPart[];
  semicolonStart: TextPosition;
}

interface Expression {
  parts: ExpressionPart[];
}

type ExpressionPart = Label | Subexpression;

interface Subexpression {
  isLabel: false;
  expression: Expression;
  bracketKind: SubexpressionBracketKind;
  span: Span;
}

enum SubexpressionBracketKind {
  Paren = "paren",
  Square = "square",
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
