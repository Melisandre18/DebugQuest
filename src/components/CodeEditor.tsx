import Editor, { type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
}

export default function CodeEditor({
  value,
  onChange,
  language = "javascript",
  height = "100%",
  readOnly = false,
}: Props) {
  const handleMount: OnMount = (editor, monaco) => {
    // Remove default keybinding that conflicts with browser shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});
  };

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme="vs-dark"
      onMount={handleMount}
      onChange={(val) => onChange(val ?? "")}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        readOnly,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: "line",
        smoothScrolling: true,
      }}
      loading={
        <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    />
  );
}
