import React from 'react';
export declare type AvatarSize = 'sm' | 'md' | 'lg';
export declare type AvatarShape = 'circle' | 'square';
export interface AvatarProps {
    className?: string;
    src?: string;
    alt?: string;
    url?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
}
export declare const Avatar: React.FC<AvatarProps>;
