'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'
import { Home, MessageSquare, Mail, User, LogOut } from 'lucide-react'

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const showSidebar = !['/login', '/register', '/'].includes(pathname)

    return (
        <div className="flex h-screen bg-gray-100">
            <AnimatePresence>
                {showSidebar && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-64 bg-white shadow-md"
                    >
                        <div className="p-4 border-b">
                            <h1 className="text-2xl font-bold text-gray-800">HealthApp</h1>
                        </div>
                        <nav className="p-4 space-y-2">
                            <Button asChild variant="ghost" className="w-full justify-start">
                                <Link href="/dashboard">
                                    <Home className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start">
                                <Link href="/ai-chat">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    AI Chat
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start">
                                <Link href="/contact-us">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Contact Us
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start">
                                <Link href="/profile">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Link>
                            </Button>
                        </nav>
                        <div className="p-4 border-t mt-auto">
                            <Button variant="outline" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
            <main className={`flex-1 overflow-auto ${showSidebar ? 'p' : ''}`}>
                {children}
            </main>
        </div>
    )
}