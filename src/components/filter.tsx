import { BeforeMount, Editor, EditorProps, OnMount } from "@monaco-editor/react";
import { useCallback, useEffect, useState } from "react";
import filterItemCode from "./filterItem.ts?raw";
import { Item } from "./filterItem";
import ts from 'typescript';
import { useDebounce } from "../lib/hooks";

const editorProps: EditorProps = {
  height: "200px",
  theme: "vs-dark",
  defaultLanguage: "typescript",
};

const defaultFilterCode = 'import { Item } from "filter";\n\n' + 
`export function filter(item: Item): boolean {
  return item.name.toLocaleLowerCase().includes("");
}

export function sort(a: Item, b: Item): number {
  return b.stats.ias.max - a.stats.ias.max;
}
`

export type ItemFilter = {
  filter(item: Item): boolean;
  sort(a: Item, b: Item): number;
}

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
  editor.setPosition(new monaco.Position(4, 50));
  editor.focus();
}

export function Filter(props: FilterProps) {
  const [value, setValue] = useState<string>(defaultFilterCode)
  const debouncedValue = useDebounce<string>(value, 500)

  useEffect(() => {
    if (!props.onChange) {
      return;
    }

    const filter = compileFilter(value!);
    if (filter) {
      props.onChange(filter);
    }
  }, [debouncedValue]);

  return <Editor 
    {...editorProps}
    defaultValue={defaultFilterCode}
    beforeMount={monacoSetup}
    onMount={editorSetup}
    onChange={val => typeof val === "string" ? setValue(val) : null}
  />;
}

function compileFilter(code: string): ItemFilter | undefined {
  const program = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.None } });
  try {
    const mod = eval(`(() => { const exports = {};\n${program.outputText}\nreturn exports; })()`);
    return mod;
  } catch (err) {
    return undefined;
  }
}