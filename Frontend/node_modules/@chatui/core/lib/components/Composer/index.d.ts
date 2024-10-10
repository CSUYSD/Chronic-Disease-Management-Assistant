import React from 'react';
import { IconButtonProps } from '../IconButton';
import { RecorderProps } from '../Recorder';
import { ToolbarItemProps } from '../Toolbar';
import { InputProps } from '../Input';
export declare const CLASS_NAME_FOCUSING = "S--focusing";
export declare type InputType = 'voice' | 'text';
export declare type ComposerProps = {
    wideBreakpoint?: string;
    text?: string;
    inputOptions?: InputProps;
    placeholder?: string;
    inputType?: InputType;
    onInputTypeChange?: (inputType: InputType) => void;
    recorder?: RecorderProps;
    onSend: (type: string, content: string) => void;
    onImageSend?: (file: File) => Promise<any>;
    onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
    onChange?: (value: string, event: React.ChangeEvent<Element>) => void;
    onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
    toolbar?: ToolbarItemProps[];
    onToolbarClick?: (item: ToolbarItemProps, event: React.MouseEvent) => void;
    onAccessoryToggle?: (isAccessoryOpen: boolean) => void;
    rightAction?: IconButtonProps;
};
export interface ComposerHandle {
    setText: (text: string) => void;
}
export declare const Composer: React.ForwardRefExoticComponent<ComposerProps & React.RefAttributes<ComposerHandle>>;
