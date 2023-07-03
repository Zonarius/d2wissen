import { MinMaxStat, PropertyRef, Stats } from "../components/filterItem";


const defaultMinMax: MinMaxStat = {
  min: 0,
  max: 0,
}

function defaultStats(): Stats {
  return {
    ias: defaultMinMax,
    edam: defaultMinMax
  };
}

function minMaxFallBackParam(prop?: PropertyRef): MinMaxStat {
  if (!prop) {
    return defaultMinMax;
  }
  if (allNumbers(prop.min, prop.max)) {
    return { min: prop.min!, max: prop.max! };
  } else if (allNumbers(prop.param)) {
    return { min: Number(prop.param), max: Number(prop.param) };
  } else {
    return defaultMinMax;
  }
}

const propFunction = {
  "swing1": ["ias", minMaxFallBackParam],
  "swing2": ["ias", minMaxFallBackParam],
  "swing3": ["ias", minMaxFallBackParam],
  "dmg%": ["edam", minMaxFallBackParam]
} as any;

export function statsFromProps(props: PropertyRef[]): Stats {
  const ret = defaultStats() as any;
  for (const prop of props) {
    const propDesc = propFunction[prop.code];
    if (propDesc) {
      const [statCode, func] = propDesc;
      ret[statCode] = func(prop);
    }
  }
  return ret;
}

function allNumbers(x: any): x is number;
function allNumbers(...xs: any[]): boolean;
function allNumbers(...xs: any[]): boolean {
  return xs.every(x => !isNaN(Number(x)));
}