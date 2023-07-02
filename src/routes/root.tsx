import '../assets/d2w.css'
import '../assets/d2wcolor.css'
import '../assets/d2wcustom.css'
import '../assets/d2-table.css'
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';

import ModChooser from '../pages/ModChooser'

function Root() {
  return (
    <>
      {/* <ModChooser onChange={async files => setD2Files(await parseD2(files))} /> */}
      <ModChooser onChange={() => alert("NYI")} />
    </>
  )
}

export default Root
