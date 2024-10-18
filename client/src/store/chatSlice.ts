import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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

export default chatSlice.reducer