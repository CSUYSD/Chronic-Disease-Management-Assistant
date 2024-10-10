import React from 'react';
export interface RecorderHandle {
    stop: () => void;
}
export interface RecorderProps {
    canRecord?: boolean;
    volume?: number;
    onStart?: () => void;
    onEnd?: (data: {
        duration: number;
    }) => void;
    onCancel?: () => void;
    ref?: React.MutableRefObject<RecorderHandle>;
}
export declare const Recorder: React.ForwardRefExoticComponent<Pick<RecorderProps, "onCancel" | "canRecord" | "volume" | "onStart" | "onEnd"> & React.RefAttributes<RecorderHandle>>;
