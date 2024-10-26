import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'

interface ProfileData {
    username: string
    email?: string | null
    role: 'companion' | 'patient'
    avatar?: string | null
    dob?: string | null
    phone?: string | null
    bio?: string | null
}

interface ProfileState {
    data: ProfileData | null
    isLoading: boolean
    error: string | null
}

const initialState: ProfileState = {
    data: null,
    isLoading: true,
    error: null
}

export const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<ProfileData>) => {
            console.log('Setting profile in Redux:', action.payload)
            state.data = action.payload
            state.isLoading = false
            state.error = null
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.isLoading = false
        },
        updateProfile: (state, action: PayloadAction<Partial<ProfileData>>) => {
            if (state.data) {
                state.data = { ...state.data, ...action.payload }
            }
        },
        clearProfile: (state) => {
            state.data = null
            state.isLoading = false
            state.error = null
        }
    }
})

export const { setProfile, setLoading, setError, updateProfile, clearProfile } = profileSlice.actions

export const selectProfile = (state: RootState) => state.profile.data
export const selectIsLoading = (state: RootState) => state.profile.isLoading
export const selectError = (state: RootState) => state.profile.error

export default profileSlice.reducer