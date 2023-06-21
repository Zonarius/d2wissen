import { FileLike } from "../lib/d2Parser";

type modType = {
    default: Record<string, any>;
}

const knownMods: Record<string, () => Promise<modType>> = {
    "2.7": () => import("../assets/mods/2.7/index.ts"),
    "projectd2": () => import("../assets/mods/projectd2/index.ts"),
    "reimagined": () => import("../assets/mods/reimagined/index.ts")
}

export function listMods(): string[] {
    return Object.keys(knownMods);
}

export async function getModFiles(modname: string): Promise<FileLike[]> {
    const mod = await knownMods[modname]();
    return Object.entries(mod.default)
        .map(([filename, content]) => ({
            // Prepending data to behave similar to folder upload
            webkitRelativePath: "data/" + filename,
            text: () => Promise.resolve(content),
            arrayBuffer: () => Promise.resolve(content)
        }))
}