import { FileLike } from "../lib/d2Parser";

const allFiles = import.meta.glob("../assets/mods/**", { as: "raw" })
const modsFolder = "../assets/mods" // Can only use literals in import, this has to be the same directory used in the import

export function listMods(): string[] {
    const mf = modsFolder.endsWith("/") ? modsFolder : modsFolder + "/";
    const len = mf.length;

    const mods = new Set<string>();
    for (const file of Object.keys(allFiles)) {
        const rel = file.substring(len)
        mods.add(rel.substring(0, rel.indexOf("/")))
    }
    return [...mods];
}

export function getModFiles(modname: string): FileLike[] {
    let mf = modsFolder.endsWith("/") ? modsFolder : modsFolder + "/";
    mf = mf + modname + "/";
    return Object.entries(allFiles).filter(([key]) => key.startsWith(mf))
        .map(([filename, content]) => ({
            // Prepending data to behave similar to folder upload
            webkitRelativePath: "data/" + filename.substring(mf.length),
            text: content
        }))
}