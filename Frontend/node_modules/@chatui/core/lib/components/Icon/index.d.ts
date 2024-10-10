import React from 'react';
export declare type IconProps = React.SVGProps<SVGSVGElement> & {
    type: string;
    className?: string;
    name?: string;
    spin?: boolean;
};
export declare const Icon: React.FC<IconProps>;
