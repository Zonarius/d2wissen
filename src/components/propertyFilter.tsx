import { Autocomplete } from "@mui/joy";
import { useD2 } from "../lib/hooks";
import { getClassBySkillTabId, getSkillTabDescStrById } from "../lib/translation/modifier";
import { useT } from "../lib/translation/translation";
import { Predicate, range } from "../lib/util";
import { PropertyRef } from "./filterItem";
import { useMemo, useState } from "react";
import { D2Property } from "../lib/d2Parser";

export type PropertyFilterProps = {
  property: D2Property;
  onChange(prec: Predicate<PropertyRef> | null): any;
}

function PropertyFilter({ property, onChange }: PropertyFilterProps) {
  const [val, setVal] = useState<FilterEntry | null>(null);
  const filter = useFilterByFunc(property.func1);
  if (!filter) {
    return null;
  }
  return (
    <Autocomplete
      blurOnSelect
      options={filter.values}
      placeholder={filter.placeholder}
      getOptionLabel={option => option.name}
      groupBy={!filter.grouped ? undefined :
        option => option.group!
      }
      value={val}
      isOptionEqualToValue={(opt, val) => opt.value === val.value}
      onChange={(_ev, entry) => {
        setVal(entry);
        onChange(!entry ? null : ref => {
          return ref.param === entry.value
        })
      }}
    />
  )
}

type FilterEntry = {
  value: string;
  name: string;
  group?: string;
}

type FilterEntries = {
  values: FilterEntry[]
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
          values: range(21).map(i => ({
            value: String(i),
            name: t(getSkillTabDescStrById(d2, i)).replace("%d", "x"),
            group: getClassBySkillTabId(i)
          }))
        }
        break;
    }
  }, [func])
}

export default PropertyFilter;