import { Quality } from "../../components/filterItem";
import { D2Affix } from "../d2Parser";
import { Range } from "../util";

export const difficulties = ["normal", "nightmare", "hell"] as const;
export const vendors = [
  "Charsi", "Gheed", "Akara",
  "Fara", "Lysander", "Drognan",
  "Hratli", "Alkor", "Ormus", "Elzix", "Asheara",
  "Cain",
  "Halbu", "Jamella",
  "Larzuk", "Malah", "Drehya"
] as const;

export type Difficulty = typeof difficulties[number];
export type Vendor = typeof vendors[number];
export type D2ItemTypeCode = string

export interface Coordinates {
  x: number;
  y: number;
}

export interface ShopItem {
  /** starting at 0 for each type (armor, weapons, misc) */
  page: number;
  coordinates: Coordinates;
  code: D2ItemTypeCode;
  quality: Quality;
  prefix?: Affix;
  suffix?: Affix;
}

export interface Affix {
  d2affix: D2Affix;
  modifiers: ModifierRoll[]
}

export interface ModifierRoll {
  code: string;
  param?: string;
  value?: number;
}

export interface ShopResult {
  difficulty: Difficulty;
  vendor: Vendor;
  clvl: number;
  type: ItemType;
  items: ShopItem[];
}

export type VendorDifficulty = [Difficulty, Vendor];
export type ItemType = "armor" | "weapons" | "misc";

export interface ShopOptions {
  clvlRange: Range;
  vendors: VendorDifficulty[],
  itemtypes: ItemType[];
  seed?: string;
}