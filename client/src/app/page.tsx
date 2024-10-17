'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { motion } from 'framer-motion'
import { User, Users } from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full space-y-8"
            >
                <motion.h1
                    className="text-5xl font-bold text-center text-blue-800"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                    Welcome to HealthApp
                </motion.h1>
                <motion.p
                    className="text-xl text-center text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Your personal health management platform
                </motion.p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5 text-blue-500" />
                                    For Patients
                                </CardTitle>
                                <CardDescription>Manage your health records and connect with AI assistance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href="/login?type=patient">Login as Patient</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-green-500" />
                                    For Companions
                                </CardTitle>
                                <CardDescription>Monitor and support your loved ones' health journey</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href="/login?type=companion">Login as Companion</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle>New to HealthApp?</CardTitle>
                            <CardDescription>Create an account to get started</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/register">Register Now</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    className="text-center text-sm text-gray-600 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p>HealthApp is designed to provide a comprehensive health management experience.</p>
                    <p>For any questions or support, please visit our <Link href="/contact-us" className="text-blue-600 hover:underline">Contact Us</Link> page.</p>
                </motion.div>
            </motion.div>
        </div>
    )
}