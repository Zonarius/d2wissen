import { Link, useParams } from "react-router-dom";
import { useD2 } from "../../lib/hooks";
import { getTableArray, hrBoolean } from "../../lib/util";
import { D2Context, getRow } from "../../context/D2Context";
import { D2ItemType } from "../../lib/d2Parser";
import { typeCanHaveAffix } from "../../lib/itemTypeGraph";
import { useState } from "react";

function ItemType() {
  const d2 = useD2();
  const { id } = useParams();
  const [alvl, setAlvl] = useState(99);
  if (!id) {
    return null;
  }
  const itemType = d2.refs.itemTypeByCode[id];
  return (
    <>
      <h1>{itemType.ItemType}</h1>
      <AffixLevelSelector onChange={setAlvl} />
      <dl>
        <div className="dl-col">
          <dt>Code</dt>
          <dd>{itemType.Code}</dd>

          <dt>Equippable</dt>
          <dd>{hrBoolean(itemType.Body)}</dd>

          <Equivalents {...{d2, itemType}} />
          <SubTypes {...{d2, itemType}} />
          <BaseItems file="weapons" text="Base Weapons" {...{d2, itemType}} />
          <BaseItems file="armor" text="Base Armors" {...{d2, itemType}} />
          <BaseItems file="misc" text="Base Misc. Items" {...{d2, itemType}} />
        </div>
        <div className="dl-col">
          <Affixes file="magicprefix" text="Possible Prefixes" {...{d2, itemType, alvl}} />
        </div>
        <div className="dl-col">
          <Affixes file="magicsuffix" text="Possible Suffixes" {...{d2, itemType, alvl}} />
        </div>
      </dl>
    </>
  )
}

function AffixLevelSelector({ onChange }: { onChange: (x: number) => any }) {
  const handle: React.ChangeEventHandler<HTMLInputElement> = ev => {
    onChange(ev.target.valueAsNumber)
  }
  return (
    <div>
      Affix Level:
      <input className="affix-level-selector" type="number" min={1} max={99} defaultValue={99} onChange={handle} />
    </div>
  )
}

function Equivalents({ d2, itemType }: { d2: D2Context, itemType: D2ItemType }) {
  const equivalents = getTableArray(itemType, "Equiv", 2);
  if (equivalents.length === 0) {
    return null;
  }

  return (
    <>
      <dt>Also Counts As</dt>
      {equivalents.map(code => (
        <dd key={code}><Link to={"../" + code}>{d2.refs.itemTypeByCode[code].ItemType}</Link></dd>
      ))}
    </>
  );
}

function SubTypes({ d2, itemType }: { d2: D2Context, itemType: D2ItemType }) {
  const subTypes = d2.refs2.itemtypes.referencedBy[itemType.Code]?.itemtypes ?? [];
  if (subTypes.length === 0) {
    return null;
  }

  return (
    <>
      <dt>These types count as <b>{itemType.ItemType}</b></dt>
      {subTypes.map(ref => (
        <dd key={`${ref.referencerId}-${ref.column}`}>
          <Link to={"../" + ref.referencerId}>{getRow(d2, ref).ItemType}</Link>
        </dd>
      ))}
    </>
  );
}

function BaseItems<F extends "armor" | "weapons" | "misc">({ file, text, d2, itemType }: { d2: D2Context, itemType: D2ItemType, file: F, text: string }) {
  const baseItems = d2.refs2.itemtypes.referencedBy[itemType.Code]?.[file] ?? [];
  if (baseItems.length === 0) {
    return null;
  }

  return (
    <>
      <dt>These {text} have this type</dt>
      {baseItems.map(ref => (
        <dd key={`${ref.referencerId}`}>
          <Link to={`../../${file}/${ref.referencerId}`}>{getRow(d2, ref).name}</Link>
        </dd>
      ))}
    </>
  );
}

function Affixes<F extends "magicprefix" | "magicsuffix">({ file, text, d2, itemType, alvl }: { d2: D2Context, itemType: D2ItemType, file: F, text: string, alvl: number }) {
  const affixes = d2.data.global.excel[file].data;

  const filteredAffixes = affixes.filter(affix => {
    if (affix.spawnable !== "1" || !affix.frequency || Number(affix.frequency) === 0) {
      return false;
    }
    if (Number(affix.level) > alvl) {
      return false;
    }
    if (affix.maxlevel && Number(affix.maxlevel) < alvl) {
      return false;
    }
    return typeCanHaveAffix(d2, itemType, affix);
  })

  return (
    <>
      <dt>{text}</dt>
      {filteredAffixes.map(affix => (
        <dd key={`${affix._index}`}>
          <Link to={`../../${file}/${affix._index}`}>{affix.Name}</Link>
        </dd>
      ))}
    </>
  );
}


export default ItemType;