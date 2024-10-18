import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'

interface ProfileState {
    profile: {
        username: string
        email: string | null
        role: 'companion' | 'patient'
        avatar: string | null
        dob: string | null
    } | null
    isLoading: boolean
    error: string | null
}

const initialState: ProfileState = {
    profile: null,
    isLoading: true,
    error: null
}

export const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<ProfileState['profile']>) => {
            console.log('Setting profile in Redux:', action.payload)
            state.profile = action.payload
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
        updateProfile: (state, action: PayloadAction<Partial<ProfileState['profile']>>) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload }
            }
        },
        clearProfile: (state) => {
            state.profile = null
            state.isLoading = false
            state.error = null
        }
    }
})

export const { setProfile, setLoading, setError, updateProfile, clearProfile } = profileSlice.actions

export const selectProfile = (state: RootState) => state.profile.profile
export const selectIsLoading = (state: RootState) => state.profile.isLoading
export const selectError = (state: RootState) => state.profile.error

export default profileSlice.reducer