import { Modifier, StatRef, getTableStats, showRange, sprintf } from "../util";
import { AvailableLanguage, TFunc, useT } from "./translation";
import { D2Context } from "../../context/D2Context";
import { D2Property, D2ItemStatCost } from "../d2Parser";
import { useRouteLoaderData } from "react-router-dom";

export type PrioMod = {
    prio: number,
    mod: string;
}

export type ModifierTFunc = (mods: Modifier[]) => string[];
export function useModifierT(lang?: AvailableLanguage): ModifierTFunc {
    const d2 = useRouteLoaderData("mod") as D2Context;
    const t = useT(lang);
    const tSkill = (skill: string) => {
        const skilldescref = d2.refs.skillsBySkillId[skill]?.skilldesc
            ?? d2.refs.skillBySkill[skill]?.skilldesc
            ?? skill;
        const skilldesc = d2.refs.skilldescBySkilldesc[skilldescref.toLocaleLowerCase()];
        if (skilldesc) {
            const ret = t(skilldesc["str name"]);
            return ret.startsWith("!t-err") ? t(skilldesc["str alt"]) : ret;
        } else {
            console.log(d2);
            return `!t-err-skill(${skill})!`
        }
    };
    return mods => {
        const result: PrioMod[] = [];
        const push = (prio: string, mod: string) => result.push({prio: Number(prio), mod})
        for (const {code, param, min, max} of mods) {
            if (param?.startsWith("Mark of the")) {
                // NYI
                continue;
            }
            try {                
                const prop = d2.refs.propertiesByCode[code.toLocaleLowerCase()];
                const stats = prop.func1 in statByFunc
                    ? [{func: prop.func1, stat: statByFunc[prop.func1]}]
                    : getTableStats(prop);
                if (prop.code === "res-all") {
                    push("40", sprintf(t("strModAllResistances"), [min, max]))
                    continue;
                }
                for (const statref of stats) {
                    const stat = d2.refs.itemStatCostsByStat[statref.stat ?? statByFunc[statref.func]];

                    if (["92", "181", "56", "59", "126"].includes(stat["*ID"] || stat["ID"])) {
                        // Skip these stats 
                        // * fixed level requirement
                        // * visual effects (fade)
                        // * Cold length
                        // * Poison length
                        // * General skill category
                        continue;
                    }

                    const tStr = t(stat.descstrpos ?? tKeyByStatCostId[stat["*ID"] || stat["ID"]]);

                    const ctx: DescFuncContext = { d2, prop, statref, stat, tStr, code, param: param!, min, max, tSkill, t, old: d2.translations.old };
                    if (stat.descfunc && stat.descfunc in descFuncs) {
                        result.push(...descFuncs[stat.descfunc](ctx));
                    } else if (!param) {
                        if (descFuncByStat[stat.Stat]) {
                            result.push(...descFuncs[descFuncByStat[stat.Stat]](ctx));
                        } else {
                            push(stat.descfunc, sprintf(tStr, [min, max]));
                        }
                    } else {
                        push("0", `!t-nyi-mod(${code}, ${param}, ${min}, ${max})!`);
                    }
                }

            } catch (err) {
                console.log(code, param, min, max, err);
                push("0", `!t-err-mod(${code}, ${param}, ${min}, ${max})!`);
            }            
        }
        return result.sort((a, b) => b.prio - a.prio)
            .map(x => x.mod);
    };
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

const descFuncByStat: any = {
    "damagepercent": 4
}

const rangeModByStat: any = {
    "firemindam": "strModFireDamageRange",
    "lightmindam": "strModLightningDamageRange",
    "magicmindam":  "strModMagicDamageRange",
    "coldmindam": "strModColdDamageRange",
    "poisonmindam": "strModPoisonDamageRange",
    "mindamage": "strModMinDamageRange",
}

type DescFuncContext = {
    d2: D2Context;
    prop: D2Property;
    statref: StatRef;
    stat: D2ItemStatCost;
    tStr: string;
    tSkill: TFunc;
    t: TFunc;
    old: boolean;
    code: string;
    param: string;
    min?: number;
    max?: number;
};

function prioMod(prio: string, mod: string): PrioMod[] {
    return [{prio: Number(prio), mod}]
}

function sign(x: number | undefined): "+" | "-" {
    return !x || x > 0 ? "+" : "-";
}

function addValue(str: string, value: string, descval: string) {
    if (descval === "0") {
        return str;
    } else if (descval === "1") {
        return value + " " + str;
    } else {
        return str + " " + value;
    }
}

type DescFunc = (ctx: DescFuncContext) => PrioMod[];
const descFuncs: Record<string, DescFunc> = {
    "1": plusMinus,
    "2": percent,
    "3": statStr,
    "4": plusPercent,
    "6": plusMinusPerLevel,
    "9": statStrMiddle,
    "11": replenishDurability,
    "13": classSkills,
    "14": skillTab,
    "15": skillOn,
    "16": offSkill, // Aura
    "28": offSkill,
    "19": general,
    "23": reanimate,
    "24": charges,
    "27": charSkill
}

function plusMinus({statref, stat, min, max, t, tStr, prop}: DescFuncContext) {
    if (statref.func === "16") {
        // Ignore separate max dmg stat
        return [];
    }

    if (statref.func === "15") {
        // Use Range string
        tStr = t(rangeModByStat[stat.Stat])
        return prioMod(stat.descpriority, sprintf(tStr, min, max))
    }
    return prioMod(stat.descpriority, `${sign(min)}${showRange([min!, max!])} ${tStr}`)
}

function percent({stat, min, max, tStr}: DescFuncContext) {
    return prioMod(stat.descpriority, `${showRange([min!, max!])}% ${tStr}`)
}

function statStrMiddle({stat, min, max, t, tStr}: DescFuncContext) {
    return prioMod(stat.descpriority, `${tStr} ${showRange([min!, max!])} ${t(stat.descstr2)}`)
}

function plusPercent({stat, min, max, tStr}: DescFuncContext) {
    return prioMod(stat.descpriority, `+${showRange([min!, max!])}% ${tStr}`)
}

function plusMinusPerLevel({stat, min, max, tStr, t}: DescFuncContext) {
    return prioMod(stat.descpriority, `${sign(min)}${showRange([min!, max!])} ${tStr} ${t(stat.descstr2)}`)
}

function statStr({stat, min, max, tStr}: DescFuncContext) {
    return prioMod(stat.descpriority, addValue(tStr, showRange([min!, max!]), stat.descval));
}

function replenishDurability({stat, param, tStr}: DescFuncContext): PrioMod[] {
    return prioMod(stat.descpriority, sprintf(tStr, 100 / Number(param)));
}

function skillOn({stat, param, tStr, min, max, tSkill }: DescFuncContext): PrioMod[] {
    return prioMod(stat.descpriority, sprintf(tStr, min, max, tSkill(param)));
}

function offSkill({stat, tStr, min, max, t, tSkill, param, old}: DescFuncContext): PrioMod[] {
    if (old) {
        // improvised:
        

        return prioMod(stat.descpriority, `+${showRange([min!, max!])} ${t("to")} ${tSkill(param)}`);
    } else {
        return prioMod(stat.descpriority, sprintf(tStr, [min, max], tSkill(param)));
    }
}

function general({prop, stat, tStr, t, param, min, max}: DescFuncContext): PrioMod[] {
    if (stat.Stat === prop.stat2 && prop.func2 === "16") {
        // Ignore separate max dmg stat
        return [];
    }
    if (param) {
        return prioMod(stat.descpriority, sprintf(tStr.replace("%+d", "%+3f"), Number(param) / 8) + ` ${t("ModStre10c")}`);
    } else {
        return prioMod(stat.descpriority, sprintf(tStr, [min, max]));
    }
}

function charges({stat, tStr, min, max, t, tSkill, param, old }: DescFuncContext): PrioMod[] {
    if (old) {
        return prioMod(stat.descpriority, `${t("ModStre10b")} ${max} ${tSkill(param)} ${sprintf(tStr, min, min)}`);
    } else {
        return prioMod(stat.descpriority, sprintf(tStr, max, tSkill(param), min, min));
    }
}

function charSkill({d2, stat, tStr, min, max, t, tSkill, param, old}: DescFuncContext): PrioMod[] {
    const skillRow = d2.refs.skillsBySkillId[param] ?? d2.refs.skillBySkill[param]
    const cls = skillRow.charclass
    const classStr = t(`${cls.charAt(0).toLocaleUpperCase()}${cls.substring(1)}Only`)
    const skill = tSkill(param);

    if (old) {
        // improvised:
        return prioMod(stat.descpriority, `+${showRange([min!, max!])} ${t("to")} ${skill} ${classStr}`);
    } else {
        return prioMod(stat.descpriority, sprintf(tStr, [min, max], skill, classStr));
    }
}

const classOrder = ["Amazon", "Sorceress", "Necromancer", "Paladin", "Barbarian", "Druid", "Assassin"]

function skillTab({d2, stat, min, max, param, t}: DescFuncContext): PrioMod[] {
    const p = Number(param);
    const clsName = classOrder[Math.floor(p / 3)];
    const tabI = (p % 3) + 1 as 1 | 2 | 3 ;
    const tStr = t(d2.refs.charstatByClassname[clsName][`StrSkillTab${tabI}`]);
    return prioMod(stat.descpriority, sprintf(tStr, [min, max]));
}

function classSkills({d2, prop, stat, min, max, t}: DescFuncContext): PrioMod[] {
    const clsName = classOrder[Number(prop.val1)]
    const tStr = t(d2.refs.charstatByClassname[clsName].StrAllSkills);
    return prioMod(stat.descpriority, sprintf(tStr, [min, max]));
}

function reanimate({d2, tStr, param, stat, min, max, t, old}: DescFuncContext): PrioMod[] {
    const monsterName = t(d2.refs.monsterByIdx[param].NameStr);
    if (old) {
        return prioMod(stat.descpriority, addValue(tStr, monsterName, "2"));
    } else {
        return prioMod(stat.descpriority, sprintf(tStr, [min, max], monsterName));
    }
}