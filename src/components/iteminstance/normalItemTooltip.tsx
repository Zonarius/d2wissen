import { NormalItemInstance, isArmorBaseItem } from "../../lib/iteminstance/normalItemInstance";
import { useT } from "../../lib/translation/translation";
import VarProp from "./varProp";
import { useD2 } from "../../lib/hooks";
import { getEntity } from "../../context/context-util";

export type NormalItemTooltipProps = {
  item: NormalItemInstance
}

function NormalItemTooltip({ item }: NormalItemTooltipProps) {
  const t = useT();

  return (
    <div className="item-tooltip">
      <p>{t(item.itemType)}</p>
      <SpecificData item={item} />
    </div>
  );
}

function SpecificData({ item }: NormalItemTooltipProps) {
  const d2 = useD2();
  const baseItem = item.baseItem;
  if (isArmorBaseItem(baseItem)) {
    const row = getEntity(d2, "armor", item.itemType);
    return <>
      <p>Defense: <VarProp value={baseItem.defense} /></p>
      <p>Durability: {baseItem.durability} of {baseItem.durability}</p>
      <p>Required Strength: {row?.reqstr}</p>
      <p>Required Level: {row?.levelreq}</p>
    </>
  }
}

export default NormalItemTooltip;