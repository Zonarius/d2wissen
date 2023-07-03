import { Link, useParams } from "react-router-dom";
import { ExcelFileName, Reference, Row, idColumns } from "../context/referenceBuilder";
import { useD2 } from "../lib/hooks";
import { encodeId } from "../lib/util";

export type ReferenceListProps<F extends ExcelFileName, RF extends ExcelFileName> = {
  title: string;
  file: F;
  entity: Row<F>;
  refFile: RF;
  labelPicker?: (row: Row<RF>, ref: Reference<RF>) => React.ReactNode;
  refClass?: string;
}

function ReferenceList<F extends ExcelFileName, RF extends ExcelFileName>({ title, file, entity, refClass, refFile, labelPicker }: ReferenceListProps<F, RF>) {
  const d2 = useD2();
  const { mod } = useParams();
  const id = entity[idColumns[file]];
  const refs = d2.refs2[file].referencedBy[id]?.[refFile];
  if (!refs || refs.length === 0 || !mod) {
    return null;
  }
  return <>
    <dt>{title}</dt>
    {refs.map(ref => (
      <dd key={ref.referencerId}>
        <Link className={refClass} to={`/${mod}/${refFile}/${encodeId(ref.referencerId)}`}>
          {!labelPicker ? ref.referencerId : 
            labelPicker(d2.refs2[refFile].rowById[ref.referencerId], ref)
          }
        </Link>
      </dd>
    ))}
  </>
}

export default ReferenceList;