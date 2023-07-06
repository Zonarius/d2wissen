import { NormalItemInstance } from "../../lib/iteminstance/normalItemInstance";
import { useT } from "../../lib/translation/translation";
import VarProp from "./varProp";
import { useD2 } from "../../lib/hooks";
import { baseItems, findFileOf, getEntity } from "../../context/context-util";
import { D2Context } from "../../context/D2Context";
import { ArmorData, BaseItemData, WeaponData } from "../../lib/iteminstance/baseItemData";
import { D2Item, D2Weapon } from "../../lib/d2Parser";
import { If } from "../../lib/util";
import { typeIsOneOf } from "../../lib/itemTypeGraph";

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

  if (isArmorBaseItem(d2, item, baseItem)) {
    const row = getEntity(d2, "armor", item.itemType);
    return <>
      <p>Defense: <VarProp value={baseItem.defense} /></p>
      <p>Durability: {baseItem.durability} of {baseItem.durability}</p>
      <If cond={row?.reqstr && row.reqstr !== "0"}>
        <p>Required Strength: {row?.reqstr}</p>
      </If>
      <If cond={row?.levelreq && row.levelreq !== "0"}>
        <p>Required Level: {row?.levelreq}</p>
      </If>
    </>
  } else if (isWeaponBaseItem(d2, item, baseItem)) {
    const row = getEntity(d2, "weapons", item.itemType) as D2Weapon;
    return <>
      <If cond={row.minmisdam}>
        <p>Throw Damage: {row.minmisdam} to {row.maxmisdam}</p>
      </If>
      <If cond={row.mindam}>
        <p>One-Hand Damage: {row.mindam} to {row.maxdam}</p>
      </If>
      <If cond={row["2handmindam"]}>
        <p>Two-Hand Damage: {row["2handmindam"]} to {row["2handmaxdam"]}</p>
      </If>
      <If cond={row.maxstack}>
        <p>Quantity: {row.maxstack}</p>
      </If>
      <ClassRequirement item={row} />
      <WeaponClass item={row} />
      <If cond={row.reqdex && row.reqdex !== "0"}>
        <p>Required Dexterity: {row.reqdex}</p>
      </If>
      <If cond={row.reqstr && row.reqstr !== "0"}>
        <p>Required Strength: {row.reqstr}</p>
      </If>
      <If cond={row.levelreq && row.levelreq !== "0"}>
        <p>Required Level: {row.levelreq}</p>
      </If>
    </>
  }
}

// TODO Use t instead
const classNames: Record<string, string> = {
  amaz: "Amazon",
  barb: "Barbarian",
  necr: "Necromancer",
  pala: "Paladin",
  sorc: "Sorceress",
  assn: "Assassin",
  drui: "Druid"
}

function ClassRequirement({ item }: {item: D2Item}) {
  const d2 = useD2();
  const type = getEntity(d2, "itemtypes", item.type)
  const classType = typeIsOneOf(d2, type!, Object.keys(classNames))
  if (!classType) {
    return;
  }
  return <p>({classNames[classType.foundType]} Only)</p>
}

// TODO use t instead
const weaponClassNames: Record<string, string> = {
  bow: "Bow",
  xbow: "Crossbow",
  jave: "Javelin",

  spea: "Spear",
  pole: "Polearm",
  h2h: "Claw",

  knif: "Dagger",
  axe: "Axe",
  swo: "Sword",

  club: "Mace",
  mace: "Mace",
  hamm: "Mace",
  scep: "Mace",

  wand: "Staff",
  staf: "Staff",
  orb: "Staff",
}

function WeaponClass({ item }: { item: D2Weapon }) {
  const d2 = useD2();
  const type = getEntity(d2, "itemtypes", item.type)
  const classType = typeIsOneOf(d2, type!, Object.keys(weaponClassNames))
  if (!classType) {
    console.error("Could not find weapon class for item", item)
    return;
  }
  const classStr = weaponClassNames[classType.foundType];
  if (!classStr) {
    console.error("Could not find weapon class for item", item)
    return;
  }
  return <p>{weaponClassNames[classType.foundType]} Class - {attackSpeedStr(Number(item.speed || 0))} Attack Speed</p>
}

/**
 * Displayed speed is actually dependent on the class viewing the item
 */
function attackSpeedStr(speed: number) {
  if (speed <= -20) {
    return "Very Fast"
  } else if (speed <= -10) {
    return "Fast"
  } else if (speed <= 0) {
    return "Normal"
  } else if (speed <= 10) {
    return "Slow"
  } else {
    return "Very Slow"
  }
}

function isArmorBaseItem(d2: D2Context, item: NormalItemInstance, _baseItem: BaseItemData): _baseItem is ArmorData {
  return findFileOf(d2, baseItems, item.itemType) === "armor"
}

function isWeaponBaseItem(d2: D2Context, item: NormalItemInstance, _baseItem: BaseItemData): _baseItem is WeaponData {
  return findFileOf(d2, baseItems, item.itemType) === "weapons"
}

export default NormalItemTooltip;