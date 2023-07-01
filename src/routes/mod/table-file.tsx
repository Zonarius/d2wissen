import EntityGrid from "../../components/entity-grid";
import { ExcelFileName } from "../../context/referenceBuilder";

export type TableFileProps = {
  headline: string;
  file: ExcelFileName
}

function TableFile({ headline, file }: TableFileProps) {
  return (
    <div className="d2-table-page">
      <h1>{headline}</h1>
      <EntityGrid
        file={file}
      />
    </div>
  )
}

export default TableFile;