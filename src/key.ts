export type NingKey =
  | "up arrow"
  | "down arrow"
  | "left arrow"
  | "right arrow"
  | "space"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

export function codeToKey(code: string): null | NingKey {
  if (code === "ArrowUp") {
    return "up arrow";
  }
  if (code === "ArrowDown") {
    return "down arrow";
  }

  if (code === "ArrowLeft") {
    return "left arrow";
  }

  if (code === "ArrowRight") {
    return "right arrow";
  }

  if (code === "Space") {
    return "space";
  }

  if (code === "KeyA") {
    return "a";
  }

  if (code === "KeyB") {
    return "b";
  }

  if (code === "KeyC") {
    return "c";
  }

  if (code === "KeyD") {
    return "d";
  }

  if (code === "KeyE") {
    return "e";
  }

  if (code === "KeyF") {
    return "f";
  }

  if (code === "KeyG") {
    return "g";
  }

  if (code === "KeyH") {
    return "h";
  }

  if (code === "KeyI") {
    return "i";
  }

  if (code === "KeyJ") {
    return "j";
  }

  if (code === "KeyK") {
    return "k";
  }

  if (code === "KeyL") {
    return "l";
  }

  if (code === "KeyM") {
    return "m";
  }

  if (code === "KeyN") {
    return "n";
  }

  if (code === "KeyO") {
    return "o";
  }

  if (code === "KeyP") {
    return "p";
  }

  if (code === "KeyQ") {
    return "q";
  }

  if (code === "KeyR") {
    return "r";
  }

  if (code === "KeyS") {
    return "s";
  }

  if (code === "KeyT") {
    return "t";
  }

  if (code === "KeyU") {
    return "u";
  }

  if (code === "KeyV") {
    return "v";
  }

  if (code === "KeyW") {
    return "w";
  }

  if (code === "KeyX") {
    return "x";
  }

  if (code === "KeyY") {
    return "y";
  }

  if (code === "KeyZ") {
    return "z";
  }

  if (code === "Digit0") {
    return "0";
  }

  if (code === "Digit1") {
    return "1";
  }

  if (code === "Digit2") {
    return "2";
  }

  if (code === "Digit3") {
    return "3";
  }

  if (code === "Digit4") {
    return "4";
  }

  if (code === "Digit5") {
    return "5";
  }

  if (code === "Digit6") {
    return "6";
  }

  if (code === "Digit7") {
    return "7";
  }

  if (code === "Digit8") {
    return "8";
  }

  if (code === "Digit9") {
    return "9";
  }

  return null;
}
