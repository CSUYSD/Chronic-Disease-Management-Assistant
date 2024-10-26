'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { motion } from 'framer-motion'
import { User, Mail, Lock, Users, Phone, Calendar as CalendarIcon, Eye, EyeOff } from 'lucide-react'
import { signUpAPI } from "@/api/user"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface SignUpFormData {
    username: string;
    email: string;
    phone: string;
    password: string;
    dob: string;
}

// Utility function to format date
const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export default function RegisterPage() {
    const [userType, setUserType] = useState<'patient' | 'companion'>('patient')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [date, setDate] = useState<Date>()
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        const userData: SignUpFormData = {
            username: formData.get('username') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            password: formData.get('password') as string,
            dob: formatDate(date),
        }

        try {
            const response = await signUpAPI(userData, userType)
            console.log('Registration successful:', response.data)
            toast({
                title: "Registration Successful",
                description: "You can now log in with your new account.",
            })
            router.push('/login')
        } catch (error) {
            console.error('Registration failed:', error)
            toast({
                title: "Registration Failed",
                description: "Please try again later.",
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
                className="w-full max-w-3xl"
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
                                    <Label htmlFor="phone" className="flex items-center text-lg">
                                        <Phone className="mr-2 h-5 w-5" />
                                        Phone
                                    </Label>
                                    <Input id="phone" name="phone" type="tel" required className="text-lg p-3" />
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
                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="flex items-center text-lg">
                                        <CalendarIcon className="mr-2 h-5 w-5" />
                                        Date of Birth
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? formatDate(date) : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
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
                            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
                                {isLoading ? 'Registering...' : 'Register'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button variant="link" onClick={() => router.push('/')} className="text-lg">
                            Already have an account? Login
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}