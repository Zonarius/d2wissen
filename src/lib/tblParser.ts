type WORD = number;
type DWORD = number;
type BYTE = number;
type HashIndex = WORD;

interface D2TblHeader {
  crc: WORD;
  numElements: WORD;
  hashTableSize: DWORD;
  version: BYTE;
  indexStart: DWORD;
  maxTries: DWORD;
  indexEnd: DWORD;
}

interface HashEntry {
  used: BYTE;
  index: WORD;
  hashValue: DWORD;
  keyOffset: DWORD;
  strOffset: DWORD;
  strLen: WORD;
}

export function readTbl(file: Uint8Array): Record<string, string> {
  const reader = new Reader(file);
  const header = readHeader(reader);
  readIndices(reader, header);
  const hashEntries = readHashEntries(reader, header);
  const table = readTable(reader, hashEntries);
  return table;
}

function readHeader(reader: Reader) {
  return {
    crc: reader.word(),
    numElements: reader.word(),
    hashTableSize: reader.dword(),
    version: reader.byte(),
    indexStart: reader.dword(),
    maxTries: reader.dword(),
    indexEnd: reader.dword()
  }
}


function readIndices(reader: Reader, header: D2TblHeader) {
  const result: HashIndex[] = [];
  for (let i = 0; i < header.numElements; i++) {
    result.push(reader.word());
  }
  return result;
}

function readHashEntries(reader: Reader, header: D2TblHeader) {
  const result: HashEntry[] = [];
  for (let i = 0; i < header.hashTableSize; i++) {
    result.push({
      used: reader.byte(),
      index: reader.word(),
      hashValue: reader.dword(),
      keyOffset: reader.dword(),
      strOffset: reader.dword(),
      strLen: reader.word()
    });
  }
  return result;
}

function readTable(reader: Reader, hashEntries: HashEntry[]) {
  const result: Record<string, string> = {};
  for (const entry of hashEntries) {
    reader.seek(entry.keyOffset);
    const key = reader.string();
    reader.seek(entry.strOffset);
    const val = reader.string();
    if (!result[key]) {
      result[key] = val;
    }
  }

  return result;
}

class Reader {
  private pos = 0;

  constructor(private arr: Uint8Array) {}

  public seek(pos: number) {
    this.pos = pos;
  }

  public word(): WORD {
    const val = this.arr.at(this.pos)!
      | this.arr.at(this.pos + 1)! << 8;
    this.pos += 2;
    return val;
  }

  public dword(): DWORD {
    const val = this.arr.at(this.pos)!
      | this.arr.at(this.pos + 1)! << 8
      | this.arr.at(this.pos + 2)! << 16
      | this.arr.at(this.pos + 3)! << 24;
    this.pos += 4;
    return val;
  }

  public byte(): BYTE {
    return this.arr.at(this.pos++)!;
  }

  public string(): string {
    const codes: number[] = [];
    while (this.arr.at(this.pos) != 0) {
      if (this.pos > this.arr.length) {
        throw new Error("OOB")
      }
      codes.push(this.arr.at(this.pos)!);
      this.pos++;
    }
    return String.fromCharCode(...codes);
  }
}