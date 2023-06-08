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
    return range(1, maxCount).map(n => tbl[prefix + n])
        .filter(Boolean);
}