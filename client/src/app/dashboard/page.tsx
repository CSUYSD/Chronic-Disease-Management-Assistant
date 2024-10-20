'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { selectProfile, selectIsLoading } from '@/store/profileSlice'
import { setSelectedDisease } from '@/store/diseaseSlice'
import { RootState } from '@/store'
import { GetAllDiseases, switchDisease, getCurrentDisease } from "@/api/patient"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Droplet } from "lucide-react"
import PatientDashboard from './PatientDashboard'
import CompanionDashboard from './CompanionDashboard'

interface Disease {
    id: string
    accountName: string
    icon: React.ReactNode
    available: boolean
}

export default function Dashboard() {
    const profile = useSelector(selectProfile)
    const isLoading = useSelector(selectIsLoading)
    const selectedDisease = useSelector((state: RootState) => state.disease.selectedDisease)
    const dispatch = useDispatch()
    const [diseases, setDiseases] = useState<Disease[]>([])
    const [isDiseaseLoading, setIsDiseaseLoading] = useState(false)

    const fetchDiseases = useCallback(async () => {
        try {
            const response = await GetAllDiseases()
            const fetchedDiseases = response.data.map((disease: any) => ({
                id: disease.id,
                accountName: disease.accountName,
                icon: disease.accountName === 'Hypertension' ? <Activity className="h-8 w-8 text-red-500" /> :
                    disease.accountName === 'Diabetes' ? <Droplet className="h-8 w-8 text-blue-500" /> :
                        <Heart className="h-8 w-8 text-pink-500" />,
                available: disease.accountName === 'Hypertension'
            }))
            setDiseases(fetchedDiseases)
        } catch (error) {
            console.error('Error fetching diseases:', error)
            toast({
                title: "Error",
                description: "Failed to fetch diseases. Please try again.",
                variant: "destructive",
            })
        }
    }, [])

    const fetchCurrentDisease = useCallback(async () => {
        try {
            const response = await getCurrentDisease()
            dispatch(setSelectedDisease(response.data.accountName))
        } catch (error) {
            console.error('Error fetching current disease:', error)
            dispatch(setSelectedDisease(null))
        }
    }, [dispatch])

    useEffect(() => {
        if (profile?.role === 'patient') {
            fetchDiseases()
            fetchCurrentDisease()
        }
    }, [profile, fetchDiseases, fetchCurrentDisease])

    const handleSelectDisease = async (disease: Disease) => {
        if (disease.available) {
            setIsDiseaseLoading(true)
            try {
                await switchDisease(disease.id)
                dispatch(setSelectedDisease(disease.accountName))
            } catch (error) {
                console.error('Error switching disease:', error)
                toast({
                    title: "Error",
                    description: "Failed to switch disease. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsDiseaseLoading(false)
            }
        } else {
            toast({
                title: "Information",
                description: `${disease.accountName} is currently in beta and not available for selection.`,
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 p-6 max-w-7xl mx-auto"
        >
            <motion.h1
                className="text-3xl font-bold text-gray-800"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
            >
                {profile?.role === 'patient' ? 'Patient Dashboard' : 'Companion Dashboard'}
            </motion.h1>
            {profile?.role === 'patient' ? (
                <>
                    {!selectedDisease ? (
                        <div className="container mx-auto p-4">
                            <h2 className="text-2xl font-bold mb-4">Select a Disease</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {diseases.map((disease) => (
                                    <Card key={disease.id} className={`cursor-pointer transition-all ${disease.available ? 'hover:shadow-lg' : 'opacity-50'}`}>
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-center">
                                                {disease.icon}
                                                <span className="ml-2">{disease.accountName}</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                className="w-full"
                                                onClick={() => handleSelectDisease(disease)}
                                                disabled={!disease.available || isDiseaseLoading}
                                            >
                                                {disease.available ? 'Select' : 'Coming Soon (Beta)'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <PatientDashboard />
                    )}
                </>
            ) : (
                <CompanionDashboard />
            )}
        </motion.div>
    )
}