import React from 'react'
import ReactDOM from 'react-dom/client'
import { Params, RouterProvider, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './routes/error-page.tsx';
import Root from './routes/root.tsx';
import Mod from './routes/mod/mod.tsx';
import { modLoader } from './context/D2Context.ts';
import GlobalLoader from './routes/global-loader.tsx';
import Items from './routes/mod/items.tsx';
import Shop from './routes/mod/shop.tsx';
import ItemTypes from './routes/mod/item-types/item-types.tsx';
import { lastElement } from './lib/util.ts';
import ItemType from './routes/mod/item-types/item-type.tsx';

if (import.meta.hot) {
  import.meta.hot.on(
    "vite:beforeUpdate",
    () => console.clear()
  );
}

const paramHandle = (id: string) => ({ params }: any) => params[id];
const pathHandle = ({ pathname }: { pathname: string }) => lastElement(pathname.split("/"))

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
          {
            path: "itemtypes",
            handle: pathHandle,
            children: [{ index: true, element: <ItemTypes /> }, { path: ":code", element: <ItemType />, handle: paramHandle("code") }]
          }
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
