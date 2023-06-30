import { useCallback, useEffect, useMemo, useState } from "react";
import { useD2 } from "../../lib/hooks";
import ShopWorker from "./shop-worker?worker"
import { ShopOptions } from "../../lib/shopsimulator/shopsimulator-model";
import { times } from "../../lib/util";
import { ShopWorkerMessage, StartMessage } from "./shop-worker";

type Result = {
  running: boolean;
  found: number;
  results: {
    [k: string]: number;
  }
}

const workerCount = 8;

const shopOptions: ShopOptions = {
  clvlRange: [60, 99],
  itemtypes: ["armor"],
  vendors: [
    ["nightmare", "Gheed"]
  ]
}

function Shop() {
  const d2 = useD2();
  const [state, setState] = useState<Result>({
    running: false,
    found: 0,
    results: {}
  });
  const workers = useMemo(() => times(workerCount, () => new ShopWorker()), [d2])
  useEffect(() => {
    function onResult({ data }: MessageEvent<string[]>) {
      for (const key of data) {
        setState(prev => ({
          ...prev,
          results: {
            ...prev.results,
            [key]: (prev.results[key] ?? 0) + 1
          }
        }))
      }
      setState(prev => ({
        ...prev,
        found: prev.found + 1
      }))
    }
    for (const worker of workers) {
      worker.addEventListener("message", onResult)
    }
    return () => {
      for (const worker of workers) {
        worker.removeEventListener("message", onResult)
      }
    }
  }, [workers])

  const handleClick = useCallback(() => {
    if (state.running) {
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
      <div>Found: {state.found} </div>
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