import { Link } from "react-router-dom";
import { useEntity } from "../../lib/hooks";
import { Predicate, encodeId, getTableArray } from "../../lib/util";
import ReferenceList from "../../components/referenceList";
import { useT } from "../../lib/translation/translation";
import PropertyRange from "../../components/propertyRange";
import { PropertyRef } from "../../components/filterItem";
import { Reference } from "../../context/referenceBuilder";
import PropertyFilter from "../../components/propertyFilter";
import { useState } from "react";
import { getPropertyFromReference } from "../../lib/property-ref";

function Property() {
  const [propertyFilter, setPropertyFilter] = useState<Predicate<PropertyRef> | null>(null);
  const t = useT();
  const [d2 ,property] = useEntity("properties");
  const stats = getTableArray(property, "stat", 7)
  const filter: Predicate<Reference<any>> | undefined = !propertyFilter ? undefined :
    (ref => propertyFilter!(getPropertyFromReference(d2, ref)));
  return <>
    <h1>{property.code}</h1>
    <PropertyFilter property={property} onChange={f => setPropertyFilter(() => f)} />
    <dl className="dl-flex">
        <div className="dl-col">
          <dt>Stats</dt>
          {stats.map(stat => (
            <dd key={stat}><Link to={`../../itemstatcost/${encodeId(stat)}`}>{stat}</Link></dd>
          ))}
        </div>
        <ReferenceList
          createColumn
          title="Property is found on these prefixes"
          refClass="mag"
          file="properties"
          entity={property}
          refFile="magicprefix"
          refFilter={filter}
          labelPicker={(affix, ref) => <>{t(affix.Name)} <PropertyRange {...getPropertyFromReference(d2, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these suffixes"
          refClass="mag"
          file="properties"
          entity={property}
          refFile="magicsuffix"
          refFilter={filter}
          labelPicker={(affix, ref) => <>{t(affix.Name)} <PropertyRange {...getPropertyFromReference(d2, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these uniques"
          refClass="uni"
          file="properties"
          entity={property}
          refFile="uniqueitems"
          refFilter={filter}
          labelPicker={(unique, ref) => <>{t(unique.index)} <PropertyRange {...getPropertyFromReference(d2, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these runewods"
          refClass="rw"
          file="properties"
          entity={property}
          refFile="runes"
          refFilter={filter}
          labelPicker={(rw, ref) => <>{t(rw.Name)} <PropertyRange {...getPropertyFromReference(d2, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these set items"
          refClass="set"
          file="properties"
          entity={property}
          refFile="setitems"
          refFilter={filter}
          labelPicker={(item, ref) => <><SetRequirement reference={ref}/> {t(item.index)} <PropertyRange {...getPropertyFromReference(d2, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these sets"
          refClass="set"
          file="properties"
          entity={property}
          refFile="sets"
          refFilter={filter}
          labelPicker={(item, ref) => <><SetRequirement reference={ref}/> {t(item.index)} <PropertyRange {...getPropertyFromReference(d2, ref)}/></>}
        />
    </dl>
  </>
}

function SetRequirement({ reference }: { reference: Reference<"setitems"> | Reference<"sets">}) {
  let text;
  if (!reference) {
    return null;
  } else if (reference.column.startsWith("a")) {
    text = Number(reference.column.substring(5, 6)) + 1;
  } else if (reference.column.startsWith("P")) {
    text = reference.column.substring(5, 6);
  } else if (reference.column.startsWith("F")) {
    text = "FULL"
  } else {
    return null;
  }
  return <>[{text}]</>
}

export default Property