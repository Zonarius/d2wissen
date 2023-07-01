import { Link, useParams } from "react-router-dom";
import { useD2 } from "../../../lib/hooks";
import { getTableArray, hrBoolean } from "../../../lib/util";
import { D2Context, getRow } from "../../../context/D2Context";
import { D2ItemType } from "../../../lib/d2Parser";

function ItemType() {
  const d2 = useD2();
  const { code } = useParams();
  if (!code) {
    return null;
  }
  const itemType = d2.refs.itemTypeByCode[code];
  return (
    <>
      <h1>{itemType.ItemType}</h1>
      <dl>
        <dt>Code</dt>
        <dd>{itemType.Code}</dd>

        <dt>Equippable</dt>
        <dd>{hrBoolean(itemType.Body)}</dd>

        <Equivalents {...{d2, itemType}} />
        <SubTypes {...{d2, itemType}} />
        <BaseItems file="weapons" text="Base Weapons" {...{d2, itemType}} />
        <BaseItems file="armor" text="Base Armors" {...{d2, itemType}} />
        <BaseItems file="misc" text="Base Misc. Items" {...{d2, itemType}} />
      </dl>
    </>
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

export default ItemType;