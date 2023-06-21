import { sprintf as spf } from "sprintf-js";

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

export interface Modifier {
    code: string;
    param?: string;
    min?: number;
    max?: number;
}

export interface StatRef {
    func: string;
    stat: string;
    set?: string;
    val?: string;
}

export function getTableModifiers(tbl: any, codePref: string, paramPref: string, minPref: string, maxPref: string, maxCount = 7): Modifier[] {
    return range(1, maxCount + 1)
        .map(n => ({
            code: tbl[codePref + n],
            param: tbl[paramPref + n],
            min: Number(tbl[minPref + n]),
            max: Number(tbl[maxPref + n])
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