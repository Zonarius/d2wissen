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