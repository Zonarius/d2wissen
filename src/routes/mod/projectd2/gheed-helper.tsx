import { Autocomplete } from "@mui/joy";
import { useD2 } from "../../../lib/hooks";
import { useT } from "../../../lib/translation/translation";
import { stripColorCode } from "../../../lib/translation/modifier";
import { useState } from "react";
import { D2Item } from "../../../lib/d2Parser";
import { D2Context } from "../../../context/D2Context";
import { Link } from "react-router-dom";

function GheedHelper() {
  const d2 = useD2();
  const t = useT();
  const [selectedItems, setSelectedItems] = useState<D2Item[]>([]);

  const normalArmors = d2.data.global.excel.armor.data
    .filter(armor => armor.code && armor.code === armor.normcode);
  const normalWeapons = d2.data.global.excel.weapons.data
    .filter(weapon => weapon.code && weapon.code === weapon.normcode);
  const miscItems = d2.data.global.excel.misc.data
    .filter(misc => misc.code);
  
  const allItems = [...normalArmors, ...normalWeapons, ...miscItems];
  return <>
    <h1>Gheed Helper</h1>
    <Autocomplete
      multiple
      placeholder="Type base item name here"
      options={allItems}
      getOptionLabel={item => `${stripColorCode(t(item.namestr))} (${item.code})`}
      onChange={(_ev, value) => setSelectedItems(value)}
    />
    <PossibleUniques items={selectedItems}/>
  </>
}

function PossibleUniques({ items }: { items: D2Item[] }) {

  return (
    <div className="gheed-possible-uniques-grid">
      {items.map(item => (
        <UniqueColumn key={item.code} item={item}/>
      ))}
    </div>
  )
}

function UniqueColumn({ item }: { item: D2Item }) {
  const d2 = useD2();
  const t = useT();
  const versions = [
    ["Normal", "normcode"],
    ["Exceptional", "ubercode"],
    ["Elite", "ultracode"]
  ] as const;
  if (getItemType(d2, item.code) === "misc") {
    return (
      <div key={item.code}>
        <h2 className="uni">{t(item.namestr)}</h2>
        <UniqueVersion versionCode={item.code} />
      </div>
    )
  }
  return (
    <div key={item.code}>
      <h2 className="uni">{t(item.namestr)}</h2>
      {versions.map(([name, col]) => 
        <UniqueVersion key={name} versionName={name} versionCode={item[col]} />
      )}
    </div>
  )
}

function UniqueVersion({ versionName, versionCode }: { versionName?: string, versionCode: string }) {
  const d2 = useD2();
  const t = useT();
  const itemType = getItemType(d2, versionCode);
  const refs = d2.refs2[itemType].referencedBy[versionCode]?.uniqueitems
  if (!refs || refs.length === 0) {
    return null;
  }
  return <>
    {!versionName ? null :
      <h3>{versionName}</h3>
    }
    <ul>
      {refs?.map(ref => (
        <li key={ref.referencerId}>
          <Link className="uni" to={`../uniqueitems/${ref.referencerId}`}>{t(d2.refs2.uniqueitems.rowById[ref.referencerId].index)}</Link>
        </li>
      ))}
    </ul>
  </>
}

function getItemType(d2: D2Context, code: string): "armor" | "weapons" | "misc" {
  const types = ["armor", "weapons", "misc"] as const;
  return types.find(type => d2.refs2[type].rowById[code])!
}

export default GheedHelper