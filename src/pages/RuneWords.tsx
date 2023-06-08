import { useContext } from "react";
import { D2Context } from "../D2Context";
import { Runeword } from "../lib/d2Parser";
import { getTableArray } from "../lib/util";
import React from "react";
import { TFunc, useItemTypeT, useT } from "../lib/translation";

function RuneWords() {
    const d2 = useContext(D2Context);
    const rws: Runeword[] = d2.data.global.excel.runes;
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
            <td></td>
            <td></td>
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

function requiredLevel(d2: D2Context, rw: Runeword): number {
    return Math.max(
        ...getTableArray(rw, "Rune").map(r => Number(d2.itemsByCode[r].levelreq))
    );
}

export default RuneWords;