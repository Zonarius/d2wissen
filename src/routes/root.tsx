import '../assets/d2w.css'
import '../assets/d2wcolor.css'
import '../assets/d2wcustom.css'
import '../assets/d2-table.css'
import '@inovua/reactdatagrid-community/base.css'
import '@inovua/reactdatagrid-community/theme/default-dark.css'

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
