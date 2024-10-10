import React from 'react';
export declare type SystemMessageProps = {
    className?: string;
    content: string;
    action?: {
        text: string;
        onClick: (event: React.MouseEvent) => void;
    };
};
export declare const SystemMessage: React.FC<SystemMessageProps>;
