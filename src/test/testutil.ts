import { D2Context, modLoader } from "../context/D2Context";

export function createTestContext(): Promise<D2Context> {
  return modLoader("projectd2");
}