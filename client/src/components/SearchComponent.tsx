import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter } from "lucide-react"

interface SearchComponentProps {
    onSearch: (searchTerm: string) => void;
    onAdvancedSearch: (params: AdvancedSearchParams) => void;
    onSelectAll: (checked: boolean) => void;
    isAllSelected: boolean;
}

interface AdvancedSearchParams {
    description: string;
    minSbp: string;
    maxSbp: string;
    minDbp: string;
    maxDbp: string;
    isHeadache: string;
    isBackPain: string;
    isChestPain: string;
    isLessUrination: string;
}

export default function SearchComponent({ onSearch, onAdvancedSearch, onSelectAll, isAllSelected }: SearchComponentProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
    const [advancedSearchParams, setAdvancedSearchParams] = useState<AdvancedSearchParams>({
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

    const handleSearch = () => {
        onSearch(searchTerm)
    }

    const handleAdvancedSearch = () => {
        onAdvancedSearch(advancedSearchParams)
    }

    return (
        <div>
            <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="select-all"
                        checked={isAllSelected}
                        onCheckedChange={onSelectAll}
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
                            onChange={(e) => setAdvancedSearchParams({...advancedSearchParams, isLessUrination: e.target.value})}
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
        </div>
    )
}