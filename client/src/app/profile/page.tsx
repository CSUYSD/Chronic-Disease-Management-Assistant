'use client'

import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { User, Mail, Key, Calendar, Heart } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProfileAPI } from "@/api/user"
import { setProfile, selectProfile, selectIsLoading } from '@/store/profileSlice'
import { AppDispatch } from '@/store'
import { selectProfile as selectStoredProfile } from '@/store/profileSlice'

export default function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>()
    const profile = useSelector(selectProfile)
    const isLoading = useSelector(selectIsLoading)
    const storedProfile = useSelector(selectStoredProfile)

    const fetchProfile = useCallback(async () => {
        try {
            const response = await getProfileAPI()
            const newProfileData = {
                ...response.data,
                role: storedProfile?.role || response.data.role
            }

            // Check if the new profile data is different from the stored profile
            if (JSON.stringify(newProfileData) !== JSON.stringify(storedProfile)) {
                dispatch(setProfile(newProfileData))
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            toast({
                title: "Error",
                description: "Failed to load profile. Please try again later.",
                variant: "destructive",
            })
        }
    }, [dispatch, storedProfile])

    useEffect(() => {
        if (!storedProfile) {
            fetchProfile()
        }
    }, [fetchProfile, storedProfile])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
                />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.p
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl text-gray-600"
                >
                    Failed to load profile. Please try again later.
                </motion.p>
            </div>
        )
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // Here you would call the API to update the profile
        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        })
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
            >
                <motion.h1
                    className="text-4xl font-bold text-gray-800 mb-8 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Your Profile
                </motion.h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="md:col-span-2"
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-2xl text-gray-700">
                                    <User className="mr-2 h-6 w-6" />
                                    Profile Information
                                </CardTitle>
                                <CardDescription>Manage your personal details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <AnimatePresence>
                                        {['username', 'email', 'dob'].map((field, index) => (
                                            <motion.div
                                                key={field}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                className="space-y-2"
                                            >
                                                <Label htmlFor={field} className="flex items-center text-lg">
                                                    {field === 'username' && <User className="mr-2 h-5 w-5 text-gray-500" />}
                                                    {field === 'email' && <Mail className="mr-2 h-5 w-5 text-gray-500" />}
                                                    {field === 'dob' && <Calendar className="mr-2 h-5 w-5 text-gray-500" />}
                                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                                </Label>
                                                <Input
                                                    id={field}
                                                    value={profile[field]}
                                                    readOnly
                                                    className="bg-gray-100"
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <motion.div
                                        className="space-y-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 }}
                                    >
                                        <Label htmlFor="healthMetrics" className="flex items-center text-lg">
                                            <Heart className="mr-2 h-5 w-5 text-red-500" />
                                            Health Metrics
                                        </Label>
                                        <Button className="w-full">View Health Dashboard</Button>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 }}
                                    >
                                        <Button type="submit" className="w-full text-lg py-6">
                                            <Key className="mr-2 h-5 w-5" /> Update Profile
                                        </Button>
                                    </motion.div>
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
                                <CardTitle className="flex items-center text-2xl text-gray-700">
                                    <User className="mr-2 h-6 w-6" />
                                    Account Summary
                                </CardTitle>
                                <CardDescription>Your account details at a glance</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <motion.div
                                    className="flex justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Avatar className="h-32 w-32">
                                        <AvatarImage src={profile.avatar || '/default-avatar.png'} alt={profile.username} />
                                        <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                >
                                    <h2 className="text-2xl font-semibold text-gray-800">{profile.username}</h2>
                                    <p className="text-lg text-gray-600">{profile.email}</p>
                                </motion.div>
                                <motion.div
                                    className="pt-4 space-y-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                >
                                    <div className="flex items-center text-lg">
                                        <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                                        <span>Born: {profile.dob}</span>
                                    </div>
                                    <motion.div
                                        className="bg-gray-100 p-4 rounded-lg"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <p className="text-gray-800 font-medium">
                                            Track your health journey with us!
                                        </p>
                                    </motion.div>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}