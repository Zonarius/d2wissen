import { createContext } from "react";
import { D2Charstat, D2Files, D2Misc, D2ItemStatCost, D2Monster, D2Property, D2Skill, D2Skilldesc, parseD2 } from "../lib/d2Parser";
import { AvailableLanguage, D2Translations, createTranslations } from "../lib/translation/translation";
import { getModFiles } from "./staticContext";

export interface D2Context {
    lang: AvailableLanguage;
    translations: D2Translations;
    data: D2Files;
    refs: D2ContextRefs;
}

export interface D2ContextRefs {
    itemsByCode: Record<string, D2Misc>;
    propertiesByCode: Record<string, D2Property>;
    itemStatCostsByStat: Record<string, D2ItemStatCost>;
    skillsBySkilldesc: Record<string, D2Skill>;
    skillsBySkillId: Record<string, D2Skill>;
    skillBySkill: Record<string, D2Skill>;
    charstatByClassname: Record<string, D2Charstat>;
    skilldescBySkilldesc: Record<string, D2Skilldesc>;
    monsterByIdx: Record<string, D2Monster>;
}

export const D2Context = createContext<D2Context>({ lang: "deDE" } as any);

export function createRefs(files: D2Files): D2ContextRefs {
    return {
        itemsByCode: createRef(files.global.excel.misc, "code"),
        propertiesByCode: createRef(files.global.excel.properties, "code"),
        itemStatCostsByStat: createRef(files.global.excel.itemstatcost, "Stat"),
        skillsBySkilldesc: createRef(files.global.excel.skills, "skilldesc"),
        skillsBySkillId: createRef(files.global.excel.skills, "*Id"),
        skillBySkill: createRef(files.global.excel.skills, "skill"),
        charstatByClassname: createRef(files.global.excel.charstats, "class"),
        skilldescBySkilldesc: createRef(files.global.excel.skilldesc, "skilldesc"),
        monsterByIdx: createRef(files.global.excel.monstats, "*hcIdx")
    }
}

function createRef<T>(file: T[], key: string): Record<string, T> {
    let output: Record<string, T> = {};
    for (const row of file) {
        output[(row as any)[key]] = row;
    }
    return output;
}

export async function modLoader(mod: string): Promise<D2Context> {
    const d2Files = await parseD2(await getModFiles(mod));
    return {
        lang: "deDE",
        translations: createTranslations(d2Files),
        refs: createRefs(d2Files),
        data: d2Files
    };
}
