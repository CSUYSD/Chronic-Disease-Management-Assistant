'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Bot, User, Paperclip, X, Lightbulb, Plus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
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

        // Simulated AI reply
        setTimeout(() => {
            const aiMessage: Message = {
                id: currentChat.messages.length + 2,
                text: "This is the AI assistant's reply. In a real application, this should be fetched from a backend API.",
                sender: 'ai'
            }
            const updatedChatsWithAiReply = updatedChats.map(chat =>
                chat.id === currentChatId
                    ? { ...chat, messages: [...chat.messages, aiMessage] }
                    : chat
            )
            setChats(updatedChatsWithAiReply)
            setIsTyping(false)
        }, 2000)
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files))
        }
    }

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index))
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
    }

    const deleteChat = (id: number) => {
        const updatedChats = chats.filter(chat => chat.id !== id)
        setChats(updatedChats)
        if (currentChatId === id) {
            setCurrentChatId(updatedChats[0]?.id || 0)
        }
    }

    const startRenaming = (chat: Chat) => {
        setNewChatName(chat.name)
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
        <div className="flex h-full">
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-64 bg-white/80 backdrop-blur-sm shadow-xl"
                    >
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-gray-800 flex justify-between items-center">
                                    Chats
                                    <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={createNewChat} className="w-full mb-4">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Chat
                                </Button>
                                <ScrollArea className="h-[calc(100vh-12rem)]">
                                    <AnimatePresence>
                                        {chats.map(chat => (
                                            <motion.div
                                                key={chat.id}
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center mb-2"
                                            >
                                                <Button
                                                    variant={chat.id === currentChatId ? "secondary" : "ghost"}
                                                    className="w-full justify-start mr-2"
                                                    onClick={() => setCurrentChatId(chat.id)}
                                                >
                                                    <Bot className="w-4 h-4 mr-2" />
                                                    {chat.name}
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => startRenaming(chat)}>
                                                            Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => deleteChat(chat.id)}>
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            <Card className="flex-1 h-[calc(100vh-2rem)] bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="border-b">
                    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                        {!isSidebarOpen && (
                            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)} className="mr-2">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        )}
                        <Bot className="mr-2 h-6 w-6 text-blue-500" />
                        {currentChat.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100%-5rem)]">
                    <ScrollArea className="flex-grow mb-4 p-4" ref={scrollAreaRef}>
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
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                            {message.sender === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-gray-600" />}
                                        </div>
                                        <div className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'}`} style={{ maxWidth: '70%' }}>
                                            {message.text}
                                            {message.file && (
                                                <div className="mt-2 p-2 bg-white rounded-md">
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
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="p-3 rounded-lg bg-gray-100 text-gray-900">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                            </motion.div>
                        )}
                    </ScrollArea>
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Prompts:</h3>
                        <div className="flex flex-wrap gap-2">
                            {suggestedPrompts.map((prompt, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => usePrompt(prompt)}
                                    className="text-xs"
                                >
                                    <Lightbulb className="w-3 h-3 mr-1" />
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
                                className="flex-grow bg-white/50 backdrop-blur-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                            <Paperclip className="w-4 h-4" />
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
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                                <Send className="w-4 h-4 mr-2" />
                                Send
                            </Button>
                        </div>
                        {files.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                <span className="text-sm  text-gray-700">{files[0].name}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(0)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
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
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={finishRenaming}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}