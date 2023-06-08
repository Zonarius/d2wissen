import { useContext } from "react";
import { D2Context } from "../D2Context";
import { D2Files } from "./d2Parser";


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
        ...t("drui", "Druid Helmets", "Felle"),
        ...t("orb",  "Orbs", "Zauberinnen-Kugeln"),
        ...t("knif", "Knives", "Dolche"),
        ...t("aspe", "Amazon Spears", "Amazon-Speere"),
    }
}

export type TFunc = (key: string, ...params: string[]) => string;

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