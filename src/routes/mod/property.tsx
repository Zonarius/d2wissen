import { Link } from "react-router-dom";
import { useEntity } from "../../lib/hooks";
import { encodeId, getTableArray } from "../../lib/util";
import ReferenceList from "../../components/referenceList";
import { useT } from "../../lib/translation/translation";
import PropertyRange from "../../components/PropertyRange";
import { D2UniqueItem, Indexed } from "../../lib/d2Parser";
import { PropertyRef } from "../../components/filterItem";
import { Reference } from "../../context/referenceBuilder";

function Property() {
  const t = useT();
  const [,property] = useEntity("properties");
  const stats = getTableArray(property, "stat", 7)
  return <>
    <h1>{property.code}</h1>
    <dl className="dl-flex">
        <div className="dl-col">
          <dt>Stats</dt>
          {stats.map(stat => (
            <dd key={stat}><Link to={`../../itemstatcost/${encodeId(stat)}`}>{stat}</Link></dd>
          ))}
        </div>
        <div className="dl-col">
          <ReferenceList
            title="Property is found on these prefixes"
            refClass="mag"
            file="properties"
            entity={property}
            refFile="magicprefix"
            labelPicker={affix => `${affix.Name}`}
          />
        </div>
        <div className="dl-col">
          <ReferenceList
            title="Property is found on these suffixes"
            refClass="mag"
            file="properties"
            entity={property}
            refFile="magicsuffix"
            labelPicker={affix => `${affix.Name}`}
          />
        </div>
        <div className="dl-col">
          <ReferenceList
            title="Property is found on these uniques"
            refClass="uni"
            file="properties"
            entity={property}
            refFile="uniqueitems"
            labelPicker={(unique, ref) => <>{t(unique.index)} <PropertyRange {...getPropertyOnUnique(unique, ref)}/></>}
          />
        </div>
    </dl>
  </>
}

function getPropertyOnUnique(unique: Indexed<D2UniqueItem>, ref: Reference<"uniqueitems">): PropertyRef {
  const propNr: "1" | "2" | "3" | "4" | "5" | "6" | "7" = ref.column.at(-1) as any;
  return {
    code: unique[ref.column],
    param: unique[`par${propNr}`],
    min: Number(unique[`min${propNr}`]),
    max: Number(unique[`max${propNr}`]),
  }
}

export default Property