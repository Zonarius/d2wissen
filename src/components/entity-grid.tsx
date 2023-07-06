import { ColumnName, ExcelFileName, Row, idColumns, referenceColumns } from "../context/referenceBuilder"
import { useD2 } from "../lib/hooks";
import { D2Context } from "../context/D2Context";
import { Predicate, encodeId } from "../lib/util";
import { Link } from "react-router-dom";
import { Indexed } from "../lib/d2Parser";
import TableGrid, { ColumnDef } from "./tableGrid";

export type EntityGridProps<F extends ExcelFileName> = {
  file: F
  filter?: Predicate<Row<F>>;
  additionalIdColumns?: string[];
}

function EntityGrid<F extends ExcelFileName>({ file, filter, additionalIdColumns }: EntityGridProps<F>) {
  const d2 = useD2();
  const data: Indexed<any>[] = d2.data.global.excel[file].data;
  const filteredData = data.filter(row => row[idColumns[file]] && (!filter || filter(row)));
  const columns = createColumns(d2, file, additionalIdColumns);

  return (
      <TableGrid
        data={filteredData}
        columns={columns}
        idCol={idColumns[file]}
      />
  )
}

function createColumns<F extends ExcelFileName>(d2: D2Context, file: F, additionalIdColumns?: string[]): ColumnDef[] {
  const cols = d2.data.global.excel[file].columns;
  return cols.map(colName => {
    const typeColumn: ColumnDef = {
      headerName: colName,
      field: colName
    };
    let refFile: ExcelFileName | ExcelFileName[] | undefined = undefined;
    let useThisId = false;
    const refCol = referenceColumns[file];
    if (colName === idColumns[file]) {
      refFile = file;
    } else if (colName in refCol) {
      refFile = refCol[colName as ColumnName<F>]!;
    } else if (additionalIdColumns && additionalIdColumns.includes(colName)) {
      refFile = file;
      useThisId = true;
    }
    if (refFile) {
      typeColumn.cellRenderer = ({ data, value }: any) => {
        if (!value) {
          return value;
        }
        const actualRefFile = findRefFile(d2, refFile, value);
        const id = useThisId ? data[idColumns[file]] : value;
        return (
          <Link to={`../${actualRefFile}/${encodeId(id)}`}>{value}</Link>
        )
      }
    }
    if (colName.startsWith("*")) {
      typeColumn.cellClass = "comment-column";
    }
    return typeColumn;
  });
}

function findRefFile(d2: D2Context, file: ExcelFileName | ExcelFileName[] | undefined, id: string) {
  if (!Array.isArray(file)) {
    return file;
  }
  return file.find(f => d2.refs2[f].rowById[id]);
}

export default EntityGrid