import React from 'react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    label?: string;
    color?: 'primary';
    variant?: 'text' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    block?: boolean;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
export declare const Button: (props: ButtonProps) => JSX.Element;
