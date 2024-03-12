import yyImpl from "./yyImpl";
import SandScanner from "./scanner";
import { SandParserGeneratedByJison } from "../parser.generated";

export default function addApi(parser: SandParserGeneratedByJison) {
  parser.lexer = new SandScanner();

  parser.yy = parser.yy || {};
  Object.assign(parser.yy, yyImpl);

  return parser;
}
