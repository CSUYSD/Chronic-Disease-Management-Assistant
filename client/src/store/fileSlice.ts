import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface FileMetadata {
    name: string;
    size: number;
    type: string;
}

interface FileState {
    uploadedFiles: FileMetadata[];
}

const initialState: FileState = {
    uploadedFiles: []
}

const fileSlice = createSlice({
    name: 'file',
    initialState,
    reducers: {
        setUploadedFiles: (state, action: PayloadAction<FileMetadata[]>) => {
            state.uploadedFiles = action.payload;
        },
        addUploadedFile: (state, action: PayloadAction<FileMetadata>) => {
            state.uploadedFiles.push(action.payload);
        },
        removeUploadedFile: (state, action: PayloadAction<FileMetadata>) => {
            state.uploadedFiles = state.uploadedFiles.filter(
                file => file.name !== action.payload.name || file.size !== action.payload.size
            );
        },
        clearUploadedFiles: (state) => {
            state.uploadedFiles = [];
        }
    }
})

export const { setUploadedFiles, addUploadedFile, removeUploadedFile, clearUploadedFiles } = fileSlice.actions;

// Encapsulated selector function
export const useUploadedFiles = () => useSelector((state: RootState) => state.file.uploadedFiles)

export default fileSlice.reducer;