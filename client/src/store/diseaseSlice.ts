import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface DiseaseState {
    selectedDisease: string | null
}

const initialState: DiseaseState = {
    selectedDisease: null
}

export const diseaseSlice = createSlice({
    name: 'disease',
    initialState,
    reducers: {
        setSelectedDisease: (state, action: PayloadAction<string | null>) => {
            state.selectedDisease = action.payload
        },
        clearSelectedDisease: (state) => {
            state.selectedDisease = null
        }
    }
})

export const { setSelectedDisease, clearSelectedDisease } = diseaseSlice.actions

export default diseaseSlice.reducer