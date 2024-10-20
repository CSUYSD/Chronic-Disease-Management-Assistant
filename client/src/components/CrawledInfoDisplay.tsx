'use client';

import React, { useState, useEffect } from 'react';
import { startPeriodicFetch } from '@/service/wiseflowService';

const CrawledInfoDisplay = () => {
    const [crawledInfo, setCrawledInfo] = useState([]);

    useEffect(() => {
        startPeriodicFetch((info) => {
            setCrawledInfo(info);
        });
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Crawled Information</h2>
            <div className="space-y-4">
                {crawledInfo.map((item, index) => (
                    <div key={index} className="border p-4 rounded-md">
                        <h3 className="font-bold">{item.title}</h3>
                        <p>{item.content.substring(0, 200)}...</p>
                        {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                View Original
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CrawledInfoDisplay;