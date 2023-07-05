import { Link, useParams } from "react-router-dom";
import { hrBoolean } from "../lib/util";
import { isEntityReference } from "../context/context-util";
import { useDisplayNameT } from "../lib/hooks";

export type SimpleTablePropProps = {
  title: string;
  prop?: any;
  link?: string;
}

function SimpleTableProp({ title, prop, link }: SimpleTablePropProps) {
  const displayNameT = useDisplayNameT();
  const { mod } = useParams();

  if (typeof prop === "undefined") {
    return null;
  }

  if (isEntityReference(prop) && !prop.id) {
    return null;
  }

  if (typeof prop === "boolean") {
    prop = hrBoolean(prop);
  }

  if (isEntityReference(prop) && !link) {
    console.log(prop);
    link = `/${mod}/${prop.file}/${prop.id}`
    prop = displayNameT(prop);
  }

  return (
    <>
      <dt>{title}</dt>
      <dd>{link
        ? <Link to={link}>{prop}</Link>
        : prop
      }
      </dd>
    </>
  )
}

export default SimpleTableProp