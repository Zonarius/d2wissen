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
            'global/excel/skills.txt',
            'global/excel/skilldesc.txt',
            'global/excel/misc.txt',
            'global/excel/runes.txt',
            'global/excel/charstats.txt',
            'local/lng/strings/item-runes.json',
            'local/lng/strings/item-modifiers.json',
            'local/lng/strings/skills.json'
        ];

        await Promise.all(files.map(async file => {
            const joinedDest = path.join(dest, file)
            await fs.mkdir(path.dirname(joinedDest), { recursive: true })
            await fs.copyFile(
                path.join(srcDir, file),
                joinedDest
            )
        }));
        
    } catch (err) {
        console.error(err)
    }
}