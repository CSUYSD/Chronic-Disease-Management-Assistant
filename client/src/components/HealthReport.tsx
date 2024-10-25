import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, RefreshCw } from "lucide-react"

interface HealthReportProps {
    report: {
        content: string;
        generatedAt: string;
    } | null;
    status: 'idle' | 'loading' | 'error';
    onRetry: () => void;
}

export default function HealthReport({ report, status, onRetry }: HealthReportProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                    Health Report
                </CardTitle>
            </CardHeader>
            <CardContent>
                {status === 'loading' && (
                    <div className="flex justify-center items-center h-40">
                        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
                    </div>
                )}
                {status === 'error' && (
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Failed to load health report.</p>
                        <Button onClick={onRetry}>Retry</Button>
                    </div>
                )}
                {status === 'idle' && report && (
                    <div>
                        <p className="text-sm text-gray-500 mb-4">Generated at: {new Date(report.generatedAt).toLocaleString()}</p>
                        <div className="prose max-w-none">
                            {report.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                )}
                {status === 'idle' && !report && (
                    <p className="text-center text-gray-500">No health report available.</p>
                )}
            </CardContent>
        </Card>
    )
}