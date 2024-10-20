'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Activity, Calendar, Edit, PlusCircle, Search, Trash2, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { getAllRecordsAPI, createRecordAPI, deleteRecordAPI, updateRecordAPI } from "@/api/record"
import { GetReportAPI } from "@/api/ai"
import { toast } from "@/hooks/use-toast"
import { setSelectedDisease } from '@/store/diseaseSlice'
import { RootState } from '@/store'
import AiResponseFormatter from '@/components/AiResponseFormatter'

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

interface HealthReport {
    content: string
    generatedAt: string
}

export default function PatientDashboard() {
    const dispatch = useDispatch()
    const selectedDisease = useSelector((state: RootState) => state.disease.selectedDisease)
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
    const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
    const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [reportError, setReportError] = useState<string | null>(null)
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
    const [isReportExpanded, setIsReportExpanded] = useState(false)

    const fetchHealthRecords = useCallback(async () => {
        if (!selectedDisease) return
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
    }, [selectedDisease])

    const fetchHealthReport = useCallback(async () => {
        if (!selectedDisease) return
        setReportStatus('loading')
        try {
            const response = await GetReportAPI()
            setHealthReport({
                content: response.data[0].content,
                generatedAt: new Date().toISOString()
            })
            setReportStatus('idle')
        } catch (error) {
            console.error('Error fetching health report:', error)
            setReportError('Failed to fetch health report. Please try again.')
            setReportStatus('error')
            toast({
                title: "Error",
                description: "Failed to fetch health report. Please try again.",
                variant: "destructive",
            })
        }
    }, [selectedDisease])

    useEffect(() => {
        fetchHealthRecords()
        fetchHealthReport()
    }, [fetchHealthRecords, fetchHealthReport])

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
                description: "New health record created successfully.",
            })
            const recordsTab = document.querySelector('[data-state="inactive"][value="records"]') as HTMLButtonElement
            if (recordsTab) {
                recordsTab.click()
            }
            setTimeout(() => {
                const newRecordElement = document.querySelector('.health-record:first-child')
                if (newRecordElement) {
                    newRecordElement.classList.add('animate-pulse')
                    setTimeout(() => {
                        newRecordElement.classList.remove('animate-pulse')
                    }, 2000)
                }
            }, 100)
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

    const filteredRecords = healthRecords.filter(record =>
        record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
    )

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{selectedDisease}</h1>
                <Button
                    variant="outline"
                    onClick={() => dispatch(setSelectedDisease(null))}
                >
                    Change Disease
                </Button>
            </div>
            <Tabs defaultValue="records" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="records">Health Records</TabsTrigger>
                    <TabsTrigger value="new">New Record</TabsTrigger>
                    <TabsTrigger value="report">Health Report</TabsTrigger>
                </TabsList>
                <TabsContent value="records">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Activity className="mr-2 h-5 w-5 text-blue-500" />
                                    {selectedDisease}'s Health Records
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
                                                                <DialogDescription>Modify your health record here.</DialogDescription>
                                                            </DialogHeader>
                                                            <form onSubmit={handleUpdate} className="space-y-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <Label htmlFor="edit-sbp">Systolic</Label>
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
                                                                        <Label htmlFor="edit-dbp">Diastolic</Label>
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
                                                                        <Label htmlFor="edit-isLessUrination">Reduced Urination</Label>
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
                                                <p className="text-gray-600"><span className="font-medium">Headache:</span> {record.isHeadache === 'YES' ? 'Yes' : 'No'}</p>
                                                <p className="text-gray-600"><span className="font-medium">Back Pain:</span> {record.isBackPain === 'YES' ? 'Yes' : 'No'}</p>
                                                <p className="text-gray-600"><span className="font-medium">Chest Pain:</span> {record.isChestPain === 'YES' ? 'Yes' : 'No'}</p>
                                                <p className="text-gray-600"><span className="font-medium">Reduced Urination:</span> {record.isLessUrination === 'YES' ? 'Yes' : 'No'}</p>
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
                                            <Label htmlFor="sbp">Systolic</Label>
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
                                            <Label htmlFor="dbp">Diastolic</Label>
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
                                            <Label htmlFor="isLessUrination">Reduced Urination</Label>
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
                                <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-t-2 border-white rounded-full"
                                        />
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Record
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="report">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                                    Health Report
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
                                        className="w-12 h-12 border-t-2 border-blue-500 rounded-full"
                                    />
                                </div>
                            ) : reportStatus === 'error' ? (
                                <div className="text-center text-red-600">
                                    <p>{reportError}</p>
                                    <Button onClick={fetchHealthReport} className="mt-4">
                                        Retry
                                    </Button>
                                </div>
                            ) : healthReport ? (
                                <div className="prose max-w-none">
                                    {isReportExpanded && healthReport.content ? (
                                        <AiResponseFormatter text={healthReport.content} />
                                    ) : (
                                        <p className="text-gray-600">Click 'Expand' to view the full report.</p>
                                    )}
                                    {healthReport.generatedAt && (
                                        <p className="text-sm text-gray-500 mt-4">
                                            Generated at: {new Date(healthReport.generatedAt).toLocaleString()}
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