/// <reference types="react" />
declare type Container = React.RefObject<any> | Element | (() => Element) | null;
export interface PortalProps {
    container?: Container;
    onRendered?: () => void;
}
export declare const Portal: React.FC<PortalProps>;
export {};
