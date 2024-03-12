import { TysonTypeDict } from "../types/tysonTypeDict";
import { ParserGeneratedByJison } from "../jison";

export declare const parser: SandParserGeneratedByJison;

export interface SandParserGeneratedByJison extends ParserGeneratedByJison {
  // TODO
  parse(src: string): TysonTypeDict["file"];
}
