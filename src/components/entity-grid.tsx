import ReactDataGrid from "@inovua/reactdatagrid-community"
import { ColumnName, ExcelFileName, idColumns, referenceColumns } from "../context/referenceBuilder"
import { useD2 } from "../lib/hooks";
import { TypeColumn } from "@inovua/reactdatagrid-community/types";
import { D2Context } from "../context/D2Context";
import { Mutable } from "../lib/util";
import { Link } from "react-router-dom";
import { IndexedRows } from "../lib/d2Parser";

export type EntityGridProps = {
  file: ExcelFileName
}

function EntityGrid({ file }: EntityGridProps) {
  const d2 = useD2();
  const data: IndexedRows<any> = d2.data.global.excel[file].data;
  const filteredData = data.filter(row => row[idColumns[file]]);
  const columns = createColumns(d2, file);

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

function createColumns<F extends ExcelFileName>(d2: D2Context, file: F): TypeColumn[] {
  const cols = d2.data.global.excel[file].columns;
  return cols.map(colName => {
    const typeColumn: Mutable<TypeColumn> = {
      name: colName
    };
    let refFile: ExcelFileName | undefined = undefined;
    const refCol = referenceColumns[file];
    if (colName === idColumns[file]) {
      refFile = file;
    } else if (colName in refCol) {
      refFile = refCol[colName as ColumnName<F>]!;
    }
    if (refFile) {
      typeColumn.render = ({value}) => {
        if (!value) {
          return value;
        }
        return (
          <Link to={`../${refFile}/${value}`}>{value}</Link>
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