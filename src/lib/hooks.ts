import { useRouteLoaderData } from "react-router-dom";
import { D2Context } from "../context/D2Context";

export function useD2() {
  return useRouteLoaderData("mod") as D2Context;
}