'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Play, Link, Search, Star, ArrowUpRight, Bookmark, BookmarkPlus, ChevronUp, Youtube } from 'lucide-react'

interface HealthResource {
    id: string
    title: string
    description: string
    url: string
    type: 'video' | 'website'
    tags: string[]
    date: string
    getThumbnail: () => string
    rating?: number
    views?: number
    monthlyVisits?: number
}

const videoResources: HealthResource[] =
    [
        {
            id: 'v1',
            title: "Understanding Hypertension: Causes and Treatment",
            description: "A comprehensive overview of hypertension, its causes, and treatments.",
            url: "https://www.youtube.com/watch?v=sNCtvsY3TS8",
            type: "video",
            tags: ["hypertension", "treatment", "causes"],
            date: "2024-03-20",
            getThumbnail: () => "https://img.youtube.com/vi/sNCtvsY3TS8/mqdefault.jpg",
            views: 180000,
            rating: 4.7
        },
        {
            id: 'v2',
            title: "Hypertension Explained Clearly - Causes, Diagnosis, Treatment",
            description: "Professor Roger Seheult explains hypertension in a simple and clear manner.",
            url: "https://www.youtube.com/watch?v=OmKVteeuQj0",
            type: "video",
            tags: ["hypertension", "diagnosis", "treatment"],
            date: "2024-02-25",
            getThumbnail: () => "https://img.youtube.com/vi/OmKVteeuQj0/mqdefault.jpg",
            views: 250000,
            rating: 4.9
        },
        {
            id: 'v3',
            title: "High Blood Pressure: Symptoms, Causes & Treatment Options",
            description: "Learn the symptoms and causes of high blood pressure, and the options for treatment.",
            url: "https://www.youtube.com/watch?v=50BW8b9DNaQ",
            type: "video",
            tags: ["high blood pressure", "symptoms", "treatment"],
            date: "2024-02-10",
            getThumbnail: () => "https://img.youtube.com/vi/50BW8b9DNaQ/mqdefault.jpg",
            views: 210000,
            rating: 4.8
        },
        {
            id: 'v4',
            title: "Hypertension: Understanding High Blood Pressure",
            description: "A video that breaks down what high blood pressure is and its impact on health.",
            url: "https://www.youtube.com/watch?v=wjIbwy9SdAQ",
            type: "video",
            tags: ["hypertension", "high blood pressure", "health"],
            date: "2024-03-05",
            getThumbnail: () => "https://img.youtube.com/vi/wjIbwy9SdAQ/mqdefault.jpg",
            views: 150000,
            rating: 4.5
        },
        {
            id: 'v5',
            title: "5 Essential Tips for Managing Hypertension",
            description: "Essential tips to help you manage high blood pressure effectively.",
            url: "https://www.youtube.com/watch?v=yaf1swrS1_c",
            type: "video",
            tags: ["hypertension", "management", "tips"],
            date: "2024-01-30",
            getThumbnail: () => "https://img.youtube.com/vi/yaf1swrS1_c/mqdefault.jpg",
            views: 190000,
            rating: 4.6
        },
        {
            id: 'v6',
            title: "How Hypertension Affects the Body",
            description: "A video explaining how high blood pressure affects various organs in the body.",
            url: "https://www.youtube.com/watch?v=EymMLXah2CA",
            type: "video",
            tags: ["hypertension", "body effects", "health"],
            date: "2024-03-18",
            getThumbnail: () => "https://img.youtube.com/vi/EymMLXah2CA/mqdefault.jpg",
            views: 170000,
            rating: 4.7
        },
        {
            id: 'v7',
            title: "Lifestyle Changes to Control High Blood Pressure",
            description: "Practical lifestyle changes you can make to control hypertension.",
            url: "https://www.youtube.com/watch?v=dWtzaKYFg00",
            type: "video",
            tags: ["hypertension", "lifestyle", "control"],
            date: "2024-02-22",
            getThumbnail: () => "https://img.youtube.com/vi/dWtzaKYFg00/mqdefault.jpg",
            views: 220000,
            rating: 4.8
        },
        {
            id: 'v8',
            title: "Hypertension Risk Factors and Prevention",
            description: "A detailed look at the risk factors of hypertension and how to prevent it.",
            url: "https://www.youtube.com/watch?v=1jzZe3ORdd8",
            type: "video",
            tags: ["hypertension", "risk factors", "prevention"],
            date: "2024-03-12",
            getThumbnail: () => "https://img.youtube.com/vi/1jzZe3ORdd8/mqdefault.jpg",
            views: 160000,
            rating: 4.6
        },
        {
            id: 'v9',
            title: "Hypertension and the Importance of Regular Check-ups",
            description: "Why regular check-ups are crucial for managing high blood pressure.",
            url: "https://www.youtube.com/watch?v=hn-6NM4QfOA",
            type: "video",
            tags: ["hypertension", "check-ups", "management"],
            date: "2024-03-15",
            getThumbnail: () => "https://img.youtube.com/vi/hn-6NM4QfOA/mqdefault.jpg",
            views: 130000,
            rating: 4.5
        }
    ]

