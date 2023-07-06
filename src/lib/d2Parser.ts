import JSON5 from 'json5';
import { readTbl } from './tblParser';
import { Vendor } from './shopsimulator/shopsimulator-model';

export type D2TableRow = 
	| D2Charstat
	| D2ItemStatCost
	| D2Misc
	| D2Monster
	| D2Property
	| D2Runeword
	| D2Skill
	| D2Skilldesc
	| D2UniqueItem
	| D2SetItem
	| D2Set
	| D2Weapon
	| D2Armor
	| D2ItemType
	| D2Affix

export type Indexed<T> = { _index: string } & T;
export type D2Table<T extends D2TableRow> = {
	columns: Array<keyof T>;
	data: Indexed<T>[];
}
export interface D2Files {
	global: {
		excel: {
			charstats: D2Table<D2Charstat>;
			itemstatcost: D2Table<D2ItemStatCost>;
			misc: D2Table<D2Misc>;
			monstats: D2Table<D2Monster>;
			properties: D2Table<D2Property>;
			runes: D2Table<D2Runeword>;
			skills: D2Table<D2Skill>;
			skilldesc: D2Table<D2Skilldesc>;
			uniqueitems: D2Table<D2UniqueItem>;
      setitems: D2Table<D2SetItem>;
			sets: D2Table<D2Set>;
      weapons: D2Table<D2Weapon>;
      armor: D2Table<D2Armor>;
			itemtypes: D2Table<D2ItemType>;
			magicprefix: D2Table<D2Affix>;
			magicsuffix: D2Table<D2Affix>;
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

	etype1: string;
	etype2: string;
	etype3: string;

	Rune1: string;
	Rune2: string;
	Rune3: string;
	Rune4: string;
	Rune5: string;
	Rune6: string;

	T1Code1: string;
	T1Param1: string;
	T1Min1: string;
	T1Max1: string;

	T1Code2: string;
	T1Param2: string;
	T1Min2: string;
	T1Max2: string;

	T1Code3: string;
	T1Param3: string;
	T1Min3: string;
	T1Max3: string;

	T1Code4: string;
	T1Param4: string;
	T1Min4: string;
	T1Max4: string;

	T1Code5: string;
	T1Param5: string;
	T1Min5: string;
	T1Max5: string;

	T1Code6: string;
	T1Param6: string;
	T1Min6: string;
	T1Max6: string;

	T1Code7: string;
	T1Param7: string;
	T1Min7: string;
	T1Max7: string;
}

export interface D2UniqueItem {
	index: string;
  enabled: string;
  code: string;
  "lvl req": string;

	prop1: string;
	par1: string;
	min1: string;
	max1: string;

	prop2: string;
	par2: string;
	min2: string;
	max2: string;

	prop3: string;
	par3: string;
	min3: string;
	max3: string;

	prop4: string;
	par4: string;
	min4: string;
	max4: string;

	prop5: string;
	par5: string;
	min5: string;
	max5: string;

	prop6: string;
	par6: string;
	min6: string;
	max6: string;

	prop7: string;
	par7: string;
	min7: string;
	max7: string;

	prop8: string;
	par8: string;
	min8: string;
	max8: string;

	prop9: string;
	par9: string;
	min9: string;
	max9: string;

	prop10: string;
	par10: string;
	min10: string;
	max10: string;

	prop11: string;
	par11: string;
	min11: string;
	max11: string;

	prop12: string;
	par12: string;
	min12: string;
	max12: string;
}

export interface D2SetItem {
  index: string;
  set: string;
  item: string;
  "lvl req": string;

	prop1: string;
	par1: string;
	min1: string;
	max1: string;

	prop2: string;
	par2: string;
	min2: string;
	max2: string;

	prop3: string;
	par3: string;
	min3: string;
	max3: string;

	prop4: string;
	par4: string;
	min4: string;
	max4: string;

	prop5: string;
	par5: string;
	min5: string;
	max5: string;

	prop6: string;
	par6: string;
	min6: string;
	max6: string;

	prop7: string;
	par7: string;
	min7: string;
	max7: string;

	prop8: string;
	par8: string;
	min8: string;
	max8: string;

	prop9: string;
	par9: string;
	min9: string;
	max9: string;

	aprop1a: string;
	apar1a: string;
	amin1a: string;
	amax1a: string;
	aprop1b: string;
	apar1b: string;
	amin1b: string;
	amax1b: string;

	aprop2a: string;
	apar2a: string;
	amin2a: string;
	amax2a: string;
	aprop2b: string;
	apar2b: string;
	amin2b: string;
	amax2b: string;

	aprop3a: string;
	apar3a: string;
	amin3a: string;
	amax3a: string;
	aprop3b: string;
	apar3b: string;
	amin3b: string;
	amax3b: string;

	aprop4a: string;
	apar4a: string;
	amin4a: string;
	amax4a: string;
	aprop4b: string;
	apar4b: string;
	amin4b: string;
	amax4b: string;

	aprop5a: string;
	apar5a: string;
	amin5a: string;
	amax5a: string;
	aprop5b: string;
	apar5b: string;
	amin5b: string;
	amax5b: string;
}

export interface D2Set {
	index: string;
	name: string;

	PCode2a: string;
	PParam2a: string;
	PMin2a: string;
	PMax2a: string;
	PCode2b: string;
	PParam2b: string;
	PMin2b: string;
	PMax2b: string;

	PCode3a: string;
	PParam3a: string;
	PMin3a: string;
	PMax3a: string;
	PCode3b: string;
	PParam3b: string;
	PMin3b: string;
	PMax3b: string;

	PCode4a: string;
	PParam4a: string;
	PMin4a: string;
	PMax4a: string;
	PCode4b: string;
	PParam4b: string;
	PMin4b: string;
	PMax4b: string;

	PCode5a: string;
	PParam5a: string;
	PMin5a: string;
	PMax5a: string;
	PCode5b: string;
	PParam5b: string;
	PMin5b: string;
	PMax5b: string;

	FCode1: string;
	FParam1: string;
	FMin1: string;
	FMax1: string;

	FCode2: string;
	FParam2: string;
	FMin2: string;
	FMax2: string;

	FCode3: string;
	FParam3: string;
	FMin3: string;
	FMax3: string;

	FCode4: string;
	FParam4: string;
	FMin4: string;
	FMax4: string;

	FCode5: string;
	FParam5: string;
	FMin5: string;
	FMax5: string;

	FCode6: string;
	FParam6: string;
	FMin6: string;
	FMax6: string;

	FCode7: string;
	FParam7: string;
	FMin7: string;
	FMax7: string;

	FCode8: string;
	FParam8: string;
	FMin8: string;
	FMax8: string;
}

type VendorKeys = `${Vendor}${"Min" | "Max" | "MagicMin" | "MagicMax" | "MagicLvl"}`
interface D2ItemFixed {
	name: string;
  code: string;
	durability: string;
	level: string;
	levelreq: string;
  namestr: string;
	normcode: string;
	ubercode: string;
	ultracode: string;
	invwidth: string;
	invheight: string;
	type: string;
	type2: string;
	NightmareUpgrade: string;
	HellUpgrade: string;
}

export type D2Item = D2ItemFixed & {
	[k in VendorKeys]: string;
}

export interface D2Misc extends D2Item {
	
}

export interface D2Weapon extends D2Item {
	mindam: string;
	maxdam: string;
	"2handmindam": string;
	"2handmaxdam": string;
	minmisdam: string;
	maxmisdam: string;
	speed: string;
	reqstr: string;
	reqdex: string;
	"magic lvl": string;
	stackable: string;
	minstack: string;
	maxstack: string;
	spawnstack: string;
}

export interface D2Armor extends D2Item {
	reqstr: string;
	minac: string;
	maxac: string;
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
	Id: string;
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
	Body: string;
	BodyLoc1: string;
	BodyLoc2: string;
	Quiver: string;
}

export interface D2Affix {
	Name: string;
	spawnable: string;
	rare: string;
	level: string;
	maxlevel: string;
	frequency: string;
	levelreq: string;
	group: string;
	
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

	itype1: string;
	itype2: string;
	itype3: string;
	itype4: string;
	itype5: string;
	itype6: string;
	itype7: string;
	etype1: string;
	etype2: string;
	etype3: string;
	etype4: string;
	etype5: string;
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

async function parseExcel(file: FileLike): Promise<D2Table<any>> {
	const text = await file.text();
	const [headerLine, ...entries] = text.split("\n").filter(line => line.length > 0);
	const header = headerLine.split("\t");

	const data = entries.map((entry, index) => {
		const cells = entry.split("\t");
		let entryObj: any = {
			_index: String(index)
		};
		for (let i = 0; i < cells.length; i++) {
			if (cells[i] !== "") {
				entryObj[header[i]] = cells[i];
			}
		}
		return entryObj;
	})

	return {
		columns: header,
		data
	}
}

async function parseTbl(file: FileLike) {
	const bin = await file.arrayBuffer();
	return readTbl(bin);
}