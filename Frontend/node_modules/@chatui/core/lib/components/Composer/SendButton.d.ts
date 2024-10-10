import React from 'react';
interface SendButtonProps {
    disabled: boolean;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
export declare const SendButton: ({ disabled, onClick }: SendButtonProps) => JSX.Element;
export {};
