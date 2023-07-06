import { Indexed } from "../lib/d2Parser";
import { TFunc } from "../lib/translation/translation";
import { D2Context } from "./D2Context";
import { ExcelFileName, Row } from "./referenceBuilder";

export type BaseItemType = typeof baseItems[number];
export const baseItems = ["armor", "weapons", "misc"] as const;

export function findItemIn<F extends ExcelFileName>(d2: D2Context, files: readonly F[], id: string): Row<F> {
  return findFileAndItemIn(d2, files, id)[1];
}

export function findFileOf<F extends ExcelFileName>(d2: D2Context, files: readonly F[], id: string): F {
  return findFileAndItemIn(d2, files, id)[0];
}

export function findFileAndItemIn<F extends ExcelFileName>(d2: D2Context, files: readonly F[], id: string): [F, Row<F>] {
  for (const file of files) {
    const row = d2.refs2[file].rowById[id];
    if (row) {
      return [file, row];
    }
  }
  throw Error(`Could not find item with id ${id}`)
}

type DisplayNames = {
  [F in ExcelFileName]?: (row: Indexed<Row<F>>, t: TFunc) => string;
}

const translateColumn = <F extends ExcelFileName>(file: F, col: keyof Row<F>) => ({
  [file]: (row: Indexed<Row<any>>, t: TFunc) => t(row[col])
})

const displayNames: DisplayNames = {
  ...translateColumn("uniqueitems", "index"),
  ...translateColumn("setitems", "index"),
  ...translateColumn("magicprefix", "Name"),
  ...translateColumn("magicsuffix", "Name"),
  ...translateColumn("armor", "code"),
  ...translateColumn("weapons", "code"),
  ...translateColumn("misc", "code"),
  ...translateColumn("itemtypes", "ItemType"),
}

export function getEntity<F extends ExcelFileName>(d2: D2Context, file: F, id: string): Indexed<Row<F>> | undefined;
export function getEntity<F extends ExcelFileName>(d2: D2Context, {file, id}: {file: F, id: string}): Indexed<Row<F>> | undefined;
export function getEntity<F extends ExcelFileName>(d2: D2Context, refOrFile: F | EntityReference, id?: string): Indexed<Row<F>> | undefined {
  let file: F;
  if (typeof refOrFile === "object") {
    file = refOrFile.file as F;
    id = refOrFile.id;
  } else {
    file = refOrFile;
  }
  return d2.refs2[file].rowById[id as string];
}

export function displayName(d2: D2Context, t: TFunc, ref: EntityReference): string {
  const entity = getEntity(d2, ref);
  if (!entity) {
    throw new Error(`Could not find entity with id "${ref.id}" in "${ref.file}"`)
  }
  return displayNames[ref.file]?.(entity as any, t) || "!t-err-displayName-NYI!";
}

export type EntityReference = {
  file: ExcelFileName;
  id: string;
}

export function isEntityReference(x: any): x is EntityReference {
  return typeof x === "object" && x.file && x.id;
}

export function entityReference(file: ExcelFileName, id: string): EntityReference {
  return { file, id };
}