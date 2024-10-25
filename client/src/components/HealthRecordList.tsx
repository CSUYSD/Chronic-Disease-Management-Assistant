import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Edit, Trash2, Brain, HeartPulse, Stethoscope, Droplets, AlertTriangle } from "lucide-react"

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

interface HealthRecordListProps {
    records: HealthRecord[]
    isLoading: boolean
    selectedRecords: string[]
    onSelectRecord: (id: string) => void
    onUpdateRecord: (record: HealthRecord) => void
    onDeleteRecord: (id: string) => void
}

export default function HealthRecordList({ records, isLoading, selectedRecords, onSelectRecord, onUpdateRecord, onDeleteRecord }: HealthRecordListProps) {
    const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

    const handleEdit = (record: HealthRecord) => {
        setEditingRecord({ ...record })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (editingRecord) {
            onUpdateRecord(editingRecord)
            setEditingRecord(null)
            setIsEditDialogOpen(false)
        }
    }

    const handleDelete = (id: string) => {
        setRecordToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const confirmDelete = () => {
        if (recordToDelete) {
            onDeleteRecord(recordToDelete)
            setRecordToDelete(null)
            setIsDeleteDialogOpen(false)
        }
    }

    if (isLoading) {
        return (
            <motion.div
                className="flex justify-center items-center h-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-t-2 border-blue-500 rounded-full"
                />
            </motion.div>
        )
    }

    return (
        <div>
            <AnimatePresence>
                {records.map((record, index) => (
                    <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="mb-4 p-4 border rounded-lg hover:shadow-md transition-all bg-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <Checkbox
                                    checked={selectedRecords.includes(record.id)}
                                    onCheckedChange={() => onSelectRecord(record.id)}
                                    className="mr-2"
                                />
                                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                <p className="font-semibold text-gray-700">{new Date(record.importTime).toLocaleString()}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
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
            {records.length === 0 && (
                <p className="text-center text-gray-500">No health records available.</p>
            )}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Health Record</DialogTitle>
                    </DialogHeader>
                    {editingRecord && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-sbp">Systolic BP</Label>
                                    <Input
                                        id="edit-sbp"
                                        type="number"
                                        value={editingRecord.sbp}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, sbp: parseInt(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-dbp">Diastolic BP</Label>
                                    <Input
                                        id="edit-dbp"
                                        type="number"
                                        value={editingRecord.dbp}
                                        onChange={(e) => setEditingRecord({ ...editingRecord, dbp: parseInt(e.target.value) || 0 })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-isHeadache"
                                        checked={editingRecord.isHeadache === 'YES'}
                                        onCheckedChange={(checked) => setEditingRecord({ ...editingRecord, isHeadache: checked ? 'YES' : 'NO' })}
                                    />
                                    <Label htmlFor="edit-isHeadache" className="flex items-center">
                                        <Brain className="w-4 h-4 mr-2" />
                                        Headache
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-isBackPain"
                                        checked={editingRecord.isBackPain === 'YES'}
                                        onCheckedChange={(checked) => setEditingRecord({ ...editingRecord, isBackPain: checked ? 'YES' : 'NO' })}
                                    />
                                    <Label htmlFor="edit-isBackPain" className="flex items-center">
                                        <HeartPulse className="w-4 h-4 mr-2" />
                                        Back Pain
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-isChestPain"
                                        checked={editingRecord.isChestPain === 'YES'}
                                        onCheckedChange={(checked) => setEditingRecord({ ...editingRecord, isChestPain: checked ? 'YES' : 'NO' })}
                                    />
                                    <Label htmlFor="edit-isChestPain" className="flex items-center">
                                        <Stethoscope className="w-4 h-4 mr-2" />
                                        Chest Pain
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="edit-isLessUrination"
                                        checked={editingRecord.isLessUrination === 'YES'}
                                        onCheckedChange={(checked) => setEditingRecord({ ...editingRecord, isLessUrination: checked ? 'YES' : 'NO' })}
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
                                    value={editingRecord.description}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, description: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Update Record</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this health record? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4">
                        <AlertTriangle className="h-12 w-12 text-yellow-500" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}