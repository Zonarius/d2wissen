import { D2Context } from "../context/D2Context";
import { D2Affix, D2ItemType } from "./d2Parser";
import { getTableArray } from "./util";

export type ItemTypeCode = string;

export function typeCanHaveAffix(d2: D2Context, code: D2ItemType, affix: D2Affix) {
  return typeIsOneOf(
    d2,
    code,
    getTableArray(affix, "itype"),
    getTableArray(affix, "etype"),
  )
}

export function typeIsOneOf(d2: D2Context, code: D2ItemType, included: ItemTypeCode[], excluded: ItemTypeCode[]): "direct" | "indirect" | false {
  return typeIsOneOfRec(d2, code, new Set(included), new Set(excluded));
}

function typeIsOneOfRec(d2: D2Context, type: D2ItemType, included: Set<ItemTypeCode>, excluded: Set<ItemTypeCode>): "direct" | "indirect" | false {
  if (excluded.has(type.Code)) {
    return false;
  }
  if (included.has(type.Code)) {
    return "direct";
  }
  for (const parent of getTableArray(type, "Equiv", 2)) {
    const isType = typeIsOneOfRec(d2, d2.refs2.itemtypes.rowById[parent], included, excluded);
    if (isType) {
      return "indirect";
    }
  }
  return false;
}