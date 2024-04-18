import {
  JisonLexError,
  JisonTokenLocation,
  JisonUnexpectedTokenError,
} from "../jison";
import { TextLocation, TysonTypeDict, Yy } from "../types/tysonTypeDict";
import {
  parser as generatedParser,
  NingParserGeneratedByJison,
} from "./parser.generated";
import { getYyImpl } from "./yyImpl";

interface WrappedParser extends NingParserGeneratedByJison {
  yy: Yy;
}

const wrappedParser = wrapParser(generatedParser);

export type ParseResult = ParseOk | ParseErr | LexErr;

export interface ParseOk {
  parseSucceeded: true;
  value: TysonTypeDict["file"];
}

export interface ParseErr {
  parseSucceeded: false;
  lexSucceeded: true;
  jisonError: JisonUnexpectedTokenError;
  errorLocation: JisonTokenLocation;
}

export interface LexErr {
  parseSucceeded: false;
  lexSucceeded: false;
  jisonError: JisonLexError;
  errorLocation: TextLocation;
  nextWhitespaceOrEofAfterErrorLocation: TextLocation;
}

export function parse(src: string): ParseResult {
  try {
    const value = wrappedParser.parse(src);
    return { parseSucceeded: true, value };
  } catch (e) {
    const error = e as JisonUnexpectedTokenError | JisonLexError;
    if (error.hash.token === null) {
      const errorLocation = wrappedParser.yy.getCurrentTextLocation();
      return {
        parseSucceeded: false,
        lexSucceeded: false,
        jisonError: error as JisonLexError,
        errorLocation,
        nextWhitespaceOrEofAfterErrorLocation:
          getNextWhitespaceOrEofAfterErrorLocation(src, errorLocation),
      };
    } else {
      const start = wrappedParser.yy.getPreviousTextLocation();
      const end = wrappedParser.yy.getCurrentTextLocation();
      return {
        parseSucceeded: false,
        lexSucceeded: true,
        jisonError: error as JisonUnexpectedTokenError,
        errorLocation: {
          first_line: start.line,
          last_line: end.line,
          first_column: start.column,
          last_column: end.column,
          range: [start.index, end.index],
        },
      };
    }
  }
}

function wrapParser(rawParser: NingParserGeneratedByJison): WrappedParser {
  (rawParser.lexer as any).options = (rawParser.lexer as any).options || {};
  (rawParser.lexer as any).options.ranges = true;
  rawParser.yy = rawParser.yy || {};
  Object.assign(rawParser.yy as any, getYyImpl());
  const boundParse = rawParser.parse.bind(rawParser);
  rawParser.parse = (src: string): any => {
    (rawParser.yy as Yy).reset();
    return boundParse(src);
  };
  return rawParser as NingParserGeneratedByJison & { yy: Yy };
}

function getNextWhitespaceOrEofAfterErrorLocation(
  src: string,
  errorLocation: TextLocation
): TextLocation {
  let index = errorLocation.index;
  let column = errorLocation.column;
  while (index < src.length && !/^\s$/.test(src.charAt(index))) {
    ++index;
    ++column;
  }
  return {
    line: errorLocation.line,
    column,
    index,
  };
}
