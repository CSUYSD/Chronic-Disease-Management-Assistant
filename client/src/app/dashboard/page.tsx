'use client'

import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { selectProfile, selectIsLoading } from '@/store/profileSlice'
import { PatientDashboard } from './PatientDashboard'
import CompanionDashboard from './CompanionDashboard'

export default function Dashboard() {
    const profile = useSelector(selectProfile)
    const isLoading = useSelector(selectIsLoading)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 p-6 max-w-7xl mx-auto"
        >
            <motion.h1
                className="text-3xl font-bold text-gray-800"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
            >
                {profile?.role === 'patient' ? 'Patient Dashboard' : 'Companion Dashboard'}
            </motion.h1>
            {profile?.role === 'patient' ? <PatientDashboard /> : <CompanionDashboard />}
        </motion.div>
    )
}