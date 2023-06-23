import { D2Context } from "../../context/D2Context";
import { D2Runeword, D2UniqueItem } from "../../lib/d2Parser";
import { range } from "../../lib/util";
import React, { useState } from "react";
import { useModifierT } from "../../lib/translation/modifier";
import { FilterPopout, ItemFilter } from "../../components/filter";
import { useItemMapper } from "../../lib/itemMapper";
import { Item } from "../../components/filterItem";
import { useD2 } from "../../lib/hooks";

function Items() {
  const d2 = useD2();
  const [itemFilter, setItemFilter] = useState<ItemFilter | undefined>(undefined);
  const itemMapper = useItemMapper();
  const rws = d2.data.global.excel.runes
    .filter((rw: D2Runeword) => rw.complete === "1")
    .map(itemMapper.fromRuneword)

  const unis = d2.data.global.excel.UniqueItems
    .filter(item => item.enabled === "1" && !isQuestItem(item))
    .map(itemMapper.fromUnique);

  const setItems = d2.data.global.excel.SetItems
    .filter(item => item.set)
    .map(itemMapper.fromSetItem);

  const combined = [
    ...rws,
    ...unis,
    ...setItems,
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
            <th>Base Item</th>
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
    return item.name + item.props.map(prop => prop.code).join("");
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
      <td>{item.baseItem}</td>
      <td>{item.reqs.lvl}</td>
      <td>{modT(item.props).map(mod => (
        <Modifier key={mod} mod={mod} />
      ))}
      {
        item.setProps.map(setProp => {
          const prop = modT([setProp.prop])[0];
          return (
            <Modifier requiredParts={setProp.requiredParts} key={prop} mod={prop} />
          )
        })
      }
      </td>
    </tr>
  )
}

function RunewordRow({ item }: RuneWordRowProps) {
  const modT = useModifierT();
  return (
    <tr>
      <td>
        <b className="rw">{item.name}</b>
        <p>
          <span className="rw">&quot;{item.runes?.join("")}&quot;</span>
        </p>
      </td>
      <td>{item.baseTypes.map(type => (
        <React.Fragment key={type}> {type} <br /> </React.Fragment>
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
    requiredParts?: number;
}

function Modifier({ mod, requiredParts }: ModifierProps) {
  return (
    <>
      {requiredParts
        ? <>[<span className="set">{requiredParts}</span>] </>
        : null
      }
      {mod} <br/>
    </>
  );
}

const questItemCodes = new Set(["vip", "msf", "hst", "hfh", "qf1", "qf2"])
function isQuestItem(item: D2UniqueItem) {
  return questItemCodes.has(item.code);
}

export default Items;