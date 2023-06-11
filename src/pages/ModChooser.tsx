import { useCallback, useRef } from "react";
import { listMods } from "../context/staticContext";
import { FileLike } from "../lib/d2Parser";
import { Link } from "react-router-dom";

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
                <StaticMods />
                <a href="__loaded" onClick={handleUpload}><li>Load...</li></a>
            </ul>
            <input ref={inputRef} style={{display: "none"}} id="modfolderChooser" type="file" 
            /* @ts-expect-error */
            directory="" webkitdirectory=""
            onChange={handleChange}>
            </input>
        </>
    )
}

function StaticMods() {
    const mods = listMods();
    return (
        <>
            {mods.map(mod => (
                <Link key={mod} to={mod}><li>{mod}</li></Link>
            ))}
        </>
    )
}

export default ModChooser;