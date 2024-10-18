import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface FileMetadata {
    name: string;
    size: number;
    type: string;
}

interface FileState {
    uploadedFile: FileMetadata | null;
}

const initialState: FileState = {
    uploadedFile: null
}

const fileSlice = createSlice({
    name: 'file',
    initialState,
    reducers: {
        setUploadedFile: (state, action: PayloadAction<FileMetadata>) => {
            state.uploadedFile = action.payload;
        },
        clearUploadedFile: (state) => {
            state.uploadedFile = null;
        }
    }
})

export const { setUploadedFile, clearUploadedFile } = fileSlice.actions;

// Encapsulated selector function
export const useUploadedFile = () => useSelector((state: RootState) => state.file.uploadedFile)

export default fileSlice.reducer;