'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Mail, MapPin, Phone, Clock, Coffee, Globe } from 'lucide-react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const mapContainerStyle = {
    width: '100%',
    height: '200px'
}

const center = {
    lat: 37.7749,
    lng: -122.4194
}

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [coffeeCount, setCoffeeCount] = useState(1)

    useEffect(() => {
        const timer = setTimeout(() => setIsMapLoaded(true), 1000)
        return () => clearTimeout(timer)
    }, [])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('Contact form submitted:', formData)

        toast({
            title: "Message Sent",
            description: "We'll get back to you as soon as possible.",
        })

        setFormData({ name: '', email: '', message: '' })
        setIsSubmitting(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleBuyCoffee = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Coffee bought:', coffeeCount)

        toast({
            title: "Thank You!",
            description: `Your support of ${coffeeCount} coffee${coffeeCount > 1 ? 's' : ''} is greatly appreciated.`,
        })

        setCoffeeCount(1)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
                <p className="text-gray-600 mb-8">We're here to help and answer any question you might have.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium text-gray-900">Send Us a Message</CardTitle>
                                <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 text-sm"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                                            Message
                                        </Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 text-sm"
                                            placeholder="Your message here..."
                                            rows={4}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full text-sm py-2 bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium text-gray-900">Frequently Asked Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="general" className="w-full">
                                    <TabsList>
                                        <TabsTrigger value="general">General</TabsTrigger>
                                        <TabsTrigger value="account">Account</TabsTrigger>
                                        <TabsTrigger value="billing">Billing</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="general">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">What is HealthApp?</h3>
                                                <p className="text-sm text-gray-600">HealthApp is a comprehensive health management platform designed to help you track and improve your overall well-being.</p>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">How do I get started?</h3>
                                                <p className="text-sm text-gray-600">Simply sign up for an account, complete your health profile, and start exploring our features to begin your health journey.</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="account">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">How do I reset my password?</h3>
                                                <p className="text-sm text-gray-600">You can reset your password by clicking on the "Forgot Password" link on the login page and following the instructions sent to your email.</p>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Can I change my email address?</h3>
                                                <p className="text-sm text-gray-600">Yes, you can change your email address in your account settings. Make sure to verify your new email address after the change.</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="billing">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">What payment methods do you accept?</h3>
                                                <p className="text-sm text-gray-600">We accept all major credit cards, PayPal, and bank transfers for our premium services.</p>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">How do I cancel my subscription?</h3>
                                                <p className="text-sm text-gray-600">You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.</p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium text-gray-900">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                        <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                        +1 (555) 123-4567
                                    </p>
                                    <p className="flex items-center">
                                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                                        Monday - Friday: 9am - 5pm
                                    </p>
                                    <p className="flex items-center">
                                        <Globe className="mr-2 h-4 w-4 text-gray-400" />
                                        www.healthapp.com
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium text-gray-900">Our Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded overflow-hidden">
                                    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                                        {isMapLoaded && (
                                            <GoogleMap
                                                mapContainerStyle={mapContainerStyle}
                                                center={center}
                                                zoom={14}
                                            >
                                                <Marker position={center} />
                                            </GoogleMap>
                                        )}
                                    </LoadScript>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-medium text-gray-900">Support Us</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">Help us improve HealthApp by buying us a coffee. Every contribution counts!</p>
                                <div className="flex items-center justify-between mb-4">
                                    <Button
                                        onClick={() => setCoffeeCount(Math.max(1, coffeeCount - 1))}
                                        className="text-sm px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    >
                                        -
                                    </Button>
                                    <div className="text-lg font-medium">{coffeeCount}</div>
                                    <Button
                                        onClick={() => setCoffeeCount(coffeeCount + 1)}
                                        className="text-sm px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    >
                                        +
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleBuyCoffee}
                                    className="w-full text-sm py-2 bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
                                >
                                    <Coffee className="mr-2 h-4 w-4" />
                                    Buy {coffeeCount} Coffee{coffeeCount > 1 ? 's' : ''}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}