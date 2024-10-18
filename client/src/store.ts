import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './store/chatSlice'
import fileReducer from './store/fileSlice'

export const store = configureStore({
    reducer: {
        chat: chatReducer,
        file: fileReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch