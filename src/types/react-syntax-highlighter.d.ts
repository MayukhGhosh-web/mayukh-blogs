declare module "react-syntax-highlighter" {
  import * as React from "react";

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: React.ReactNode;
    PreTag?: keyof JSX.IntrinsicElements;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    lineProps?: any;
  }

  export class Prism extends React.Component<SyntaxHighlighterProps> {}
  export class Light extends React.Component<SyntaxHighlighterProps> {}
  export const SyntaxHighlighter: typeof Prism;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const oneDark: any;
  export const oneLight: any;
  export const atomDark: any;
  export const vscDarkPlus: any;
  export const dracula: any;
  export const duotoneDark: any;
  export const duotoneLight: any;
  export const prism: any;
  export const twilight: any;
}
