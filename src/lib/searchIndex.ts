import { useMemo } from "react";
import { useD2 } from "./hooks";
import { ExcelFileName, Row, idColumns } from "../context/referenceBuilder";
import { D2Context } from "../context/D2Context";
import { TFunc, useT } from "./translation/translation";
import MiniSearch, { SearchResult } from "minisearch";
import { entries, range } from "./util";
import { D2Runeword, Indexed } from "./d2Parser";

type SearchDocument = {
  _searchId: string;
  id: string;
  file: ExcelFileName;
  searchText: string;
  displayText: string;
}

type SearchColumns = {
  [F in ExcelFileName]?: (row: Indexed<Row<F>>, t: TFunc) => {
    searchText: string;
    displayText: string;
  };
}

const translateColumn = <F extends ExcelFileName>(file: F, col: keyof Row<F>) => ({
  [file]: (row: Indexed<Row<any>>, t: TFunc) => createText(t(row[col]))
})

function createText(txt: string) {
  return {
    searchText: txt,
    displayText: txt,
  }
}

const searchColumns: SearchColumns = {
  ...translateColumn("uniqueitems", "index"),
  ...translateColumn("setitems", "index"),
  ...translateColumn("magicprefix", "Name"),
  ...translateColumn("magicsuffix", "Name"),
  ...translateColumn("armor", "code"),
  ...translateColumn("weapons", "code"),
  ...translateColumn("misc", "code"),
  runes: runewordText
}

function runewordText(rw: D2Runeword, t: TFunc) {
  const runes = range(1, 7)
    .map(i => rw[`Rune${i as 1}`])
    .filter(Boolean)
    .map(rune => t(rune + "L"))
  const name = t(rw.Name);
  const displayText = `${name} '${runes.join("")}'`;
  return {
    displayText,
    searchText: [
      name,
      ...runes
    ].join(" ")
  }
}

export function useSearchIndex() {
  const d2 = useD2();
  const t = useT();
  return useMemo(() => new SearchIndex(d2, t), [d2]);
}


class SearchIndex {
  private index: MiniSearch<SearchDocument>;

  constructor(private d2: D2Context, private t: TFunc) {
    this.index = new MiniSearch({
      idField: "_searchId",
      fields: ["searchText"],
      storeFields: ["id", "file", "displayText"]
    });
    this.addItems()
  }

  private addItems(): void {
    for (const [file, textMapper] of entries(searchColumns)) {
      for (const row of this.d2.data.global.excel[file].data) {
        const id = (row as any)[idColumns[file]]
        this.index.add({
          _searchId: `${file}.${id}`,
          id,
          file,
          ...textMapper(row as any, this.t)
        })
      }
    }
  }

  public search(term: string): SearchResult[] {
    return this.index.search(term, { prefix: true });
  }
}