// src/store/chatSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'

export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    isReport?: boolean;
    timestamp: string;
}

export interface Chat {
    id: string;
    name: string;
    messages: Message[];
}

interface ChatState {
    chats: Chat[];
    currentChatId: string;
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
        },
        addMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
            const chat = state.chats.find(chat => chat.id === action.payload.chatId)
            if (chat) {
                chat.messages.push(action.payload.message)
            }
        },
        clearMessages: (state, action: PayloadAction<string>) => {
            const chat = state.chats.find(chat => chat.id === action.payload)
            if (chat) {
                chat.messages = []
            }
        }
    }
})

export const {
    addChat,
    updateChat,
    deleteChat,
    setCurrentChatId,
    addMessage,
    clearMessages
} = chatSlice.actions

// Selectors
export const selectChats = (state: RootState) => state.chat.chats
export const selectCurrentChatId = (state: RootState) => state.chat.currentChatId
export const selectCurrentChat = (state: RootState) => {
    const currentChatId = state.chat.currentChatId
    return state.chat.chats.find(chat => chat.id === currentChatId)
}

export default chatSlice.reducer