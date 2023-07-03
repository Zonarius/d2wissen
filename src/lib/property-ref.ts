import { PropertyRef } from "../components/filterItem";
import { D2Context } from "../context/D2Context";
import { ExcelFileName, Reference } from "../context/referenceBuilder";
import { Indexed, D2Affix, D2UniqueItem, D2SetItem, D2Set, D2Runeword } from "./d2Parser";

export function getPropertyFromReference<F extends ExcelFileName>(d2: D2Context, ref: Reference<F>): PropertyRef {
  const referencer = d2.refs2[ref.referencerFile].rowById[ref.referencerId];
  switch (ref.referencerFile) {
    case "magicprefix":
    case "magicsuffix":
      return getPropertyOnAffix(referencer as any, ref as any);
    case "uniqueitems":
      return getPropertyOnUnique(referencer as any, ref as any);
    case "setitems":
      return getPropertyOnSetItem(referencer as any, ref as any);
    case "sets":
      return getPropertyOnSet(referencer as any, ref as any);
    case "runes":
      return getPropertyOnRuneword(referencer as any, ref as any);
  }
  throw new Error("NYI")
}

function getPropertyOnAffix(affix: Indexed<D2Affix>, ref: Reference<"magicprefix"> | Reference<"magicsuffix">): PropertyRef {
  const propNr = ref.column[3] as "1";
  return {
    code: affix[ref.column],
    param: affix[`mod${propNr}param`],
    min: Number(affix[`mod${propNr}min`]),
    max: Number(affix[`mod${propNr}max`]),
  }
}

function getPropertyOnUnique(unique: Indexed<D2UniqueItem>, ref: Reference<"uniqueitems">): PropertyRef {
  const propNr = ref.column.at(-1) as "1";
  return {
    code: unique[ref.column],
    param: unique[`par${propNr}`],
    min: Number(unique[`min${propNr}`]),
    max: Number(unique[`max${propNr}`]),
  }
}

function getPropertyOnSetItem(set: Indexed<D2SetItem>, ref: Reference<"setitems">): PropertyRef {
  let propNr: "1";
  let prefix: "";
  if (ref.column.startsWith("a")) {
    propNr = ref.column.substring(5) as any;
    prefix = "a" as any;
  } else {
    propNr = ref.column.at(-1) as "1";
    prefix = "";
  }
  return {
    code: set[ref.column],
    param: set[`${prefix}par${propNr}`],
    min: Number(set[`${prefix}min${propNr}`]),
    max: Number(set[`${prefix}max${propNr}`]),
  }
}

function getPropertyOnSet(set: Indexed<D2Set>, ref: Reference<"sets">): PropertyRef {
  const propNr = ref.column.substring(5) as "1";
  const prefix = ref.column[0] as "F";
  return {
    code: set[ref.column],
    param: set[`${prefix}Param${propNr}`],
    min: Number(set[`${prefix}Min${propNr}`]),
    max: Number(set[`${prefix}Max${propNr}`]),
  }
}

function getPropertyOnRuneword(rw: Indexed<D2Runeword>, ref: Reference<"runes">): PropertyRef {
  const propNr = ref.column.at(-1) as "1";
  return {
    code: rw[ref.column],
    param: rw[`T1Param${propNr}`],
    min: Number(rw[`T1Min${propNr}`]),
    max: Number(rw[`T1Max${propNr}`]),
  }
}