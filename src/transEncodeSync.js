/* @flow */

import type {
  IteratorTransform,
  SugarlessIterator,
  SugarlessIteratorResult,
} from "@capnp-js/transform";

import type { WordAlignedString } from "./TransformCore";

import TransformCore from "./TransformCore";

type uint = number;

export default function transEncode(wordSize: uint): IteratorTransform<string, WordAlignedString> {
  return function transform(source: SugarlessIterator<string>): SugarlessIterator<WordAlignedString> {
    let done = false;
    let next: WordAlignedString | null = null;

    const core = new TransformCore(wordSize);

    return {
      next(): SugarlessIteratorResult<WordAlignedString> {
        if (done) {
          return { done };
        }

        if (next !== null) {
          // #if _DEBUG
          console.log("consuming tail from the prior core.next()");
          // #endif

          const value = next;
          next = null;
          return {
            done: false,
            value,
          };
        } else {
          const string = source.next();
          if (!string.done) {
            // #if _DEBUG
            console.log("consuming head from core.next()");
            // #endif

            let now;
            [ now, next ] = core.next(string.value);
            return {
              done: false,
              value: now,
            };
          } else {
            // #if _DEBUG
            console.log("exhausted core");
            // #endif

            done = true;
            return {
              done: false,
              value: core.finish(),
            };
          }
        }
      },
    };
  };
}
