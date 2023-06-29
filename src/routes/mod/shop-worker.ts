import { D2Context } from "../../context/D2Context";
import { ShopGenerator } from "../../lib/shopsimulator/shopsimulator";
import { ShopOptions, ShopResult } from "../../lib/shopsimulator/shopsimulator-model";

export type ShopWorkerMessage = StartMessage | StopMessage;

export interface StartMessage {
  type: "start";
  d2: D2Context;
  shopOptions: ShopOptions;
}

export interface StopMessage {
  type: "stop";
}

const state = {
  running: false
}

onmessage = ({ data }: MessageEvent<ShopWorkerMessage>) => {
  if (data.type === "start" && !state.running) {
    state.running = true;
    const shop = new ShopGenerator(data.d2, data.shopOptions);
    run(shop)
  } else if (data.type === "stop") {
    state.running = false;
  }
}

function run(shop: ShopGenerator) {
  if (!state.running) {
    return;
  }
  const shopResult = shop.generate();
  const desiredItems = hasDesiredItem(shopResult);
  if (desiredItems.length > 0) {
    postMessage(desiredItems);
  }
  setTimeout(() => run(shop), 0);
}

function hasDesiredItem(data: ShopResult[]): string[] {
  const shopKeys: string[] = [];
  for (const result of data) {
    for (const item of result.items)  {
      const prefixMod = item.prefix?.modifiers[0];
      const suffixMod = item.suffix?.modifiers[0];
      if ((prefixMod && prefixMod.code === "skilltab" && prefixMod.param === "0" && prefixMod.value === 3)
        && (suffixMod && suffixMod.code === "swing2" && suffixMod.value === 20)) {
          const key = `${result.clvl}-${result.difficulty}-${result.vendor}`;
          shopKeys.push(key);
      }
    }
  }
  return shopKeys;
}