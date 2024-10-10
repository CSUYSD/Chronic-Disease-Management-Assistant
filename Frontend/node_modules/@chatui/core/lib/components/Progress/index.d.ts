import React from 'react';
export declare type ProgressProps = {
    className?: string;
    value: number;
    status?: 'active' | 'success' | 'error';
};
export declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
