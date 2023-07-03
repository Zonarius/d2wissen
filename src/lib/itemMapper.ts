import { BaseItem, BaseItemVersion, Item, ItemSlot, PropertyRef, Rune, SetProperty } from "../components/filterItem";
import { D2Context } from "../context/D2Context";
import { D2Runeword, D2SetItem, D2UniqueItem } from "./d2Parser";
import { useD2 } from "./hooks";
import { statsFromProps } from "./statMapper";
import { TFunc, useItemTypeT, useT } from "./translation/translation";
import { getTableArray, getTableModifiers, range } from "./util";

export function useItemMapper() {
  const d2 = useD2();
  const t = useT("enUS");
  const itT = useItemTypeT();

  return {
    fromRuneword: (item: D2Runeword) => fromRuneword(d2, t, itT, item),
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
    stats: statsFromProps(props),
    sockets: 0,
    runes: [],
    reqs: {
      lvl: Number(item["lvl req"])
    },
    baseItem: baseItem(d2, t, item.code),
    baseTypes: [],
    slots: slotsByItemCode(d2, item.code),
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
    stats: statsFromProps(props),
    sockets: 0,
    runes: [],
    reqs: {
      lvl: Number(item["lvl req"])
    },
    baseItem: baseItem(d2, t, item.item),
    baseTypes: [],    
    slots: slotsByItemCode(d2, item.item),
    __original: item
  }
}

function fromRuneword(d2: D2Context, t: TFunc, itT: TFunc, rw: D2Runeword): Item {
  const runes = getRunes(t, rw);
  const props = getTableModifiers(rw, "T1Code", "T1Param", "T1Min", "T1Max");
  return {
    name: t(rw.Name),
    quality: "runeword",
    sockets: runes.length,
    props,
    setProps: [],
    stats: statsFromProps(props),
    runes,
    reqs: {
      lvl: requiredLevel(d2, rw, props)
    },
    baseTypes: getTableArray(rw, "itype").map(key => itT(key)),
    slots: runewordSlots(d2, rw),
    __original: rw
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

function getRunes(t: TFunc, rw: D2Runeword): Rune[] {
  return range(1, 7).map(i => (rw as any)["Rune" + i])
    .filter(Boolean)
    .map(code => t(code + "L")) as Rune[];
}

function requiredLevel(d2: D2Context, rw: D2Runeword, props: PropertyRef[]): number {
  const lreq = props.find(prop => prop.code === "levelreq");
  return Math.max(
      ...[
          ...[lreq ? Number(lreq.max) : 0],
          ...getTableArray(rw, "Rune").map(r => Number(d2.refs.itemsByCode[r].levelreq))
      ]
  );
}

function baseItem(d2: D2Context, t: TFunc, code: string): BaseItem {
  const item = d2.refs.itemsByCode[code] as any;
  const [version, versionNum]: [BaseItemVersion, (0 | 1 | 2)] =
    item.ultracode === code ? ["elite", 2] :
    item.ubercode === code ? ["exceptional", 1] :
    ["normal", 0];
  return {
    name: t(item.namestr),
    version,
    versionNum
  };
}

function slotsByItemCode(d2: D2Context, code: string): ItemSlot[] {
  const typeRef = d2.refs.itemsByCode[code].type;
  return slotsByItemTypeCode(d2, typeRef);
}

const slotByCode: Record<string, ItemSlot> = {
  "shie": "offhand",
  "head": "offhand",
  "ashd": "offhand",
  "bowq": "offhand",
  "xboq": "offhand",
  "weap": "mainhand",
  "mele": "mainhand",
  "miss": "mainhand",
  "thro": "mainhand",
  "comb": "mainhand",
  "armo": "body",
  "shld": "offhand",

  "rod": "mainhand",
  "misl": "mainhand",
  "blun": "mainhand",

  "amaz": "mainhand",
  "barb": "helm",
  "necr": "offhand",
  "pala": "offhand",
  "sorc": "mainhand",
  "assn": "mainhand",
  "drui": "helm",

  "gen": "mainhand",
  "pas": "mainhand",
}

const slotByBodyLoc: Record<string, ItemSlot> = {
  "rarm": "mainhand",
  "larm": "mainhand",
  "tors": "body",
  "rrin": "ring",
  "lrin": "ring",
  "neck": "amulet",
  "feet": "boots",
  "glov": "gloves",
  "belt": "belt",
  "head": "helm",
}

function slotsByItemTypeCode(d2: D2Context, code: string): ItemSlot[] {
  const type = d2.refs.itemTypeByCode[code];
  const slot = slotByCode[code] ??
    slotByBodyLoc[type.BodyLoc1] ??
    slotByBodyLoc[type.BodyLoc2];
  return slot ? [slot] : [];
}

function runewordSlots(d2: D2Context, rw: D2Runeword): ItemSlot[] {
  const included = range(1, 7).map(i => (rw as any)["itype"] + i).filter(Boolean);
  const excluded = range(1, 4).map(i => (rw as any)["etype"] + i).filter(Boolean);

  const slots = new Set(included.flatMap(t => slotsByItemTypeCode(d2, t)));
  excluded.flatMap(t => slotsByItemTypeCode(d2, t)).forEach(slot => slots.delete(slot));
  return [...slots];
}