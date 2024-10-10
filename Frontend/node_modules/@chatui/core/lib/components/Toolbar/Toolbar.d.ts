import React from 'react';
import { ToolbarItemProps } from './ToolbarButton';
export interface ToolbarProps {
    items: ToolbarItemProps[];
    onClick: (item: ToolbarItemProps, event: React.MouseEvent) => void;
}
export declare const Toolbar: React.FC<ToolbarProps>;
