export type PropertyRangeProps = {
  code?: string;
  min?: number;
  max?: number;
}

const exceptions = new Set([
  "nofreeze"
])

function PropertyRange({code, min, max}: PropertyRangeProps) {
  if (!min || (code && exceptions.has(code))) {
    return null;
  }
  const text = min === max ? String(min) : `${min}-${max}`;
  return (
    <span className="range">[{text}]</span>
  )
}

export default PropertyRange;