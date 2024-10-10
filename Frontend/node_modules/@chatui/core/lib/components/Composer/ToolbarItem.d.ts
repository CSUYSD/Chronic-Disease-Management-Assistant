import React from 'react';
import { ToolbarItemProps } from '../Toolbar';
declare type IToolbarItem = {
    item: ToolbarItemProps;
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};
export declare const ToolbarItem: React.FC<IToolbarItem>;
export {};
