import { Link } from "react-router-dom";
import { useEntity } from "../../lib/hooks";
import { encodeId, getTableArray } from "../../lib/util";
import ReferenceList from "../../components/referenceList";
import { useT } from "../../lib/translation/translation";
import PropertyRange from "../../components/PropertyRange";
import { D2Affix, D2Runeword, D2SetItem, D2UniqueItem, Indexed } from "../../lib/d2Parser";
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
        <ReferenceList
          createColumn
          title="Property is found on these prefixes"
          refClass="mag"
          file="properties"
          entity={property}
          refFile="magicprefix"
          labelPicker={(affix, ref) => <>{t(affix.Name)} <PropertyRange {...getPropertyOnAffix(affix, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these suffixes"
          refClass="mag"
          file="properties"
          entity={property}
          refFile="magicsuffix"
          labelPicker={(affix, ref) => <>{t(affix.Name)} <PropertyRange {...getPropertyOnAffix(affix, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these uniques"
          refClass="uni"
          file="properties"
          entity={property}
          refFile="uniqueitems"
          labelPicker={(unique, ref) => <>{t(unique.index)} <PropertyRange {...getPropertyOnUnique(unique, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these runewods"
          refClass="rw"
          file="properties"
          entity={property}
          refFile="runes"
          labelPicker={(rw, ref) => <>{t(rw.Name)} <PropertyRange {...getPropertyOnRuneword(rw, ref)}/></>}
        />
        <ReferenceList
          createColumn
          title="Property is found on these set items"
          refClass="set"
          file="properties"
          entity={property}
          refFile="setitems"
          labelPicker={(item, ref) => <><SetRequirement reference={ref}/> {t(item.index)} <PropertyRange {...getPropertyOnSet(item, ref)}/></>}
        />
    </dl>
  </>
}

function getPropertyOnAffix(affix: Indexed<D2Affix>, ref: Reference<"magicprefix"> | Reference<"magicsuffix">): PropertyRef {
  const propNr = ref.column[3] as "1";
  return {
    code: affix[ref.column],
    param: affix[`mod${propNr}param`],
    min: Number(affix[`mod${propNr}min`]),
    max: Number(affix[`mod${propNr}max`]),
  }
}

function getPropertyOnUnique(unique: Indexed<D2UniqueItem>, ref: Reference<"uniqueitems">): PropertyRef {
  const propNr = ref.column.at(-1) as "1";
  return {
    code: unique[ref.column],
    param: unique[`par${propNr}`],
    min: Number(unique[`min${propNr}`]),
    max: Number(unique[`max${propNr}`]),
  }
}

function getPropertyOnSet(set: Indexed<D2SetItem>, ref: Reference<"setitems">): PropertyRef {
  let propNr: "1";
  let prefix: "";
  if (ref.column.startsWith("a")) {
    propNr = ref.column.substring(5) as any;
    prefix = "a" as any;
  } else {
    propNr = ref.column.at(-1) as "1";
    prefix = "";
  }
  return {
    code: set[ref.column],
    param: set[`${prefix}par${propNr}`],
    min: Number(set[`${prefix}min${propNr}`]),
    max: Number(set[`${prefix}max${propNr}`]),
  }
}

function getPropertyOnRuneword(rw: Indexed<D2Runeword>, ref: Reference<"runes">): PropertyRef {
  const propNr = ref.column.at(-1) as "1";
  return {
    code: rw[ref.column],
    param: rw[`T1Param${propNr}`],
    min: Number(rw[`T1Min${propNr}`]),
    max: Number(rw[`T1Max${propNr}`]),
  }
}

function SetRequirement({ reference }: { reference: Reference<"setitems">}) {
  if (!reference || !reference.column.startsWith("a")) {
    return null;
  }
  const nr = Number(reference.column.substring(5, 6)) + 1;
  return <>[{nr}]</>
}

export default Property