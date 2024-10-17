'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity, Calendar, Edit, PlusCircle, Search, Trash2, X, UserPlus, AlertTriangle } from "lucide-react"

interface HealthRecord {
    id: number
    date: string
    symptoms: string
    notes: string
}

interface Patient {
    id: number
    name: string
    age: number
    condition: string
}

interface User {
    role: 'patient' | 'companion'
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
    const [newRecord, setNewRecord] = useState({ symptoms: '', notes: '' })
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [warningInfo, setWarningInfo] = useState<string | null>(null)

    useEffect(() => {
        const fetchUserAndData = async () => {
            setLoading(true)
            // Simulating API call to get user role
            await new Promise(resolve => setTimeout(resolve, 1000))
            const userRole = Math.random() > 0.5 ? 'patient' : 'companion'
            setUser({ role: userRole })

            if (userRole === 'companion') {
                // Fetch health records for patient
                setHealthRecords([
                    { id: 1, date: "2023-05-01", symptoms: "Mild headache", notes: "Possibly due to lack of sleep" },
                    { id: 2, date: "2023-05-15", symptoms: "Cold symptoms", notes: "Started taking cold medicine" },
                    { id: 3, date: "2023-06-01", symptoms: "Sore throat", notes: "Drinking warm tea with honey" },
                ])
            } else {
                // Fetch patients for companion
                setPatients([
                    { id: 1, name: "John Doe", age: 65, condition: "Diabetes" },
                    { id: 2, name: "Jane Smith", age: 72, condition: "Hypertension" },
                ])
            }
            setLoading(false)
        }

        fetchUserAndData()
    }, [])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const newHealthRecord = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            ...newRecord
        }
        setHealthRecords([...healthRecords, newHealthRecord])
        setNewRecord({ symptoms: '', notes: '' })
    }

    const handleEdit = (record: HealthRecord) => {
        setEditingRecord(record)
    }

    const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (editingRecord) {
            setHealthRecords(healthRecords.map(record =>
                record.id === editingRecord.id ? editingRecord : record
            ))
            setEditingRecord(null)
        }
    }

    const handleDelete = (id: number) => {
        setHealthRecords(healthRecords.filter(record => record.id !== id))
    }

    const filteredRecords = healthRecords.filter(record =>
        record.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient)
        // Simulating fetching patient's health report and warning info
        setHealthRecords([
            { id: 1, date: "2023-06-01", symptoms: "Elevated blood sugar", notes: "Adjust insulin dose" },
            { id: 2, date: "2023-06-15", symptoms: "Fatigue", notes: "Recommend more rest" },
        ])
        setWarningInfo("Patient's blood sugar levels have been consistently high for the past week.")
    }

    if (loading) {
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
                {user?.role === 'patient' ? 'Patient Dashboard' : 'Companion Dashboard'}
            </motion.h1>
            {user?.role === 'patient' ? (
                <Tabs defaultValue="records" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="records">Health Records</TabsTrigger>
                        <TabsTrigger value="new">New Record</TabsTrigger>
                    </TabsList>
                    <TabsContent value="records">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Activity className="mr-2 h-5 w-5 text-blue-500" />
                                        Health Records
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search records..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8 pr-4 py-2"
                                        />
                                    </div>
                                </CardTitle>
                                <CardDescription>Your historical health records</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AnimatePresence>
                                    {filteredRecords.map((record) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="mb-4 p-4 border rounded-lg hover:shadow-md transition-all bg-white"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                                    <p className="font-semibold text-gray-700">{record.date}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Edit Health Record</DialogTitle>
                                                                <DialogDescription>Make changes to your health record here.</DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={handleUpdate} className="space-y-4">
                                                                <div>
                                                                    <Label htmlFor="edit-symptoms">Symptoms</Label>
                                                                    <Input
                                                                        id="edit-symptoms"
                                                                        value={editingRecord?.symptoms || ''}
                                                                        onChange={(e) => setEditingRecord(prev => prev ? {...prev, symptoms: e.target.value} : null)}
                                                                        required
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="edit-notes">Notes</Label>
                                                                    <Textarea
                                                                        id="edit-notes"
                                                                        value={editingRecord?.notes || ''}
                                                                        onChange={(e) => setEditingRecord(prev => prev ? {...prev, notes: e.target.value} : null)}
                                                                    />
                                                                </div>
                                                                <Button type="submit">Update Record</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete(record.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-gray-600"><span className="font-medium">Symptoms:</span> {record.symptoms}</p>
                                            <p className="text-gray-600"><span className="font-medium">Notes:</span> {record.notes}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="new">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PlusCircle className="mr-2 h-5 w-5 text-green-500" />
                                    Add New Record
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="symptoms">Symptoms</Label>
                                            <Input
                                                id="symptoms"
                                                value={newRecord.symptoms}
                                                onChange={(e) =>
                                                    setNewRecord({ ...newRecord, symptoms: e.target.value })
                                                }
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={newRecord.notes}
                                                onChange={(e) =>
                                                    setNewRecord({ ...newRecord, notes: e.target.value })
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="mt-4 w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Record
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserPlus className="mr-2 h-5 w-5 text-blue-500" />
                                Bind Patients
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {patients.map(patient => (
                                    <Button
                                        key={patient.id}
                                        onClick={() => handlePatientSelect(patient)}
                                        variant={selectedPatient?.id === patient.id ? "secondary" : "outline"}
                                        className="w-full justify-start"
                                    >
                                        {patient.name} - Age: {patient.age}, Condition: {patient.condition}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    {selectedPatient && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Activity className="mr-2 h-5 w-5 text-green-500" />
                                        Patient Health Report
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="text-lg font-semibold mb-2">{selectedPatient.name}'s Health Records</h3>
                                    {healthRecords.map(record => (
                                        <div key={record.id} className="mb-4 p-4 border rounded-lg">
                                            <p className="font-semibold">{record.date}</p>
                                            <p><span className="font-medium">Symptoms:</span> {record.symptoms}</p>
                                            <p><span className="font-medium">Notes:</span> {record.notes}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            {warningInfo && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-red-500">
                                            <AlertTriangle className="mr-2 h-5 w-5" />
                                            Warning Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p>{warningInfo}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            )}

        </motion.div>
    )
}