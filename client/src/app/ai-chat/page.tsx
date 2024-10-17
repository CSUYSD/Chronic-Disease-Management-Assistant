'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Bot, User, Paperclip, X, Lightbulb, Plus, MoreHorizontal, MessageSquare, ChevronDown } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FluxMessageWithHistoryAPI, UploadFileAPI, ClearFileAPI, ChatWithFileAPI } from '@/api/ai'


interface Message {
    id: number
    text: string
    sender: 'user' | 'ai'
    file?: File
}

interface Chat {
    id: number
    name: string
    messages: Message[]
}

const suggestedPrompts = [
    "What are the symptoms of diabetes?",
    "How can I improve my sleep quality?",
    "What's a balanced diet for heart health?",
    "Can you explain the importance of regular exercise?",
]

export default function AiChatPage() {
    const [chats, setChats] = useState<Chat[]>([{ id: 1, name: 'New Chat', messages: [] }])
    const [currentChatId, setCurrentChatId] = useState(1)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [isRenaming, setIsRenaming] = useState(false)
    const [newChatName, setNewChatName] = useState('')
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [chats])

    const currentChat = chats.find(chat => chat.id === currentChatId) || chats[0]

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!input.trim() && files.length === 0) return

        const newMessage: Message = {
            id: currentChat.messages.length + 1,
            text: input,
            sender: 'user',
        }

        if (files.length > 0) {
            newMessage.file = files[0]
            await handleFileUpload(files[0])
        }

        const updatedChats = chats.map(chat =>
            chat.id === currentChatId
                ? { ...chat, messages: [...chat.messages, newMessage] }
                : chat
        )

        setChats(updatedChats)
        setInput('')
        setFiles([])
        setIsTyping(true)

        try {
            let response;
            if (files.length > 0) {
                response = await ChatWithFileAPI(new URLSearchParams({
                    prompt: input,
                    sessionId: currentChatId.toString()
                }))
            } else {
                response = await FluxMessageWithHistoryAPI({
                    prompt: input,
                    sessionId: currentChatId.toString()
                })
            }

            const reader = response.data.getReader()
            const decoder = new TextDecoder()
            let aiResponse = ''

            const aiMessage: Message = {
                id: currentChat.messages.length + 2,
                text: '',
                sender: 'ai'
            }

            const updatedChatsWithAiReply = updatedChats.map(chat =>
                chat.id === currentChatId
                    ? { ...chat, messages: [...chat.messages, aiMessage] }
                    : chat
            )
            setChats(updatedChatsWithAiReply)

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.slice(5).trim()
                        if (data !== '') {
                            aiResponse += data + ' '
                            setChats(prevChats =>
                                prevChats.map(chat =>
                                    chat.id === currentChatId
                                        ? {
                                            ...chat,
                                            messages: chat.messages.map(msg =>
                                                msg.id === aiMessage.id
                                                    ? { ...msg, text: aiResponse.trim() }
                                                    : msg
                                            )
                                        }
                                        : chat
                                )
                            )
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error getting AI response:', error)
            // 处理错误，可能显示一个错误消息给用户
        } finally {
            setIsTyping(false)
        }
    }

    const handleFileUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)

        try {
            await UploadFileAPI(formData)
            console.log('File uploaded successfully')
            // 可能需要更新UI来显示文件上传成功
        } catch (error) {
            console.error('Error uploading file:', error)
            // 处理错误，可能显示一个错误消息给用户
        }
    }

    const clearFiles = async () => {
        try {
            await ClearFileAPI()
            console.log('Files cleared successfully')
            setFiles([])
            // 更新UI以反映文件已被清除
        } catch (error) {
            console.error('Error clearing files:', error)
            // 处理错误，可能显示一个错误消息给用户
        }
    }

    const usePrompt = (prompt: string) => {
        setInput(prompt)
    }

    const createNewChat = () => {
        const newChat: Chat = {
            id: chats.length + 1,
            name: `New Chat ${chats.length + 1}`,
            messages: []
        }
        setChats([...chats, newChat])
        setCurrentChatId(newChat.id)
        startRenaming(newChat)  // Open rename dialog immediately
    }

    const deleteChat = (id: number) => {
        const updatedChats = chats.filter(chat => chat.id !== id)
        setChats(updatedChats)
        if (currentChatId === id) {
            setCurrentChatId(updatedChats[0]?.id || 0)
        }
    }

    const startRenaming = (chat?: Chat) => {
        const targetChat = chat || currentChat
        setNewChatName(targetChat.name)
        setIsRenaming(true)
    }

    const finishRenaming = () => {
        if (newChatName.trim()) {
            setChats(chats.map(chat =>
                chat.id === currentChatId ? { ...chat, name: newChatName.trim() } : chat
            ))
        }
        setIsRenaming(false)
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <header className="bg-white shadow-sm p-4 flex items-center border-b border-gray-200">
                <h1 className="text-xl font-semibold flex items-center text-gray-800 flex-grow">
                    <Bot className="mr-2 h-6 w-6 text-blue-500" />
                    AI Chat Assistant
                </h1>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            {currentChat.name}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="end">
                        <ScrollArea className="h-[300px]">
                            <div className="p-4 border-b border-gray-200">
                                <Button
                                    onClick={createNewChat}
                                    className="w-full justify-start text-left font-normal hover:bg-gray-100 transition-colors duration-200 ease-in-out rounded-md"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New chat
                                </Button>
                            </div>
                            <AnimatePresence>
                                {chats.map(chat => (
                                    <motion.div
                                        key={chat.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Button
                                            variant={chat.id === currentChatId ? "secondary" : "ghost"}
                                            className={`w-full justify-start py-2 px-4 text-left font-normal transition-colors duration-200 ease-in-out ${
                                                chat.id === currentChatId ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                                            }`}
                                            onClick={() => setCurrentChatId(chat.id)}
                                        >
                                            <MessageSquare className={`w-4 h-4 mr-2 flex-shrink-0 ${
                                                chat.id === currentChatId ? 'text-blue-600' : 'text-gray-500'
                                            }`} />
                                            <span className="truncate flex-grow">{chat.name}</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="sm" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => startRenaming(chat)}>
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => deleteChat(chat.id)} className="text-red-600">
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </Button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </ScrollArea>
                    </PopoverContent>
                </Popover>
            </header>
            <main className="flex-1 overflow-hidden flex flex-col bg-white">
                <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                    <AnimatePresence>
                        {currentChat.messages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                        {message.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-gray-600" />}
                                    </div>
                                    <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`} style={{ maxWidth: '70%' }}>
                                        {message.text}
                                        {message.file && (
                                            <div className="mt-2 p-2 bg-white rounded-md border border-gray-200">
                                                <Paperclip className="inline-block mr-2 w-4 h-4" />
                                                {message.file.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center space-x-2"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                        </motion.div>
                    )}
                </ScrollArea>
                <div className="p-4 border-t border-gray-200">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Prompts:</h3>
                        <div className="flex flex-wrap gap-2">
                            {suggestedPrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => usePrompt(prompt)}
                                    className="text-xs bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <Lightbulb className="w-3 h-3 mr-1 text-yellow-500"/>
                                    {prompt}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-2">
                        <div className="flex space-x-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your question..."
                                className="flex-grow bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="outline"
                                                onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip className="w-4 h-4"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Upload file</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
                                className="hidden"
                            />
                            <Button type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">
                                <Send className="w-4 h-4 mr-2"/>
                                Send
                            </Button>
                        </div>
                        {files.length > 0 && (
                            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                                <Paperclip className="w-4 h-4 text-gray-500"/>
                                <span className="text-sm text-gray-700 truncate flex-grow">{files[0].name}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(0)}
                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                >
                                    <X className="w-4 h-4"/>
                                </Button>
                            </div>
                        )}
                    </form>
                    <Button onClick={clearFiles}
                            className="mt-2 bg-red-500 hover:bg-red-600 text-white transition-colors duration-200">
                        Clear All Files
                    </Button>
                </div>
            </main>
            <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="chatName" className="text-right">
                            New Chat Name
                        </Label>
                        <Input
                            id="chatName"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            className="col-span-3 mt-1"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={finishRenaming}
                                className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}