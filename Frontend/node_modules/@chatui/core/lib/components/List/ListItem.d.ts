import React from 'react';
interface ListItemPropsBase {
    className?: string;
    as?: React.ElementType;
    content?: React.ReactNode;
    rightIcon?: string;
    onClick?: (event: React.MouseEvent) => void;
}
interface ListItemPropsWithLink extends ListItemPropsBase {
    as: 'a';
    href: string;
}
export declare type ListItemProps = ListItemPropsBase | ListItemPropsWithLink;
export declare const ListItem: React.FC<ListItemProps>;
export {};
