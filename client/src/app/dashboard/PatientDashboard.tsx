'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity, Calendar, Edit, PlusCircle, Search, Trash2, Heart, Droplet, ArrowLeft } from "lucide-react"
import { createDisease, switchDisease, GetAllDiseases } from "@/api/patient"
import { getAllRecordsAPI, createRecordAPI, deleteRecordAPI, updateRecordAPI } from "@/api/record"
import { toast } from "@/hooks/use-toast"

interface HealthRecord {
    id: string
    sbp: number
    dbp: number
    isHeadache: string
    isBackPain: string
    isChestPain: string
    isLessUrination: string
    importTime: string
    description: string
}

interface Disease {
    accountName: string
    icon: React.ReactNode
    available: boolean
}

export function PatientDashboard() {
    const [selectedDisease, setSelectedDisease] = useState<string | null>(null)
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
    const [newRecord, setNewRecord] = useState<Omit<HealthRecord, 'id' | 'importTime'>>({
        sbp: 0,
        dbp: 0,
        isHeadache: 'NO',
        isBackPain: 'NO',
        isChestPain: 'NO',
        isLessUrination: 'NO',
        description: ''
    })
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [, setIsDiseaseCreated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const diseases: Disease[] = [
        { accountName: 'Hypertension', icon: <Activity className="h-8 w-8 text-red-500" />, available: true },
        { accountName: 'Diabetes', icon: <Droplet className="h-8 w-8 text-blue-500" />, available: false },
        { accountName: 'Heart Disease', icon: <Heart className="h-8 w-8 text-pink-500" />, available: false },
    ]

    useEffect(() => {
        const initializeDiseases = async () => {
            try {
                const response = await GetAllDiseases()
                const hypertensionDisease = response.data.find(disease => disease.id === 1 && disease.accountName === 'Hypertension')
                if (!hypertensionDisease) {
                    await createDisease({ accountName: 'Hypertension' })
                    console.log('Hypertension disease created')
                } else {
                    console.log('Hypertension disease already exists')
                }
                setIsDiseaseCreated(true)
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    try {
                        await createDisease({ accountName: 'Hypertension' })
                        console.log('Hypertension disease created after 404 error')
                        setIsDiseaseCreated(true)
                    } catch (createError) {
                        console.error('Error creating disease after 404:', createError)
                        toast({
                            title: "Error",
                            description: "Failed to create disease. Please try again.",
                            variant: "destructive",
                        })
                    }
                } else {
                    console.error('Error initializing diseases:', error)
                    toast({
                        title: "Error",
                        description: "Failed to initialize diseases. Please try again.",
                        variant: "destructive",
                    })
                }
            }
        }

        initializeDiseases()
    }, [])

    useEffect(() => {
        if (selectedDisease) {
            fetchHealthRecords()
        }
    }, [selectedDisease])

    const fetchHealthRecords = async () => {
        setIsLoading(true)
        try {
            const response = await getAllRecordsAPI()
            setHealthRecords(response.data)
        } catch (error) {
            console.error('Error fetching health records:', error)
            toast({
                title: "Error",
                description: "Failed to fetch health records. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        try {
            const response = await createRecordAPI({
                ...newRecord,
                importTime: new Date().toISOString()
            })
            setHealthRecords(prevRecords => [response.data, ...prevRecords])
            setNewRecord({
                sbp: 0,
                dbp: 0,
                isHeadache: 'NO',
                isBackPain: 'NO',
                isChestPain: 'NO',
                isLessUrination: 'NO',
                description: ''
            })
            toast({
                title: "Success",
                description: "Health record created successfully.",
            })

            // 添加动画效果
            const newRecordElement = document.querySelector('.health-record:first-child')
            if (newRecordElement) {
                newRecordElement.classList.add('animate-pulse')
                setTimeout(() => {
                    newRecordElement.classList.remove('animate-pulse')
                }, 2000)
            }
        } catch (error) {
            console.error('Error creating health record:', error)
            toast({
                title: "Error",
                description: "Failed to create health record. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (record: HealthRecord) => {
        setEditingRecord(record)
    }

    const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (editingRecord) {
            try {
                const response = await updateRecordAPI(editingRecord.id, editingRecord)
                setEditingRecord(null)
                toast({
                    title: "Success",
                    description: "Health record updated successfully.",
                })
                fetchHealthRecords() // 立即刷新记录
            } catch (error) {
                console.error('Error updating health record:', error)
                toast({
                    title: "Error",
                    description: "Failed to update health record. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteRecordAPI(id)
            setHealthRecords(healthRecords.filter(record => record.id !== id))
            toast({
                title: "Success",
                description: "Health record deleted successfully.",
            })
        } catch (error) {
            console.error('Error deleting health record:', error)
            toast({
                title: "Error",
                description: "Failed to delete health record. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleSelectDisease = (diseaseName: string) => {
        if (diseaseName === 'Hypertension') {
            setIsLoading(true)
            switchDisease('1')
                .then(() => {
                    console.log('Switched to Hypertension')
                    setSelectedDisease(diseaseName)
                    return fetchHealthRecords()
                })
                .catch((error) => {
                    console.error('Error switching disease:', error)
                    toast({
                        title: "Error",
                        description: "Failed to switch disease. Please try again.",
                        variant: "destructive",
                    })
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }

    const filteredRecords = healthRecords.filter(record =>
        record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
    )

    if (!selectedDisease) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {diseases.map((disease) => (
                    <Card key={disease.accountName} className={`cursor-pointer transition-all ${disease.available ? 'hover:shadow-lg' : 'opacity-50'}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-center">
                                {disease.icon}
                                <span className="ml-2">{disease.accountName}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                onClick={() => disease.available && handleSelectDisease(disease.accountName)}
                                disabled={!disease.available}
                            >
                                {disease.available ? 'Select' : 'Coming Soon'}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Button
                variant="outline"
                onClick={() => setSelectedDisease(null)}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Diseases
            </Button>
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
                                    Health Records for {selectedDisease}
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
                            {isLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-12 h-12 border-t-2 border-blue-500 rounded-full"
                                    />
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {filteredRecords.map((record) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="mb-4 p-4 border rounded-lg hover:shadow-md transition-all bg-white health-record"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                                    <p className="font-semibold text-gray-700">{new Date(record.importTime).toLocaleString()}</p>
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
                                                                {/* Edit form fields */}
                                                                <Button type="submit">Update Record</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button variant="outline" size="sm" onClick={() => handleDelete(record.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <p className="text-gray-600"><span className="font-medium">Blood Pressure:</span> {record.sbp}/{record.dbp} mmHg</p>
                                                <p className="text-gray-600"><span className="font-medium">Headache:</span> {record.isHeadache}</p>
                                                <p className="text-gray-600"><span className="font-medium">Back Pain:</span> {record.isBackPain}</p>
                                                <p className="text-gray-600"><span className="font-medium">Chest Pain:</span> {record.isChestPain}</p>
                                                <p className="text-gray-600"><span className="font-medium">Less Urination:</span> {record.isLessUrination}</p>
                                            </div>
                                            <p className="text-gray-600"><span className="font-medium">Description:</span> {record.description}</p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="sbp">Systolic BP</Label>
                                            <Input
                                                id="sbp"
                                                type="number"
                                                value={newRecord.sbp}
                                                onChange={(e) => setNewRecord({ ...newRecord, sbp: parseInt(e.target.value) })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="dbp">Diastolic BP</Label>
                                            <Input
                                                id="dbp"
                                                type="number"
                                                value={newRecord.dbp}
                                                onChange={(e) => setNewRecord({ ...newRecord, dbp: parseInt(e.target.value) })}
                                                required
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="isHeadache">Headache</Label>
                                            <select
                                                id="isHeadache"
                                                value={newRecord.isHeadache}
                                                onChange={(e) => setNewRecord({ ...newRecord, isHeadache: e.target.value })}
                                                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="YES">Yes</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="isBackPain">Back Pain</Label>
                                            <select
                                                id="isBackPain"
                                                value={newRecord.isBackPain}
                                                onChange={(e) => setNewRecord({ ...newRecord, isBackPain: e.target.value })}
                                                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="YES">Yes</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="isChestPain">Chest Pain</Label>
                                            <select
                                                id="isChestPain"
                                                value={newRecord.isChestPain}
                                                onChange={(e) => setNewRecord({ ...newRecord, isChestPain: e.target.value })}
                                                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="YES">Yes</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="isLessUrination">Less Urination</Label>
                                            <select
                                                id="isLessUrination"
                                                value={newRecord.isLessUrination}
                                                onChange={(e) => setNewRecord({ ...newRecord, isLessUrination: e.target.value })}
                                                className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="YES">Yes</option>
                                                <option value="NO">No</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={newRecord.description}
                                            onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
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
        </div>
    )
}