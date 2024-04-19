import { Yy, TextLocation } from "../types/tysonTypeDict";

const START_LOCATION: TextLocation = {
  line: 0,
  column: 0,
  index: 0,
};

export function getYyImpl(): Yy {
  let previousLocation = START_LOCATION;
  let currentLocation = START_LOCATION;

  return {
    reset(): void {
      previousLocation = START_LOCATION;
      currentLocation = START_LOCATION;
    },

    recordTokenLocationBasedOnCurrentMatch(): void {
      const { match } = (this as any).lexer;
      let { line, column, index } = currentLocation;
      for (let i = 0; i < match.length; ++i) {
        if (match[i] === "\n") {
          ++line;
          column = 0;
        } else {
          ++column;
        }
      }
      index += match.length;

      previousLocation = currentLocation;
      currentLocation = { line, column, index };
    },

    getPreviousTextLocation(): TextLocation {
      return previousLocation;
    },

    getCurrentTextLocation(): TextLocation {
      return currentLocation;
    },
  };
}
