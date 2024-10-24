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
import { BindPatientAPI, GetPatientInfo, GetPatientRecords } from "@/api/companion"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GetReportAPI } from "@/api/ai"
import AiResponseFormatter from '@/components/AiResponseFormatter'

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

interface Account {
    id: number
    name: string
    // Add other account properties as needed
}

interface PatientDTO {
    id: number
    username: string
    email: string
    phone: string
    dob: string
    avatar: string | null
    selectedAccountName: string
    accounts: Account[]
}

interface HealthReport {
    content: string
    generatedAt: string
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
    const [report, setReport] = useState<HealthReport | null>(null)
    const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [isReportExpanded, setIsReportExpanded] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])

    useEffect(() => {
        fetchPatientInfo()
    }, [])

    const fetchPatientInfo = async () => {
        try {
            const response = await GetPatientInfo()
            if (response.status === 200) {
                setPatient(response.data)
                if (response.data.accounts.length > 0) {
                    setSelectedAccount(response.data.accounts[0])
                    fetchPatientRecords(response.data.accounts[0].name)
                }
                fetchHealthReport()
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

    const fetchPatientRecords = async (accountName: string) => {
        try {
            const response = await GetPatientRecords(accountName)
            if (response.status === 200) {
                setHealthRecords(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch patient records:', error)
            toast({
                title: "Error",
                description: "Failed to fetch patient records. Please try again later.",
                variant: "destructive",
            })
        }
    }

    const handleBindPatient = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        try {
            const response = await BindPatientAPI(bindingCode)
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

    const fetchHealthReport = async () => {
        setReportStatus('loading')
        try {
            const response = await GetReportAPI()
            setReport({
                content: response.data[0].content,
                generatedAt: new Date().toISOString()
            })
            setReportStatus('idle')
        } catch (error) {
            console.error('Error fetching health report:', error)
            setReportStatus('error')
            toast({
                title: "Error",
                description: "Failed to fetch health report. Please try again later.",
                variant: "destructive",
            })
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

    const groupedHealthRecords = groupHealthRecordsByDate(healthRecords)

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
                                    <p className="text-muted-foreground">Selected Account: {patient.selectedAccountName}</p>
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
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Activity className="mr-2 h-5 w-5 text-green-500" />
                                    Health Records
                                </div>
                                <select
                                    value={selectedAccount?.id || ''}
                                    onChange={(e) => {
                                        const account = patient.accounts.find(acc => acc.id.toString() === e.target.value)
                                        if (account) {
                                            setSelectedAccount(account)
                                            fetchPatientRecords(account.name)
                                        }
                                    }}
                                    className="border rounded p-2"
                                >
                                    {patient.accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
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
                                    <p>No health records available for the selected account.</p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ai-report">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Bot className="mr-2 h-5 w-5 text-purple-500" />
                                    AI Health Report
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsReportExpanded(!isReportExpanded)}
                                >
                                    {isReportExpanded ? (

                                        <>
                                            <ChevronUp className="h-4 w-4 mr-2" />
                                            Collapse
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-2" />
                                            Expand
                                        </>
                                    )}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reportStatus === 'loading' ? (
                                <div className="flex justify-center items-center h-40">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-12 h-12 border-t-2 border-purple-500 rounded-full"
                                    />
                                </div>
                            ) : reportStatus === 'error' ? (
                                <div className="text-center text-gray-600">
                                    <p>Unable to load the health report at this time. Please try again later.</p>
                                </div>
                            ) : report ? (
                                <div className="prose max-w-none">
                                    {isReportExpanded && report.content ? (
                                        <AiResponseFormatter text={report.content} />
                                    ) : (
                                        <p className="text-gray-600">Click 'Expand' to view the full report.</p>
                                    )}
                                    {report.generatedAt && (
                                        <p className="text-sm text-gray-500 mt-4">
                                            Generated at: {new Date(report.generatedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-600">No health report available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}