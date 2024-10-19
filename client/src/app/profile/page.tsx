'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { User, Mail, Phone, Calendar, Heart, Camera, Key } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getProfileAPI, updateProfileAPI } from "@/api/user"
import { setProfile, selectProfile, selectIsLoading, setError, updateProfile } from '@/store/profileSlice'
import { AppDispatch } from '@/store'

export default function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>()
    const profile = useSelector(selectProfile)
    const isLoading = useSelector(selectIsLoading)
    const [isEditing, setIsEditing] = useState(false)
    const [editedProfile, setEditedProfile] = useState(profile)
    const [initialFetchDone, setInitialFetchDone] = useState(false)

    const fetchProfile = useCallback(async () => {
        try {
            const response = await getProfileAPI()
            dispatch(setProfile(response.data))
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            dispatch(setError('Failed to load profile. Please try again later.'))
            toast({
                title: "Error",
                description: "Failed to load profile. Please try again later.",
                variant: "destructive",
            })
        }
    }, [dispatch])

    useEffect(() => {
        if (!initialFetchDone) {
            fetchProfile()
            setInitialFetchDone(true)
        }
    }, [fetchProfile, initialFetchDone])

    useEffect(() => {
        setEditedProfile(profile)
    }, [profile])

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setEditedProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const response = await updateProfileAPI(editedProfile)
            dispatch(updateProfile(response.data))
            setIsEditing(false)
            toast({
                title: "Success",
                description: "Your profile has been successfully updated.",
            })
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again later.",
                variant: "destructive",
            })
        }
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
                                        {['username', 'email', 'phone', 'dob'].map((field, index) => (
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
                                                    {field === 'phone' && <Phone className="mr-2 h-5 w-5 text-gray-500" />}
                                                    {field === 'dob' && <Calendar className="mr-2 h-5 w-5 text-gray-500" />}
                                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                                </Label>
                                                <Input
                                                    id={field}
                                                    name={field}
                                                    value={editedProfile[field as keyof typeof editedProfile] || ''}
                                                    onChange={handleInputChange}
                                                    readOnly={!isEditing}
                                                    className={isEditing ? "bg-white" : "bg-gray-100"}
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
                                        <Label htmlFor="bio" className="flex items-center text-lg">
                                            <Heart className="mr-2 h-5 w-5 text-red-500" />
                                            Bio
                                        </Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={editedProfile.bio || ''}
                                            onChange={handleInputChange}
                                            readOnly={!isEditing}
                                            className={isEditing ? "bg-white" : "bg-gray-100"}
                                            rows={4}
                                        />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 }}
                                        className="flex justify-end space-x-4"
                                    >
                                        {isEditing ? (
                                            <>
                                                <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                                                    <Key className="mr-2 h-5 w-5" /> Save Changes
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <Button type="button" onClick={() => setIsEditing(true)}>
                                                <Camera className="mr-2 h-5 w-5" /> Edit Profile
                                            </Button>
                                        )}
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
                                        <AvatarImage src={profile.avatar || '/placeholder.svg?height=128&width=128'} alt={profile.username} />
                                        <AvatarFallback>{profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                >
                                    <h2 className="text-2xl font-semibold text-gray-800">{profile.username || 'N/A'}</h2>
                                    <p className="text-lg text-gray-600">{profile.email || 'N/A'}</p>
                                </motion.div>
                                <motion.div
                                    className="pt-4 space-y-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                >
                                    <div className="flex items-center text-lg">
                                        <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                                        <span>Born: {profile.dob || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center text-lg">
                                        <Phone className="mr-2 h-5 w-5 text-gray-500" />
                                        <span>Phone: {profile.phone || 'Not provided'}</span>
                                    </div>
                                    <motion.div
                                        className="bg-gray-100 p-4 rounded-lg"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <p className="text-gray-800 font-medium">
                                            {profile.bio || 'Add a bio to tell us more about yourself!'}
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