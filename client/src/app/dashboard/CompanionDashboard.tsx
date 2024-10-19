'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Activity, Bot, Calendar, Mail, Phone, Heart, Droplet, Stethoscope, Droplets, ChevronDown, ChevronUp } from "lucide-react"
import { BindPatientAPI, GetPatientInfo } from "@/api/companion"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HealthRecord {
    sbp: number
    dbp: number
    isHeadache: string
    isBackPain: string
    isChestPain: string
    isLessUrination: string
    importTime: string
    description: string
}

interface PatientDTO {
    id: number
    username: string
    email: string
    phone: string
    dob: string
    avatar: string | null
    selectedAccountName: string
    healthRecords: HealthRecord[]
}

interface CollapsibleProps {
    title: React.ReactNode
    children: React.ReactNode
}

const Collapsible: React.FC<CollapsibleProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border rounded-md mb-2">
            <button
                className="flex justify-between items-center w-full p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                {title}
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isOpen && <div className="p-4 pt-0">{children}</div>}
        </div>
    )
}

export default function CompanionDashboard() {
    const [patient, setPatient] = useState<PatientDTO | null>(null)
    const [bindingCode, setBindingCode] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPatientInfo()
    }, [])

    const fetchPatientInfo = async () => {
        try {
            const response = await GetPatientInfo()
            if (response.status === 200) {
                setPatient(response.data)
            }
        } catch (error: any) {
            console.error('Failed to fetch patient info:', error)
            if (error.response && error.response.status === 404) {
                setPatient(null)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to fetch patient information. Please try again later.",
                    variant: "destructive",
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleBindPatient = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        try {
            const response = await BindPatientAPI({ randomString: bindingCode })
            if (response.status === 200) {
                toast({
                    title: "Success",
                    description: "Patient bound successfully.",
                })
                await fetchPatientInfo()
            }
        } catch (error: any) {
            console.error('Failed to bind patient:', error)
            toast({
                title: "Error",
                description: "Failed to bind patient. Please check the binding code and try again.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const groupHealthRecordsByDate = (records: HealthRecord[]) => {
        if (!records || records.length === 0) return []

        const grouped = records.reduce((acc, record) => {
            const date = new Date(record.importTime).toLocaleDateString()
            if (!acc[date]) {
                acc[date] = []
            }
            acc[date].push(record)
            return acc
        }, {} as Record<string, HealthRecord[]>)

        return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    }

    if (loading) {
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

    if (!patient) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <UserPlus className="mr-2 h-5 w-5 text-blue-500" />
                        Bind Patient
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleBindPatient}>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="bindingCode">Patient Binding Code</Label>
                                <Input
                                    id="bindingCode"
                                    value={bindingCode}
                                    onChange={(e) => setBindingCode(e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Enter the patient's binding code"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="mt-4 w-full" disabled={loading}>
                            {loading ? (
                                <motion.div
                                    className="h-5 w-5 rounded-full border-t-2 border-r-2 border-white"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" /> Bind Patient
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )
    }

    const groupedHealthRecords = groupHealthRecordsByDate(patient.healthRecords)

    return (
        <div className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="health-records">Health Records</TabsTrigger>
                    <TabsTrigger value="ai-report">AI Report</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserPlus className="mr-2 h-5 w-5 text-blue-500" />
                                Patient Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex items-center space-x-4 mb-4"
                            >
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={patient.avatar || '/placeholder.svg?height=80&width=80'} alt={patient.username} />
                                    <AvatarFallback>{patient.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold">{patient.username}</h2>
                                    <p className="text-muted-foreground">{patient.selectedAccountName}</p>
                                </div>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="space-y-2"
                            >
                                <p className="flex items-center"><Mail className="mr-2 h-4 w-4" /> {patient.email}</p>
                                <p className="flex items-center"><Phone className="mr-2 h-4 w-4" /> {patient.phone}</p>
                                <p className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Born: {new Date(patient.dob).toLocaleDateString()}</p>
                            </motion.div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="health-records">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="mr-2 h-5 w-5 text-green-500" />
                                Health Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                                {groupedHealthRecords.length > 0 ? (
                                    groupedHealthRecords.map(([date, records]) => (
                                        <Collapsible
                                            key={date}
                                            title={
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    <span>{date}</span>
                                                </div>
                                            }
                                        >
                                            {records.map((record, index) => (
                                                <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
                                                    <p className="font-medium mb-2">Time: {new Date(record.importTime).toLocaleTimeString()}</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <p><Heart className="inline mr-1" /> Blood Pressure: {record.sbp}/{record.dbp} mmHg</p>
                                                        <p><Droplet className="inline mr-1" /> Headache: {record.isHeadache}</p>
                                                        <p><Stethoscope className="inline mr-1" /> Chest Pain: {record.isChestPain}</p>
                                                        <p><Droplets className="inline mr-1" /> Less Urination: {record.isLessUrination}</p>
                                                    </div>
                                                    <p className="mt-2"><span className="font-medium">Description:</span> {record.description}</p>
                                                </div>
                                            ))}
                                        </Collapsible>
                                    ))
                                ) : (
                                    <p>No health records available.</p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ai-report">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bot className="mr-2 h-5 w-5 text-purple-500" />
                                AI Health Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>AI health report functionality is not implemented yet.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}