import { request } from "@/utils";

interface recordFormData {
    sbp: number
    dbp: number
    isHeadache: string
    isBackPain: string
    isChestPain: string
    isLessUrination: string
    importTime: string
    description: string
}

interface SearchParams {
    keyword?: string
    page?: number
    size?: number
}

interface AdvancedSearchParams {
    description?: string
    minSbp?: number
    maxSbp?: number
    minDbp?: number
    maxDbp?: number
    isHeadache?: string
    isBackPain?: string
    isChestPain?: string
    isLessUrination?: string
}

// Get all records for an account
export function getAllRecordsAPI() {
    return request({
        url: `/records/all`,
        method: 'GET',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}


// Create a new transaction record
export function createRecordAPI(formData: recordFormData) {
    return request({
        url: '/records/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: formData
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Update an existing transaction record
export function updateRecordAPI(id: string, formData: recordFormData) {
    return request({
        url: `/records/update/${id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        data: formData
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Delete a transaction record
export function deleteRecordAPI(id: string) {
    return request({
        url: `/records/delete/${id}`,
        method: 'DELETE',
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// Delete multiple records in batch
export function deleteRecordsInBatchAPI(recordIds: string[]) {
    return request({
        url: `/records/batch`,
        method: 'DELETE',
        data: recordIds
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// New function for basic search
export function searchRecordsAPI({ keyword = '', page = 0, size = 10 }: SearchParams) {
    return request({
        url: '/api/records-search/search',
        method: 'GET',
        params: { keyword, page, size }
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}

// New function for advanced search
export function advancedSearchRecordsAPI(params: AdvancedSearchParams) {
    return request({
        url: '/api/records-search/advanced-search',
        method: 'GET',
        params
    }).catch(error => {
        console.error('API Error:', error);
        throw error;
    });
}