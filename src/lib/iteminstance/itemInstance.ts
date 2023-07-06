import { D2Context } from "../../context/D2Context";
import { EntityReference, getEntity } from "../../context/context-util";
import { D2Item } from "../d2Parser";
import { Range } from "../util";
import { NormalItemInstance, createVariableNormalItem } from "./normalItemInstance";

export type ItemInstance = SimpleItem | NormalItemInstance;
export type BaseItemCode = string;

export interface SimpleItem {
  itemType: BaseItemCode;
}

export enum ItemQuality {
  LOW_QUALITY = 1,
  NORMAL,
  HIGH_QUALITY,
  MAGIC,
  SET,
  RARE,
  UNIQUE,
  CRAFTED
}

export interface ExtendedItem extends SimpleItem {
  quality: ItemQuality
}

export type VariableProperty = VariableNumber;
export type VariableNumber = number | Range

export function createVariableItem(d2: D2Context, ref: EntityReference): ItemInstance | undefined {
  switch (ref.file) {
    case "armor":
    case "misc":
    case "weapons":
      return createVariableNormalItem(ref.file, getEntity(d2, ref) as D2Item)
  }
}