import { BeforeMount, Editor, EditorProps, OnMount } from "@monaco-editor/react";
import { MarkerSeverity, editor } from 'monaco-editor';
import { useCallback, useState } from "react";
import filterItemCode from "./filterItem.d.ts?raw";
import { Item } from "./filterItem";
import ts from 'typescript';

const editorProps: EditorProps = {
  height: "200px",
  theme: "vs-dark",
  defaultLanguage: "typescript",
  line: 6
};

const defaultFilterCode = 'import { Item } from "filter";\n\n' + 
`export default function filter(item: Item): boolean {
  return true;
}`

export type ItemFilter = (item: Item) => boolean
export interface FilterProps {
  onChange?(filter: ItemFilter): void;
}


export function FilterPopout(props: FilterProps) {
  const [hidden, setHidden] = useState(false);
  const display = hidden ? "none": "block";
  const handleClick = useCallback(() => {
    setHidden(!hidden);
  }, [hidden])
  return (
    <div>
      <h4 onClick={handleClick} style={{cursor: "pointer"}}>Filter {hidden ? ">" : "v"}</h4>
      <div style={{display, marginBottom: "20px"}}><Filter {...props}/></div>
    </div>
  )
}

const monacoSetup: BeforeMount = (monaco) => {
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    `declare module 'filter' { ${filterItemCode} }`,
    'file:///node_modules/filter/index.d.ts' // irrelevant?
  );
}

const editorSetup: OnMount = (editor, monaco) => {
  editor.setSelection(new monaco.Range(4, 10, 4, 14));
  editor.focus();
}

export function Filter(props: FilterProps) {
  const [code, setCode] = useState<string | undefined>(defaultFilterCode);
  const handleValidate = useCallback<(markers: editor.IMarker[], code: string) => void>((markers, code) => {
    if (!props.onChange) {
      return;
    }

    if (markers.some(marker => marker.severity === MarkerSeverity.Error)) {
      return;
    }

    const filter = compileFilter(code!);
    props.onChange(filter);
  }, [props.onChange])
  return <Editor 
    {...editorProps}
    value={code}
    beforeMount={monacoSetup}
    onMount={editorSetup}
    onValidate={markers => handleValidate(markers, code!)}
    onChange={setCode}
  />;
}

function compileFilter(code: string): ItemFilter {
  const program = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.None } });
  const mod = eval(`(() => { const exports = {};\n${program.outputText}\nreturn exports; })()`);
  return mod.default;
}