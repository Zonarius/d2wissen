import { D2Files } from "../lib/d2Parser"
import { entries, getOrCreateArr, getOrCreateObj } from "../lib/util";

type ColumnName<file extends ExcelFileName> = keyof Row<file>;
/** Id type of a file */
/** @ts-ignore */
type RowID<K extends ExcelFileName> = string | number;
type ExcelFileName = keyof D2Files["global"]["excel"];
type ReferenceColumns = {
  [file in ExcelFileName]?: {
    [column in ColumnName<file>]?: ExcelFileName;
  }
}

type Row<file extends ExcelFileName> = D2Files["global"]["excel"][file]["data"][number];

type IdColumns = {
  [file in ExcelFileName]: ColumnName<file>;
}

const idColumns: IdColumns = {
  armor: "code",
  charstats: "class",
  itemstatcost: "ID",
  itemtypes: "Code",
  magicprefix: "_index",
  magicsuffix: "_index",
  misc: "code",
  monstats: "Id",
  properties: "code",
  runes: "Name",
  setitems: "index",
  skilldesc: "skilldesc",
  skills: "Id",
  uniqueitems: "index",
  weapons: "code"
}

const referenceColumns: ReferenceColumns = {
  itemtypes: {
    "Equiv1": "itemtypes",
    "Equiv2": "itemtypes"
  }
}

type Reference<referencer extends ExcelFileName> = {
  column: ColumnName<referencer>;
  referencerId: RowID<referencer>;
}

export type D2Ref2 = {
  [file in ExcelFileName]: {
    rowById: {
      [id in RowID<file>]: Row<file>;
    }
    referencedBy: {
      [referencedId in RowID<file>]?: {
        [referencer in ExcelFileName]?: Reference<referencer>[]
      }
    }
  }
}

export function createReferences(files: D2Files): D2Ref2 {
  const result: Partial<D2Ref2> = {};

  for (const [file, idCol] of entries(idColumns)) {
    const rowById: D2Ref2[typeof file]["rowById"] = {};
    for (const row of files.global.excel[file].data) {
      const id: RowID<typeof file> = (row as any)[idCol];
      rowById[id] = row;

      const refCols = referenceColumns[file]
      if (!refCols) {
        continue;
      }

      for (const [column, referencedFileName] of entries(refCols)) {
        const referencedFile = getOrCreateObj(result, referencedFileName);
        const referencedBy = getOrCreateObj(referencedFile, "referencedBy");
        const referencedId = getOrCreateObj(referencedBy, row[column]);
        const references = getOrCreateArr(referencedId, file);
        const reference: Reference<typeof file> = {
          column: column,
          referencerId: id
        }
        references.push(reference);
      }
    }
    const fileObj = getOrCreateObj(result, file);
    fileObj.rowById = rowById
  }

  return result as D2Ref2;
}