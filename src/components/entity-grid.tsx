import ReactDataGrid from "@inovua/reactdatagrid-community"
import { ColumnName, ExcelFileName, Row, idColumns, referenceColumns } from "../context/referenceBuilder"
import { useD2 } from "../lib/hooks";
import { TypeColumn } from "@inovua/reactdatagrid-community/types";
import { D2Context } from "../context/D2Context";
import { Mutable, Predicate } from "../lib/util";
import { Link } from "react-router-dom";
import { IndexedRows } from "../lib/d2Parser";

export type EntityGridProps<F extends ExcelFileName> = {
  file: F
  filter?: Predicate<Row<F>>;
  additionalIdColumns?: string[];
}

function EntityGrid<F extends ExcelFileName>({ file, filter, additionalIdColumns }: EntityGridProps<F>) {
  const d2 = useD2();
  const data: IndexedRows<any> = d2.data.global.excel[file].data;
  const filteredData = data.filter(row => row[idColumns[file]] && (!filter || filter(row)));
  const columns = createColumns(d2, file, additionalIdColumns);

  return (
    <div className="d2-table">
      <ReactDataGrid
        columns={columns}
        dataSource={filteredData}
        theme="default-dark"
        idProperty="Code"
        enableColumnAutosize={true}
        style={{
          height: "100%"
        }}
      />
    </div>
  )
}

function createColumns<F extends ExcelFileName>(d2: D2Context, file: F, additionalIdColumns?: string[]): TypeColumn[] {
  const cols = d2.data.global.excel[file].columns;
  console.log(additionalIdColumns)
  return cols.map(colName => {
    const typeColumn: Mutable<TypeColumn> = {
      name: colName as string
    };
    let refFile: ExcelFileName | undefined = undefined;
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
      typeColumn.render = ({ data, value }) => {
        if (!value) {
          return value;
        }
        const id = useThisId ? data[idColumns[file]] : value;
        return (
          <Link to={`../${refFile}/${id}`}>{value}</Link>
        )
      }
    }
    if (colName.startsWith("*")) {
      typeColumn.className = "comment-column";
    }
    return typeColumn;
  });
}


export default EntityGrid