import { useParams, useRouteLoaderData } from "react-router-dom";
import { D2Context } from "../context/D2Context";
import { Item } from "../components/filterItem";
import { useItemMapper } from "./itemMapper";
import { D2UniqueItem } from "./d2Parser";
import { useEffect, useMemo, useState } from "react";

export function useD2() {
  return useRouteLoaderData("mod") as D2Context;
}

export function useItems(): Item[] {
  const d2 = useD2();
  const itemMapper = useItemMapper();

  return useMemo(() => {
    const rws = d2.data.global.excel.runes.data
      .filter(rw => rw.complete === "1")
      .map(itemMapper.fromRuneword)

    const unis = d2.data.global.excel.uniqueitems.data
      .filter(item => item.enabled === "1" && !isQuestItem(item))
      .map(itemMapper.fromUnique);

    const setItems = d2.data.global.excel.setitems.data
      .filter(item => item.set)
      .map(itemMapper.fromSetItem);

    return [
      ...rws,
      ...unis,
      ...setItems,
    ];
  }, [d2])
}

const questItemCodes = new Set(["vip", "msf", "hst", "hfh", "qf1", "qf2"])
function isQuestItem(item: D2UniqueItem) {
  return questItemCodes.has(item.code);
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export function useEntityId() {
  const d2 = useD2();
  const { id } = useParams();
  if (!id) {
    throw new Error(`Could not find entity with id ${id}`)
  }
  return [d2, id] as const;
}