import Editor from "@monaco-editor/react";

interface Props {
    value?: string;
    onChange: (v:string)=>void;
    language: string
}

const CodeEditor = ({ value, onChange, language = "javascript" }: Props) => {
    const handleEditorChange = (newValue?: string) => {
        onChange(newValue || "");
    };

    return (
        <Editor
            className="border rounded-sm overflow-hidden"
            height="200px"
            defaultLanguage={language}
            value={value}
            onChange={handleEditorChange}
            options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                automaticLayout: true,
                fontSize: 14,
                fontFamily: "monospace",
                theme: "vs-light",
            }}
        />
    );
};

export default CodeEditor;
