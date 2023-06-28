import JSON5 from 'json5';
import { readTbl } from './tblParser';
import { Vendor } from './shopsimulator/shopsimulator-model';

export interface D2Files {
	global: {
		excel: {
			charstats: D2Charstat[];
			itemstatcost: D2ItemStatCost[];
			misc: D2Misc[];
			monstats: D2Monster[];
			properties: D2Property[];
			runes: D2Runeword[];
			skills: D2Skill[];
			skilldesc: D2Skilldesc[];
			uniqueitems: D2UniqueItem[];
      setitems: D2SetItem[];
      weapons: D2Weapon[];
      armor: D2Armor[];
			itemtypes: D2ItemType[];
			magicprefix: D2Affix[];
			magicsuffix: D2Affix[];
		}
	};
	hd: any;
	local: any;
};

export interface D2Runeword {
	Name: string;
	complete: string;

	itype1: string;
	itype2: string;
	itype3: string;
	itype4: string;
	itype5: string;
	itype6: string;

	Rune1: string;
	Rune2: string;
	Rune3: string;
	Rune4: string;
	Rune5: string;
	Rune6: string;
}

export interface D2UniqueItem {
	index: string;
  enabled: string;
  code: string;
  "lvl req": string;
}

export interface D2SetItem {
  index: string;
  set: string;
  item: string;
  "lvl req": string;
}

type VendorKeys = `${Vendor}${"Min" | "Max" | "MagicMin" | "MagicMax" | "MagicLvl"}`
interface D2ItemFixed {
	name: string;
  code: string;
	level: string;
	levelreq: string;
  namestr: string;
	normcode: string;
	ubercode: string;
	ultracode: string;
	invwidth: string;
	invheight: string;
	type: string;
	NightmareUpgrade: string;
	HellUpgrade: string;
}

export type D2Item = D2ItemFixed & {
	[k in VendorKeys]: string;
}

export interface D2Misc extends D2Item {
	
}

export interface D2Weapon extends D2Item {
	"magic lvl": string;
}

export interface D2Armor extends D2Item {
	"magic lvl": string;
}

export interface D2Property {
	code: string;
	func1: string;
	stat1: string;
	set1: string;
	val1: string;

	func2: string;
	stat2: string;
	set2: string;
	val2: string;

	func3: string;
	stat3: string;
	set3: string;
	val3: string;

	func4: string;
	stat4: string;
	set4: string;
	val4: string;

	func5: string;
	stat5: string;
	set5: string;
	val5: string;

	func6: string;
	stat6: string;
	set6: string;
	val6: string;

	func7: string;
	stat7: string;
	set7: string;
	val7: string;
}

export interface D2ItemStatCost {
	Stat: string;
	"*ID": string;
	ID: string;
	descpriority: string;
	descfunc: string;
	descval: "0" | "1" | "2";
	descstrpos: string;
	descstrneg: string;
	descstr2: string;
}

export interface D2Skill {
	skill: string;
	"*Id": string;
	skilldesc: string;
	charclass: string;
}

export interface D2Charstat {
	class: string;
	StrAllSkills: string;
	StrSkillTab1: string;
	StrSkillTab2: string;
	StrSkillTab3: string;
}

export interface D2Skilldesc {
	skilldesc: string;
	"str name": string;
	"str alt": string;
	desctexta1: string;
	desctextb1: string;
	desctexta2: string;
	desctextb2: string;
	"item proc text": string;
}

export interface D2Monster {
	Id: string;
	"*hcIdx": string;
	NameStr: string;
}

export interface D2ItemType {
	ItemType: string;
	Code: string;
	Equiv1: string;
	Equiv2: string;
	BodyLoc1: string;
	BodyLoc2: string;
}

export interface D2Affix {
	Name: string;
	spawnable: string;
	rare: string;
	level: string;
	maxlevel: string;
	frequency: string;
	
	mod1code: string;
	mod1param: string;
	mod1min: string;
	mod1max: string;

	mod2code: string;
	mod2param: string;
	mod2min: string;
	mod2max: string;

	mod3code: string;
	mod3param: string;
	mod3min: string;
	mod3max: string;
}

export interface FileLike {
	webkitRelativePath: string;
	text(): Promise<string>;
	arrayBuffer(): Promise<Uint8Array>;
}

export async function parseD2(files: FileLike[]): Promise<D2Files> {
	let d2: any = {};

	for (const file of files) {
		const rp = file.webkitRelativePath
		const path = rp.substring(rp.indexOf("/") + 1).split("/");
		await mkFile(d2, file, path);
	}

	return d2;
}

async function mkFile(folder: any, file: FileLike, [fileName, ...rest]: string[]) {
	const mkOrGet = (name: string) => {
		if (!folder[name]) {
			folder[name] = {}
		}
		return folder[name]
	}

	if (rest.length >= 2) {
		await mkFile(mkOrGet(fileName), file, rest);
	} else if (fileName === "excel") {
		mkOrGet(fileName)[stripExt(rest[0])] = await parseExcel(file)
	} else if (rest[0].endsWith(".json")){
		mkOrGet(fileName)[stripExt(rest[0])] = await parseJson(file)
	} else if (rest[0].endsWith(".tbl")){
		mkOrGet(fileName)[stripExt(rest[0])] = await parseTbl(file)
	}
}

function stripExt(fileName: string) {
	return fileName.substring(0, fileName.lastIndexOf("."));
}

async function parseJson(file: FileLike) {
	const text = await file.text();
	return JSON5.parse(text);
}

async function parseExcel(file: FileLike) {
	const text = await file.text();
	const [headerLine, ...entries] = text.split("\n").filter(line => line.length > 0);
	const header = headerLine.split("\t");

	return entries.map(entry => {
		const cells = entry.split("\t");
		let entryObj: any = {};
		for (let i = 0; i < cells.length; i++) {
			if (cells[i] !== "") {
				entryObj[header[i]] = cells[i];
			}
		}
		return entryObj;
	})
}

async function parseTbl(file: FileLike) {
	const bin = await file.arrayBuffer();
	return readTbl(bin);
}