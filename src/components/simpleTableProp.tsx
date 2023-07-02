import { Link } from "react-router-dom";
import { hrBoolean } from "../lib/util";

export type SimpleTablePropProps = {
  title: string;
  prop?: any;
  link?: string;
}

function SimpleTableProp({ title, prop, link }: SimpleTablePropProps) {
  if (typeof prop === "undefined") {
    return null;
  }

  if (typeof prop === "boolean") {
    prop = hrBoolean(prop);
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