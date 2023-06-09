import { useCallback, useRef } from "react";
import { getModFiles, listMods } from "../context/staticContext";
import { FileLike } from "../lib/d2Parser";

interface ModChooserProps {
    onChange(files: FileLike[]): any;
}

function ModChooser(props: ModChooserProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(ev => {
        if (!ev.target.files) {
            return;
        }
        props.onChange([...ev.target.files]);
    }, []);
    const handleUpload = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    }, [])
    return (
        <>
            <h1>Mods</h1>
            <ul>
                <StaticMods {...props} />
                <a href="#" onClick={handleUpload}><li>Upload...</li></a>
            </ul>
            <input ref={inputRef} style={{display: "none"}} id="modfolderChooser" type="file" 
            /* @ts-expect-error */
            directory="" webkitdirectory=""
            onChange={handleChange}>
            </input>
        </>
    )
}

function StaticMods(props: ModChooserProps) {
    const loadMod = useCallback((mod: string) => {
        props.onChange(getModFiles(mod));
    }, []);
    const mods = listMods();
    return (
        <>
            {mods.map(mod => (
                <a key={mod} href="#" onClick={() => loadMod(mod)}><li>{mod}</li></a>
            ))}
        </>
    )
}

export default ModChooser;