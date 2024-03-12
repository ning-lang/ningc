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
  leftParenSpan: Span;
  signature: SignaturePart[];
  rightParenSpan: Span;
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
  span: Span;
}

interface Param {
  kind: NodeKind.Param;
  typeSigilSpan: Span;
  leftDelimiterSpan: Span;
  name: Phrase;
  type: Phrase;
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

enum ParseStateKind {
  Def_Kind,
  Def_Signature,
}

type ParseState = Def_Kind_State | Def_Signature_State;

interface Def_Kind_State {
  kind: ParseStateKind.Def_Kind;
  start: TextPosition;
}

interface Def_Signature_State {
  kind: ParseStateKind.Def_Signature;
  defKind: Phrase;
  leftParenSpan: Span;
}

interface PositionedChar {
  value: string;
  position: TextPosition;
}

interface PositionedEndOfInput {
  value: null;
  position: TextPosition;
}

function parse(src: string): Doc {
  let index = 0;
  let line = 0;
  let col = 0;

  function consumeChar(): PositionedChar | PositionedEndOfInput {
    if (index >= src.length) {
      return { value: null, position: { byteIndex: index, line, column: col } };
    }

    const firstCode = src.charCodeAt(index);
    const isSurrogate = 0xd800 <= firstCode && firstCode <= 0xdfff;
    const char = isSurrogate ? src.slice(index, index + 2) : src.charAt(index);

    const out = {
      value: char,
      position: {
        byteIndex: index,
        line,
        column: col,
      },
    };

    index += isSurrogate ? 2 : 1;
    ++col;
    if (char === "\n") {
      ++line;
      col = 0;
    }

    return out;
  }

  let state: ParseState = {
    kind: ParseStateKind.Def_Kind,
    start: {
      byteIndex: 0,
      line: 0,
      column: 0,
    },
  };
  let current = consumeChar();

  while (true) {
    if (current.value === null) {
      break;
    }

    const lookahead = consumeChar();
    state = handleChar(state, current, lookahead, src);
    current = lookahead;
  }

  throw new Error("todo");
}

function handleChar(
  state: ParseState,
  current: PositionedChar,
  lookahead: PositionedChar | PositionedEndOfInput,
  src: string
): ParseState {
  switch (state.kind) {
    case ParseStateKind.Def_Kind: {
      if (current.value === "(") {
        return {
          kind: ParseStateKind.Def_Signature,
          defKind: {
            kind: NodeKind.Phrase,
            originalValue: src.slice(
              state.start.byteIndex,
              current.position.byteIndex
            ),
            span: {
              start: state.start,
              end: current.position,
            },
          },
          leftParenSpan: {
            start: state.start,
            end: lookahead.position,
          },
        };
      }

      if (/^[)[\]{}A-Z]$/.test(current.value)) {
        console.log("TODO: Unexpected character", current.value);
      }

      return {
        kind: ParseStateKind.Def_Kind,
        start: state.start,
      };
    }
  }
}
