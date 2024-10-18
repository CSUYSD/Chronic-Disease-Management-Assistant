'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { loginAPI } from "@/api/user"
import { toast } from "@/hooks/use-toast"
import { useDispatch } from 'react-redux'
import { setProfile } from '@/store/profileSlice'
import {setToken} from "@/utils";

interface LoginFormData {
    username: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const userData: LoginFormData = {
            username: formData.get('username') as string,
            password: formData.get('password') as string,
        }

        try {
            const response = await loginAPI(userData)
            console.log('Login successful:', response.data)
            toast({
                title: "Login Successful",
                description: "Welcome back!",
            })
            setToken(response.data.token)
            // Update the profile with the data from the login response
            const profileData = {
                username: response.data.username,
                role: response.data.role,
                email: null,
                avatar: null,
                dob: null
            }
            console.log('Updating profile with:', profileData)
            dispatch(setProfile(profileData))
            router.push('/dashboard')
        } catch (error) {
            console.error('Login failed:', error)
            toast({
                title: "Login Failed",
                description: "Please check your credentials and try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center text-blue-800">Login</CardTitle>
                        <CardDescription className="text-center text-lg">Welcome back! Please login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="flex items-center text-lg">
                                        <Mail className="mr-2 h-5 w-5" />
                                        Username
                                    </Label>
                                    <Input id="username" name="username" required className="text-lg p-3" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center text-lg">
                                        <Lock className="mr-2 h-5 w-5" />
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="text-lg p-3 pr-10"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="link" onClick={() => router.push('/register')} className="text-lg">
                            Don't have an account? Register
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}