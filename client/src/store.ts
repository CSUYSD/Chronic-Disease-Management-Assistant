import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'

import chatReducer from '@/store/chatSlice'
import fileReducer from '@/store/fileSlice'
import profileReducer from '@/store/profileSlice'
import diseaseReducer from '@/store/diseaseSlice'
import warningRecordsReducer from "@/store/warningRecordsSlice";

const persistConfig = {
    key: 'root',
    storage,
    // persist these data in the localstorage
    whitelist: ['chat', 'file', 'profile' , 'disease']
}

const rootReducer = combineReducers({
    chat: chatReducer,
    file: fileReducer,
    profile: profileReducer,
    disease: diseaseReducer,
    warningRecords: warningRecordsReducer
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