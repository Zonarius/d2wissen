import { Autocomplete } from "@mui/joy";
import { useD2, useUrlState } from "../lib/hooks";
import { getClassBySkillTabId, getSkillTabDescStrById } from "../lib/translation/modifier";
import { useT } from "../lib/translation/translation";
import { Predicate, range, toObject } from "../lib/util";
import { PropertyRef } from "./filterItem";
import { useEffect, useMemo } from "react";
import { D2Property } from "../lib/d2Parser";

export type PropertyFilterProps = {
  property: D2Property;
  onChange(prec: Predicate<PropertyRef> | null): any;
}

function PropertyFilter({ property, onChange }: PropertyFilterProps) {
  const filter = useFilterByFunc(property.func1);
  const [val, setVal] = useUrlState<FilterEntry | null>("param", {
    stateToParam: state => state?.value,
    paramToState: param => (param && filter) ? filter.values[param] || null : null
  });
  if (!filter) {
    return null;
  }
  useEffect(() => {
    onChange(!val ? null : ref => {
      return ref.param === val.value
    })
  }, [val])
  return (
    <Autocomplete
      blurOnSelect
      options={Object.values(filter.values)}
      placeholder={filter.placeholder}
      getOptionLabel={option => option.name}
      groupBy={!filter.grouped ? undefined :
        option => option.group!
      }
      value={val}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      onChange={(_ev, entry) => setVal(entry)}
    />
  )
}

type FilterEntry = {
  value: string;
  name: string;
  group?: string;
}

type FilterEntries = {
  values: Record<string, FilterEntry>
  placeholder: string;
  grouped: boolean;
}

function useFilterByFunc(func: string): FilterEntries | undefined {
  const d2 = useD2();
  const t = useT();
  return useMemo(() => {
    switch (func) {
      case "10": // Skilltab
        return {
          placeholder: "Filter by Skilltab",
          grouped: true,
          values: toObject(range(21).map(i => ({
            value: String(i),
            name: t(getSkillTabDescStrById(d2, i)).replace("%d", "x"),
            group: getClassBySkillTabId(i)
          })), x => x.value)
        }
        break;
    }
  }, [func])
}

export default PropertyFilter;