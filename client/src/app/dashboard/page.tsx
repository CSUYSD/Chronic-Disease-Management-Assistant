'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PatientDashboard } from './PatientDashboard'
import { CompanionDashboard } from './CompanionDashboard'

interface User {
    role: 'patient' | 'companion'
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserRole = async () => {
            setLoading(true)
            // Simulating API call to get user role
            await new Promise(resolve => setTimeout(resolve, 1000))
            const userRole = Math.random() > 0.5 ? 'patient' : 'companion'
            setUser({ role: userRole })
            setLoading(false)
        }

        fetchUserRole()
    }, [])

    if (loading) {
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
                {user?.role === 'patient' ? 'Patient Dashboard' : 'Companion Dashboard'}
            </motion.h1>
            {user?.role === 'patient' ? <PatientDashboard /> : <CompanionDashboard />}
        </motion.div>
    )
}