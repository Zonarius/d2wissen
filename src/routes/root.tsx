import { useState } from 'react'
import '../assets/d2w.css'
import '../assets/d2wcolor.css'
import ModChooser from '../pages/ModChooser'
import {D2Files, parseD2 } from '../lib/d2Parser';
import RuneWords from './mod/runewords';
import { D2Context, createRefs } from '../context/D2Context';
import { createTranslations } from '../lib/translation/translation';

function Root() {
  const [d2Files, setD2Files] = useState<D2Files | undefined>(undefined);
  return (
    <>
        {d2Files 
          ? (
            <D2Context.Provider value={{
              lang: "deDE",
              translations: createTranslations(d2Files),
              refs: createRefs(d2Files),
              data: d2Files
              }}>
              <RuneWords />
            </D2Context.Provider>
          )
          : <>
            <ModChooser onChange={async files => setD2Files(await parseD2(files))} />
          </>
        }
        
    </>
  )
}

export default Root
