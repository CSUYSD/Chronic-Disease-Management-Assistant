import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@/store'

interface ReportState {
    report: {
        content: string | null
        generatedAt: string | null
    } | null
    status: 'idle' | 'loading' | 'success' | 'error'
    error: string | null
}

const initialState: ReportState = {
    report: null,
    status: 'idle',
    error: null
}

export const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        setReport: (state, action: PayloadAction<{ content: string, generatedAt: string }>) => {
            state.report = action.payload
            state.status = 'success'
            state.error = null
        },
        setReportContent: (state, action: PayloadAction<string>) => {
            if (state.report) {
                state.report.content = action.payload
            } else {
                state.report = { content: action.payload, generatedAt: new Date().toISOString() }
            }
            state.status = 'success'
            state.error = null
        },
        setReportStatus: (state, action: PayloadAction<ReportState['status']>) => {
            state.status = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.status = 'error'
        },
        updateReport: (state, action: PayloadAction<Partial<ReportState['report']>>) => {
            if (state.report) {
                state.report = { ...state.report, ...action.payload }
            }
        },
        clearReport: (state) => {
            state.report = null
            state.status = 'idle'
            state.error = null
        }
    }
})

export const { setReport, setReportStatus, setError, updateReport, clearReport, setReportContent } = reportSlice.actions

export const selectReport = (state: RootState) => state.report.report
export const selectReportStatus = (state: RootState) => state.report.status
export const selectReportError = (state: RootState) => state.report.error

export default reportSlice.reducer