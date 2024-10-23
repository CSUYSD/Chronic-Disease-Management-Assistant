'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity, Calendar, Edit, PlusCircle, Search, Trash2, Heart, Droplet, ArrowLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { switchDisease, GetAllDiseases, getCurrentDisease } from "@/api/patient"
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
    id: string
    accountName: string
    icon: React.ReactNode
    available: boolean
}

export default function PatientDashboard() {
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
    const [isLoading, setIsLoading] = useState(false)
    const [diseases, setDiseases] = useState<Disease[]>([])

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
            setSelectedDisease(response.data.accountName)
        } catch (error) {
            console.error('Error fetching current disease:', error)
            setSelectedDisease(null)
        }
    }, [])

    useEffect(() => {
        const initializeDashboard = async () => {
            await fetchDiseases()
            await fetchCurrentDisease()
        }

        initializeDashboard()
    }, [fetchDiseases, fetchCurrentDisease])

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
            setIsLoading(true)
            try {
                const response = await updateRecordAPI(editingRecord.id, editingRecord)
                setHealthRecords(prevRecords =>
                    prevRecords.map(record =>
                        record.id === editingRecord.id ? response.data : record
                    )
                )
                setEditingRecord(null)
                toast({
                    title: "Success",
                    description: "Health record updated successfully.",
                })
            } catch (error) {
                console.error('Error updating health record:', error)
                toast({
                    title: "Error",
                    description: "Failed to update health record. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleDelete = async (id: string) => {
        setIsLoading(true)
        try {
            await deleteRecordAPI(id)
            setHealthRecords(prevRecords => prevRecords.filter(record => record.id !== id))
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
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectDisease = async (disease: Disease) => {
        if (disease.available) {
            setIsLoading(true)
            try {
                await switchDisease(disease.id)
                setSelectedDisease(disease.accountName)
                await fetchHealthRecords()
            } catch (error) {
                console.error('Error switching disease:', error)
                toast({
                    title: "Error",
                    description: "Failed to switch disease. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        } else {
            toast({
                title: "Information",
                description: `${disease.accountName} is currently in beta and not available for selection.`,
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
                                disabled={!disease.available}
                            >
                                {disease.available ? 'Select' : 'Coming Soon (Beta)'}
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
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-sbp">Systolic BP</Label>
                                                                        <Input
                                                                            id="edit-sbp"
                                                                            type="number"
                                                                            value={editingRecord?.sbp}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? {...prev, sbp: parseInt(e.target.value)} : null)}
                                                                            required
                                                                            className="mt-1"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-dbp">Diastolic BP</Label>
                                                                        <Input
                                                                            id="edit-dbp"
                                                                            type="number"
                                                                            value={editingRecord?.dbp}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? {...prev, dbp: parseInt(e.target.value)} : null)}
                                                                            required
                                                                            className="mt-1"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-isHeadache">Headache</Label>
                                                                        <select
                                                                            id="edit-isHeadache"
                                                                            value={editingRecord?.isHeadache}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? {...prev, isHeadache: e.target.value} : null)}
                                                                            className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                        >
                                                                            <option value="YES">Yes</option>
                                                                            <option value="NO">No</option>

                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-isBackPain">Back Pain</Label>
                                                                        <select
                                                                            id="edit-isBackPain"
                                                                            value={editingRecord?.isBackPain}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? {...prev, isBackPain: e.target.value} : null)}
                                                                            className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                        >
                                                                            <option value="YES">Yes</option>
                                                                            <option value="NO">No</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-isChestPain">Chest Pain</Label>
                                                                        <select
                                                                            id="edit-isChestPain"
                                                                            value={editingRecord?.isChestPain}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? {...prev, isChestPain: e.target.value} : null)}
                                                                            className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                        >
                                                                            <option value="YES">Yes</option>
                                                                            <option value="NO">No</option>
                                                                        </select>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-isLessUrination">Less Urination</Label>
                                                                        <select
                                                                            id="edit-isLessUrination"
                                                                            value={editingRecord?.isLessUrination}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? {...prev, isLessUrination: e.target.value} : null)}
                                                                            className="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                                        >
                                                                            <option value="YES">Yes</option>
                                                                            <option value="NO">No</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="edit-description">Description</Label>
                                                                    <Textarea
                                                                        id="edit-description"
                                                                        value={editingRecord?.description}
                                                                        onChange={(e) => setEditingRecord(prev => prev ? {...prev, description: e.target.value} : null)}
                                                                        className="mt-1"
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
                            <CardTitle className="flex items-center text-2xl">
                                <PlusCircle className="mr-2 h-6 w-6 text-green-500" />
                                Add New Record
                            </CardTitle>
                            <CardDescription>Enter your health information for today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="sbp" className="text-lg font-semibold">Systolic Blood Pressure</Label>
                                        <Input
                                            id="sbp"
                                            type="number"
                                            placeholder="Enter SBP"
                                            value={newRecord.sbp}
                                            onChange={(e) => setNewRecord({ ...newRecord, sbp: parseInt(e.target.value) })}
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dbp" className="text-lg font-semibold">Diastolic Blood Pressure</Label>
                                        <Input
                                            id="dbp"
                                            type="number"
                                            placeholder="Enter DBP"
                                            value={newRecord.dbp}
                                            onChange={(e) => setNewRecord({ ...newRecord, dbp: parseInt(e.target.value) })}
                                            required
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Symptoms</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isHeadache"
                                                checked={newRecord.isHeadache === 'YES'}
                                                onCheckedChange={(checked) =>
                                                    setNewRecord({ ...newRecord, isHeadache: checked ? 'YES' : 'NO' })
                                                }
                                            />
                                            <Label htmlFor="isHeadache" className="flex items-center">
                                                <span className="mr-2">🌡️</span> Headache
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isBackPain"
                                                checked={newRecord.isBackPain === 'YES'}
                                                onCheckedChange={(checked) =>
                                                    setNewRecord({ ...newRecord, isBackPain: checked ? 'YES' : 'NO' })
                                                }
                                            />
                                            <Label htmlFor="isBackPain" className="flex items-center">
                                                <span className="mr-2">😣</span> Back Pain
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isChestPain"
                                                checked={newRecord.isChestPain === 'YES'}
                                                onCheckedChange={(checked) =>
                                                    setNewRecord({ ...newRecord, isChestPain: checked ? 'YES' : 'NO' })
                                                }
                                            />
                                            <Label htmlFor="isChestPain" className="flex items-center">
                                                <span className="mr-2">❤️</span> Chest Pain
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isLessUrination"
                                                checked={newRecord.isLessUrination === 'YES'}
                                                onCheckedChange={(checked) =>
                                                    setNewRecord({ ...newRecord, isLessUrination: checked ? 'YES' : 'NO' })
                                                }
                                            />
                                            <Label htmlFor="isLessUrination" className="flex items-center">
                                                <span className="mr-2">💧</span> Less Urination
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Add any additional notes or observations here..."
                                        value={newRecord.description}
                                        onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                                        className="mt-2"
                                        rows={4}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-t-2 border-white rounded-full"
                                        />
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Health Record
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}