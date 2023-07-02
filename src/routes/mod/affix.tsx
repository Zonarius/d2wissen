import { useEntity } from "../../lib/hooks";
import SimpleTableProp from "../../components/simpleTableProp";

export type AffixType = "prefix" | "suffix"
export type AffixProps = {
  affixType: AffixType
}

function Affix({ affixType }: AffixProps) {
  const [d2, affix] = useEntity(`magic${affixType}`);
  return (
    <div>
      <h1>{affix.Name}</h1>
      <dl>
        <div className="dl-col">
          <SimpleTableProp title="Level" prop={affix.level} />
          <SimpleTableProp title="Max. Level" prop={affix.maxlevel} />
          <SimpleTableProp title="Frequency" prop={affix.frequency} />
          <SimpleTableProp title="Can appear on rare items" prop={affix.rare === "1"} />
          <SimpleTableProp title="Level requirement" prop={affix.levelreq} />
          <SimpleTableProp title="Affix Group" prop={affix.group} link={`../../affixgroup/${affix.group}`} />
        </div>
      </dl>
    </div>
  )
}

export default Affix