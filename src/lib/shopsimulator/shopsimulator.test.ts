import { it, describe, beforeEach, expect } from 'vitest';
import { ShopGenerator } from './shopsimulator';
import { D2Context } from '../../context/D2Context';
import { createTestContext } from '../../test/testutil';
import { Coordinates, ShopResult } from './shopsimulator-model';

const seed = "testseed";
const maxAttempts = 1000;

describe("shop simulator", () => {
  let d2: D2Context;
  beforeEach(async () => {
    d2 = await createTestContext();
  });

  it("works", async () => {
    const shop = new ShopGenerator(d2, {clvlRange: [1, 1], vendors: [["normal", "Charsi"]], itemtypes: ["armor"], seed });
    const results = shop.generate();
    expect(results).toHaveLength(1);
    const result = results[0];
    expect(result.clvl).toEqual(1);
    expect(result.difficulty).toEqual("normal");
    expect(result.type).toEqual("armor");
    expect(result.vendor).toEqual("Charsi");
    expect(result.items.length).toBeGreaterThan(10)
    expect(result.items.length).toBeLessThan(50)
  })

  it("doesn't overlap items", () => {
    const shop = new ShopGenerator(d2, {clvlRange: [1, 1], vendors: [["normal", "Charsi"]], itemtypes: ["armor"], seed });
    const result = shop.generate()[0];
    for (let j = 0; j < result.items.length; j++) {
      for (let k = j + 1; k < result.items.length; k++) {
        const [itemA, itemB] = [result.items[j], result.items[k]];
        expect(itemA.coordinates.width).toBeGreaterThan(0);
        expect(itemA.coordinates.height).toBeGreaterThan(0);
        expect(itemB.coordinates.width).toBeGreaterThan(0);
        expect(itemB.coordinates.height).toBeGreaterThan(0);
        const overlapping = doOverlap(itemA.coordinates, itemB.coordinates);
        expect(overlapping, "overlapping").toEqual(false);
      }
    }
  })

  describe("anya in hell", () => {
    let shop: ShopGenerator;
    beforeEach(() => {
      shop = new ShopGenerator(d2, {clvlRange: [80, 80], vendors: [["hell", "Drehya"]], itemtypes: ["armor"], seed });
    })

    it("sells any items", () => {
      const items = shop.generate()[0].items;
      expect(items.length).toBeGreaterThan(5);
    });

    it("must be possible to spawn 3 magic gauntlets", () => {
      const found = randomShopTest(shop, res => res.items.filter(item => item.quality === "magic" && item.code === "hgl").length === 3)
      expect(found, `Found 3 magic gauntlets after ${maxAttempts} attempts`).toBeTruthy();
    })
    it("must be possible to spawn 0 bone helmets", () => {
      const found = randomShopTest(shop, res => res.items.filter(item => item.code === "bhm").length === 0)
      expect(found, `Found a page with 0 bone helmets after ${maxAttempts} attempts`).toBeTruthy();
    })
    it("must not be possible to spawn 0 ancient armors", () => {
      const found = randomShopTest(shop, res => res.items.filter(item => ["aar", "xar", "uar"].includes(item.code)).length === 0)
      expect(found, `Found a page with 0 ancient armors after ${maxAttempts} attempts`).toBeFalsy();
    })
    it("must only offer magic items that have at least a prefix or a suffix", () => {
      const found = randomShopTest(shop, res => res.items.every(item => !item.prefix && !item.suffix))
      expect(found).toBeFalsy();
    })
  })

  it("sells bow 3/20 in a reasonable time", () => {
    const shop = new ShopGenerator(d2, {clvlRange: [1, 99], vendors: [
      ["nightmare", "Gheed"],
      ["nightmare", "Charsi"],
      ["nightmare", "Drehya"],
      ["hell", "Gheed"],
      ["hell", "Charsi"],
      ["hell", "Drehya"],
    ], itemtypes: ["armor"], seed });

    for (let i = 0; i < maxAttempts; i++) {
      const results = shop.generate();
      for (const result of results) {
        for (const item of result.items)  {
          const prefixMod = item.prefix?.modifiers[0];
          const suffixMod = item.suffix?.modifiers[0];
          if ((prefixMod && prefixMod.code === "skilltab" && prefixMod.param === "0" && prefixMod.value === 3)
            && (suffixMod && suffixMod.code === "swing2" && suffixMod.value === 20)) {
              return;
          }
        }
      }
    }
    expect(true).toBeFalsy();
  });
})

function randomShopTest(shop: ShopGenerator, condition: (sr: ShopResult) => boolean) {
  for (let i = 0; i < maxAttempts; i++) {
    const sr = shop.generate()[0];
    if (condition(sr)) {
      return true;
    }
  }
  return false;
}

function doOverlap(a: Coordinates, b: Coordinates): any {
  if (a.x + a.width - 1 < b.x || b.x + b.width - 1 < a.x) {
    return false;
  }
  if (a.y + a.height - 1 < b.y || b.y + b.height - 1 < a.y) {
    return false;
  }
  return true;
}
