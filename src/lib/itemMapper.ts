import { Item, Property, Rune } from "../components/filterItem";
import { D2Context } from "../context/D2Context";
import { D2Runeword, D2UniqueItem } from "./d2Parser";
import { useD2 } from "./hooks";
import { TFunc, useT } from "./translation/translation";
import { getTableArray, getTableModifiers, range } from "./util";

export function useItemMapper() {
  const d2 = useD2();
  const t = useT("enUS");

  return {
    fromRuneword: (item: D2Runeword) => fromRuneword(d2, t, item),
    fromUnique: (item: D2UniqueItem) => fromUnique(t, item)
  }
}

function fromUnique(t: TFunc, item: D2UniqueItem): Item {
  const props = getTableModifiers(item, "prop", "par", "min", "max");
  return {
    name: t(item.index),
    quality: "unique",
    props,
    sockets: 0,
    reqs: {
      lvl: Number(item["lvl req"])
    },
    __original: item
  }
}

function fromRuneword(d2: D2Context, t: TFunc, rw: D2Runeword): Item {
  const runes = getRunes(t, rw);
  const props = getTableModifiers(rw, "T1Code", "T1Param", "T1Min", "T1Max");
  return {
    name: t(rw.Name),
    quality: "runeword",
    sockets: runes.length,
    props,
    runes,
    reqs: {
      lvl: requiredLevel(d2, rw, props)
    },
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