import { createContext } from "react";
import { D2Files } from "../lib/d2Parser";
import { AvailableLanguage, D2Translations } from "../lib/translation/translation";

export interface D2Context {
    lang: AvailableLanguage;
    translations: D2Translations;
    itemsByCode: Record<string, D2Item>;
    propertiesByCode: Record<string, D2Property>;
    itemStatCostsByStat: Record<string, ItemStatCost>;
    skillsBySkilldesc: Record<string, D2Skill>;
    skillsBySkillId: Record<string, D2Skill>;
    skillBySkill: Record<string, D2Skill>;
    charstatByClassname: Record<string, D2Charstat>;
    skilldescBySkilldesc: Record<string, D2Skilldesc>
    data: D2Files;
}

export interface D2Item {
    name: string;
    levelreq: string;
}

export interface D2Property {
    code: string;
    func1: string;
    stat1: string;
    set1: string;
    val1: string;

    func2: string;
    stat2: string;
    set2: string;
    val2: string;

    func3: string;
    stat3: string;
    set3: string;
    val3: string;

    func4: string;
    stat4: string;
    set4: string;
    val4: string;

    func5: string;
    stat5: string;
    set5: string;
    val5: string;

    func6: string;
    stat6: string;
    set6: string;
    val6: string;

    func7: string;
    stat7: string;
    set7: string;
    val7: string;
}

export interface ItemStatCost {
    Stat: string;
    "*ID": string;
    descpriority: string;
    descfunc: string;
    descstrpos: string;
    descstrneg: string;
    descstr2: string;
}

export interface D2Skill {
    skill: string;
    "*Id": string;
    skilldesc: string;
    charclass: string;
}

export interface D2Charstat {
    class: string;
    StrAllSkills: string;
    StrSkillTab1: string;
    StrSkillTab2: string;
    StrSkillTab3: string;
}

export interface D2Skilldesc {
    skilldesc: string;
    "str name": string;
    desctexta1: string;
    desctextb1: string;
    desctexta2: string;
    desctextb2: string;
    "item proc text": string;
}

export const D2Context = createContext<D2Context>({ lang: "deDE" } as any);

export function createItemsByCode(files: D2Files): Record<string, D2Item> {
    let output: Record<string, D2Item> = {};
    ["misc"].forEach(file => {
        for (const item of files.global.excel[file]) {
            output[item.code] = item;
        }
    })

    return output;
}

export function createPropertiesByCode(files: D2Files): Record<string, D2Property> {
    let output: Record<string, D2Property> = {};
    for (const prop of files.global.excel.properties) {
        output[prop.code] = prop;
    }
    return output;
}

export function createItemStatCostsByStat(files: D2Files): Record<string, ItemStatCost> {
    let output: Record<string, ItemStatCost> = {};
    for (const stat of files.global.excel.itemstatcost) {
        output[stat.Stat] = stat;
    }
    return output;
}

export function createSkillsBySkilldesc(files: D2Files): Record<string, D2Skill> {
    let output: Record<string, D2Skill> = {};
    for (const skill of files.global.excel.skills) {
        output[skill.skilldesc] = skill;
    }
    return output;
}

export function createSkillsById(files: D2Files): Record<string, D2Skill> {
    let output: Record<string, D2Skill> = {};
    for (const skill of files.global.excel.skills) {
        output[skill["*Id"]] = skill;
    }
    return output;
}

export function createSkillsBySkill(files: D2Files): Record<string, D2Skill> {
    let output: Record<string, D2Skill> = {};
    for (const skill of files.global.excel.skills) {
        output[skill["skill"]] = skill;
    }
    return output;
}

export function createCharstatsByClass(files: D2Files): Record<string, D2Charstat> {
    let output: Record<string, D2Charstat> = {};
    for (const cls of files.global.excel.charstats) {
        output[cls["class"]] = cls;
    }
    return output;
}

export function createSkilldescBySkilldesc(files: D2Files): Record<string, D2Skilldesc> {
    let output: Record<string, D2Skilldesc> = {};
    for (const entry of files.global.excel.skilldesc) {
        output[entry["skilldesc"]] = entry;
    }
    return output;
}