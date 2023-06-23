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
  props: Property[];

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
  baseItem: string;

  /**
   * The possible item types of the base items for runewords.
   */
  baseTypes: string[];

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

export interface Property {
  code: string;
  param?: string;
  min?: number;
  max?: number;
}