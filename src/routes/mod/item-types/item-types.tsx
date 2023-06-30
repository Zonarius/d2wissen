import ReactDataGrid from "@inovua/reactdatagrid-community";
import { useD2 } from "../../../lib/hooks";
import { TypeColumn } from "@inovua/reactdatagrid-community/types";
import { Link } from "react-router-dom";
import { useState } from "react";

function ItemTypes() {
  const d2 = useD2();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [gridRef, setGridRef] = useState<any>();

  function selectRow(id: string) {
    setActiveIndex(gridRef.current.getItemIndexBy((r: any) => r.Code === id));
  }

  const tbl = d2.data.global.excel.itemtypes;
  const columns: TypeColumn[] = tbl.columns.map(name => {
    const common: TypeColumn = {
      name
    };
    if (name === "Code") {
      return {
        ...common,
        render: ({value}) => <Link to={value}>{value}</Link>
      };
    } else if (name.startsWith("Equiv")) {
      return {
        ...common,
        cellSelectable: false,
        render: ({value}) => {
          if (!value) {
            return value;
          }
          return (
            <Link to={`#${value}`} onClick={() => selectRow(value)}>{value}</Link>
          )
        }
      };
    } else if (name.startsWith("*")) {
      return {
        ...common,
        className: "comment-column"
      }
    }
    return common;
  });
  const data = tbl.data.filter(r => r.Code);
  return (
    <div className="d2-table-page">
      <h1>Item Types</h1>
      <div className="d2-table">
        <ReactDataGrid
          columns={columns}
          dataSource={data}
          theme="default-dark"
          idProperty="Code"
          enableColumnAutosize={true}
          style={{
            height: "100%"
          }}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          onReady={setGridRef}
        />
      </div>
    </div>
  )
}

export default ItemTypes;