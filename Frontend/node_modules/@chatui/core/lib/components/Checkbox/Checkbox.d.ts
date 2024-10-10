import React from 'react';
export declare type CheckboxValue = string | number | undefined;
export declare type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
    value?: CheckboxValue;
    label?: CheckboxValue;
};
export declare const Checkbox: React.FC<CheckboxProps>;
