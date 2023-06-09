import { useContext } from "react";
import { D2Context } from "../context/D2Context";
import { Runeword } from "../lib/d2Parser";
import { getTableArray, getTableModifiers, range } from "../lib/util";
import React from "react";
import { ModifierTFunc, TFunc, useItemTypeT, useModifierT, useT } from "../lib/translation";

function RuneWords() {
    const d2 = useContext(D2Context);
    const rws: Runeword[] = d2.data.global.excel.runes.filter((rw: Runeword) => rw.complete === "1");
    rws.sort((a, b) => requiredLevel(d2, a) - requiredLevel(d2, b));    
    return (
        <>
            <h3>Runenw&ouml;rter: &Uuml;bersicht</h3>
            <table className="d2w">
                <thead>
                    <tr>
                        <th rowSpan={2}>Sockel</th>
                        <th rowSpan={2}>Runenwort</th>
                        <th rowSpan={2}>mögliche Gegenstände</th>
                        <th rowSpan={2}>Level</th>
                        <th colSpan={2}>magische Eigenschaften</th>
                    </tr>
                    <tr>
                        <th>Runenwortbonus</th>
                        <th>mit Runeneigenschaften</th>
                    </tr>
                </thead>
                <tbody>
                    {rws.map((rw: Runeword) => (
                        <RuneWordRow key={rw.Name} d2={d2} runeword={rw} />
                    ))}
                </tbody>
            </table>
        </>
    )
}

interface RuneWordRowProps {
    d2: D2Context;
    runeword: Runeword;
}

function RuneWordRow({ d2, runeword }: RuneWordRowProps) {
    const t = useT();
    const enT = useT("enUS");
    const itT = useItemTypeT();
    const modT = useModifierT();
    return (
        <tr>
            <td>{runeCount(runeword)}</td>
            <td>
                <b className="rw">{t(runeword.Name)}</b> <br/>
                [<i className="rw">{enT(runeword.Name)}</i>]
                <p>
                    <span className="rw">&quot;{combinedRuneWord(t, runeword)}&quot;</span>
                </p>
            </td>
            <td>{possibleItems(itT, runeword).map(type => (
                <React.Fragment key={type}>{type}<br/></React.Fragment>
            ))}</td>
            <td>{requiredLevel(d2, runeword)}</td>
            <td>{modifiers(modT, runeword).map(mod => (
                <React.Fragment key={mod}>{mod}<br/></React.Fragment>
            ))}</td>
            <td>NYI</td>
        </tr>
    )
}


function runeCount(rw: Runeword) {
    return getTableArray(rw, "Rune").length;
}

function combinedRuneWord(t: TFunc, rw: Runeword): string {
    return getTableArray(rw, "Rune")
        .map(key => t(key + "L"))
        .join("");
}

function possibleItems(t: TFunc, rw: Runeword): string[] {
    return getTableArray(rw, "itype")
        .map(key => t(key))
}

function modifiers(t: ModifierTFunc, rw: Runeword): string[] {
    const mods = getTableModifiers(rw, "T1Code", "T1Param", "T1Min", "T1Max");
    return t(mods);
}

function requiredLevel(d2: D2Context, rw: Runeword): number {
    const mods = getTableModifiers(rw, "T1Code", "T1Param", "T1Min", "T1Max");
    const lreq = mods.find(mod => mod.code === "levelreq");
    return Math.max(
        ...[
            ...[lreq ? Number(lreq.max) : 0],
            ...getTableArray(rw, "Rune").map(r => Number(d2.itemsByCode[r].levelreq))
        ]
    );
}

export default RuneWords;