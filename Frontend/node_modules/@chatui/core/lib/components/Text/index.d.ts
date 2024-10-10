import React from 'react';
export interface TextProps {
    className?: string;
    as?: React.ElementType;
    align?: 'left' | 'center' | 'right' | 'justify';
    breakWord?: boolean;
    truncate?: boolean | number;
}
export declare const Text: React.FC<TextProps>;
