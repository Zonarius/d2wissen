import { useState } from "react";
import EntityGrid from "../../components/entity-grid";
import { ExcelFileName, Row } from "../../context/referenceBuilder";
import { Predicate } from "../../lib/util";

export type TableFileProps<F extends ExcelFileName> = {
  title: string;
  file: F,
  filter?: Predicate<Row<F>>;
  additionalIdColumns?: string[];
}

function TableFile<F extends ExcelFileName>({ title, file, filter, additionalIdColumns }: TableFileProps<F>) {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="d2-table-page">
      <h1>{title}</h1>
      <div>Show all: <input type="checkbox" checked={showAll} onChange={ev => setShowAll(ev.target.checked)} /></div>
      <EntityGrid
        file={file}
        filter={showAll ? undefined : filter}
        additionalIdColumns={additionalIdColumns}
      />
    </div>
  )
}

export default TableFile;