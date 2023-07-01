import EntityGrid from "../../components/entity-grid";
import { ExcelFileName } from "../../context/referenceBuilder";

export type TableFileProps = {
  title: string;
  file: ExcelFileName,
  additionalIdColumns?: string[];
}

function TableFile({ title, file, additionalIdColumns }: TableFileProps) {
  return (
    <div className="d2-table-page">
      <h1>{title}</h1>
      <EntityGrid
        file={file}
        additionalIdColumns={additionalIdColumns}
      />
    </div>
  )
}

export default TableFile;