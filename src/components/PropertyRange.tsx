export type PropertyRangeProps = {
  min?: number;
  max?: number;
}

function PropertyRange({min, max}: PropertyRangeProps) {
  if (!min) {
    return null;
  }
  const text = min === max ? String(min) : `${min}-${max}`;
  return (
    <span className="range">[{text}]</span>
  )
}

export default PropertyRange;