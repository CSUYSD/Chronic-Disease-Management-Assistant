/// <reference types="react" />
interface BackBottomProps {
    count: number;
    onClick: () => void;
    onDidMount?: () => void;
}
export declare const BackBottom: ({ count, onClick, onDidMount }: BackBottomProps) => JSX.Element;
export {};
