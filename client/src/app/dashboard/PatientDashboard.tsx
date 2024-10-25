'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"
import { setSelectedDisease } from '@/store/diseaseSlice'
import { RootState } from '@/store'
import WebSocketService from '@/service/webSocketService'
import { getAllRecordsAPI, createRecordAPI, deleteRecordAPI, updateRecordAPI, deleteRecordsInBatchAPI, searchRecordsAPI, advancedSearchRecordsAPI } from "@/api/record"
import { GetReportAPI } from "@/api/ai"
import { toast } from "@/hooks/use-toast"
import WarningRecords from '@/components/WarningRecords'
import SearchComponent from '@/components/SearchComponent'
import HealthRecordList from '@/components/HealthRecordList'
import NewRecordForm from '@/components/NewRecordForm'
import HealthReport from '@/components/HealthReport'

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
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRecords, setSelectedRecords] = useState<string[]>([])

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

        if (typeof window !== 'undefined' && !localStorage.getItem('webSocketConnected')) {
            WebSocketService.connect()
        }

        return () => {
            WebSocketService.disconnect()
        }
    }, [fetchHealthRecords, fetchHealthReport])

    const handleSearch = async (searchTerm: string) => {
        setIsLoading(true)
        try {
            const response = await searchRecordsAPI({ keyword: searchTerm })
            setHealthRecords(response.data)
        } catch (error) {
            console.error('Error searching health records:', error)
            toast({
                title: "Error",
                description: "Failed to search health records. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAdvancedSearch = async (params: any) => {
        setIsLoading(true)
        try {
            const response = await advancedSearchRecordsAPI(params)
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

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecords(healthRecords.map(record => record.id))
        } else {
            setSelectedRecords([])
        }
    }

    const handleCreateRecord = async (newRecord: Omit<HealthRecord, 'id' | 'importTime'>) => {
        setIsLoading(true)
        try {
            const response = await createRecordAPI({
                ...newRecord,
                importTime: new Date().toISOString()
            })
            setHealthRecords(prevRecords => [response.data, ...prevRecords])
            toast({
                title: "Success",
                description: "New health record created successfully.",
            })
            fetchHealthRecords()
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

    const handleUpdateRecord = async (updatedRecord: HealthRecord) => {
        setIsLoading(true)
        try {
            const response = await updateRecordAPI(updatedRecord.id, updatedRecord)
            setHealthRecords(prevRecords =>
                prevRecords.map(record =>
                    record.id === updatedRecord.id ? response.data : record
                )
            )
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

    const handleDeleteRecord = async (id: string) => {
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
                <TabsList className="w-full flex justify-between">
                    <TabsTrigger value="warnings" className="flex-1">Warnings</TabsTrigger>
                    <TabsTrigger value="records" className="flex-1">Health Records</TabsTrigger>
                    <TabsTrigger value="new" className="flex-1">New Record</TabsTrigger>
                    <TabsTrigger value="report" className="flex-1">Health Report</TabsTrigger>
                </TabsList>
                <TabsContent value="warnings">
                    <WarningRecords />
                </TabsContent>
                <TabsContent value="records">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="mr-2 h-5 w-5 text-blue-500" />
                                {selectedDisease}'s Health Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SearchComponent
                                onSearch={handleSearch}
                                onAdvancedSearch={handleAdvancedSearch}
                                onSelectAll={handleSelectAll}
                                isAllSelected={selectedRecords.length === healthRecords.length}
                            />
                            <HealthRecordList
                                records={healthRecords}
                                isLoading={isLoading}
                                selectedRecords={selectedRecords}
                                onSelectRecord={(id) => {
                                    setSelectedRecords(prev =>
                                        prev.includes(id) ? prev.filter(recordId => recordId !== id) : [...prev, id]
                                    )
                                }}
                                onUpdateRecord={handleUpdateRecord}
                                onDeleteRecord={handleDeleteRecord}
                            />
                            {selectedRecords.length > 0 && (
                                <Button onClick={handleBatchDelete} className="mt-4" variant="destructive">
                                    Delete Selected ({selectedRecords.length})
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="new">
                    <NewRecordForm onSubmit={handleCreateRecord} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="report">
                    <HealthReport report={healthReport} status={reportStatus} onRetry={fetchHealthReport} />
                </TabsContent>
            </Tabs>
        </div>
    )
}