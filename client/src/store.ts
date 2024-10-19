import { configureStore } from '@reduxjs/toolkit'
import chatReducer from '@/store/chatSlice'
import fileReducer from '@/store/fileSlice'
import profileReducer from '@/store/profileSlice'
import reportReducer from '@/store/reportSlice'

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        file: fileReducer,
        profile: profileReducer,
        report: reportReducer
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch