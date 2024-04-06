export function getNingNumberLiteralRegex(): RegExp {
  return /^-?[0-9]+(?:\.[0-9]+)?(?:e-?[0-9]+)?$/;
}

export function parseNingString(source: string): string {
  if (source.charAt(0) !== '"' || source.charAt(source.length - 1) !== '"') {
    throw new Error(
      "Invalid string literal: `" +
        source +
        "`. String literals must start and end in quotes. "
    );
  }

  let out = "";
  let i = 1;
  while (i < source.length - 1) {
    if (source.charAt(i) === '"') {
      throw new Error(
        "Invalid string literal: `" +
          source +
          "`. String literals must not contain quotes, except at the beginning and end."
      );
    }

    if (source.charAt(i) === "{") {
      const nextRCurlyIndex = source.indexOf("}", i);
      if (nextRCurlyIndex === -1) {
        throw new Error(
          "Invalid string literal: `" + source + "`. Missing `}`."
        );
      }
      const escape = source.slice(i + 1, nextRCurlyIndex);
      out += parseNingStringEscapeCodeWithoutCurlyBraces(escape);
      i = nextRCurlyIndex + 1;
      continue;
    }

    out += source.charAt(i);
    ++i;
  }

  return out;
}

function parseNingStringEscapeCodeWithoutCurlyBraces(escape: string): string {
  if (!/^0x[0-9a-fA-F]+$/.test(escape)) {
    throw new Error(
      "Invalid escape code: `" +
        escape +
        "`. Escape codes must match the pattern /^0x[0-9a-fA-F]+$/."
    );
  }

  const hex = escape.slice(2);
  const parsed = parseInt(hex, 16);
  if (Number.isNaN(parsed)) {
    throw new Error(
      "Invalid escape code: `" +
        escape +
        "`. Could not parse as hexadecimal number."
    );
  }

  return String.fromCodePoint(parsed);
}
