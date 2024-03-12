import { TysonTypeDict } from "../../types/tysonTypeDict";

interface TokenLocation {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
  range: [number, number];
}

const semanticActions = {
  "file -> expr EOF"($1: TysonTypeDict["expr"]): TysonTypeDict["file"] {
    let $$: TysonTypeDict["file"];
    return $1;
  },

  "expr -> 1"(
    yylstack: { "@$": TokenLocation },

    $1: TysonTypeDict["1"]
  ): TysonTypeDict["expr"] {
    let $$: TysonTypeDict["expr"];
    $$ = { location: yylstack["@$"], val: $1 };
    return $$;
  },

  "expr -> < expr % expr >"(
    yylstack: { "@$": TokenLocation },

    $2: TysonTypeDict["expr"],
    $4: TysonTypeDict["expr"]
  ): TysonTypeDict["expr"] {
    let $$: TysonTypeDict["expr"];
    $$ = { location: yylstack["@$"], left: $2, right: $4 };
    return $$;
  },
};
