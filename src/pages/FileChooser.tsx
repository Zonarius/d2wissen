import { useCallback, useState } from "react";

interface FileChooserProps {
    onChange(files: File[]): any;
}

function FileChooser(props: FileChooserProps) {
    const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(ev => {
        if (!ev.target.files) {
            return;
        }
        props.onChange([...ev.target.files]);
    }, []);
    return (
        <>
            <input id="modfolderChooser" type="file" webkitdirectory="true" onChange={handleChange}>
            </input>
        </>
    )
}

export default FileChooser;