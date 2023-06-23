import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './routes/error-page.tsx';
import Root from './routes/root.tsx';
import Mod from './routes/mod/mod.tsx';
import RuneWords from './routes/mod/runewords.tsx';
import { modLoader } from './context/D2Context.ts';
import GlobalLoader from './routes/global-loader.tsx';
import Items from './routes/mod/items.tsx';

if (import.meta.hot) {
  import.meta.hot.on(
    "vite:beforeUpdate",
    () => console.clear()
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <GlobalLoader />,
    children: [
      { index: true, element: <Root />},
      {
        path: ":mod",
        id: "mod",
        loader: ({ params }) => modLoader(params.mod!),
        children: [
          { index: true, element: <Mod />},
          {
            path: "runewords",
            children: [{ index: true, element: <RuneWords />}]
          },
          {
            path: "items",
            children: [{ index: true, element: <Items />}]
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
