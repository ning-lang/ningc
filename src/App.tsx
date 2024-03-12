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
  BracketedParam,
  BlockCommand,
  Command,
  ParenthesizedExpression,
  ExpressionKebab,
  StringlLiteral,
  BracketedMutRef,
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
  returnType: null | Phrase;
  body: BlockCommand;
}

type SignaturePart = Label | BracketedParam;

interface Label {
  kind: NodeKind.Label;
  name: Phrase;
}

interface Phrase {
  kind: NodeKind.Phrase;
  originalValue: string;
  span: Span;
}

interface BracketedParam {
  kind: NodeKind.BracketedParam;
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

type CommandPart =
  | Label
  | ParenthesizedExpression
  | BracketedMutRef
  | BlockCommand;

interface ParenthesizedExpression {
  kind: NodeKind.ParenthesizedExpression;
  leftParenSpan: Span;
  expression: Expression;
  rightParenSpan: Span;
}

type Expression = ExpressionKebab | StringLiteral;

interface ExpressionKebab {
  kind: NodeKind.ExpressionKebab;
  parts: ExpressionPart[];
}

interface StringLiteral {
  kind: NodeKind.StringlLiteral;
  originalValue: string;
  span: Span;
}

type ExpressionPart = Label | ParenthesizedExpression;

interface BracketedMutRef {
  kind: NodeKind.BracketedMutRef;
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
  Def_SignatureLabel,
  Def_SignatureParam,
  Def_ReturnType,
}

type ParseState =
  | Def_Kind_State
  | Def_SignatureLabel_State
  | Def_SignatureParam_State
  | Def_ReturnType_State;

interface Def_Kind_State {
  kind: ParseStateKind.Def_Kind;

  defKindStart: TextPosition;
}

interface Def_SignatureLabel_State {
  kind: ParseStateKind.Def_SignatureLabel;
  defKind: Phrase;
  leftParenSpan: Span;
  pendingSignature: SignaturePart[];

  labelStart: TextPosition;
}

interface Def_SignatureParam_State {
  kind: ParseStateKind.Def_SignatureParam;
  defKind: Phrase;
  leftParenSpan: Span;
  pendingSignature: SignaturePart[];
  leftDelimiterStart: TextPosition;
}

interface Def_ReturnType_State {
  kind: ParseStateKind.Def_ReturnType;
  defKind: Phrase;
  leftParenSpan: Span;
  signature: SignaturePart[];
  returnTypeStart: TextPosition;
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
    defKindStart: {
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
      return handleCharIn_Def_Kind(state, current, lookahead, src);
    }

    case ParseStateKind.Def_SignatureLabel: {
      return handleCharIn_Def_SignatureLabel(state, current, lookahead, src);
    }
  }
}

function handleCharIn_Def_Kind(
  state: Def_Kind_State,
  current: PositionedChar,
  lookahead: PositionedChar | PositionedEndOfInput,
  src: string
): ParseState {
  if (current.value === "(") {
    return {
      kind: ParseStateKind.Def_SignatureLabel,
      defKind: {
        kind: NodeKind.Phrase,
        originalValue: src.slice(
          state.defKindStart.byteIndex,
          current.position.byteIndex
        ),
        span: {
          start: state.defKindStart,
          end: current.position,
        },
      },
      leftParenSpan: {
        start: state.defKindStart,
        end: lookahead.position,
      },
      pendingSignature: [],
      labelStart: lookahead.position,
    };
  }

  if (/^[)[\]{}A-Z"']$/.test(current.value)) {
    console.log("TODO: Unexpected character", current.value);
  }

  return {
    kind: ParseStateKind.Def_Kind,
    defKindStart: state.defKindStart,
  };
}

function handleCharIn_Def_SignatureLabel(
  state: Def_SignatureLabel_State,
  current: PositionedChar,
  lookahead: PositionedChar | PositionedEndOfInput,
  src: string
): ParseState {
  if (current.value === ")") {
    return {
      kind: ParseStateKind.Def_ReturnType,
      defKind: state.defKind,
      leftParenSpan: state.leftParenSpan,
      signature: state.pendingSignature.concat([todo]),
      returnTypeStart: lookahead.position,
    };
  }

  if (current.value === "(" || current.value === "[") {
    return {
      kind: ParseStateKind.Def_SignatureParam,
      defKind: state.defKind,
      leftParenSpan: state.leftParenSpan,
      pendingSignature: state.pendingSignature.concat([todo]),
      leftDelimiterStart: current.position,
    };
  }
}
