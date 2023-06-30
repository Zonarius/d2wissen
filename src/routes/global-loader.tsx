import { Link, Outlet, Params, useMatches, useNavigation } from "react-router-dom";

function GlobalLoader() {
  const nav = useNavigation();
  nav.state === "loading";
  return (
    <>
        <Breadcrumb />
        <Outlet />
        <div className={
            nav.state === "loading" ? "loading-overlay" : ""
        }></div>
    </>
  )
}

function Breadcrumb() {
  const matches = useMatches();
  const crumbs = matches
    .filter(m => m.handle)
    .map(match => ({
      id: match.id,
      handle: (match.handle as any)(match) as string,
      pathname: match.pathname
    }))
  return (
    <ol className="breadcrumb">
      {crumbs.map(m => (
        <li key={m.id}><Link to={m.pathname}>{m.handle}</Link></li>
      ))}
    </ol>
  )
}

export default GlobalLoader;