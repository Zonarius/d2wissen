import { D2Context } from "../../context/D2Context";
import { ShopGenerator } from "../../lib/shopsimulator/shopsimulator";
import { ShopOptions } from "../../lib/shopsimulator/shopsimulator-model";

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
  postMessage(shop.generate());
  setTimeout(() => run(shop));
}