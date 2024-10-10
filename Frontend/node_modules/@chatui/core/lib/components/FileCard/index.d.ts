import React from 'react';
export interface FileCardProps {
    className?: string;
    file: File;
    extension?: string;
}
export declare const FileCard: React.FC<FileCardProps>;
