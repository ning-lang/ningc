import { TysonTypeDict } from "../types/tysonTypeDict";
import { ParserGeneratedByJison } from "../jison";

export declare const parser: NingParserGeneratedByJison;

export interface NingParserGeneratedByJison extends ParserGeneratedByJison {
  parse(src: string): TysonTypeDict["file"];
}
