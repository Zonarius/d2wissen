export type SimpleTablePropProps = {
  title: string;
  prop?: any;
}

function SimpleTableProp({ title, prop }: SimpleTablePropProps) {
  if (typeof prop === "undefined") {
    return null;
  }

  return (
    <>
      <dt>{title}</dt>
      <dd>{prop}</dd>
    </>
  )
}

export default SimpleTableProp