import { JisonUnexpectedTokenError } from "../jison";
import { TysonTypeDict } from "../types/tysonTypeDict";
import {
  parser as generatedParser,
  NingParserGeneratedByJison,
} from "./parser.generated";

const wrappedParser = wrapParser(generatedParser);

export type ParseResult = ParseOk | ParseErr;

export interface ParseOk {
  succeeded: true;
  value: TysonTypeDict["file"];
}

export interface ParseErr {
  succeeded: false;
  error: JisonUnexpectedTokenError;
}

export function parse(src: string): ParseResult {
  try {
    const value = wrappedParser.parse(src);
    return { succeeded: true, value };
  } catch (error) {
    return { succeeded: false, error: error as JisonUnexpectedTokenError };
  }
}

function wrapParser(
  rawParser: NingParserGeneratedByJison
): NingParserGeneratedByJison {
  (rawParser.lexer as any).options = (rawParser.lexer as any).options || {};
  (rawParser.lexer as any).options.ranges = true;
  return rawParser;
}
