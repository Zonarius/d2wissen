import { VariableProperty } from "../../lib/iteminstance/itemInstance";
import { isRange } from "../../lib/util";

export type VarPropProps = {
  value: VariableProperty
  valueClass?: string;
}

function VarProp({ value, valueClass }: VarPropProps) {
  let exampleValue;
  let rangePart = null;
  if (typeof value === "number") {
    exampleValue = value;
    return <span className={valueClass}>{value}</span>;
  } else if (isRange(value)) {
    exampleValue = value[1];
    rangePart = <span className="range">[{value[0]}-{value[1]}]</span>
  } else {
    return null;
  }
  return <>
    {exampleValue} {rangePart}
  </>;
}

export default VarProp;