import React from 'react';
export declare type RadioValue = string | number | undefined;
export declare type RadioProps = React.InputHTMLAttributes<HTMLInputElement> & {
    value?: RadioValue;
    label?: RadioValue;
};
export declare const Radio: React.FC<RadioProps>;
