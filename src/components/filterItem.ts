export interface Item {
  /**
   * The name of the item.
   */
  name: string;
  /**
   * The number of sockets.
   * 
   * For runewords, this is equal to the amount of runes needed.
   * 
   * For normal items, this is the maximum amount of sockets possible.
   * 
   * For everything else, this is the amount of sockets added by modifiers.
   */
  sockets: number;

  /**
   * The requirements to equip the item.
   */
  reqs: Requirements;

  /**
   * The quality of the item (magic, rare, etc.)
   */
  quality: Quality;

  /**
   * The properties of the item.
   */
  props: PropertyRef[];

  /**
   * The properites that are active on this item when enough parts of the set are equipped.
   */
  setProps: SetProperty[];

  stats: Stats;

  /** 
   * Applies to runewords only.
   * 
   * The runes required to create the runeword, in order.
   */
  runes: Rune[];

  /**
   * The base of the item. (eg. "Crystal Sword")
   * 
   * For runewords, this is empty.
   */
  baseItem?: BaseItem;

  /**
   * The possible item types of the base items for runewords.
   */
  baseTypes: string[];

  /**
   * The possible slots in which the items can be equipped.
   * 
   * For runewords, this can be multiple.
   * 
   * Empty if the item cannot be equipped (charms).
   * 
   * 
   * "mainhand" is defined as all weapons.
   * 
   * "offhand" is defined as all items that can be placed in hands but cannot normal attack on its own (shields, paladin shields, shrunken heads, bolts and arrows).
   */
  slots: ItemSlot[];

  /**
   * Reference to the original item object.
   */
  __original: any;
}

export type Quality = "normal" | "magic" | "rare" | "set" | "unique" | "runeword"

export interface Requirements {
  lvl: number;
}

export const runes = ["El", "Eld", "Tir", "Nef", "Eth", "Ith", "Tal", "Ral", "Ort", "Thul", "Amn", "Sol", "Shael", "Dol", "Hel", "Io", "Lum", "Ko", "Fal", "Lem", "Pul", "Um", "Mal", "Ist", "Gul", "Vex", "Ohm", "Lo", "Sur", "Ber", "Jah", "Cham", "Zod"] as const;
export type Rune = typeof runes[number];

export type BaseItemVersion = "normal" | "exceptional" | "elite";

export interface BaseItem {
  /** The name of the base item */
  name: string;
  /** The version of the base item (normal, exceptional or elite) */
  version: BaseItemVersion
  /** Same as version, but as a number. 0 = normal, 1 = exceptional, 2 = elite */
  versionNum: 0 | 1 | 2;
}

export interface PropertyRef {
  code: string;
  param?: string;
  min?: number;
  max?: number;
}

export interface SetProperty {
  requiredParts: number;
  prop: PropertyRef;
}

export interface Stats {
  /** Increased Attack Speed */
  ias: MinMaxStat;
  /** Enhanced Damage % */
  edam: MinMaxStat
}

export interface MinMaxStat {
  min: number;
  max: number;
}

export type ItemSlot = "mainhand" | "offhand" | "helm" | "body" | "ring" | "amulet" | "gloves" | "belt" | "boots"

export type SortProp = string | number | undefined;
export type SortOrder = "asc" | "desc";
export type Sorter = (item: Item) => SortProp | (SortOrder | SortProp)[];
export type FilterPredicate = (item: Item) => boolean;