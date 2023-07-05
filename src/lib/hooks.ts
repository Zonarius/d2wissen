import { useParams, useRouteLoaderData, useSearchParams } from "react-router-dom";
import { D2Context } from "../context/D2Context";
import { Item } from "../components/filterItem";
import { useItemMapper } from "./itemMapper";
import { D2UniqueItem } from "./d2Parser";
import { useEffect, useMemo, useState } from "react";
import { ExcelFileName } from "../context/referenceBuilder";

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

export function useEntity<F extends ExcelFileName>(file: F) {
  const [d2, id] = useEntityId();
  const entity = d2.refs2[file].rowById[id];
  return [d2, entity] as const;
}

// Workaround, see https://github.com/remix-run/react-router/discussions/9851
export function useUpdateQueryStringValueWithoutNavigation(
  queryKey: string,
  queryValue: string,
) {
  useEffect(() => {
    const currentSearchParams = new URLSearchParams(window.location.search)
    const oldQuery = currentSearchParams.get(queryKey) ?? ''
    if (queryValue === oldQuery) return

    if (queryValue) {
      currentSearchParams.set(queryKey, queryValue)
    } else {
      currentSearchParams.delete(queryKey)
    }
    const newUrl = [window.location.pathname, encodeURI(decodeURIComponent(currentSearchParams.toString()))]
      .filter(Boolean)
      .join('?')
    // alright, let's talk about this...
    // Normally with remix, you'd update the params via useSearchParams from react-router-dom
    // and updating the search params will trigger the search to update for you.
    // However, it also triggers a navigation to the new url, which will trigger
    // the loader to run which we do not want because all our data is already
    // on the client and we're just doing client-side filtering of data we
    // already have. So we manually call `window.history.pushState` to avoid
    // the router from triggering the loader.
    window.history.replaceState(null, '', newUrl)
  }, [queryKey, queryValue])
}

export type ParamMapper<S> = {
  paramToState: (param: string | null) => S;
  stateToParam: (state: S) => string;
}

export const stringArrayParamMapper: ParamMapper<string[]> = {
  paramToState: param => !param ? [] : param.split(","),
  stateToParam: state => state.join(",")
}

export function useUrlState(urlParam: string): [string | null, React.Dispatch<React.SetStateAction<string | null>>];
export function useUrlState<S>(urlParam: string, paramMapper: ParamMapper<S>): [S, React.Dispatch<React.SetStateAction<S>>];
export function useUrlState<S>(urlParam: string, paramMapper?: ParamMapper<S>) {
  const [urlSearch] = useSearchParams();
  const defaultValue = paramMapper
    ? paramMapper.paramToState(urlSearch.get(urlParam))
    : urlSearch.get(urlParam);

  const [state, setState] = useState(defaultValue);
  if (paramMapper) {
    useUpdateQueryStringValueWithoutNavigation(urlParam, paramMapper.stateToParam(state as S));
  } else {
    useUpdateQueryStringValueWithoutNavigation(urlParam, state as string);
  }

  return [state, setState] as const;
}