import {
  parser as generatedParser,
  SandParserGeneratedByJison,
} from "./parser.generated";

const wrappedParser = wrapParser(generatedParser);

export function parse(src: string): any {
  return wrappedParser.parse(src);
}

function wrapParser(
  rawParser: SandParserGeneratedByJison
): SandParserGeneratedByJison {
  (rawParser.lexer as any).options = (rawParser.lexer as any).options || {};
  (rawParser.lexer as any).options.ranges = true;
  return rawParser;
}
