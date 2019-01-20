/* @flow */

import type {
  Source,
  AsyncIteratorTransform,
} from "@capnp-js/transform";

import type { WordAlignedString } from "./TransformCore";

import { PULL_STREAM_BROKE_PROTOCOL } from "@capnp-js/transform";

import { EMPTY } from "./constant";
import TransformCore from "./TransformCore";

type uint = number;

export default function transEncode(wordSize: uint): AsyncIteratorTransform<string, WordAlignedString> {
  return function transform(source: Source<string>): Source<WordAlignedString> {
    const status: {|
      doned: null | Error,
      done: null | true,
    |} = {
      doned: null,
      done: null,
    };

    let next: WordAlignedString | null = null;

    const core = new TransformCore(wordSize);

    return function aligned(abort: null | true, put: (null | (true | Error), WordAlignedString) => void): void {
      if (status.doned) {
        put(status.doned, EMPTY);
        return;
      }

      if (status.done) {
        put(status.done, EMPTY);
        return;
      }

      if (abort) {
        source(true, function (done, unaligned) { // eslint-disable-line no-unused-vars
          if (!done) {
            throw new Error(PULL_STREAM_BROKE_PROTOCOL);
          } else {
            if (done === true) {
              put(true, EMPTY);
            } else {
              (done: Error);
              put(status.doned = done, EMPTY);
            }
          }
        });

        return;
      }

      if (next !== null) {
        const value = next;
        next = null;
        put(null, value);
      } else {
        source(null, function (done, string) {
          if (!done) {
            let now;
            [ now, next ] = core.next(string);
            put(null, now);
          } else {
            status.done = true;
            put(null, core.finish());
          }
        });
      }
    };
  };
}
