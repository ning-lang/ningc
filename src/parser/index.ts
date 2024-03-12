import { option, Result, result } from "rusty-ts";
import { JisonUnexpectedTokenError } from "../jison";
import { convertToTextRange } from "../textRange";
import * as ast from "../types/ast";
import { ParseError, ParseErrorType, SandParser } from "../types/parser";
import { TokenType } from "../types/tokens";
import addApi from "./addApi";
import {
  parser as generatedParser,
  SandParserGeneratedByJison,
} from "./parser.generated";
import { Yy } from "../types/yy";

addApi(generatedParser);

const wrappedParser = wrapGeneratedParser(generatedParser);

export function parseFiles(
  fileContentMap: Map<string, string>
): Result<ast.Program, ParseError> {
  const fileNodeMapEntries: [string, ast.SourceFile][] = [];
  for (const [filePath, fileContent] of fileContentMap.entries()) {
    const parseResult = wrappedParser.parse(fileContent);
    if (parseResult.isErr()) {
      return parseResult;
    }
    fileNodeMapEntries.push([filePath, parseResult.unwrap()]);
  }
  const fileNodeMap = new Map(fileNodeMapEntries);
  const program: ast.Program = {
    nodeType: ast.NodeType.Program,
    files: fileNodeMap,
  };
  return result.ok(program);
}

function wrapGeneratedParser(
  generated: SandParserGeneratedByJison
): SandParser {
  return {
    parse(input: string): Result<ast.SourceFile, ParseError> {
      const yy: Yy = generatedParser.yy;
      yy.resetNodeIdCounter();

      try {
        return result.ok(generated.parse(input));
      } catch (e) {
        if (!("object" === typeof e && e !== null)) {
          throw new Error("Unhandled error: " + e);
        }

        if ("object" === typeof e.hash) {
          const {
            hash: { token, text, loc, expected },
          }: JisonUnexpectedTokenError<TokenType> = e;
          return result.err({
            errorType: ParseErrorType.UnexpectedToken,
            token,
            text: text === undefined ? option.none() : option.some(text),
            location: convertToTextRange(loc),
            expected,
          });
        }

        throw new Error("Unhandled error: " + e);
      }
    },
  };
}
