import { D2Context } from "../../context/D2Context";
import { D2Runeword, D2UniqueItem } from "../../lib/d2Parser";
import { getTableArray, getTableModifiers, range } from "../../lib/util";
import React, { useState } from "react";
import { TFunc, useItemTypeT } from "../../lib/translation/translation";
import { useModifierT, ModifierTFunc } from "../../lib/translation/modifier";
import { FilterPopout, ItemFilter } from "../../components/filter";
import { useItemMapper } from "../../lib/itemMapper";
import { Item } from "../../components/filterItem";
import { useD2 } from "../../lib/hooks";

function Items() {
  const d2 = useD2();
  console.log(d2);
  const [itemFilter, setItemFilter] = useState<ItemFilter | undefined>(undefined);
  const itemMapper = useItemMapper();
  const rws = d2.data.global.excel.runes
    .filter((rw: D2Runeword) => rw.complete === "1")
    .map(itemMapper.fromRuneword)

  const unis = d2.data.global.excel.UniqueItems
    .filter(item => item.enabled === "1" && !isQuestItem(item))
    .map(itemMapper.fromUnique);

  const combined = [
    ...rws,
    ...unis
  ];
  
  if (itemFilter?.sort) {
    combined.sort(itemFilter.sort);
  }

  const filtered = itemFilter?.filter
    ? combined.filter(itemFilter.filter)
    : combined;

  return (
    <>
      <h3>All items</h3>
      <FilterPopout onChange={filter => setItemFilter(() => filter)}/>
      <table className="d2w">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Level</th>
            <th>Properties</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item: Item) => (
            <ItemRow key={itemKey(item)} d2={d2} item={item} />
          ))}
        </tbody>
      </table>
    </>
  )
}

interface RuneWordRowProps {
  d2: D2Context;
  item: Item;
}

function itemKey(item: Item): string {
  if (item.quality === "runeword") {
    return item.name + range(1, 5).map(i => item.__original["itype" + i]).join("");
  } else {
    return item.name;
  }
}

const itemNameColorByRarity = {
  "unique": "uni",
  "set": "set",
  "runeword": "rw"
} as any;

function ItemRow({ d2, item }: RuneWordRowProps) {
  const modT = useModifierT();
  if (item.quality === "runeword") {
    return <RunewordRow {...{d2, item}}/>
  }
  return (
    <tr>
      <td>
        <b className={itemNameColorByRarity[item.quality]}>{item.name}</b>
      </td>
      <td>TYPE</td>
      <td>{item.reqs.lvl}</td>
      <td>{modT(item.props).map(mod => (
        <Modifier key={mod} mod={mod} />
      ))}</td>
    </tr>
  )
}

function RunewordRow({ item }: RuneWordRowProps) {
  const itT = useItemTypeT();
  const modT = useModifierT();
  return (
    <tr>
      <td>
        <b className="rw">{item.name}</b>
        <p>
          <span className="rw">&quot;{item.runes?.join("")}&quot;</span>
        </p>
      </td>
      <td>{possibleItems(itT, item.__original).map(type => (
        <React.Fragment key={type}>{type}<br/></React.Fragment>
      ))}</td>
      <td>{item.reqs.lvl}</td>
      <td>{modT(item.props).map(mod => (
        <Modifier key={mod} mod={mod} />
      ))}</td>
    </tr>
  )
}

type ModifierProps = {
    mod: string;
}

function Modifier({mod}: ModifierProps) {
  return (
    <>
      {mod} <br/>
    </>
  );
}

function possibleItems(t: TFunc, rw: D2Runeword): string[] {
  return getTableArray(rw, "itype")
    .map(key => t(key))
}

const questItemCodes = new Set(["vip", "msf", "hst", "hfh", "qf1", "qf2"])
function isQuestItem(item: D2UniqueItem) {
  return questItemCodes.has(item.code);
}

export default Items;