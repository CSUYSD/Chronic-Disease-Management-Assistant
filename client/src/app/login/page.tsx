'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        // Here you should call the backend API for login verification
        console.log('Login user:', userData)

        // Redirect to the dashboard after successful login
        router.push('/dashboard')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center text-blue-800">Login</CardTitle>
                        <CardDescription className="text-center">Welcome back! Please login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email
                                    </Label>
                                    <Input id="email" name="email" type="email" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center">
                                        <Lock className="mr-2 h-4 w-4" />
                                        Password
                                    </Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                            </div>
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                            <Button type="submit" className="w-full mt-6">Login</Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="link" onClick={() => router.push('/register')}>Don't have an account? Register</Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}