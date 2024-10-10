import React from 'react';
export declare type FormItemProps = {
    label?: string | React.ReactNode;
    help?: string;
    required?: boolean;
    invalid?: boolean;
    hidden?: boolean;
};
export declare const FormItem: React.FC<FormItemProps>;
