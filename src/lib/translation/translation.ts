import { D2Context } from "../../context/D2Context";
import { D2Files } from "../d2Parser";
import { useRouteLoaderData } from "react-router-dom";

const itemTypeTranslations = createItemTypeTranslations();

export const availableLanguages = ["enUS", "zhTW", "deDE", "esES", "frFR", "itIT", "koKR", "plPL", "esMX", "jaJP", "ptBR", "ruRU", "zhCN"] as const;
export type AvailableLanguage = typeof availableLanguages[number];

export type TranslationStrings = Record<string, D2TranslationEntry>
export interface D2Translations {
    old: boolean;
    strings: TranslationStrings;
}
export type D2TranslationEntry = {
    id: number;
    Key: string;
} & {
    [lang in AvailableLanguage]: string;
}

export function createTranslations(files: D2Files): D2Translations {
    let output: Record<string, D2TranslationEntry> = {};

    const strings = files.local.lng?.strings;

    if (strings) {
        for (const key of Object.keys(strings)) {
            for (const entry of strings[key]) {
                if (!output[entry.Key]) {
                    output[entry.Key] = entry;
                }
            }
        }
        return {
            old: false,
            strings: output
        }
    } else {
        const languages = files.local.LNG;
        // TODO support other languages
        for (const file of ["patchstring", "expansionstring", "string"]) {
            for (const [key, value] of Object.entries(languages.ENG[file])) {
                if (!output[key]) {
                    output[key] = {
                        id: 0,
                        Key: key,
                        ...Object.fromEntries(availableLanguages.map(lang => [lang, value]))
                    } as D2TranslationEntry;
                }
            }
        }
        return {
            old: true,
            strings: output
        }
    }
}

function createItemTypeTranslations(): TranslationStrings {
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
        ...t("h2h2", "High Level Claws", "High-Level-Klauen"),
        ...t("circ", "Circlets", "Haarreife"),
        ...t("armo", "Armors", "Rüstungsgegenstände"),
        ...t("abow", "Amazon Bow", "Amazonen-Bogen"),
        ...t("spea", "Spears", "Speere"),
        ...t("necr", "Necromancer Heads", "Schrumpfköpfe"),
        ...t("barb", "Barbarian Helmets", "Barbaren-Helme"),
        ...t("drui", "Pelts", "Felle"),
        ...t("orb",  "Orbs", "Zauberinnen-Kugeln"),
        ...t("sorc", "Sorceress Weapons", "Zauberinnen-Waffen"),
        ...t("knif", "Knives", "Dolche"),
        ...t("aspe", "Amazon Spears", "Amazon-Speere"),
    }
}

export type TFunc = (key: string, ...params: string[]) => string;

export function useT(lang?: AvailableLanguage): TFunc {
    const d2 = useRouteLoaderData("mod") as D2Context;
    const defLang = useLanguage(lang);
    return (key: string) => d2.translations.strings[key]
        ? d2.translations.strings[key][defLang]
        : `!t-err(${key})!`;
        // : (() => {throw Error(key)})();
}

export function useItemTypeT(lang?: AvailableLanguage): TFunc {
    const defLang = useLanguage(lang);
    return (key: string) => itemTypeTranslations[key]
        ? itemTypeTranslations[key][defLang]
        : `!t-item-err(${key})!`;
}

export function useLanguage(lang?: AvailableLanguage): AvailableLanguage {
    const d2 = useRouteLoaderData("mod") as D2Context;
    if (isAvailableLanguage(lang)) {
        return lang;
    } else {
        return d2.lang;
    }
}

function isAvailableLanguage(lang: any): lang is AvailableLanguage {
    return lang && availableLanguages.includes(lang);
}