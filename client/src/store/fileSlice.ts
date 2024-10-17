import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
export default fileSlice.reducer;