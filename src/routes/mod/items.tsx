import { D2Context } from "../../context/D2Context";
import { range } from "../../lib/util";
import React, { useState } from "react";
import { useModifierT } from "../../lib/translation/modifier";
import { FilterPopout, ItemFilter } from "../../components/filter";
import { Item } from "../../components/filterItem";
import { useD2, useItems } from "../../lib/hooks";
import BaseItem from "../../components/baseItem";

function Items() {
  const d2 = useD2();
  const items = useItems();
  const [itemFilter, setItemFilter] = useState<ItemFilter | undefined>(undefined);

  let errorText: string | undefined;
  let filtered: Item[];
  try {
    if (itemFilter?.sort) {
      items.sort(itemFilter.sort);
    }

    filtered = itemFilter?.filter
      ? items.filter(itemFilter.filter)
      : items;
  } catch (err) {
    const e = err as any;
    errorText = e.message;
    filtered = items;
  }

  return (
    <>
      <h3>All items</h3>
      <FilterPopout onChange={filter => setItemFilter(() => filter)}/>
      <FilterError message={errorText} />
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

interface FilterErrorProps {
  message: string | undefined;
}

function FilterError({ message }: FilterErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <div className="error">Error: {message}</div>
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
      <td><BaseItem item={item.baseItem} /></td>
      <td>{item.reqs.lvl}</td>
      <td>{modT(item.props).map(mod => (
        <Modifier key={mod} mod={mod} />
      ))}
      {
        item.setProps.flatMap(setProp => modT([setProp.prop])
          .map(prop => 
            <Modifier requiredParts={setProp.requiredParts} key={setProp.requiredParts + "-" + prop} mod={prop} />
          )
        )
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

export default Items;