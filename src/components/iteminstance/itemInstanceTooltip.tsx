import { Tooltip } from "@mui/joy";
import { ItemInstance, ItemQuality, isExtendedItem } from "../../lib/iteminstance/itemInstance";
import { isNormalItem } from "../../lib/iteminstance/normalItemInstance";
import NormalItemTooltip from "./normalItemTooltip";

export type ItemInstanceTooltipProps = {
  item?: ItemInstance
}

const supportedTypes = new Set([ItemQuality.NORMAL])

function ItemInstanceTooltip(props: ItemInstanceTooltipProps & { children: React.ReactElement }) {
  // TODO Support more items
  if (!props.item || !isExtendedItem(props.item) || !supportedTypes.has(props.item.quality)) {
    return props.children;
  }
  return (
    <Tooltip
      enterDelay={0}
      variant="solid"
      title={<ItemInstanceTooltipContent {...props} />}
      placement="right-start"
      children={props.children}
      style={{
        backgroundColor: "#0000000"
      }}
      slotProps={{
        root: {
          className: "item-tooltip-root"
        } as any
      }}
    />
  )
}

export function ItemInstanceTooltipContent({ item }: ItemInstanceTooltipProps) {
  if (!item) {
    return null;
  }
  if (isNormalItem(item)) {
    return <NormalItemTooltip item={item} />
  }
}

export default ItemInstanceTooltip;