import { useState } from 'react'
import './d2w.css'
import './d2wcolor.css'
import ModChooser from './pages/ModChooser'
import {D2Files, parseD2 } from './lib/d2Parser';
import RuneWords from './pages/RuneWords';
import { D2Context, createItemStatCostsByStat, createItemsByCode, createPropertiesByCode, createSkillsBySkilldesc } from './context/D2Context';
import { createTranslations } from './lib/translation';

function App() {
  const [d2Files, setD2Files] = useState<D2Files | undefined>(undefined);
  return (
    <>
        {d2Files 
          ? (
            <D2Context.Provider value={{
              lang: "deDE",
              translations: createTranslations(d2Files),
              itemsByCode: createItemsByCode(d2Files),
              propertiesByCode: createPropertiesByCode(d2Files),
              itemStatCostsByStat: createItemStatCostsByStat(d2Files),
              skillsBySkilldesc: createSkillsBySkilldesc(d2Files),
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

export default App
