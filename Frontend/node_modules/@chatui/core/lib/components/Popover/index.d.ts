import React from 'react';
export declare type PopoverProps = {
    className?: string;
    active: boolean;
    target: HTMLElement;
    onClose: () => void;
};
export declare const Popover: React.FC<PopoverProps>;
