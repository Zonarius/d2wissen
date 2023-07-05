import SimpleTableProp from "../../components/simpleTableProp";
import { entityReference } from "../../context/context-util";
import { useEntity } from "../../lib/hooks";
import { useT } from "../../lib/translation/translation";

function Armor() {
  const [, armor] = useEntity("armor");
  const t = useT();
  return <>
    <h1>{t(armor.code)}</h1>
    <dl>
      <dt>Requirements</dt>
      <dl className="dl-inner">
        <SimpleTableProp title="Level" prop={armor.levelreq} />
        <SimpleTableProp title="Strength" prop={armor.reqstr} />
      </dl>
      <SimpleTableProp title="Item Type" prop={entityReference("itemtypes", armor.type)} />
    </dl>
  </>
}

export default Armor;