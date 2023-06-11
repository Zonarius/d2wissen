import { Modifier, getTableStats, sprintf } from "../util";
import { AvailableLanguage, TFunc, useT } from "./translation";
import { D2Context } from "../../context/D2Context";
import { D2Property, D2ItemStatCost } from "../d2Parser";
import { useRouteLoaderData } from "react-router-dom";

type PrioMod = {
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
        const skilldesc = d2.refs.skilldescBySkilldesc[skilldescref];
        if (skilldesc) {
            return t(skilldesc["str name"]);
        } else {
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

                    if (["92", "181", "56", "59"].includes(stat["*ID"])) {
                        // Skip these stats 
                        // * fixed level requirement
                        // * visual effects (fade)
                        // * Cold length
                        // * Poison length
                        continue;
                    }

                    const tStr = t(stat.descstrpos ?? tKeyByStatCostId[stat["*ID"]]);

                    if (stat.descfunc && stat.descfunc in descFuncs) {
                        const ctx: DescFuncContext = { d2, prop, stat, tStr, code, param: param!, min, max, tSkill, t };
                        result.push(...descFuncs[stat.descfunc](ctx));
                    } else if (!param) {
                        push(stat.descfunc, sprintf(tStr, [min, max]));

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

type DescFuncContext = {
    d2: D2Context;
    prop: D2Property;
    stat: D2ItemStatCost;
    tStr: string;
    tSkill: TFunc;
    t: TFunc;
    code: string;
    param: string
    min?: number;
    max?: number;
};

type DescFunc = (ctx: DescFuncContext) => PrioMod[];
const descFuncs: Record<string, DescFunc> = {
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

function prioMod(prio: string, mod: string): PrioMod[] {
    return [{prio: Number(prio), mod}]
}

function replenishDurability({stat, param, tStr}: DescFuncContext): PrioMod[] {
    return prioMod(stat.descpriority, sprintf(tStr, 100 / Number(param)));
}

function skillOn({stat, param, tStr, min, max, tSkill }: DescFuncContext): PrioMod[] {
    return prioMod(stat.descpriority, sprintf(tStr, min, max, tSkill(param)));
}

function offSkill({stat, tStr, min, max, tSkill, param}: DescFuncContext): PrioMod[] {
    return prioMod(stat.descpriority, sprintf(tStr, [min, max], tSkill(param)));
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

function charges({stat, tStr, min, max, tSkill, param}: DescFuncContext): PrioMod[] {
    return prioMod(stat.descpriority, sprintf(tStr, max, tSkill(param), min, min));
}

function charSkill({d2, stat, tStr, min, max, t, tSkill, param}: DescFuncContext): PrioMod[] {
    const cls = d2.refs.skillsBySkillId[param].charclass
    const classStr = t(`${cls.charAt(0).toLocaleUpperCase()}${cls.substring(1)}Only`)
    const skill = tSkill(param);

    return prioMod(stat.descpriority, sprintf(tStr, [min, max], skill, classStr));
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

function reanimate({d2, tStr, param, stat, min, max, t}: DescFuncContext): PrioMod[] {
    const monsterName = t(d2.refs.monsterByIdx[param].NameStr);
    return prioMod(stat.descpriority, sprintf(tStr, [min, max], monsterName));
}