import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './routes/error-page.tsx';
import Root from './routes/root.tsx';
import Mod from './routes/mod/mod.tsx';
import { modLoader } from './context/D2Context.ts';
import GlobalLoader from './routes/global-loader.tsx';
import Items from './routes/mod/items.tsx';
import Shop from './routes/mod/shop.tsx';
import TableFile from './routes/mod/table-file.tsx';
import { lastElement } from './lib/util.ts';
import ItemType from './routes/mod/item-type.tsx';
import { ExcelFileName } from './context/referenceBuilder.ts';

if (import.meta.hot) {
  import.meta.hot.on(
    "vite:beforeUpdate",
    () => console.clear()
  );
}

const paramHandle = (id: string) => ({ params }: any) => params[id];
const pathHandle = ({ pathname }: { pathname: string }) => lastElement(pathname.split("/"))

export const tableFiles: Record<string, ExcelFileName> = {
  "Item Types": "itemtypes",
  "Weapons": "weapons",
  "Armors": "armor",
  "Misc. Items": "misc",
  "Prefixes": "magicprefix",
  "Suffixes": "magicsuffix"
}
const tableFileRoutes = Object.entries(tableFiles)
  .map(([headline, file]) => ({
      path: file,
      handle: pathHandle,
      children: [{ index: true, element: <TableFile {...{ headline, file}} /> }, { path: ":code", element: <ItemType />, handle: paramHandle("code") }]
  }))

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <GlobalLoader />,
    handle: () => "home",
    children: [
      { index: true, element: <Root />},
      {
        path: ":mod",
        id: "mod",
        loader: ({ params }) => modLoader(params.mod!),
        handle: paramHandle("mod"),
        children: [
          { index: true, element: <Mod />},
          {
            path: "items",
            handle: pathHandle,
            children: [{ index: true, element: <Items />}]
          },
          {
            path: "shop",
            handle: pathHandle,
            children: [{ index: true, element: <Shop />}]
          },
          ...tableFileRoutes
        ]
      }
    ]
  }
], {basename: "/d2wissen"})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
