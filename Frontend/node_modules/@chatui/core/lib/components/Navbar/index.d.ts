import React from 'react';
import { IconButtonProps } from '../IconButton';
export declare type NavbarProps = {
    title: string;
    className?: string;
    logo?: string;
    leftContent?: IconButtonProps;
    rightContent?: IconButtonProps[];
};
export declare const Navbar: React.FC<NavbarProps>;
