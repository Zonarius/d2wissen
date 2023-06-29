import seedrandom from "seedrandom";


export class Rng {
  private rng: seedrandom.PRNG;

  constructor(seed?: string) {
    seed = seed ?? String(Math.random())
    this.rng = seedrandom.alea(seed);
  }

  rangeInc(min: number, max: number): number {
    return min + Math.floor(this.rng() * (max - min + 1));
  }

  distribution(xs: number[]): number {
    const sum = xs.reduce((x, y) => x + y);
    let roll = this.rangeInc(0, sum - 1);
    for (let i = 0; i < xs.length; i++) {
      if (roll < xs[i]) {
        return i;
      }
      roll = roll - xs[i];
    }
    throw new Error();
  }

  roll(chance: number): boolean {
    return this.rng() < chance;
  }

  choice<T>(arr: T[]): T {
    return arr[this.rangeInc(0, arr.length - 1)];
  }
}