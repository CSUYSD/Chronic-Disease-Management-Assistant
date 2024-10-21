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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Activity, Calendar, Edit, PlusCircle, Search, Trash2, FileText, ChevronDown, ChevronUp, Filter, HeartPulse, Brain, Stethoscope, Droplets } from "lucide-react"
import { getAllRecordsAPI, createRecordAPI, deleteRecordAPI, updateRecordAPI, deleteRecordsInBatchAPI, searchRecordsAPI, advancedSearchRecordsAPI } from "@/api/record"
import { GetReportAPI } from "@/api/ai"
import { toast } from "@/hooks/use-toast"
import { setSelectedDisease } from '@/store/diseaseSlice'
import { RootState } from '@/store'
import AiResponseFormatter from '@/components/AiResponseFormatter'
import { Checkbox } from "@/components/ui/checkbox"

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
    const [, setReportError] = useState<string | null>(null)
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
    const [selectedRecords, setSelectedRecords] = useState<string[]>([])
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
    const [advancedSearchParams, setAdvancedSearchParams] = useState({
        description: '',
        minSbp: '',
        maxSbp: '',
        minDbp: '',
        maxDbp: '',
        isHeadache: '',
        isBackPain: '',
        isChestPain: '',
        isLessUrination: ''
    })

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
            // Refresh the page
            window.location.reload()
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
        setEditingRecord({ ...record });
    };

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

    const handleBatchDelete = async () => {
        if (selectedRecords.length === 0) return
        setIsLoading(true)
        try {
            await deleteRecordsInBatchAPI(selectedRecords)
            setHealthRecords(prevRecords => prevRecords.filter(record => !selectedRecords.includes(record.id)))
            setSelectedRecords([])
            toast({
                title: "Success",
                description: `${selectedRecords.length} health record(s) deleted successfully.`,
            })
        } catch (error) {
            console.error('Error deleting health records:', error)
            toast({
                title: "Error",
                description: "Failed to delete health records. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async () => {
        setIsLoading(true);
        try {
            let response;
            if (searchTerm.trim() === '') {
                response = await getAllRecordsAPI();
            } else {
                response = await searchRecordsAPI({ keyword: searchTerm });
            }
            setHealthRecords(response.data);
        } catch (error) {
            console.error('Error searching health records:', error);
            toast({
                title: "Error",
                description: "Failed to search health records. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdvancedSearch = async () => {
        setIsLoading(true)
        try {
            const convertedParams = {
                ...advancedSearchParams,
                minSbp: advancedSearchParams.minSbp ? Number(advancedSearchParams.minSbp) : undefined,
                maxSbp: advancedSearchParams.maxSbp ? Number(advancedSearchParams.maxSbp) : undefined,
                minDbp: advancedSearchParams.minDbp ? Number(advancedSearchParams.minDbp) : undefined,
                maxDbp: advancedSearchParams.maxDbp ? Number(advancedSearchParams.maxDbp) : undefined,
            };
            const response = await advancedSearchRecordsAPI(convertedParams)
            setHealthRecords(response.data)
        } catch (error) {
            console.error('Error performing advanced search:', error)
            toast({
                title: "Error",
                description: "Failed to perform advanced search. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{selectedDisease}</h1>
                <Button
                    variant="outline"
                    onClick={() => dispatch(setSelectedDisease(''))}
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
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedRecords.length === healthRecords.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedRecords(healthRecords.map(record => record.id))
                                                } else {
                                                    setSelectedRecords([])
                                                }
                                            }}
                                        />
                                        <Label htmlFor="select-all">Select All</Label>
                                    </div>
                                    <Input
                                        placeholder="Search records..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64"
                                    />
                                    <Button onClick={handleSearch}>
                                        <Search className="h-4 w-4 mr-2" />
                                        Search
                                    </Button>
                                    <Button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
                                        <Filter className="h-4 w-4 mr-2" />
                                        Advanced
                                    </Button>
                                </div>
                            </CardTitle>
                            <CardDescription>Your historical health records</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {showAdvancedSearch && (
                                <div className="mb-4 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            placeholder="Description"
                                            value={advancedSearchParams.description}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, description: e.target.value})}
                                        />
                                        <Input
                                            placeholder="Min Systolic BP"
                                            type="number"
                                            value={advancedSearchParams.minSbp}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, minSbp: e.target.value})}
                                        />
                                        <Input
                                            placeholder="Max Systolic BP"
                                            type="number"
                                            value={advancedSearchParams.maxSbp}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, maxSbp: e.target.value})}
                                        />
                                        <Input
                                            placeholder="Min Diastolic BP"
                                            type="number"
                                            value={advancedSearchParams.minDbp}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, minDbp: e.target.value})}
                                        />
                                        <Input
                                            placeholder="Max Diastolic BP"
                                            type="number"
                                            value={advancedSearchParams.maxDbp}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, maxDbp: e.target.value})}
                                        />
                                        <select
                                            value={advancedSearchParams.isHeadache}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, isHeadache: e.target.value})}
                                            className="border rounded-md p-2"
                                        >
                                            <option value="">Headache (Any)</option>
                                            <option value="YES">Yes</option>
                                            <option value="NO">No</option>
                                        </select>
                                        <select
                                            value={advancedSearchParams.isBackPain}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, isBackPain: e.target.value})}
                                            className="border rounded-md p-2"
                                        >
                                            <option value="">Back Pain (Any)</option>
                                            <option value="YES">Yes</option>
                                            <option value="NO">No</option>
                                        </select>
                                        <select
                                            value={advancedSearchParams.isChestPain}
                                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, isChestPain: e.target.value})}
                                            className="border rounded-md p-2"
                                        >
                                            <option value="">Chest Pain (Any)</option>
                                            <option value="YES">Yes</option>
                                            <option value="NO">No</option>
                                        </select>
                                        <select
                                            value={advancedSearchParams.isLessUrination}
                                            onChange={(e) =>   setAdvancedSearchParams({...advancedSearchParams, isLessUrination: e.target.value})}
                                            className="border rounded-md p-2"
                                        >
                                            <option value="">Reduced Urination (Any)</option>
                                            <option value="YES">Yes</option>
                                            <option value="NO">No</option>
                                        </select>
                                    </div>
                                    <Button onClick={handleAdvancedSearch} className="mt-4">
                                        Perform Advanced Search
                                    </Button>
                                </div>
                            )}
                            {isLoading ? (
                                <motion.div
                                    className="flex justify-center items-center h-40"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-12 h-12 border-t-2 border-blue-500 rounded-full"
                                    />
                                </motion.div>
                            ) : (
                                <AnimatePresence>
                                    {healthRecords.map((record, index) => (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="mb-4 p-4 border rounded-lg hover:shadow-md transition-all bg-white health-record"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRecords.includes(record.id)}
                                                        onChange={() => {
                                                            if (selectedRecords.includes(record.id)) {
                                                                setSelectedRecords(selectedRecords.filter(id => id !== record.id))
                                                            } else {
                                                                setSelectedRecords([...selectedRecords, record.id])
                                                            }
                                                        }}
                                                        className="mr-2"
                                                    />
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
                                                                        <Label htmlFor="edit-sbp">Systolic BP</Label>
                                                                        <Input
                                                                            id="edit-sbp"
                                                                            type="number"
                                                                            value={editingRecord?.sbp || ''}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? { ...prev, sbp: parseInt(e.target.value) || 0 } : null)}
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="edit-dbp">Diastolic BP</Label>
                                                                        <Input
                                                                            id="edit-dbp"
                                                                            type="number"
                                                                            value={editingRecord?.dbp || ''}
                                                                            onChange={(e) => setEditingRecord(prev => prev ? { ...prev, dbp: parseInt(e.target.value) || 0 } : null)}
                                                                            required
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="edit-isHeadache"
                                                                            checked={editingRecord?.isHeadache === 'YES'}
                                                                            onCheckedChange={(checked) => setEditingRecord(prev => prev ? { ...prev, isHeadache: checked ? 'YES' : 'NO' } : null)}
                                                                        />
                                                                        <Label htmlFor="edit-isHeadache" className="flex items-center">
                                                                            <Brain className="w-4 h-4 mr-2" />
                                                                            Headache
                                                                        </Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="edit-isBackPain"
                                                                            checked={editingRecord?.isBackPain === 'YES'}
                                                                            onCheckedChange={(checked) => setEditingRecord(prev => prev ? { ...prev, isBackPain: checked ? 'YES' : 'NO' }: null)}
                                                                        />
                                                                        <Label htmlFor="edit-isBackPain" className="flex items-center">
                                                                            <HeartPulse className="w-4 h-4 mr-2" />
                                                                            Back Pain
                                                                        </Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="edit-isChestPain"
                                                                            checked={editingRecord?.isChestPain === 'YES'}
                                                                            onCheckedChange={(checked) => setEditingRecord(prev => prev ? { ...prev, isChestPain: checked ? 'YES' : 'NO' }: null)}
                                                                        />
                                                                        <Label htmlFor="edit-isChestPain" className="flex items-center">
                                                                            <Stethoscope className="w-4 h-4 mr-2" />
                                                                            Chest Pain
                                                                        </Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id="edit-isLessUrination"
                                                                            checked={editingRecord?.isLessUrination === 'YES'}
                                                                            onCheckedChange={(checked) => setEditingRecord(prev => prev ? { ...prev, isLessUrination: checked ? 'YES' : 'NO' }: null)}
                                                                        />
                                                                        <Label htmlFor="edit-isLessUrination" className="flex items-center">
                                                                            <Droplets className="w-4 h-4 mr-2" />
                                                                            Reduced Urination
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label htmlFor="edit-description">Description</Label>
                                                                    <Textarea
                                                                        id="edit-description"
                                                                        value={editingRecord?.description || ''}
                                                                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, description: e.target.value } : null)}
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
                            {selectedRecords.length > 0 && (
                                <Button onClick={handleBatchDelete} className="mt-4" variant="destructive">
                                    Delete Selected ({selectedRecords.length})
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="new">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PlusCircle className="mr-2 h-5 w-5 text-green-500" />
                                    Add New Record
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="sbp">Systolic BP</Label>
                                            <Input
                                                id="sbp"
                                                type="number"
                                                value={newRecord.sbp}
                                                onChange={(e) => setNewRecord({ ...newRecord, sbp: parseInt(e.target.value) })}
                                                required
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
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isHeadache"
                                                checked={newRecord.isHeadache === 'YES'}
                                                onCheckedChange={(checked) => setNewRecord({ ...newRecord, isHeadache: checked ? 'YES' : 'NO' })}
                                            />
                                            <Label htmlFor="isHeadache" className="flex items-center">
                                                <Brain className="w-4 h-4 mr-2" />
                                                Headache
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isBackPain"
                                                checked={newRecord.isBackPain === 'YES'}
                                                onCheckedChange={(checked) => setNewRecord({ ...newRecord, isBackPain: checked ? 'YES' : 'NO' })}
                                            />
                                            <Label htmlFor="isBackPain" className="flex items-center">
                                                <HeartPulse className="w-4 h-4 mr-2" />
                                                Back Pain
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isChestPain"
                                                checked={newRecord.isChestPain === 'YES'}
                                                onCheckedChange={(checked) => setNewRecord({ ...newRecord, isChestPain: checked ? 'YES' : 'NO' })}
                                            />
                                            <Label htmlFor="isChestPain" className="flex items-center">
                                                <Stethoscope className="w-4 h-4 mr-2" />
                                                Chest Pain
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="isLessUrination"
                                                checked={newRecord.isLessUrination === 'YES'}
                                                onCheckedChange={(checked) => setNewRecord({ ...newRecord, isLessUrination: checked ? 'YES' : 'NO' })}
                                            />
                                            <Label htmlFor="isLessUrination" className="flex items-center">
                                                <Droplets className="w-4 h-4 mr-2" />
                                                Reduced Urination
                                            </Label>
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
                                    <Button type="submit" className="w-full" disabled={isLoading}>
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
                    </motion.div>
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
                            ) : reportStatus === 'error' || !healthReport ? (
                                <div className="text-center text-gray-600">
                                    <p>No health report is available at this time.</p>
                                    <Button onClick={fetchHealthReport} className="mt-4">
                                        Retry
                                    </Button>
                                </div>
                            ) : (
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
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}