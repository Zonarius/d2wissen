import { Outlet, useNavigation } from "react-router-dom";

function GlobalLoader() {
  const nav = useNavigation();
  nav.state === "loading";
  return (
    <>
        <Outlet />
        <div className={
            nav.state === "loading" ? "loading-overlay" : ""
        }></div>
    </>
  )
}

export default GlobalLoader;