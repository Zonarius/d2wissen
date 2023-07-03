import { Link, useParams } from "react-router-dom";
import { ExcelFileName, Reference, Row, idColumns } from "../context/referenceBuilder";
import { useD2 } from "../lib/hooks";
import { Predicate, encodeId } from "../lib/util";
import React from "react";

export type ReferenceListProps<F extends ExcelFileName, RF extends ExcelFileName> = {
  title: string;
  file: F;
  entity: Row<F>;
  refFile: RF;
  refFilter?: Predicate<Reference<RF>> | null;
  createColumn?: boolean;
  labelPicker?: (row: Row<RF>, ref: Reference<RF>) => React.ReactNode;
  refClass?: string;
}

function ReferenceList<F extends ExcelFileName, RF extends ExcelFileName>({ title, file, entity, refClass, createColumn, refFile, refFilter, labelPicker }: ReferenceListProps<F, RF>) {
  const d2 = useD2();
  const { mod } = useParams();
  const id = entity[idColumns[file]];
  let refs = d2.refs2[file].referencedBy[id]?.[refFile];
  if (!refs || refs.length === 0 || !mod) {
    return null;
  }
  if (refFilter) {
    refs = refs.filter(refFilter) as typeof refs;
  }
  const Wrapper = createColumn ? ({children}: any) => <div className="dl-col">{children}</div> : React.Fragment;
  return <Wrapper>
    <dt>{title}</dt>
    {refs.map(ref => (
      <dd key={`${ref.referencerId}-${String(ref.column)}`}>
        <Link className={refClass} to={`/${mod}/${refFile}/${encodeId(ref.referencerId)}`}>
          {!labelPicker ? ref.referencerId : 
            labelPicker(d2.refs2[refFile].rowById[ref.referencerId], ref)
          }
        </Link>
      </dd>
    ))}
  </Wrapper>
}

export default ReferenceList;