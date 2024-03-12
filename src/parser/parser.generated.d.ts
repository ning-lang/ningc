import { SourceFile } from "../types/ast";
import { ParserGeneratedByJison } from "../jison";

export declare const parser: SandParserGeneratedByJison;

export interface SandParserGeneratedByJison extends ParserGeneratedByJison {
  parse(src: string): SourceFile;
}
