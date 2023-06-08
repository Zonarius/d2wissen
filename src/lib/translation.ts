import { useContext } from "react";
import { sprintf } from "sprintf-js";
import { D2Context } from "../D2Context";
import { D2Files } from "./d2Parser";
import { Modifier, getTableStats } from "./util";

const itemTypeTranslations = createItemTypeTranslations();

export const availableLanguages = ["enUS", "zhTW", "deDE", "esES", "frFR", "itIT", "koKR", "plPL", "esMX", "jaJP", "ptBR", "ruRU", "zhCN"] as const;
export type AvailableLanguage = typeof availableLanguages[number];

export type D2Translations = {
    [key: string]: D2TranslationEntry;
}
export type D2TranslationEntry = {
    id: number;
    Key: string;
} & {
    [lang in AvailableLanguage]: string;
}

export function createTranslations(files: D2Files): D2Translations {
    let output: D2Translations = {};

    const strings = files.data.local.lng.strings;

    for (const key of Object.keys(strings)) {
        for (const entry of strings[key]) {
            output[entry.Key] = entry;
        }
    }

    return output;
}

function createItemTypeTranslations(): D2Translations {
    const t = (key: string, en: string, de: string): any => ({
        [key]: {
            id: 0,
            Key: key,
            enUS: en,
            deDE: de,
        }
    })
    return {
        ...t("shld", "Shields", "Schilde"),
        ...t("club", "Clubs", "Knüppel"),
        ...t("hamm", "Hammers", "Hämmer"),
        ...t("mace", "Maces", "Keulen"),
        ...t("mele", "Melee Weapons", "Nahkampfwaffen"),
        ...t("scep", "Scepters", "Szepter"),
        ...t("swor", "Swords", "Schwerter"),
        ...t("staf", "Staves", "Zauberinnen-Stäbe"),
        ...t("tors", "Body Armors", "Rüstungen"),
        ...t("helm", "Helmets", "Kopfbedeckungen"),
        ...t("miss", "Missile Weapons", "Schusswaffen"),
        ...t("weap", "Weapon", "Waffe"),
        ...t("axe",  "Axes", "Äxte"),
        ...t("wand", "Wands", "Totenbeschwörer-Stäbe"),
        ...t("pole", "Polearms", "Stangenwaffen"),
        ...t("pala", "Paladin Shields", "Paladin-Schilde"),
        ...t("h2h",  "Claws", "Klauen"),
        ...t("circ", "Circlets", "Haarreife"),
        ...t("armo", "Armors", "Rüstungsgegenstände"),
        ...t("abow", "Amazon Bow", "Amazonen-Bogen"),
        ...t("spea", "Spears", "Speere"),
        ...t("necr", "Necromancer Heads", "Schrumpfköpfe"),
        ...t("barb", "Barbarian Helmets", "Barbaren-Helme"),
        ...t("drui", "Pelts", "Felle"),
        ...t("orb",  "Orbs", "Zauberinnen-Kugeln"),
        ...t("knif", "Knives", "Dolche"),
        ...t("aspe", "Amazon Spears", "Amazon-Speere"),
    }
}

export type TFunc = (key: string, ...params: string[]) => string;
export type ModifierTFunc = (mods: Modifier[]) => string[];

export function useT(lang?: AvailableLanguage): TFunc {
    const d2 = useContext(D2Context);
    const defLang = useLanguage(lang);
    return (key: string) => d2.translations[key]
        ? d2.translations[key][defLang]
        : "!t-err!";
}

export function useItemTypeT(lang?: AvailableLanguage): TFunc {
    const defLang = useLanguage(lang);
    return (key: string) => itemTypeTranslations[key]
        ? itemTypeTranslations[key][defLang]
        : "!t-err!";
}

const statByFunc: any = {
    "5": "mindamage",
    "6": "maxdamage",
    "7": "damagepercent"
};

const tKeyByStatCostId: any = {
    "25": "strModEnhancedDamage",
    "92": "ItemStats1p"
};

export function useModifierT(lang?: AvailableLanguage): ModifierTFunc {
    const d2 = useContext(D2Context);
    const t = useT(lang);
    const defLang = useLanguage(lang);
    const tSkill = (skill: string) => {
        let id: number;
        if (isNaN(Number(skill))) {
            id = Number(d2.skillsBySkilldesc[skill]["*Id"]);
        } else {
            id = Number(skill);
        }
        const tEntry = d2.translations[`Skillname${id}`]
            ?? d2.translations[`skillname${id}`];        
        return tEntry[defLang];
    };
    return mods => {
        const result: any[] = [];
        const push = (prio: string, res: string) => result.push({prio: Number(prio), res})
        for (const {code, param, min, max} of mods) {
            try {
                const prop = d2.propertiesByCode[code.toLocaleLowerCase()];
                for (const statref of getTableStats(prop)) {
                    const stat = d2.itemStatCostsByStat[statref.stat ?? statByFunc[statref.func]];
                    const tStr = t(stat.descstrpos ?? tKeyByStatCostId[stat["*ID"]]);

                    if (["92", "181"].includes(stat["*ID"])) {
                        // Skip these stats 
                        // * fixed level requirement
                        // * visual effects (fade)
                        continue;
                    }

                    // TODO min-max ranges!

                    if (!param) {
                        push("0", sprintf(strRangeReplace(tStr), numRangeReplace(min, max)));
                    } else if (stat.descfunc === "11") { // Replenish Durability
                        push(stat.descpriority, sprintf(tStr, 100 / Number(param)));
                    } else if (stat.descfunc === "15") { // Skill on Hit, etc.
                        push(stat.descpriority, sprintf(tStr, min, max, tSkill(param)));
                    } else if (["16", "28"].includes(stat.descfunc)) { // Auras, OSkills
                        push(stat.descpriority, sprintf(strRangeReplace(tStr), numRangeReplace(min, max), tSkill(param)));
                    } else if (stat.descfunc === "19") { // Per level stats
                        push(stat.descpriority, sprintf(tStr.replace("%+d", "%+3f"), Number(param) / 8) + ` ${t("ModStre10c")}`);
                    } else if (stat.descfunc === "24") { // Charges
                        push(stat.descpriority, sprintf(tStr, max, tSkill("" + (Number(param) + 1)), min, min));
                    } else {
                        push("0", `!t-nyi-mod(${code}, ${param}, ${min}, ${max})!`);
                    }
                }

            } catch (err) {
                console.log(err);
                push("0", `!t-err-mod(${code}, ${param}, ${min}, ${max})!`);
            }            
        }
        return result.sort((a, b) => b.prio - a.prio)
            .map(x => x.res);
    };
}

function strRangeReplace(str: string): string {
    return str.replace("%+d", "+%s").replace("%d", "%s");
}

function numRangeReplace(min?: number, max?: number): string {
    return min === max ? "" + min : `${min}-${max}`;
}

export function useLanguage(lang?: AvailableLanguage): AvailableLanguage {
    const d2 = useContext(D2Context);
    if (isAvailableLanguage(lang)) {
        return lang;
    } else {
        return d2.lang;
    }
}

function isAvailableLanguage(lang: any): lang is AvailableLanguage {
    return lang && availableLanguages.includes(lang);
}