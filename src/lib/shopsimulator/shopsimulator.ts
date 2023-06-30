import { Affix, Coordinates, D2ItemTypeCode, Difficulty, ItemType, ModifierRoll, ShopItem, ShopOptions, ShopResult, Vendor } from "./shopsimulator-model";
import { D2Context } from "../../context/D2Context";
import { getOrCreateArr, getOrCreateObj, getTableArray, times, unique } from "../util";
import { D2Affix, D2Item } from "../d2Parser";
import { Rng } from "../rng";

type ItemsByVendor = {
  [v in Vendor]: ItemsByType
}

type ItemsByType = {
  [t in ItemType]: D2Item[];
}

type PossibleAffixes = {
  [type: string]: {
    [alvl: number]: {
      prefix: D2Affix[];
      suffix: D2Affix[];
    }
  }
}

type TypeHierarchy = {
  [type: D2ItemTypeCode]: {
    selfAndDescendants: D2ItemTypeCode[]
    isAlso: D2ItemTypeCode[];
  }
}

type ItemNode = {
  [code: D2ItemTypeCode]: {
    children: D2ItemTypeCode[];
    parents: D2ItemTypeCode[];
  }
}

export class ShopGenerator {
  private rng: Rng;
  private itemsByVendor: ItemsByVendor;
  private possibleAffixes: PossibleAffixes;
  constructor(private d2: D2Context, private shopOptions: ShopOptions) {
    this.rng = new Rng(shopOptions.seed);
    this.itemsByVendor = this.getItemsByVendor();
    this.possibleAffixes = this.getPossibleAffixes();
  }

  /** Creates results for every combination of clvl, vendor, difficulty and item type */
  generate(): ShopResult[] {
    const items: ShopResult[] = [];
    for (const [difficulty, vendor] of this.shopOptions.vendors) {
      for (let clvl = this.shopOptions.clvlRange[0]; clvl <= this.shopOptions.clvlRange[1]; clvl++) {
        for (const type of this.shopOptions.itemtypes) {
          items.push(generateItems(this.d2, this.rng, this.possibleAffixes, difficulty, vendor, this.itemsByVendor[vendor][type], clvl, type));
        }
      }
    }
    return items;
  }

  private getItemsByVendor(): ItemsByVendor {
    let result: ItemsByVendor = {} as any
    const vendors = unique(this.shopOptions.vendors.map(dv => dv[1]));
    for (const type of this.shopOptions.itemtypes) {
      for (const item of this.d2.data.global.excel[type].data) {
        for (const vendor of vendors) {
          if (item[`${vendor}Max`]) {
            const v = getOrCreateObj(result, vendor)
            getOrCreateArr(v, type).push(item);
          }
        }
      }
    }
    return result as ItemsByVendor;
  }

  private getPossibleAffixes(): PossibleAffixes {
    let result: PossibleAffixes = {};
    const typeHierarchy = this.createHierarchy();
    for (const affixType of ["prefix", "suffix"] as const) {
      for (const affix of this.d2.data.global.excel[`magic${affixType}`].data) {
        if (affix.spawnable !== "1" || affix.frequency === "0" || !affix.frequency) {
          continue;
        }
        const alvl = Number(affix.level);
        for (const type of possibleTypes(typeHierarchy, affix)) {
          const ts = getOrCreateObj(result, type)
          for (let i = alvl; i <= 99; i++) {
            const alvls = getOrCreateObj(ts, i)
            const arr = getOrCreateArr(alvls, affixType);
            const freq = Number(affix.frequency);
            for (let j = 0; j < freq; j++) {
              arr.push(affix);
            }
          }
        }
      }
    }
    return result;
  }

  private createHierarchy(): TypeHierarchy {
    let graph: ItemNode = {};
    for (const type of this.d2.data.global.excel.itemtypes.data) {
      const node = getOrCreateObj(graph, type.Code);
      node.parents = [type.Equiv1, type.Equiv2].filter(Boolean);
      for (const parent of node.parents) {
        const node = getOrCreateObj(graph, parent);
        getOrCreateArr(node, "children").push(type.Code);
      }
    }
  
    let result: TypeHierarchy = {}
    for (const code of Object.keys(graph)) {
      result[code] = {
        selfAndDescendants: selfAndDescendantsRec(graph, code),
        isAlso: isAlsoRec(graph, code)
      };
    }
  
    return result;
  }
}

function selfAndDescendantsRec(graph: ItemNode, code: D2ItemTypeCode): D2ItemTypeCode[] {
  if (!graph[code].children || graph[code].children.length === 0) {
    return [code];
  } else {
    return [
      code,
      ...graph[code].children.flatMap(c => selfAndDescendantsRec(graph, c))
    ];
  }
}

