import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface WarningRecord {
    id: number;
    description: string;
    date: string;
    risk: 'high' | 'low';
}

interface WarningRecordsState {
    records: WarningRecord[];
}

const initialState: WarningRecordsState = {
    records: []
}

const warningRecordsSlice = createSlice({
    name: 'warningRecords',
    initialState,
    reducers: {
        addWarningRecord: (state, action: PayloadAction<WarningRecord>) => {
            state.records.unshift(action.payload);
            // Keep only the latest 5 warning records
            state.records = state.records.slice(0, 5);
        },
        clearWarningRecords: (state) => {
            state.records = [];
        },
    }
})

export const { addWarningRecord, clearWarningRecords } = warningRecordsSlice.actions

export default warningRecordsSlice.reducer