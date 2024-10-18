'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Activity, AlertTriangle, Bot, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface Patient {
    id: number
    name: string
    age: number
    condition: string
}

interface HealthRecord {
    id: number
    date: string
    symptoms: string
    notes: string
}

interface AIReport {
    summary: string
    recommendations: string[]
}

export function CompanionDashboard() {
    const [boundPatient, setBoundPatient] = useState<Patient | null>(null)
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
    const [warningInfo, setWarningInfo] = useState<string | null>(null)
    const [aiReport, setAIReport] = useState<AIReport | null>(null)
    const [bindingCode, setBindingCode] = useState('')
    const [loading, setLoading] = useState(false)

    const handleBindPatient = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        // Simulating API call to bind patient
        await new Promise(resolve => setTimeout(resolve, 1000))
        setBoundPatient({
            id: 1,
            name: "John Doe",
            age: 65,
            condition: "Diabetes"
        })
        setHealthRecords([
            { id: 1, date: "2023-06-01", symptoms: "Elevated blood sugar", notes: "Adjust insulin dose" },
            { id: 2, date: "2023-06-15", symptoms: "Fatigue", notes: "Recommend more rest" },
            { id: 3, date: "2023-06-30", symptoms: "Blurred vision", notes: "Schedule eye exam" },
        ])
        setWarningInfo("Patient's blood sugar levels have been consistently high for the past week.")
        setAIReport({
            summary: "Based on recent health records, the patient's diabetes management needs improvement. There are concerning trends in blood sugar levels and emerging complications.",
            recommendations: [
                "Adjust insulin dosage under doctor's supervision",
                "Increase daily physical activity to at least 30 minutes of moderate exercise",
                "Monitor blood sugar levels more frequently, ideally before and after meals",
                "Schedule a comprehensive eye exam to check for diabetic retinopathy",
                "Review and adjust the patient's diet plan with a nutritionist"
            ]
        })
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            {boundPatient ? (
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
                                >
                                    <p><span className="font-medium">Name:</span> {boundPatient.name}</p>
                                    <p><span className="font-medium">Age:</span> {boundPatient.age}</p>
                                    <p><span className="font-medium">Condition:</span> {boundPatient.condition}</p>
                                </motion.div>
                            </CardContent>
                        </Card>
                        {warningInfo && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-red-500">
                                        <AlertTriangle className="mr-2 h-5 w-5" />
                                        Warning Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        {warningInfo}
                                    </motion.p>
                                </CardContent>
                            </Card>
                        )}
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
                                    <Accordion type="single" collapsible className="w-full">
                                        {healthRecords.map((record, index) => (
                                            <AccordionItem value={`item-${index}`} key={record.id}>
                                                <AccordionTrigger>
                                                    <div className="flex items-center">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        <span>{record.date}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <p><span className="font-medium">Symptoms:</span> {record.symptoms}</p>
                                                    <p><span className="font-medium">Notes:</span> {record.notes}</p>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
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
                                {aiReport && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <p className="font-medium mb-2">Summary:</p>
                                        <p className="mb-4">{aiReport.summary}</p>
                                        <p className="font-medium mb-2">Recommendations:</p>
                                        <ul className="list-disc pl-5 space-y-2">
                                            {aiReport.recommendations.map((rec, index) => (
                                                <motion.li
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                >
                                                    {rec}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
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
            )}
        </div>
    )
}