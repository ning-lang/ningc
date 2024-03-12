export declare const yy: Yy;

interface Yy {}

interface __JisonTokenLocation {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
  range: [number, number];
}

export interface TysonTypeDict {
  "1": "1";

  file: Expression;
  expr: Expression;
}

type Expression = Infix | Literal;

interface Literal {
  val: string;
  location: __JisonTokenLocation;
}

interface Infix {
  location: __JisonTokenLocation;
  left: Expression;
  right: Expression;
}
