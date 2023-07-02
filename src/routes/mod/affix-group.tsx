import { Link } from "react-router-dom";
import { useD2, useEntityId } from "../../lib/hooks";

function AffixGroup() {
  const [d2, id] = useEntityId();
  const prefixes = d2.data.global.excel.magicprefix.data
    .filter(affix => affix.group === id)
  const suffixes = d2.data.global.excel.magicsuffix.data
    .filter(affix => affix.group === id)

  const filteredAffixes = [["magicprefix", prefixes], ["magicsuffix", suffixes]] as const;

  return (
    <>
      <h1>Affix Group {id}</h1>
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