function isAlsoRec(graph: ItemNode, code: D2ItemTypeCode): D2ItemTypeCode[] {
  return [
    code,
    ...graph[code].parents.flatMap(p => isAlsoRec(graph, p))
  ];
}

function possibleTypes(types: TypeHierarchy, affix: D2Affix): D2ItemTypeCode[] {
  const result = new Set<string>();
  const excluded = new Set(getTableArray(affix, "etype", 5));
  for (const type of getTableArray(affix, "itype")) {
    // Skip erronous item types (ex. affix "of Anima": "amu" instead of "amul")
    if (!types[type]) {
      continue;
    }
    for (const subType of types[type].selfAndDescendants) {
      if (types[type].isAlso.some(t => excluded.has(t))) {
        continue;
      }
      result.add(subType);
    }
  }
  return [...result];
}

const pagesByType: Record<ItemType, number> = {
  armor: 1,
  weapons: 2,
  misc: 1
};

const shopDimensions = {
  width: 10,
  height: 10
}

const ilvlCaps: Record<Vendor, number> = {
  Charsi: 12,
  Akara: 12,
  Gheed: 12,
  Cain: 12,

  Fara: 20,
  Drognan: 20,
  Elzix: 20,
  Lysander: 20,

  Ormus: 28,
  Hratli: 28,
  Asheara: 28,
  Alkor: 28,

  Jamella: 36,
  Halbu: 36,

  Malah: 45,
  Larzuk: 45,
  Drehya: 45
}

type PageSpace = boolean[][];

/**
 * Generates items according to https://diablo2.diablowiki.net/Item_Generation_Tutorial#Item_Generation_at_Shops
 */
function generateItems(d2: D2Context, rng: Rng, possibleAffixes: PossibleAffixes, difficulty: Difficulty, vendor: Vendor, vendorItems: D2Item[], clvl: number, type: ItemType): ShopResult {
  const result: ShopItem[] = [];
  const ilvl = getIlvl(clvl, vendor, difficulty);

  let page = 0;
  let hasSpace: PageSpace = initPage();
  itemLoop: for (const item of vendorItems) {
    if (Number(item.level) > ilvl) {
      continue;
    }
    const actualItems = generateActualItems(d2, rng, item, difficulty, vendor, ilvl);
    for (const quality of ["normal", "magic"] as const) {
      for (const item of actualItems[quality]) {
        let coordinates = reserveSpace(hasSpace, item);
        if (!coordinates) {
          page++;
          if (page < pagesByType[type]) {
            hasSpace = initPage();
            coordinates = reserveSpace(hasSpace, item);
            if (!coordinates) {
              break itemLoop;
            }
          } else {
            break itemLoop;
          }
        }
        if (quality === "normal") {
          result.push({
            code: item.code,
            page,
            coordinates,
            quality: "normal"
          });
        } else {
          result.push({
            code: item.code,
            page,
            coordinates,
            quality: "magic",
            ...generateAffixes(rng, possibleAffixes, item, ilvl)
          });
        }
      }
    }
    // magic items
    if (ilvl < Number(item[`${vendor}MagicLvl`])) {
      continue;
    }
  }

  return {
    clvl,
    difficulty,
    type,
    vendor,
    items: result
  };
}

function getIlvl(clvl: number, vendor: Vendor, difficulty: Difficulty) {
  const ilvl = clvl + 5;
  if (difficulty === "normal") {
    return Math.min(ilvl, ilvlCaps[vendor]);
  } else {
    return ilvl;
  }
}

function initPage(): PageSpace {
  let result: PageSpace = [];
  for (let i = 0; i < shopDimensions.width; i++) {
    result[i] = [];
    for (let j = 0; j < shopDimensions.height; j++) {
      result[i].push(true);
    }
  }
  return result;
}

function reserveSpace(space: PageSpace, item: D2Item): Coordinates | false {
  const itemWidth = Number(item.invwidth);
  const itemHeight = Number(item.invheight);
  const hasSpace = (x: number, y: number) => {
    for (let i = x; i < x + itemWidth; i++) {
      if (!space[x][y]) {
        return false;
      }
    }
    return true;
  }
  for (let x = 0; x <= shopDimensions.width - itemWidth; x++) {
    for (let y = 0; y <= shopDimensions.height - itemHeight; y++) {
      if (hasSpace(x, y)) {
        for (let i = x; i < x + itemWidth; i++) {
          for (let j = y; j < y + itemHeight; j++) {
            space[i][j] = false;
          }
        }
        return {x, y, width: itemWidth, height: itemHeight};
      }
    }
  }
  return false;
}

type ActualItems = {
  normal: D2Item[];
  magic: D2Item[];
}

