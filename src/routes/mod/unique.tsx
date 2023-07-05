import PD2Link from "../../components/pd2Link";
import { useEntity } from "../../lib/hooks";
import { useT } from "../../lib/translation/translation";

function Unique() {
  const [d2, unique] = useEntity("uniqueitems");
  const t = useT();
  return <>
    <h1>{t(unique.index)}</h1>
    <PD2Link entityRef={{file: "uniqueitems", id: unique._index}} />
  </>
}

export default Unique;