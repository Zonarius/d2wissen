import JSON5 from 'json5';

export interface D2Files {
    global: any;
    hd: any;
    local: any;
};

export interface Runeword {
    Name: string;
    complete: string;

    itype1: string;
    itype2: string;
    itype3: string;
    itype4: string;
    itype5: string;
    itype6: string;

    Rune1: string;
    Rune2: string;
    Rune3: string;
    Rune4: string;
    Rune5: string;
    Rune6: string;

    
}

export interface FileLike {
    webkitRelativePath: string;
    text(): Promise<string>;
}

export async function parseD2(files: FileLike[]): Promise<D2Files> {
    let d2: any = {};

    for (const file of files) {
        const rp = file.webkitRelativePath
        const path = rp.substring(rp.indexOf("/") + 1).split("/");
        await mkFile(d2, file, path);
    }

    return d2;
}

async function mkFile(folder: any, file: FileLike, [fileName, ...rest]: string[]) {
    const mkOrGet = (name: string) => {
        if (!folder[name]) {
            folder[name] = {}
        }
        return folder[name]
    }

    if (rest.length >= 2) {
        await mkFile(mkOrGet(fileName), file, rest);
    } else if (fileName === "excel") {
        mkOrGet(fileName)[stripExt(rest[0])] = await parseExcel(file)
    } else if (rest[0].endsWith(".json")){
        mkOrGet(fileName)[stripExt(rest[0])] = await parseJson(file)
    }
}

function stripExt(fileName: string) {
    return fileName.substring(0, fileName.lastIndexOf("."));
}

async function parseJson(file: FileLike) {
    const text = await file.text();
    return JSON5.parse(text);
}

async function parseExcel(file: FileLike) {
    const text = await file.text();
    const [headerLine, ...entries] = text.split("\n").filter(line => line.length > 0);
    const header = headerLine.split("\t");

    return entries.map(entry => {
        const cells = entry.split("\t");
        let entryObj: any = {};
        for (let i = 0; i < cells.length; i++) {
            if (cells[i] !== "") {
                entryObj[header[i]] = cells[i];
            }
        }
        return entryObj;
    })
}