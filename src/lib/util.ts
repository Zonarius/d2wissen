import { sprintf as spf } from "sprintf-js";
import { Item, Property, SortOrder, SortProp, Sorter } from "../components/filterItem";

export function range(end: number): number[];
export function range(start: number, end: number): number[];

export function range(start: number, end?: number): number[] {
    if (!end) {
        end = start;
        start = 0;
    }

    const res: number[] = [];
    for(; start < end; start++) {
        res.push(start);
    }

    return res;
}

export function getTableArray(tbl: any, prefix: string, maxCount = 6): string[] {
    return range(1, maxCount + 1).map(n => tbl[prefix + n])
        .filter(Boolean);
}

export interface StatRef {
    func: string;
    stat: string;
    set?: string;
    val?: string;
}

export function getTableModifiers(tbl: any, codePref: string, paramPref: string, minPref: string, maxPref: string, suffix: string = "", maxCount = 10): Property[] {
    return range(1, maxCount + 1)
        .map(n => ({
            code: tbl[codePref + n + suffix],
            param: tbl[paramPref + n + suffix],
            min: Number(tbl[minPref + n + suffix]),
            max: Number(tbl[maxPref + n + suffix])
        }))
        .filter(mod => mod.code);
}

export function getTableStats(tbl: any): StatRef[] {
    return range(1, 8)
        .map(n => ({
            func: tbl["func" + n],
            stat: tbl["stat" + n],
            set: tbl["set" + n],
            val: tbl["val" + n],
        }))
        .filter(mod => mod.stat);
}

export function sprintf(pattern: string, ...params: any[]): string {
    const modPattern = pattern.replace(/%\+d/g, "+%s")
        .replace(/%d/g, "%s")
        .replace("%2", "%3$s")
        .replace("%1", "%2$s")
        .replace("%0", "%1$s");
    
    params = params.map(param => {
        if (isRange(param)) {
            return showRange(param);
        } else {
            return param;
        }
    })

    try {
        return spf(modPattern, ...params);
    } catch (err) {
        console.log([pattern, modPattern]);
        return spf(modPattern, ...params);
    }
}

export type Range = [number, number]

export function showRange([min, max]: Range): string {
    return min === max ? "" + Math.abs(min) : `${Math.abs(min)}-${Math.abs(max)}`;
}

export function isRange(x: any): x is Range {
    return Array.isArray(x) && x.length === 2 && typeof x[0] === "number" && typeof x[1] === "number";
}

export function itemSort(items: Item[], sorter: Sorter): Item[] {
    return items.sort((a, b) => {
        const [aS, bS] = [sorter(a) as any, sorter(b) as any];
        if (!Array.isArray(aS)) {
            return cmp(aS, bS);
        }

        let cmpResult = 0;
        for (let i = 0; i < aS.length && cmpResult === 0; i++) {
            if (typeof aS[i] === "string") {
                const order: SortOrder = aS[i++];
                cmpResult = cmp(aS[i], bS[i], order);
            } else {
                cmpResult = cmp(aS[i], bS[i]);
            }
        }
        return cmpResult;
    })
}

function cmp(a: SortProp, b: SortProp, order: SortOrder = "asc"): number {
    const orderSign = order === "desc" ? -1 : 1;
    const [aDef, bDef] = [typeof a !== "undefined", typeof b !== "undefined"];
    let result;
    if (!aDef && !bDef) {
        result = 0;
    } else if (!aDef) {
        result = 1;
    } else if (!bDef) {
        result = -1;
    } else if (typeof a === "number" && typeof b === "number") {
        result = a - b;
    } else if (typeof a === "string" && typeof b === "string") {
        result = a.localeCompare(b);
    } else {
        console.warn("Cannot compare", a, b);
        result = 0;
    }
    return result * orderSign;
}