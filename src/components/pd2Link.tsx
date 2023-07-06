import { useParams } from "react-router-dom";
import { Link } from "@mui/joy";
import { useD2 } from "../lib/hooks";
import { EntityReference, baseItems, findItemIn, getEntity } from "../context/context-util";
import { D2Runeword, D2UniqueItem, Indexed } from "../lib/d2Parser";
import { typeIsOneOf } from "../lib/itemTypeGraph";
import { useT } from "../lib/translation/translation";
import Launch from '@mui/icons-material/Launch';

export type PD2LinkProps = {
  entityRef: EntityReference;
  text?: string,
}

const baseUrl = "https://wiki.projectdiablo2.com/wiki";

const uniqueItemTypes: Record<string, string> = {
  amaz: "Class_Weapons",
  assn: "Class_Weapons",
  sorc: "Class_Weapons",
  
  axe: "Axes",
  mace: "Maces",
  hamm: "Maces",
  club: "Maces",
  swor: "Swords",
  knif: "Daggers",
  thro: "Throwing",
  spea: "Spears",
  pole: "Polearms",
  bow: "Bows",
  xbow: "Crossbows",
  staf: "Staves",
  wand: "Wands",
  scep: "Scepters",

  helm: "Helms",
  tors: "Chests",
  shie: "Shields",
  glov: "Gloves",
  boot: "Boots",
  belt: "Belts",
  amul: "Amulets",
  ring: "Rings",
  char: "Charms",
  jew: "Charms"
}

const runeWordItemTypes: Record<string, string> = {
  "helm": "RWHelms",
  "tors": "RWChests",
  "shie": "RWShields",
  "weap": "RWWeapons",
}

function PD2Link({ entityRef: ref, text }: PD2LinkProps) {
  const d2 = useD2();
  const t = useT();
  const { mod } = useParams();
  if (mod !== "projectd2" || !ref) {
    return null;
  }
  let page: string;
  let hash: string;
  if (ref.file === "uniqueitems") {
    const entity = getEntity(d2, ref) as Indexed<D2UniqueItem>;
    if (!entity.code) {
      return null;
    }
    const classTypes = ["amaz", "assn", "sorc"];
    const base = findItemIn(d2, baseItems, entity.code);
    const type = getEntity(d2, { file: "itemtypes", id: base.type });
    if (!type) {
      console.error(`Could not find item type with id ${base.code}`)
      return null;
    }
    const isClassItem = typeIsOneOf(d2, type, classTypes, []);
    if (isClassItem) {
      page = uniqueItemTypes[isClassItem.foundType];
    } else {
      const otherTypes = Object.keys(uniqueItemTypes)
        .filter(key => !classTypes.includes(key))
      const otherItem = typeIsOneOf(d2, type, otherTypes, []);
      if (!otherItem) {
        console.error(`Unknown item type`, type)
        return null;
      }
      page = uniqueItemTypes[otherItem.foundType];
    }
    hash = t(entity.index);
  } else if (ref.file === "runes") {
    const entity = getEntity(d2, ref) as Indexed<D2Runeword>;
    const type = getEntity(d2, { file: "itemtypes", id: entity.itype1 });
    if (!type) {
      console.error(`Could not find item type with id ${entity.itype1}`)
      return null;
    }
    const rwType = typeIsOneOf(d2, type, Object.keys(runeWordItemTypes), []);
    if (!rwType) {
      console.error(`Unknown item type`, type)
      return null;
    }
    page = runeWordItemTypes[rwType.foundType];
    hash = t(entity.Name);
  } else {
    // TODO Implement other items
    return null;
  }

  return (
    <Link
      href={`${baseUrl}/${page}#${hash.replace(/ /g, "_")}`}
      target="_blank"
      rel="noopener"
      endDecorator={<Launch />}
    >
      {typeof text === "undefined" ? "PD2 Wiki" : text}
    </Link>
  );
}

export default PD2Link;