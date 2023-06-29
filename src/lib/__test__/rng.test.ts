import { beforeEach, describe, expect, it } from "vitest";
import { Rng } from "../rng";
const seed = "testseed";
const maxAttempts = 1000;

describe("rng", () => {
  let rng: Rng;
  beforeEach(() => {
    rng = new Rng(seed);
  })
  it("must emit all possible values in a distribution", () => {
    const emitted = [false, false, false, false];
    for (let i = 0; i < maxAttempts; i++) {
      const index = rng.distribution([5, 5, 5, 2]);
      emitted[index] = true;
      if (emitted.every(x => x)) {
        break;
      }
    }
    expect(emitted.every(x => x)).toBeTruthy();
  })
})