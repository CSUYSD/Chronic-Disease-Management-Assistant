import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { addWarningRecord } from "@/store/warningRecordsSlice"
import { toast } from "@/hooks/use-toast"
import WebSocketService from '@/service/webSocketService'

interface WarningRecord {
    id: number;
    description: string;
    date: string;
    risk: 'high' | 'low';
}

export default function WarningRecords() {
    const [warningRecords, setWarningRecords] = useState<WarningRecord[]>([])
    const dispatch = useDispatch()

    useEffect(() => {
        // Load existing warning records from session storage
        const storedRecords = sessionStorage.getItem('warningRecords')
        if (storedRecords) {
            setWarningRecords(JSON.parse(storedRecords))
        }

        const handleWarningRecord = (payload: WarningRecord) => {
            const newRecord = {
                id: payload.id,
                description: payload.description,
                date: payload.date,
                risk: payload.risk
            }

            setWarningRecords(prevRecords => {
                const updatedRecords = [newRecord, ...prevRecords]
                // Update session storage
                sessionStorage.setItem('warningRecords', JSON.stringify(updatedRecords))
                return updatedRecords
            })

            dispatch(addWarningRecord(newRecord))
            toast({
                title: "New Warning",
                description: payload.description,
                variant: "destructive",
            })
        }

        WebSocketService.addMessageHandler(handleWarningRecord)

        return () => {
            WebSocketService.removeMessageHandler(handleWarningRecord)
        }
    }, [dispatch])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-yellow-500" />
                    Warning Records
                </CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {warningRecords.map((record) => (
                        <motion.div
                            key={record.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Alert variant={record.risk === 'high' ? "destructive" : "default"} className="mb-4">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>{record.description}</AlertDescription>
                                <p className="text-sm text-muted-foreground mt-2">{new Date(record.date).toLocaleString()}</p>
                            </Alert>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {warningRecords.length === 0 && (
                    <p className="text-center text-muted-foreground">No warning records available.</p>
                )}
            </CardContent>
        </Card>
    )
}