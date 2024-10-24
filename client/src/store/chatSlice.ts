import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface Message {
    id: number
    text: string
    sender: 'user' | 'ai'
}

interface Chat {
    id: string
    name: string
    messages: Message[]
}

interface ChatState {
    chats: Chat[]
    currentChatId: string
}

const initialState: ChatState = {
    chats: [],
    currentChatId: ''
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addChat: (state, action: PayloadAction<Chat>) => {
            state.chats.push(action.payload)
        },
        updateChat: (state, action: PayloadAction<{ id: string; changes: Partial<Chat> }>) => {
            const { id, changes } = action.payload
            const chatIndex = state.chats.findIndex(chat => chat.id === id)
            if (chatIndex !== -1) {
                state.chats[chatIndex] = { ...state.chats[chatIndex], ...changes }
            }
        },
        deleteChat: (state, action: PayloadAction<string>) => {
            state.chats = state.chats.filter(chat => chat.id !== action.payload)
        },
        setCurrentChatId: (state, action: PayloadAction<string>) => {
            state.currentChatId = action.payload
        }
    }
})

export const { addChat, updateChat, deleteChat, setCurrentChatId } = chatSlice.actions

// Encapsulated selector functions
export const useChats = () => useSelector((state: RootState) => state.chat.chats)
export const useCurrentChatId = () => useSelector((state: RootState) => state.chat.currentChatId)
export const useCurrentChat = () => useSelector((state: RootState) => {
    const currentChatId = state.chat.currentChatId
    return state.chat.chats.find(chat => chat.id === currentChatId) || state.chat.chats[0]
})

export default chatSlice.reducer