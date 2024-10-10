import type { GlobalToken } from '../../theme/internal';
export declare const TARGET_CLS = "ant-wave-target";
export type ShowWaveEffect = (element: HTMLElement, info: {
    className: string;
    token: GlobalToken;
    component?: string;
    event: MouseEvent;
    hashId: string;
}) => void;
export type ShowWave = (event: MouseEvent) => void;
