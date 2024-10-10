/// <reference types="react" />
export declare type IMessageStatus = 'pending' | 'sent' | 'fail';
declare type StatusType = '' | 'loading' | 'fail';
export interface MessageStatusProps {
    status: IMessageStatus;
    delay?: number;
    maxDelay?: number;
    onRetry?: () => void;
    onChange?: (type: StatusType) => void;
}
export declare const MessageStatus: ({ status, delay, maxDelay, onRetry, onChange, }: MessageStatusProps) => JSX.Element | null;
export {};
