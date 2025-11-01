declare module "@uiw/react-markdown-editor" {
  import * as React from "react";
  export interface MarkdownEditorProps {
    value?: string;
    height?: string | number;
    onChange?: (value: string) => void;
    className?: string;
  }
  const MarkdownEditor: React.FC<MarkdownEditorProps>;
  export default MarkdownEditor;
}
