'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Mail, Send, MapPin, Phone, Clock, Coffee, ChevronUp, ChevronDown } from 'lucide-react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'

const mapContainerStyle = {
    width: '100%',
    height: '200px'
}

const center = {
    lat: -33.8882,
    lng: 151.1871
}

const MotionCard = motion(Card)

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [coffeeCount, setCoffeeCount] = useState(1)
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

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

    const toggleFaq = (faqId: string) => {
        setExpandedFaq(expandedFaq === faqId ? null : faqId)
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <motion.h1
                    className="text-4xl font-bold text-gray-900 mb-2 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Contact Us
                </motion.h1>
                <motion.p
                    className="text-gray-600 mb-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    We're here to help and answer any question you might have.
                </motion.p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <MotionCard className="shadow-lg" variants={cardVariants} initial="hidden" animate="visible">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">Send Us a Message</CardTitle>
                                <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
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
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
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
                                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
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
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isSubmitting ? 'submitting' : 'idle'}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Button
                                                type="submit"
                                                className="w-full text-sm py-2 bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full"
                                                    />
                                                ) : (
                                                    <>
                                                        <Send className="mr-2 h-4 w-4" /> Send Message
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </AnimatePresence>
                                </form>
                            </CardContent>
                        </MotionCard>
                        <MotionCard className="shadow-lg" variants={cardVariants} initial="hidden" animate="visible">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">Frequently Asked Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { id: 'faq1', question: "What is HealthApp?", answer: "HealthApp is a comprehensive health management platform designed to help you track and improve your overall well-being." },
                                        { id: 'faq2', question: "How do I get started?", answer: "Simply sign up for an account, complete your health profile, and start exploring our features to begin your health journey." },
                                        { id: 'faq3', question: "Is my data secure?", answer: "Yes, we use industry-standard encryption and security measures to protect your personal health information." }
                                    ].map((faq) => (
                                        <div key={faq.id} className="border-b border-gray-200 pb-4">
                                            <button
                                                className="flex justify-between items-center w-full text-left"
                                                onClick={() => toggleFaq(faq.id)}
                                            >
                                                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                                                {expandedFaq === faq.id ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                            </button>
                                            <AnimatePresence>
                                                {expandedFaq === faq.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <p className="mt-2 text-gray-600">{faq.answer}</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </MotionCard>
                    </div>
                    <div className="space-y-8">
                        <MotionCard className="shadow-lg" variants={cardVariants} initial="hidden" animate="visible">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 text-sm text-gray-600">
                                    <motion.p
                                        className="flex items-center"
                                        whileHover={{ scale: 1.05, originX: 0 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                                        The University of Sydney, Camperdown NSW 2006, Australia
                                    </motion.p>
                                    <motion.p
                                        className="flex items-center"
                                        whileHover={{ scale: 1.05, originX: 0 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Mail className="mr-2 h-5 w-5 text-blue-500" />
                                        contact@healthapp.com
                                    </motion.p>
                                    <motion.p
                                        className="flex items-center"
                                        whileHover={{ scale: 1.05, originX: 0 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Phone className="mr-2 h-5 w-5 text-blue-500" />
                                        +61 2 9351 2222
                                    </motion.p>
                                    <motion.p
                                        className="flex items-center"
                                        whileHover={{ scale: 1.05, originX: 0 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Clock className="mr-2 h-5 w-5 text-blue-500" />
                                        Monday - Friday: 9am - 5pm
                                    </motion.p>
                                </div>
                            </CardContent>
                        </MotionCard>
                        <MotionCard className="shadow-lg" variants={cardVariants} initial="hidden" animate="visible">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">Our Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg overflow-hidden">
                                    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                                        <AnimatePresence>
                                            {isMapLoaded && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <GoogleMap
                                                        mapContainerStyle={mapContainerStyle}
                                                        center={center}
                                                        zoom={14}
                                                        options={{
                                                            language: 'en',
                                                        }}
                                                    >
                                                        <Marker position={center} />
                                                    </GoogleMap>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </LoadScript>
                                </div>
                            </CardContent>
                        </MotionCard>
                        <MotionCard className="shadow-lg" variants={cardVariants} initial="hidden" animate="visible">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-gray-900">Support Us</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">Help us improve HealthApp by buying us a coffee. Every contribution counts!</p>
                                <div className="flex items-center justify-between mb-4">
                                    <Button
                                        onClick={() => setCoffeeCount(Math.max(1, coffeeCount - 1))}
                                        className="text-lg px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        -
                                    </Button>
                                    <motion.div
                                        className="text-2xl font-bold"
                                        key={coffeeCount}
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {coffeeCount}
                                    </motion.div>
                                    <Button
                                        onClick={() => setCoffeeCount(coffeeCount + 1)}

                                        className="text-lg px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
                                    >
                                        +
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleBuyCoffee}
                                    className="w-full text-lg py-3 bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
                                >
                                    <Coffee className="mr-2 h-5 w-5" />
                                    Buy {coffeeCount} Coffee{coffeeCount > 1 ? 's' : ''}
                                </Button>
                            </CardContent>
                        </MotionCard>
                    </div>
                </div>
            </div>
        </div>
    )
}