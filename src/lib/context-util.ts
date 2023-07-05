import { D2Context } from "../context/D2Context";
import { ExcelFileName, Row } from "../context/referenceBuilder";

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