import { ItemInstanceTooltipContent } from "../../components/iteminstance/itemInstanceTooltip";
import { useD2 } from "../../lib/hooks";
import { createVariableItem } from "../../lib/iteminstance/itemInstance";

export type DevComponent = {
  
}

function DevComponent({}: DevComponent) {
  const d2 = useD2();
  return (<>
        <ItemInstanceTooltipContent item={createVariableItem(d2, {file: "weapons", id: "7ja"})}/>
  </>
  );
}

export default DevComponent;