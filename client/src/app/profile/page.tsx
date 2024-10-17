'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { User, Mail, Shield, Key, Activity, Calendar, Clock, Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserProfile {
    name: string
    email: string
    userType: 'patient' | 'companion'
    avatar: string
    dateJoined: string
    lastLogin: string
    notificationsEnabled: boolean
    language: string
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        userType: 'patient',
        avatar: '',
        dateJoined: '',
        lastLogin: '',
        notificationsEnabled: true,
        language: 'en'
    })

    useEffect(() => {
        // Here you should fetch the user profile from the backend API
        // This is simulated data
        setProfile({
            name: 'John Doe',
            email: 'john@example.com',
            userType: 'patient',
            avatar: '/placeholder.svg?height=100&width=100',
            dateJoined: '2023-01-15',
            lastLogin: '2023-05-20',
            notificationsEnabled: true,
            language: 'en'
        })
    }, [])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // Here you should call the backend API to update the user profile
        console.log('Profile updated:', profile)

        // Show success toast
        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }))
    }

    const handleSwitchChange = (checked: boolean) => {
        setProfile(prevProfile => ({
            ...prevProfile,
            notificationsEnabled: checked
        }))
    }

    const handleLanguageChange = (value: string) => {
        setProfile(prevProfile => ({
            ...prevProfile,
            language: value
        }))
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">User Profile</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5 text-blue-500" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>Update your personal information</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="flex items-center">
                                            <User className="mr-2 h-4 w-4 text-gray-500" />
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="flex items-center">
                                            <Mail className="mr-2 h-4 w-4 text-gray-500" />
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="userType" className="flex items-center">
                                            <Shield className="mr-2 h-4 w-4 text-gray-500" />
                                            User Type
                                        </Label>
                                        <Input
                                            id="userType"
                                            name="userType"
                                            value={profile.userType}
                                            disabled
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="language" className="flex items-center">
                                            <Activity className="mr-2 h-4 w-4 text-gray-500" />
                                            Language
                                        </Label>
                                        <Select
                                            value={profile.language}
                                            onValueChange={handleLanguageChange}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select a language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Español</SelectItem>
                                                <SelectItem value="fr">Français</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="notifications" className="flex items-center">
                                            <Bell className="mr-2 h-4 w-4 text-gray-500" />
                                            Enable Notifications
                                        </Label>
                                        <Switch
                                            id="notifications"
                                            checked={profile.notificationsEnabled}
                                            onCheckedChange={handleSwitchChange}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Key className="mr-2 h-4 w-4" /> Update Profile
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="mr-2 h-5 w-5 text-green-500" />
                                    Account Summary
                                </CardTitle>
                                <CardDescription>Your account details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-center">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={profile.avatar} alt={profile.name} />
                                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold">{profile.name}</h2>
                                    <p className="text-sm text-gray-500">{profile.email}</p>
                                </div>
                                <div className="pt-4 space-y-2">
                                    <div className="flex items-center text-sm">
                                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                        <span>Joined: {profile.dateJoined}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                        <span>Last Login: {profile.lastLogin}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}