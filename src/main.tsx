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
import { Predicate, entries, lastElement } from './lib/util.ts';
import ItemType from './routes/mod/item-type.tsx';
import { ExcelFileName, Row } from './context/referenceBuilder.ts';
import Affix from './routes/mod/affix.tsx';
import { D2Affix } from './lib/d2Parser.ts';
import AffixGroup from './routes/mod/affix-group.tsx';
import GheedHelper from './routes/mod/projectd2/gheed-helper.tsx';
import { CssVarsProvider } from '@mui/joy/styles';
import theme from './theme.ts';
import Property from './routes/mod/property.tsx';
import Search from './routes/mod/search.tsx';
import Armor from './routes/mod/armor.tsx';

if (import.meta.hot) {
  import.meta.hot.on(
    "vite:beforeUpdate",
    () => console.clear()
  );
}

const paramHandle = (id: string) => ({ params }: any) => params[id];
const pathHandle = ({ pathname }: { pathname: string }) => lastElement(pathname.split("/"))

type TableFileParams<F extends ExcelFileName> = {
  title: string;
  element?: React.ReactNode;
  additionalIdColumns?: string[];
  filter?: Predicate<Row<F>>
}

export const affixFilter: Predicate<D2Affix> = row => row.spawnable === "1" && row.frequency && Number(row.frequency) > 0;

type TableFiles = {
  [F in ExcelFileName]?: TableFileParams<F>;
}
export const tableFiles: TableFiles = {
  itemtypes: {
    title: "Item Types",
    element: <ItemType />
  },
  weapons: {
    title: "Weapons",
  },
  armor: {
    title: "Armors",
    element: <Armor />
  },
  misc: {
    title: "Misc. Items",
  },
  magicprefix: {
    title: "Prefixes",
    additionalIdColumns: ["Name"],
    element: <Affix affixType="prefix" />,
    filter: affixFilter
  },
  magicsuffix: {
    title: "Suffixes",
    additionalIdColumns: ["Name"],
    element: <Affix affixType="suffix" />,
    filter: affixFilter
  },
  properties: {
    title: "Properties",
    element: <Property />
  },
  itemstatcost: {
    title: "Stats"
  },
  uniqueitems: {
    title: "Uniques"
  },
  runes: {
    title: "Runewords",
  },
  setitems: {
    title: "Set Items"
  },
  sets: {
    title: "Sets"
  }
};

const tableFileRoutes = entries(tableFiles)
  .map(([file, {title, element, additionalIdColumns, filter }]) => ({
      path: file,
      handle: pathHandle,
      children: [
        { index: true, element: <TableFile {...{ title, file, additionalIdColumns, filter: filter as any }} /> },
        { path: ":id", element: element || null, handle: paramHandle("id")}
      ]
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
          {
            path: "affixgroup",
            handle: pathHandle,
            children: [{ path: ":id", element: <AffixGroup />}]
          },
          {
            path: "gheed",
            handle: pathHandle,
            children: [{ index: true, element: <GheedHelper />}]
          },
          {
            path: "search",
            handle: pathHandle,
            children: [{ index: true, element: <Search />}]
          },
          ...tableFileRoutes
        ]
      }
    ]
  }
], {basename: "/d2wissen"})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <CssVarsProvider defaultMode="dark" theme={theme}>
      <RouterProvider router={router} />
    </CssVarsProvider>
  </React.StrictMode>,
)
