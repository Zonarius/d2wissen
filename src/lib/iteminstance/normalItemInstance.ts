import { BaseItemType } from "../../context/context-util";
import { D2Armor, D2Item } from "../d2Parser";
import { BaseItemData } from "./baseItemData";
import { ExtendedItem, ItemQuality } from "./itemInstance";

export interface NormalItemInstance extends ExtendedItem {
  baseItem: BaseItemData
}

export function isNormalItem(x: any): x is NormalItemInstance {
  return x && x.quality === ItemQuality.NORMAL;
} 

export function createVariableNormalItem(file: BaseItemType, item: D2Item): NormalItemInstance {
  let baseItem: BaseItemData;
  if (file === "armor") {
    const armor = item as D2Armor
    baseItem = {
      defense: [Number(armor.minac), Number(armor.maxac)],
      durability: Number(armor.durability)
    }
  } else if (file === "weapons") {
    baseItem = {
      durability: Number(item.durability)
    }
  } else {
    baseItem = {};
  }
  return {
    quality: ItemQuality.NORMAL,
    itemType: item.code,
    baseItem
  };
}
