'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, Bot, User, Paperclip, Lightbulb, Plus, MoreHorizontal, MessageSquare, Trash2, Edit2, ChevronLeft, ChevronRight, X, File, FileText } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { FluxMessageWithHistoryAPI, UploadFileAPI, ChatWithFileAPI, ClearFileAPI, ClearFileByFileName, GenerateReportAPI } from '@/api/ai'
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { addChat, updateChat, deleteChat, setCurrentChatId } from '@/store/chatSlice'
import { setUploadedFiles, removeUploadedFile, clearUploadedFiles } from '@/store/fileSlice'
import { AppDispatch, RootState } from '@/store'
import { ErrorBoundary } from 'react-error-boundary'
import AiResponseFormatter from '@/components/AiResponseFormatter'

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

interface UploadedFile {
    name: string
    size: number
    type: string
}

const suggestedPrompts = [
    "What are the symptoms of diabetes?",
    "How can I improve my sleep quality?",
    "What's a balanced diet for heart health?",
    "Can you explain the importance of regular exercise?",
]

const MAX_FILES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
    return (
        <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>Something went wrong:</p>
            <pre className="mt-2 text-sm">{error.message}</pre>
            <button onClick={resetErrorBoundary} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Try again</button>
        </div>
    )
}

export default function AiChatPage() {
    const dispatch = useDispatch<AppDispatch>()
    const chats = useSelector((state: RootState) => state.chat.chats)
    const currentChatId = useSelector((state: RootState) => state.chat.currentChatId)
    const currentChat = useSelector((state: RootState) => state.chat.chats.find(chat => chat.id === state.chat.currentChatId))
    const uploadedFiles = useSelector((state: RootState) => state.file.uploadedFiles)

    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isRenaming, setIsRenaming] = useState(false)
    const [newChatName, setNewChatName] = useState('')
    const [, setIsCreatingNewChat] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [, setReport] = useState<{ content: string; generatedAt: string } | null>(null)
    const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [chats])

    useEffect(() => {
        if (chats.length === 0) {
            createNewChat()
        } else if (!currentChatId) {
            dispatch(setCurrentChatId(chats[0].id))
        }
    }, [chats, currentChatId, dispatch])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!input.trim() || !currentChat) return

        const newUserMessage: Message = {
            id: Date.now(),
            text: input,
            sender: 'user',
        }

        dispatch(updateChat({
            id: currentChat.id,
            changes: {
                messages: [...currentChat.messages, newUserMessage]
            }
        }))
        setInput('')
        setIsTyping(true)

        try {
            let response;
            if (uploadedFiles.length > 0) {
                response = await ChatWithFileAPI({
                    prompt: input,
                    conversationId: currentChat.id
                })
            } else {
                response = await FluxMessageWithHistoryAPI({
                    prompt: input,
                    sessionId: currentChat.id
                })
            }

            const aiResponse = response.data

            const newAiMessage: Message = {
                id: Date.now(),
                text: aiResponse,
                sender: 'ai'
            }

            dispatch(updateChat({
                id: currentChat.id,
                changes: {
                    messages: [...currentChat.messages, newUserMessage, newAiMessage]
                }
            }))
        } catch (error) {
            console.error('Error getting AI response:', error);
            toast({
                title: "Error",
                description: `Failed to get response from AI: ${(error as Error).message || 'Unknown error'}`,
                variant: "destructive",
            });
        } finally {
            setIsTyping(false)
        }
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files)
            const totalFiles = uploadedFiles.length + files.length

            if (totalFiles > MAX_FILES) {
                toast({
                    title: "Error",
                    description: `You can only upload a maximum of ${MAX_FILES} files.`,
                    variant: "destructive",
                })
                return
            }

            setIsUploading(true)

            for (const file of files) {
                if (file.size > MAX_FILE_SIZE) {
                    toast({
                        title: "Error",
                        description: `File ${file.name} exceeds the maximum size of 5MB.`,
                        variant: "destructive",
                    })
                    continue
                }

                const formData = new FormData()
                formData.append('file', file)

                try {
                    await UploadFileAPI(formData)
                    dispatch(setUploadedFiles([...uploadedFiles, {
                        name: file.name,
                        size: file.size,
                        type: file.type
                    }]))
                    toast({
                        title: "Success",
                        description: `File ${file.name} uploaded successfully.`,
                    })
                } catch (error) {
                    console.error('Error uploading file:', error)
                    toast({
                        title: "Error",
                        description: `Failed to upload file ${file.name}. Please try again.`,
                        variant: "destructive",
                    })
                }
            }

            setIsUploading(false)
        }
    }

    const removeFile = async (file: UploadedFile) => {
        try {
            await ClearFileByFileName(file.name)
            dispatch(removeUploadedFile(file))
            toast({
                title: "Success",
                description: `File ${file.name} removed successfully.`,
            })
        } catch (error) {
            console.error('Error removing file:', error)
            toast({
                title: "Error",
                description: `Failed to remove file ${file.name}. Please try again.`,
                variant: "destructive",
            })
        }
    }

    const clearAllFiles = async () => {
        try {
            await ClearFileAPI()
            dispatch(clearUploadedFiles())
            toast({
                title: "Success",
                description: "All files have been cleared.",
            })
        } catch (error) {
            console.error('Error clearing files:', error)
            toast({
                title: "Error",
                description: "Failed to clear files. Please try again.",
                variant: "destructive",
            })
        }
    }

    const usePrompt = (prompt: string) => {
        setInput(prompt)
    }

    const createNewChat = () => {
        const newChatId = uuidv4()
        const newChat: Chat = {
            id: newChatId,
            name: `New Chat ${chats.length + 1}`,
            messages: []
        }
        dispatch(addChat(newChat))
        dispatch(setCurrentChatId(newChatId))
        setIsCreatingNewChat(false)
    }

    const deleteChatHandler = (id: string) => {
        dispatch(deleteChat(id))
        if (chats.length > 1) {
            const newCurrentChatId = chats.find(chat => chat.id !== id)?.id || ''
            dispatch(setCurrentChatId(newCurrentChatId))
        } else {
            createNewChat()
        }
    }

    const startRenaming = (chat: Chat) => {
        setNewChatName(chat.name)
        setIsRenaming(true)
    }

    const finishRenaming = () => {
        if (newChatName.trim() && currentChat) {
            dispatch(updateChat({
                id: currentChat.id,
                changes: { name: newChatName.trim() }
            }))
        }
        setIsRenaming(false)
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const generateReport = async () => {
        setReportStatus('loading')
        try {
            const response = await GenerateReportAPI()
            const reportContent = response.data

            if (currentChat) {
                const newAiMessage: Message = {
                    id: Date.now(),
                    text: reportContent,
                    sender: 'ai'
                }

                dispatch(updateChat({
                    id: currentChat.id,
                    changes: {
                        messages: [...currentChat.messages, newAiMessage]
                    }
                }))
            }

            setReport({
                content: reportContent,
                generatedAt: new Date().toISOString()
            })
            setReportStatus('idle')
            toast({
                title: "Success",
                description: "AI report generated successfully.",
            })
        } catch (error) {
            console.error('Error generating AI report:', error)
            setReportStatus('error')
            toast({
                title: "Error",
                description: "Failed to generate AI report. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (!currentChat) {
        return <div>Loading...</div>
    }

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => {
            createNewChat()
        }}>
            <div className="flex h-screen overflow-hidden bg-white">
                <motion.aside
                    initial={{ width: 256 }}
                    animate={{ width: isSidebarOpen ? 256 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-r border-gray-200 flex flex-col overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-200">
                        <Button
                            onClick={createNewChat}
                            className="w-full justify-start text-left font-normal bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 ease-in-out rounded-md"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New chat
                        </Button>
                    </div>
                    <ScrollArea className="flex-grow">
                        <AnimatePresence>
                            {chats.map(chat => (
                                <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative group"
                                >
                                    <Button
                                        variant={chat.id === currentChatId ? "secondary" : "ghost"}
                                        className={`w-full justify-start py-2 px-4 text-left font-normal transition-all duration-200 ease-in-out ${
                                            chat.id === currentChatId ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                        onClick={() => dispatch(setCurrentChatId(chat.id))}
                                    >
                                        <MessageSquare className={`w-4 h-4 mr-2 flex-shrink-0 ${
                                            chat.id === currentChatId ? 'text-gray-900' : 'text-gray-500'
                                        }`} />
                                        <span className="truncate flex-grow">{chat.name}</span>
                                    </Button>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem onClick={() => startRenaming(chat)}>
                                                    <Edit2 className="w-4 h-4 mr-2" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => deleteChatHandler(chat.id)} className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </ScrollArea>
                </motion.aside>

                <main className="flex-1 flex  flex-col relative">
                    <header className="bg-white shadow-sm p-4 flex items-center justify-between border-b border-gray-200">
                        <div className="flex items-center">
                            <Button variant="ghost" size="sm" onClick={toggleSidebar} className="mr-2">
                                {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            </Button>
                            <h1 className="text-xl font-semibold flex items-center text-gray-800">
                                <Bot className="mr-2 h-6 w-6 text-gray-500" />
                                AI Chat Assistant
                            </h1>
                        </div>
                        <Button
                            onClick={generateReport}
                            disabled={reportStatus === 'loading'}
                            className="bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                        >
                            {reportStatus === 'loading' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4 mr-2" />
                            )}
                            Generate AI Report
                        </Button>
                    </header>
                    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
                        <AnimatePresence>
                            {currentChat.messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-start space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === 'user' ? 'bg-gray-200' : 'bg-gray-100'}`}>
                                            {message.sender === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-gray-600" />}
                                        </div>
                                        <motion.div
                                            className={`p-3 rounded-lg ${message.sender === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-white border border-gray-200 text-gray-900'}`}
                                            style={{ maxWidth: '70%' }}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <AiResponseFormatter text={message.text} />
                                        </motion.div>
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
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-gray-600" />
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-gray-200 text-gray-900">
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
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => usePrompt(prompt)}
                                            className="text-xs bg-white hover:bg-gray-50 text-gray-700 border-gray-200 transition-all duration-200"
                                        >
                                            <Lightbulb className="w-3 h-3 mr-1 text-gray-400" />
                                            {prompt}
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div className="flex space-x-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question..."
                                    className="flex-grow bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400 transition-all duration-200"
                                />
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Upload file (max 10 files, 5MB each)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    multiple
                                />
                                <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200">
                                    <Send className="w-4 h-4 mr-2" />
                                    Send
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <AnimatePresence>
                                    {uploadedFiles.map((file,) => (
                                        <motion.div
                                            key={file.name}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border border-gray-200"
                                        >
                                            <File className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-700 truncate max-w-[100px]">{file.name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFile(file)}
                                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </form>
                        {uploadedFiles.length > 0 && (
                            <Button
                                onClick={clearAllFiles}
                                className="mt-2 bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 w-full"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Files
                            </Button>
                        )}
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
                            <Button onClick={finishRenaming} className="bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200">
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </ErrorBoundary>
    )
}