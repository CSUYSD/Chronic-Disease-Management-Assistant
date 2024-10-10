import React from 'react';
import { InputProps } from '../Input';
interface ComposerInputProps extends InputProps {
    invisible: boolean;
    inputRef: React.MutableRefObject<HTMLTextAreaElement>;
    onImageSend?: (file: File) => Promise<any>;
}
export declare const ComposerInput: ({ inputRef, invisible, onImageSend, ...rest }: ComposerInputProps) => JSX.Element;
export {};