/**
 * Create multiple, possibly upgraded items of the given type.
 * It seems that on nightmare and hell, each item appears randomly min to (max+2) times, the distribution not being uniform.
 * Each item can then be upgraded to exceptional or elite using the algorithm from https://diablo2.diablowiki.net/Item_Generation_Tutorial#Item_Generation_at_Shops
 * 
 * The distribution for the amount of items is derived from empirical evidence. https://docs.google.com/spreadsheets/d/1WmC991S52AvDKce2GYVJWzQs8M2Oucy1rk52ya4QJ6I/edit?usp=sharing
 */
function generateActualItems(d2: D2Context, rng: Rng, item: D2Item, difficulty: Difficulty, vendor: Vendor, ilvl: number): ActualItems {
  const magicMin = Number(item[`${vendor}MagicMin`] ?? 0);
  const magicMax = Number(item[`${vendor}MagicMax`] ?? 0);
  if (difficulty === "normal") {
    const normalMin = Number(item[`${vendor}Min`]);
    const normalMax = Number(item[`${vendor}Max`]);
    if (ilvl < 25) {
      const normalAmount = rng.rangeInc(normalMin, normalMax);
      const magicAmount = rng.rangeInc(magicMin, magicMax);
      return {
        normal: times(normalAmount, () => item),
        magic: times(magicAmount, () => item)
      }
    } else {
      const magicAmount = rng.rangeInc(magicMin + normalMin, magicMax + normalMax);
      return {
        normal: [],
        magic: times(magicAmount, () => item)
      }
    }
  } else {
    let amount: number;
    if (magicMax === 0) {
      amount = 0;
    } else {
      const distribution = [...times(magicMax - magicMin + 2, 5), 2]
      amount = rng.distribution(distribution) + magicMin;
    }
    const items: D2Item[] = [];
    for (let i = 0; i < amount; i++) {
      if (difficulty === "nightmare") {
        if (item.NightmareUpgrade !== "xxx") {
          items.push(d2.refs.itemsByCode[item.NightmareUpgrade]);
        } else if (rng.roll((ilvl*64 + 4000) / 100000)) {
          items.push(d2.refs.itemsByCode[item.ubercode]);
        } else {
          items.push(item);
        }
      } else {
        if (item.HellUpgrade !== "xxx") {
          items.push(d2.refs.itemsByCode[item.HellUpgrade]);
        } else if (rng.roll((ilvl*128 + 5000) / 100000)) {
          items.push(d2.refs.itemsByCode[item.ubercode]);
        } else if (rng.roll((ilvl*16 + 1000) / 100000)) {
          items.push(d2.refs.itemsByCode[item.ultracode]);
        } else {
          items.push(item);
        }
      }
    }
    return {
      normal: [],
      magic: items
    };
  }
}

type Affixes = {
  prefix?: Affix;
  suffix?: Affix;
}

function generateAffixes(rng: Rng, possibleAffixes: PossibleAffixes, item: D2Item, ilvl: number): Affixes {
  const types = rollTypes(rng)
  const alvl = affixLevel(item, ilvl);

  const result: Affixes = {};

  for (const aType of types) {
    const affix = rng.choice(possibleAffixes[item.type][alvl][aType]);
    let mods: ModifierRoll[] = [];
    for (const i of [1,2,3] as const) {
      const code = affix[`mod${i}code`];
      if (!code) {
        continue;
      }
      const min = Number(affix[`mod${i}min`])
      const max = Number(affix[`mod${i}max`])
      mods.push({
        code,
        param: affix[`mod${i}param`] ?? undefined,
        value: min ? rng.rangeInc(min, max) : undefined
      })
    }
    result[aType] = {
      d2affix: affix,
      modifiers: mods
    }
  }

  return result;
}

/** According to https://diablo2.diablowiki.net/Item_Generation_Tutorial#Affix_selection */
function rollTypes(rng: Rng) {
  const result = rng.rangeInc(0, 3)
  if (result === 0) {
    return ["prefix", "suffix"] as const;
  } else if (result === 1) {
    return ["prefix"] as const;
  } else {
    return ["suffix"] as const;
  }
}

/** According to https://diablo2.diablowiki.net/Item_Generation_Tutorial#Affix_selection */
function affixLevel(item: D2Item, ilvl: number): number {
  const qlvl = Number(item.level);
  const mlvl = magicLvl(item);
  if (ilvl > 99) {
    ilvl = 99;
  }
  if (qlvl > ilvl) {
    ilvl = qlvl;
  }
  let alvl;
  if (mlvl) {
    alvl = ilvl + mlvl;
  } else if (ilvl < (99 - Math.trunc(qlvl / 2))) {
    alvl = ilvl - Math.trunc(qlvl / 2);
  } else {
    alvl = 2 * ilvl - 99
  }
  return Math.min(alvl, 99);
}

function magicLvl(item: D2Item): number {
  if ("magic lvl" in item) {
    return Number(item["magic lvl"])
  } else {
    return 0;
  }
}