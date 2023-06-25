import * as fs from 'fs/promises';
import * as fss from 'fs';
import * as path from 'path';

const srcDir = process.argv[2];
const dest = process.argv[3]

if (process.argv.length < 4 || srcDir === "-h" || srcDir === "--help" || !fss.statSync(srcDir).isDirectory()) {
    console.log("Usage: npm run copymod <srcDir> <mod-name>\n\nsrcDir must have the folders 'global' and 'local' at first level!")
} else {
    main(srcDir, path.join(path.dirname(process.argv[1]), "src/assets/mods", dest))
}

async function main(srcDir, dest) {
    try {
        const files = [
            'global/excel/properties.txt',
            'global/excel/itemstatcost.txt',
            'global/excel/monstats.txt',
            'global/excel/skills.txt',
            'global/excel/skilldesc.txt',
            'global/excel/misc.txt',
            'global/excel/Weapons.txt',
            'global/excel/Armor.txt',
            'global/excel/runes.txt',
            'global/excel/charstats.txt',
            'global/excel/UniqueItems.txt',
            'global/excel/SetItems.txt',
            'global/excel/Sets.txt',
            'global/excel/ItemTypes.txt',
            'local/lng/eng/string.tbl',
            'local/lng/eng/expansionstring.tbl',
            'local/lng/eng/patchstring.tbl',
            'local/lng/strings/item-runes.json',
            'local/lng/strings/item-modifiers.json',
            'local/lng/strings/monsters.json',
            'local/lng/strings/skills.json'
        ];

        const copiedFiles = await copyAll(srcDir, dest, files);
        await fs.writeFile(path.join(dest, "index.ts"), createIndex(copiedFiles));
    } catch (err) {
        console.error(err)
    }
}

async function copyAll(srcDir, dest, files) {
    let copied = [];
    await Promise.all(files.map(async file => {
        const joinedSrc = path.join(srcDir, file).toLocaleLowerCase();
        const joinedDest = path.join(dest, file).toLocaleLowerCase();
        await fs.mkdir(path.dirname(joinedDest), { recursive: true })
        try {
            await fs.copyFile(joinedSrc, joinedDest);
            copied.push(file);
        } catch (err) {
            if (err && err.code === "ENOENT") {
                console.warn(`Could not find source file: ${joinedSrc}`)
            } else {
                throw err;
            }
        }
    }));

    return copied;
}

function createIndex(files) {
    let result = "";
    let i = 0;
    for (const file of files) {
        const loader = file.endsWith(".tbl")
            ? "bin" : "raw";
        result += `import file${i} from './${file.toLocaleLowerCase()}?${loader}';\n`
        i++;
    }
    result += "\nexport default {\n";
    i = 0;
    for (const file of files) {
        result += `  "${file.toLocaleLowerCase()}": file${i},\n`
        i++;
    }
    result += "}";

    return result;
}