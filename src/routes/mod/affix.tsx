import { useEntity } from "../../lib/hooks";
import SimpleTableProp from "../../components/simpleTableProp";
import { PropertyRef } from "../../components/filterItem";
import { getTableModifiersRev } from "../../lib/util";
import React from "react";

export type AffixType = "prefix" | "suffix"
export type AffixProps = {
  affixType: AffixType
}

function Affix({ affixType }: AffixProps) {
  const [, affix] = useEntity(`magic${affixType}`);
  const properties: PropertyRef[] = getTableModifiersRev(affix, "code", "param", "min", "max", "mod", 3);
  return (
    <div>
      <h1>{affix.Name}</h1>
      <dl className="dl-flex">
        <div className="dl-col">
          <SimpleTableProp title="Level" prop={affix.level} />
          <SimpleTableProp title="Max. Level" prop={affix.maxlevel} />
          <SimpleTableProp title="Frequency" prop={affix.frequency} />
          <SimpleTableProp title="Can appear on rare items" prop={affix.rare === "1"} />
          <SimpleTableProp title="Level requirement" prop={affix.levelreq} />
          <SimpleTableProp title="Affix Group" prop={affix.group} link={`../../affixgroup/${affix.group}`} />
        </div>
        <div className="dl-col">
          {properties.map((property, i) => (
            <React.Fragment key={property.code}>
              <dt>{properties.length === 1 ? "Property" : `Property ${i + 1}`}</dt>
              <dd key={property.code}>
                <dl className="dl-inner">
                  <SimpleTableProp title="Code" prop={property.code} link={`../../properties/${property.code}`} /> 
                  <SimpleTableProp title="Parameter" prop={property.param} /> 
                  <SimpleTableProp title="Min" prop={property.min} /> 
                  <SimpleTableProp title="Max" prop={property.max} /> 
                </dl>
              </dd>
            </React.Fragment>
          ))}
        </div>
      </dl>
    </div>
  )
}

export default Affix