const websiteResources: HealthResource[] = [
    {
        id: 'w1',
        title: "NHLBI High Blood Pressure Education Materials",
        description: "Offers fact sheets, DASH eating plans, and materials about blood pressure management.",
        url: "https://www.nhlbi.nih.gov",
        type: "website",
        tags: ["hypertension", "education"],
        date: "2023-03-15",
        getThumbnail: () => `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.nhlbi.nih.gov&screenshot=true`,
        monthlyVisits: 500000
    },
    {
        id: 'w2',
        title: "American Heart Association - High Blood Pressure",
        description: "Comprehensive guide including risk factors, self-measurement tips, and blood pressure tools.",
        url: "https://www.heart.org",
        type: "website",
        tags: ["hypertension", "heart health"],
        date: "2023-02-20",
        getThumbnail: () => `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.heart.org&screenshot=true`,
        monthlyVisits: 1000000
    },
    {
        id: 'w3',
        title: "CDC High Blood Pressure Information",
        description: "Resources and data related to hypertension, including telehealth and self-measured monitoring programs.",
        url: "https://www.cdc.gov",
        type: "website",
        tags: ["hypertension", "public health"],
        date: "2023-05-01",
        getThumbnail: () => `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.cdc.gov&screenshot=true`,
        monthlyVisits: 800000
    },
    {
        id: 'w4',
        title: "Keep High Blood Pressure Under Control - NHLBI",
        description: "Resources on lowering blood pressure and improving heart health.",
        url: "https://www.nhlbi.nih.gov",
        type: "website",
        tags: ["hypertension", "management"],
        date: "2023-04-10",
        getThumbnail: () => `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.nhlbi.nih.gov&screenshot=true`,
        monthlyVisits: 300000
    },
    {
        id: 'w5',
        title: "What is High Blood Pressure? Fact Sheet - NHLBI",
        description: "Detailed information about blood pressure and ways to manage it effectively.",
        url: "https://www.nhlbi.nih.gov",
        type: "website",
        tags: ["hypertension", "education"],
        date: "2023-06-05",
        getThumbnail: () => `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.nhlbi.nih.gov&screenshot=true`,
        monthlyVisits: 250000
    },
    {
        id: 'w6',
        title: "American Heart Association - Hypertension Management Program",
        description: "An extensive guide for healthcare professionals focusing on hypertension.",
        url: "https://store.education.heart.org",
        type: "website",
        tags: ["hypertension", "professional resources"],
        date: "2023-05-20",
        getThumbnail: () => `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://store.education.heart.org&screenshot=true`,
        monthlyVisits: 150000
    },
    {
        id: 'w7',
        title: "CDC - High Blood Pressure Toolkit",
        description: "Downloadable resources to help manage and understand hypertension.",
        url: "https://www.cdc.gov",
        type: "website",
        tags: ["hypertension", "toolkit"],
        date: "2023-06-15",
        getThumbnail: () => `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.cdc.gov&screenshot=true`,
        monthlyVisits: 200000
    }
]

const MotionCard = motion(Card)

