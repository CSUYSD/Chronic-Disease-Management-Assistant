import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { combineReducers } from 'redux'

import chatReducer from '@/store/chatSlice'
import fileReducer from '@/store/fileSlice'
import profileReducer from '@/store/profileSlice'
import diseaseReducer from '@/store/diseaseSlice'

const persistConfig = {
    key: 'root',
    storage,
    // If you want to persist only specific reducers, list them here:
    whitelist: ['chat', 'file', 'profile' , 'disease']
}

const rootReducer = combineReducers({
    chat: chatReducer,
    file: fileReducer,
    profile: profileReducer,
    disease: diseaseReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
            },
        }),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch