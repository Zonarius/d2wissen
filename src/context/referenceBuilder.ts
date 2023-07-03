import { D2Files } from "../lib/d2Parser"
import { entries, getOrCreateArr, getOrCreateObj } from "../lib/util";

export type ColumnName<file extends ExcelFileName> = keyof Row<file>;

/** Id type of a file */
/** @ts-ignore */
export type RowID<K extends ExcelFileName> = string | number;
export type ExcelFileName = keyof D2Files["global"]["excel"];
type ReferenceColumns = {
  [file in ExcelFileName]: {
    [column in ColumnName<file>]?: ExcelFileName | ExcelFileName[];
  }
}

export type Row<file extends ExcelFileName> = D2Files["global"]["excel"][file]["data"][number];

type IdColumns = {
  [file in ExcelFileName]: ColumnName<file>;
}

export const idColumns: IdColumns = {
  armor: "code",
  charstats: "class",
  itemstatcost: "Stat",
  itemtypes: "Code",
  magicprefix: "_index",
  magicsuffix: "_index",
  misc: "code",
  monstats: "Id",
  properties: "code",
  runes: "_index",
  setitems: "index",
  skilldesc: "skilldesc",
  skills: "Id",
  weapons: "code",
  uniqueitems: "_index",
} as const;

const affixRefCols: ReferenceColumns["magicprefix"] = {
  mod1code: "properties",
  mod2code: "properties",
  mod3code: "properties",

  itype1: "itemtypes",
	itype2: "itemtypes",
	itype3: "itemtypes",
	itype4: "itemtypes",
	itype5: "itemtypes",
	itype6: "itemtypes",
	itype7: "itemtypes",
	etype1: "itemtypes",
	etype2: "itemtypes",
	etype3: "itemtypes",
	etype4: "itemtypes",
	etype5: "itemtypes",
}

export const referenceColumns: ReferenceColumns = {
  armor: {
    "type": "itemtypes",
    "type2": "itemtypes"
  },
  charstats: {},
  itemstatcost: {},
  itemtypes: {
    "Equiv1": "itemtypes",
    "Equiv2": "itemtypes",
    "Quiver": "itemtypes"
  },
  magicprefix: affixRefCols,
  magicsuffix: affixRefCols,
  misc: {
    "type": "itemtypes",
    "type2": "itemtypes"
  },
  monstats: {},
  properties: {
    "stat1": "itemstatcost",
    "stat2": "itemstatcost",
    "stat3": "itemstatcost",
    "stat4": "itemstatcost",
    "stat5": "itemstatcost",
    "stat6": "itemstatcost",
    "stat7": "itemstatcost",
  },
  runes: {
    itype1: "itemtypes",
    itype2: "itemtypes",
    itype3: "itemtypes",
    itype4: "itemtypes",
    itype5: "itemtypes",
    itype6: "itemtypes",

    etype1: "itemtypes",
    etype2: "itemtypes",
    etype3: "itemtypes",

    T1Code1: "properties",
    T1Code2: "properties",
    T1Code3: "properties",
    T1Code4: "properties",
    T1Code5: "properties",
    T1Code6: "properties",
    T1Code7: "properties",
  },
  setitems: {
    item: ["armor", "weapons", "misc"],
    prop1: "properties",
    prop2: "properties",
    prop3: "properties",
    prop4: "properties",
    prop5: "properties",
    prop6: "properties",
    prop7: "properties",
    prop8: "properties",
    prop9: "properties",
    
    aprop1a: "properties",
    aprop1b: "properties",

    aprop2a: "properties",
    aprop2b: "properties",

    aprop3a: "properties",
    aprop3b: "properties",

    aprop4a: "properties",
    aprop4b: "properties",

    aprop5a: "properties",
    aprop5b: "properties",
  },
  skilldesc: {},
  skills: {},
  weapons: {
    "type": "itemtypes",
    "type2": "itemtypes"
  },
  uniqueitems: {
    code: ["armor", "weapons", "misc"],
    prop1: "properties",
    prop2: "properties",
    prop3: "properties",
    prop4: "properties",
    prop5: "properties",
    prop6: "properties",
    prop7: "properties",
    prop8: "properties",
    prop9: "properties",
    prop10: "properties",
    prop11: "properties",
    prop12: "properties",
  },
}

export type Reference<referencer extends ExcelFileName> = {
  referencerFile: referencer
  referencerId: RowID<referencer>;
  column: ColumnName<referencer>;
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
      if (!id) {
        continue;
      }
      rowById[id] = row;

      const refCols = referenceColumns[file]
      if (!refCols) {
        continue;
      }

      for (let [column, referencedFileNames] of entries(refCols)) {
        const refId = row[column]
        if (!refId) {
          continue;
        }
        if (!Array.isArray(referencedFileNames)) {
          referencedFileNames = [referencedFileNames];
        }
        for (const referencedFileName of referencedFileNames) {
          if (referencedFileNames.length > 1 && !result[referencedFileName]?.rowById[refId]) {
            continue;
          }
          const referencedFile = getOrCreateObj(result, referencedFileName);
          const referencedBy = getOrCreateObj(referencedFile, "referencedBy");
          const referencedId = getOrCreateObj(referencedBy, refId);
          const references = getOrCreateArr(referencedId, file);
          const reference: Reference<typeof file> = {
            referencerFile: file,
            referencerId: id,
            column: column,
          }
          references.push(reference as any);
        }
      }
    }
    const fileObj = getOrCreateObj(result, file);
    fileObj.rowById = rowById
  }

  return result as D2Ref2;
}