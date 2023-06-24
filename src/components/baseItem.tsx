import { BaseItem } from "./filterItem";
import Chevron from "@/assets/icons/chevron.svg";
import DoubleChevron from "@/assets/icons/double-chevron.svg";
import TripleChevron from "@/assets/icons/triple-chevron.svg";

export interface BaseItemProps {
  item?: BaseItem
}

export default function BaseItemComponent({ item }: BaseItemProps) {
  if (!item) {
    return null;
  }
  const Icon = [Chevron, DoubleChevron, TripleChevron][item.versionNum];
  return (
    <div className="base-item">
      {item.name}
      <img height="20px" src={Icon} />
    </div>
  )
}
