import { Link } from "react-router-dom";
import { useEntityId } from "../../lib/hooks";
import { useState } from "react";
import { Predicate } from "../../lib/util";
import { D2Affix } from "../../lib/d2Parser";
import { affixFilter } from "../../main";

function AffixGroup() {
  const [d2, id] = useEntityId();
  const [showAll, setShowAll] = useState(false);
  const isSpawnableAffix: Predicate<D2Affix> = affix =>
    affix.group === id && (showAll || affixFilter(affix));

  const prefixes = d2.data.global.excel.magicprefix.data.filter(isSpawnableAffix)
  const suffixes = d2.data.global.excel.magicsuffix.data.filter(isSpawnableAffix)

  const filteredAffixes = [["magicprefix", prefixes], ["magicsuffix", suffixes]] as const;

  return (
    <>
      <h1>Affix Group {id}</h1>
      <div>Show all: <input type="checkbox" checked={showAll} onChange={ev => setShowAll(ev.target.checked)} /></div>
      <dl>
        <div className="dl-col">
          <dt>Affixes in this Group</dt>
          {
            filteredAffixes.flatMap(([type, affixes]) => (
              affixes.map(affix => (
                <dd key={affix._index}>
                  <Link to={`../../${type}/${affix._index}`}>{affix.Name}</Link>
                </dd>
              ))
            ))
          }
        </div>
      </dl>
    </>
  )
}

export default AffixGroup;