'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Mail, User, MessageSquare, Send, MapPin } from 'lucide-react'
import Image from 'next/image'

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // Here you should call the backend API to send the contact form
        console.log('Contact form submitted:', formData)

        // Show success toast
        toast({
            title: "Message Sent",
            description: "We'll get back to you as soon as possible.",
        })

        // Reset form
        setFormData({ name: '', email: '', message: '' })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prevData => ({
            ...prevData,
            [name]: value
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
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Contact Us</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Mail className="mr-2 h-5 w-5 text-blue-500" />
                                    Get in Touch
                                </CardTitle>
                                <CardDescription>If you have any questions or suggestions, please don't hesitate to contact us.</CardDescription>
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
                                            value={formData.name}
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
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="message" className="flex items-center">
                                            <MessageSquare className="mr-2 h-4 w-4 text-gray-500" />
                                            Message
                                        </Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            className="mt-1"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        <Send className="mr-2 h-4 w-4" /> Send Message
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
                                    <MapPin className="mr-2 h-5 w-5 text-green-500" />
                                    Our Location
                                </CardTitle>
                                <CardDescription>Visit us at our office</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-w-16 aspect-h-9 mb-4">
                                    <Image
                                        src="/placeholder.svg?height=300&width=400"
                                        alt="Map"
                                        width={400}
                                        height={300}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center">
                                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                                        123 Health Street, Medical District, City, 12345
                                    </p>
                                    <p className="flex items-center">
                                        <Mail className="mr-2 h-4 w-4 text-gray-400" />
                                        contact@healthapp.com
                                    </p>
                                    <p className="flex items-center">
                                        <User className="mr-2 h-4 w-4 text-gray-400" />
                                        Monday - Friday: 9am - 5pm
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}