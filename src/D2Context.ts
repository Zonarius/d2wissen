import { createContext } from "react";
import { D2Files } from "./lib/d2Parser";
import { AvailableLanguage, D2Translations } from "./lib/translation";

export interface D2Context {
    lang: AvailableLanguage;
    translations: D2Translations;
    itemsByCode: ItemsByCode; 
    data: D2Files["data"];
}

export interface ItemsByCode {
    [code: string]: D2Item;
}

export interface D2Item {
    name: string;
    levelreq: string;
}


export const D2Context = createContext<D2Context>({ lang: "deDE" } as any);

export function createItemsByCode(files: D2Files): ItemsByCode {
    let output: ItemsByCode = {};
    ["misc"].forEach(file => {
        for (const item of files.data.global.excel[file]) {
            output[item.code] = item;
        }
    })

    return output;
}
