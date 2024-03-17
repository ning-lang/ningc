import { TysonTypeDict } from "../types/tysonTypeDict";
import {
  parser as generatedParser,
  NingParserGeneratedByJison,
} from "./parser.generated";

const wrappedParser = wrapParser(generatedParser);

export function parse(src: string): TysonTypeDict["file"] {
  return wrappedParser.parse(src);
}

function wrapParser(
  rawParser: NingParserGeneratedByJison
): NingParserGeneratedByJison {
  (rawParser.lexer as any).options = (rawParser.lexer as any).options || {};
  (rawParser.lexer as any).options.ranges = true;
  return rawParser;
}
