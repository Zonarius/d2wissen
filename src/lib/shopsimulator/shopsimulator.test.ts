import { it, describe, beforeEach, expect } from 'vitest';
import { ShopGenerator } from './shopsimulator';
import { D2Context } from '../../context/D2Context';
import { createTestContext } from '../../test/testutil';

const seed = "testseed";

describe("shop simulator", () => {
  let d2: D2Context;
  beforeEach(async () => {
    d2 = await createTestContext();
  });

  it.only("works", async () => {
    const shop = new ShopGenerator(d2, {clvlRange: [1, 1], vendors: [["normal", "Gheed"]], itemtypes: ["armor"], seed });
    const result = shop.generate();
    expect(result).toHaveLength(1);
  })

  it("doesn't overlap items", () => {
    throw new Error("NYI")
  })

  describe("anya in hell", () => {
    it("must be possible to spawn 3 magic gauntlets", () => {
      throw new Error("NYI")
    })
    it("must be possible to spawn 0 bone helmets", () => {
      throw new Error("NYI")
    })
    it("must not be possible to spawn 0 ancient armors", () => {
      throw new Error("NYI")
    })
  })

})