import { combineReducers } from '@reduxjs/toolkit'
import chatReducer from './chatSlice'
import fileReducer from './fileSlice'
import profileReducer from './profileSlice'
// Import other reducers as needed

const appReducer = combineReducers({
    chat: chatReducer,
    file: fileReducer,
    profile: profileReducer
    // Add other reducers here
})

export const CLEAR_ALL_DATA = 'CLEAR_ALL_DATA'

export const clearAllData = () => ({ type: CLEAR_ALL_DATA })

const rootReducer = (state: any, action: any) => {
    if (action.type === CLEAR_ALL_DATA) {
        state = undefined
    }

    return appReducer(state, action)
}

export default rootReducer