import { Link, useParams } from "react-router-dom";
import { useD2 } from "../../../lib/hooks";
import { getTableArray, hrBoolean } from "../../../lib/util";
import { getRow } from "../../../context/D2Context";

function ItemType() {
  const d2 = useD2();
  const { code } = useParams();
  if (!code) {
    return null;
  }
  const itemType = d2.refs.itemTypeByCode[code];
  const equivalents = getTableArray(itemType, "Equiv", 2);
  const subTypes = d2.refs2.itemtypes.referencedBy[code]?.itemtypes ?? [];
  return (
    <>
      <h1>{itemType.ItemType}</h1>
      <dl>
        <dt>Code</dt>
        <dd>{itemType.Code}</dd>

        <dt>Equippable</dt>
        <dd>{hrBoolean(itemType.Body)}</dd>
        
        {equivalents.length === 0 ? null : (
          <>
            <dt>Also Counts As</dt>
            {equivalents.map(code => (
              <dd key={code}><Link to={"../" + code}>{d2.refs.itemTypeByCode[code].ItemType}</Link></dd>
            ))}
          </>
        )}

        {subTypes.length === 0 ? null : (
          <>
            <dt>These types count as <b>{itemType.ItemType}</b></dt>
            {subTypes.map(ref => (
              <dd key={`${ref.referencerId}-${ref.column}`}>
                <Link to={"../" + ref.referencerId}>{getRow(d2, ref).ItemType}</Link>
              </dd>
            ))}
          </>
        )}

      </dl>
    </>
  )
}

export default ItemType;