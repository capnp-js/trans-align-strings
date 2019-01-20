/* @flow */

import {
  EMPTY,
  WORD_SIZE_ERROR,
} from "./constant";

type uint = number;

export type WordAlignedString = string;

export default class TransformCore {
  +wordSize: uint;
  remainder: string;

  constructor(wordSize: uint) {
    if (wordSize < 1) {
      throw new Error(WORD_SIZE_ERROR);
    }

    this.wordSize = wordSize;

    this.remainder = "";
  }

  next(string: string): [ WordAlignedString, WordAlignedString ] {
    // #if _DEBUG
    console.log("\n***** next() beginning *****");
    // #endif

    if (this.remainder.length + string.length < this.wordSize) {
      this.remainder += string;
      return [ EMPTY, EMPTY ];
    }

    let head;

    if (this.remainder.length === 0) {
      head = EMPTY;
    } else {
      const cut = this.wordSize - this.remainder.length;
      head = this.remainder + string.slice(0, cut);
      string = string.slice(cut);
    }

    const cut = string.length - (string.length % this.wordSize);
    this.remainder = string.slice(cut);

    return [ head, string.slice(0, cut) ];
  }

  finish(): string {
    // #if _DEBUG
    console.log("\n***** finish() beginning *****");
    // #endif

    return this.remainder;
  }
}
