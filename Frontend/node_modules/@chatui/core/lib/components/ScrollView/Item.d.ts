import React from 'react';
export declare type ScrollViewEffect = 'slide' | 'fade' | '';
export declare type ScrollViewItemProps = {
    item: any;
    effect?: ScrollViewEffect;
    onIntersect?: (item?: any, entry?: IntersectionObserverEntry) => boolean | void;
};
export declare const Item: React.FC<ScrollViewItemProps>;
