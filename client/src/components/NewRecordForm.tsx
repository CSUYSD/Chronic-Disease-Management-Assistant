import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Brain, HeartPulse, Stethoscope, Droplets } from "lucide-react"

interface NewRecordFormProps {
    onSubmit: (record: Omit<HealthRecord, 'id' | 'importTime'>) => void;
    isLoading: boolean;
}

interface HealthRecord {
    id: string;
    sbp: number;
    dbp: number;
    isHeadache: string;
    isBackPain: string;
    isChestPain: string;
    isLessUrination: string;
    importTime: string;
    description: string;
}

export default function NewRecordForm({ onSubmit, isLoading }: NewRecordFormProps) {
    const [newRecord, setNewRecord] = useState<Omit<HealthRecord, 'id' | 'importTime'>>({
        sbp: 0,
        dbp: 0,
        isHeadache: 'NO',
        isBackPain: 'NO',
        isChestPain: 'NO',
        isLessUrination: 'NO',
        description: ''
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSubmit(newRecord)
        setNewRecord({
            sbp: 0,
            dbp: 0,
            isHeadache: 'NO',
            isBackPain: 'NO',
            isChestPain: 'NO',
            isLessUrination: 'NO',
            description: ''
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <PlusCircle className="mr-2 h-5 w-5 text-green-500" />
                    Add New Record
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="sbp">Systolic BP</Label>
                            <Input
                                id="sbp"
                                type="number"
                                value={newRecord.sbp}
                                onChange={(e) => setNewRecord({ ...newRecord, sbp: parseInt(e.target.value) || 0 })}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="dbp">Diastolic BP</Label>
                            <Input
                                id="dbp"
                                type="number"
                                value={newRecord.dbp}
                                onChange={(e) => setNewRecord({ ...newRecord, dbp: parseInt(e.target.value) || 0 })}
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
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Adding...' : 'Add Record'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}