export default function HealthResource() {
    const [activeTab, setActiveTab] = useState<'videos' | 'websites'>('videos')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTag, setSelectedTag] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'date' | 'rating' | 'views' | 'monthlyVisits'>('date')
    const [openItem, setOpenItem] = useState<HealthResource | null>(null)
    const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([])
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const filteredAndSortedResources = useMemo(() => {
        const resources = activeTab === 'videos' ? videoResources : websiteResources
        return resources
            .filter(resource =>
                (resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    resource.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (selectedTag === 'all' || resource.tags.includes(selectedTag))
            )
            .sort((a, b) => {
                if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime()
                if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
                if (sortBy === 'views') return (b.views || 0) - (a.views || 0)
                if (sortBy === 'monthlyVisits') return (b.monthlyVisits || 0) - (a.monthlyVisits || 0)
                return 0
            })
    }, [activeTab, searchTerm, selectedTag, sortBy])

    const allTags = useMemo(() => {
        const tags = new Set<string>()
        ;[...videoResources, ...websiteResources].forEach(resource => resource.tags.forEach(tag => tags.add(tag)))
        return ['all', ...Array.from(tags)]
    }, [])

    const handleBookmark = (id: string) => {
        setBookmarkedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
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
                    Health Community
                </motion.h1>
                <motion.p
                    className="text-gray-600 mb-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Discover valuable resources on health and wellness.
                </motion.p>
                <Tabs defaultValue="videos" className="mb-8" onValueChange={(value) => setActiveTab(value as 'videos' | 'websites')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="videos">Videos</TabsTrigger>
                        <TabsTrigger value="websites">Websites</TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex-1">
                        <Select onValueChange={setSelectedTag} defaultValue="all">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filter by tag" />
                            </SelectTrigger>
                            <SelectContent>
                                {allTags.map(tag => (
                                    <SelectItem key={tag} value={tag}>
                                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <Select onValueChange={setSortBy as (value: string) => void} defaultValue="date">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="rating">Rating</SelectItem>
                                <SelectItem value="views">Views</SelectItem>
                                <SelectItem value="monthlyVisits">Monthly Visits</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search resources..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 py-2"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <AnimatePresence>
                        {filteredAndSortedResources.map((resource) => (
                            <MotionCard
                                key={resource.id}
                                className="shadow-lg"
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                layout
                            >
                                <CardHeader>
                                    <img
                                        src={resource.getThumbnail()}
                                        alt={resource.title}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "https://via.placeholder.com/300x200?text=Thumbnail+Unavailable";
                                        }}
                                    />
                                    <CardTitle className="text-xl font-semibold text-gray-900">{resource.title}</CardTitle>
                                    <CardDescription>{resource.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {resource.tags.map(tag => (
                                            <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Date: {new Date(resource.date).toLocaleDateString()}</p>
                                    {resource.rating && (
                                        <div className="flex items-center mb-2">
                                            <Star className="h-5 w-5 text-yellow-500 mr-1" />
                                            <span>{resource.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                    {resource.views && <p className="text-sm text-gray-500 mb-2">Views: {resource.views.toLocaleString()}</p>}
                                    {resource.monthlyVisits && <p className="text-sm text-gray-500 mb-2">Monthly Visits: {resource.monthlyVisits.toLocaleString()}</p>}
                                    <div className="flex justify-between items-center">
                                        <Button
                                            onClick={() => resource.type === 'video' ? setOpenItem(resource) : window.open(resource.url, '_blank')}
                                            className="flex items-center"
                                        >
                                            {resource.type === 'video' ? (
                                                <><Play className="mr-2 h-4 w-4" /> Watch Video</>
                                            ) : (
                                                <><ArrowUpRight className="mr-2 h-4 w-4" /> Visit Website</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleBookmark(resource.id)}
                                            aria-label={bookmarkedItems.includes(resource.id) ? "Remove bookmark" : "Add bookmark"}
                                        >
                                            {bookmarkedItems.includes(resource.id) ? (
                                                <Bookmark className="h-5 w-5" />
                                            ) : (
                                                <BookmarkPlus className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </MotionCard>
                        ))}
                    </AnimatePresence>
                </div>
                {filteredAndSortedResources.length === 0 && (
                    <motion.p
                        className="text-center text-gray-600 mt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        No resources found. Try adjusting your search or filters.
                    </motion.p>
                )}
            </div>
            <Dialog open={openItem !== null} onOpenChange={() => setOpenItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{openItem?.title}</DialogTitle>
                        <DialogDescription>{openItem?.description}</DialogDescription>
                    </DialogHeader>
                    {openItem && openItem.type === 'video' && (
                        <div className="aspect-video">
                            <iframe
                                src={openItem.url.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                allowFullScreen
                                title={openItem.title}
                            />
                        </div>
                    )}
                    <div className="flex justify-between">
                        <Button onClick={() => setOpenItem(null)}>Close</Button>
                        {openItem?.type === 'video' && (
                            <Button onClick={() => window.open(openItem.url, '_blank')}>
                                <Youtube className="mr-2 h-5 w-5" />
                                Watch on YouTube
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            <motion.button
                className="fixed bottom-8 right-8 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: scrollY > 100 ? 1 : 0, y: scrollY > 100 ? 0 : 20 }}
                transition={{ duration: 0.3 }}
                aria-label="Scroll to top"
            >
                <ChevronUp className="h-6 w-6" />
            </motion.button>
        </div>
    )
}