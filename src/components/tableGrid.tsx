import { Sheet, Table } from "@mui/joy";

export type ColumnDef<T = any> = {
  headerName: string;
  field: keyof T;
  cellClass?: string;
  cellRenderer?: (props: { data: T, value: T[keyof T]}) => React.ReactNode
}

export type TableGridProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  idCol: keyof T;
}

function TableGrid<T extends object>({ data, columns, idCol }: TableGridProps<T>) {
  return (
    <Sheet>
      <Table hoverRow borderAxis="bothBetween" stickyHeader stripe="odd" style={{tableLayout: "auto"}}>
        <TableHead cols={columns}/>
        <TableBody {...{ data, columns, idCol }} />
      </Table>
    </Sheet>
  );
}

function TableHead({cols}: { cols: ColumnDef<any>[] }) {
  return (
    <thead>
      <tr>
        {cols.map((col, i) => (
          <th className={col.cellClass} key={col.headerName + i}>{col.headerName}</th>
        ))}
      </tr>
    </thead>
  )
}

function TableBody<T>({ data, columns, idCol }: TableGridProps<T>) {
  return (
    <tbody>
      {data.map(row => (
        <TableRow key={row[idCol] as any} {...{ row, columns }} />
      ))}
    </tbody>
  )
}

type TableRowProps<T> = {
  row: T;
  columns: ColumnDef<T>[];
}


function TableRow<T>({ row, columns }: TableRowProps<T>) {
  return (
    <tr>
      {columns.map((col, i) => (
        <td key={col.headerName + i}>
          {!col.cellRenderer ? row[col.field] as any :
            <col.cellRenderer data={row} value={row[col.field]} />
          }
        </td>
      ))}
    </tr>
  )
}

export default TableGrid;