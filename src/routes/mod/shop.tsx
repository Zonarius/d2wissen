import { useCallback, useEffect, useMemo, useState } from "react";
import { useD2 } from "../../lib/hooks";
import ShopWorker from "./shop-worker?worker"
import { ShopOptions, ShopResult } from "../../lib/shopsimulator/shopsimulator-model";
import { times } from "../../lib/util";
import { ShopWorkerMessage, StartMessage } from "./shop-worker";

type Result = {
  running: boolean;
  runs: number;
  results: {
    [k: string]: number;
  }
}

const workerCount = 8;

const shopOptions: ShopOptions = {
  clvlRange: [60, 99],
  itemtypes: ["armor"],
  vendors: [
    ["nightmare", "Gheed"],
    ["nightmare", "Charsi"],
    ["nightmare", "Drehya"],
    ["hell", "Gheed"],
    ["hell", "Charsi"],
    ["hell", "Drehya"],
  ]
}

function Shop() {
  const d2 = useD2();
  const [state, setState] = useState<Result>({
    running: false,
    runs: 0,
    results: {}
  });
  const workers = useMemo(() => times(workerCount, () => new ShopWorker()), [d2])
  useEffect(() => {
    function onResult({ data }: MessageEvent<ShopResult[]>) {
      for (const result of data) {
        for (const item of result.items)  {
          const prefixMod = item.prefix?.modifiers[0];
          const suffixMod = item.suffix?.modifiers[0];
          if ((prefixMod && prefixMod.code === "skilltab" && prefixMod.param === "0" && prefixMod.value === 3)
            && (suffixMod && suffixMod.code === "swing2" && suffixMod.value === 20)) {
              const key = `${result.clvl}-${result.difficulty}-${result.vendor}`;
              setState(prev => ({
                ...prev,
                results: {
                  ...prev.results,
                  [key]: (prev.results[key] ?? 0) + 1
                }
              }))
          }
        }
      }
      setState(prev => ({
        ...prev,
        runs: prev.runs + 1
      }))
    }
    for (const worker of workers) {
      worker.addEventListener("message", onResult)
    }
    return () => {
      console.log("removing...")
      for (const worker of workers) {
        worker.removeEventListener("message", onResult)
      }
    }
  }, [workers])

  const handleClick = useCallback(() => {
    if (state.running) {
      console.log("Stopping...")
      for (const worker of workers) {
        worker.postMessage({
          type: "stop"
        } as ShopWorkerMessage)
      }
    } else {
      const startMessage: StartMessage = {
        type: "start",
        d2, shopOptions
      }
      for (const worker of workers) {
        worker.postMessage(startMessage)
      }
    }
    setState(prev => ({
      ...prev,
      running: !prev.running
    }))
  }, [state.running])

  return (
    <div>
      <button onClick={handleClick}>
        {state.running
          ? "Cancel"
          : "Find bow 3/20"
        }
      </button>
      <div>Workers: {workers.length}</div>
      <div>Runs: {state.runs} </div>
      <div>Running: {String(state.running)}</div>
      <div>Results:</div>
      <div>
        <pre>
          {Object.entries(state.results).sort((a,b) => b[1] - a[1]).map(([key, val]) => (
            `${key}: ${val}\n`
          ))}
        </pre>
      </div>
    </div>
  )
}

export default Shop;