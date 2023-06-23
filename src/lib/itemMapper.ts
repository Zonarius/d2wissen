import { Item, Property, Rune, SetProperty } from "../components/filterItem";
import { D2Context } from "../context/D2Context";
import { D2Runeword, D2SetItem, D2UniqueItem } from "./d2Parser";
import { useD2 } from "./hooks";
import { TFunc, useItemTypeT, useT } from "./translation/translation";
import { getTableArray, getTableModifiers, range } from "./util";

export function useItemMapper() {
  const d2 = useD2();
  const t = useT("enUS");

  return {
    fromRuneword: (item: D2Runeword) => fromRuneword(d2, t, item),
    fromUnique: (item: D2UniqueItem) => fromUnique(d2, t, item),
    fromSetItem: (item: D2SetItem) => fromSetItem(d2, t, item),
  }
}

function fromUnique(d2: D2Context, t: TFunc, item: D2UniqueItem): Item {
  const props = getTableModifiers(item, "prop", "par", "min", "max");
  return {
    name: t(item.index),
    quality: "unique",
    props,
    setProps: [],
    sockets: 0,
    runes: [],
    reqs: {
      lvl: Number(item["lvl req"])
    },
    baseItem: t(d2.refs.itemsByCode[item.code].namestr),
    baseTypes: [],    
    __original: item
  }
}

function fromSetItem(d2: D2Context, t: TFunc, item: D2SetItem): Item {
  const props = getTableModifiers(item, "prop", "par", "min", "max");
  return {
    name: t(item.index),
    quality: "set",
    props,
    setProps: setProps(item),
    sockets: 0,
    runes: [],
    reqs: {
      lvl: Number(item["lvl req"])
    },
    baseItem: t(d2.refs.itemsByCode[item.item].namestr),
    baseTypes: [],    
    __original: item
  }
}

function setProps(item: D2SetItem): SetProperty[] {
  const ret: SetProperty[] = [];
  const tbl = item as any;

  for (let i = 1; i <= 5; i++) {
    for (const suffix of ["a", "b"]) {
      if (tbl["aprop" + i + suffix]) {
        ret.push({
          requiredParts: i + 1,
          prop: {
            code: tbl["aprop" + i + suffix],
            param: tbl["apar" + i + suffix],
            min: Number(tbl["amin" + i + suffix]),
            max: Number(tbl["amax" + i + suffix])            
          }
        })
      }
    }
  }

  return ret;
}


function fromRuneword(d2: D2Context, t: TFunc, rw: D2Runeword): Item {
  const runes = getRunes(t, rw);
  const props = getTableModifiers(rw, "T1Code", "T1Param", "T1Min", "T1Max");
  const itT = useItemTypeT();
  return {
    name: t(rw.Name),
    quality: "runeword",
    sockets: runes.length,
    props,
    setProps: [],
    runes,
    reqs: {
      lvl: requiredLevel(d2, rw, props)
    },
    baseItem: "",
    baseTypes: getTableArray(rw, "itype").map(key => itT(key)),
    __original: rw
  }
}

function getRunes(t: TFunc, rw: D2Runeword): Rune[] {
  return range(1, 7).map(i => (rw as any)["Rune" + i])
    .filter(Boolean)
    .map(code => t(code + "L")) as Rune[];
}

function requiredLevel(d2: D2Context, rw: D2Runeword, props: Property[]): number {
  const lreq = props.find(prop => prop.code === "levelreq");
  return Math.max(
      ...[
          ...[lreq ? Number(lreq.max) : 0],
          ...getTableArray(rw, "Rune").map(r => Number(d2.refs.itemsByCode[r].levelreq))
      ]
  );
}