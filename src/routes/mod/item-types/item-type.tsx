import { Link, useParams } from "react-router-dom";
import { useD2 } from "../../../lib/hooks";
import { getTableArray, hrBoolean } from "../../../lib/util";

function ItemType() {
  const d2 = useD2();
  const { code } = useParams();
  if (!code) {
    return null;
  }
  const itemType = d2.refs.itemTypeByCode[code];
  const equivalents = getTableArray(itemType, "Equiv", 2);
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
      </dl>
    </>
  )
}

export default ItemType;