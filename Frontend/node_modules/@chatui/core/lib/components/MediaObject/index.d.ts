import React from 'react';
export declare type MediaObjectProps = {
    className?: string;
    picUrl?: string;
    picAlt?: string;
    picSize?: 'sm' | 'md' | 'lg';
    title?: string;
    meta?: React.ReactNode;
};
export declare const MediaObject: React.FC<MediaObjectProps>;
