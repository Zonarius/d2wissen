import { Autocomplete } from "@mui/joy";
import { useD2, useUrlState } from "../../../lib/hooks";
import { useT } from "../../../lib/translation/translation";
import { stripColorCode } from "../../../lib/translation/modifier";
import { Link } from "react-router-dom";
import { encodeId } from "../../../lib/util";
import { findFileOf, findItemIn } from "../../../context/context-util";
import { D2Item } from "../../../lib/d2Parser";

const baseItemFiles = ["armor", "weapons", "misc"] as const;

function GheedHelper() {
  const d2 = useD2();
  const t = useT();
  const [selectedItems, setSelectedItems] = useUrlState<D2Item[]>("sells", {
    stateToParam: items => items.map(item => item.code).join(","),
    paramToState: codes => !codes ? [] : codes.split(",")
      .map(code => findItemIn(d2, baseItemFiles, code))
  });

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
      value={selectedItems}
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

const versions = [
  ["Normal", "normcode"],
  ["Exceptional", "ubercode"],
  ["Elite", "ultracode"]
] as const;

function UniqueColumn({ item }: { item: D2Item }) {
  const d2 = useD2();
  const t = useT();

  if (findFileOf(d2, baseItemFiles, item.code) === "misc") {
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
  const itemType = findFileOf(d2, baseItemFiles, versionCode);
  const refs = d2.refs2[itemType].referencedBy[versionCode]?.uniqueitems
  if (!refs || refs.length === 0) {
    return null;
  }
  return <>
    {!versionName ? null :
      <h3>{versionName}</h3>
    }
    <ul>
      {refs?.map(ref => {
        const unique = d2.refs2.uniqueitems.rowById[ref.referencerId];
        if (unique.enabled !== "1") {
          return null;
        }
        return (
          <li key={ref.referencerId}>
            <Link className="uni" to={`../uniqueitems/${encodeId(ref.referencerId)}`}>{t(unique.index)}</Link>
          </li>
        );
      })}
    </ul>
  </>
}

export default GheedHelper