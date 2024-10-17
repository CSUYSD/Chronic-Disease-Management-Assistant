'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { User, Mail, Lock, Users } from 'lucide-react'

export default function RegisterPage() {
    const [userType, setUserType] = useState<'patient' | 'companion'>('patient')
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            userType: userType,
        }

        // Here you should call the backend API for registration
        console.log('Register user:', userData)

        // Redirect to the login page after successful registration
        router.push('/login')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl" // Increased max-width here
            >
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center text-blue-800">Register</CardTitle>
                        <CardDescription className="text-center text-lg">Create your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="flex items-center text-lg">
                                        <User className="mr-2 h-5 w-5" />
                                        Username
                                    </Label>
                                    <Input id="username" name="username" required className="text-lg p-3" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center text-lg">
                                        <Mail className="mr-2 h-5 w-5" />
                                        Email
                                    </Label>
                                    <Input id="email" name="email" type="email" required className="text-lg p-3" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center text-lg">
                                        <Lock className="mr-2 h-5 w-5" />
                                        Password
                                    </Label>
                                    <Input id="password" name="password" type="password" required className="text-lg p-3" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center text-lg">
                                        <Users className="mr-2 h-5 w-5" />
                                        User Type
                                    </Label>
                                    <RadioGroup
                                        defaultValue="patient"
                                        onValueChange={(value) => setUserType(value as 'patient' | 'companion')}
                                        className="flex space-x-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="patient" id="patient" />
                                            <Label htmlFor="patient" className="text-lg">Patient</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="companion" id="companion" />
                                            <Label htmlFor="companion" className="text-lg">Companion</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            <Button type="submit" className="w-full text-lg py-6">Register</Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="link" onClick={() => router.push('/login')} className="text-lg">
                            Already have an account? Login
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}