'use client';

import React from 'react';
import TopicSelection from '@/components/TopicSelection';
import CrawledInfoDisplay from '@/components/CrawledInfoDisplay';

const CommunityPage = () => {
    const handleSaveTopics = async (selectedTopics) => {
        try {
            const response = await fetch('/api/save-topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topics: selectedTopics }),
            });
            if (response.ok) {
                alert('Topics saved successfully');
            } else {
                throw new Error('Failed to save topics');
            }
        } catch (error) {
            console.error('Error saving topics:', error);
            alert('Error saving topics. Please try again.');
        }
    };

    return (
        <div className="container mx-auto">
            <TopicSelection onSave={handleSaveTopics} />
            <CrawledInfoDisplay />
        </div>
    );
};

export default CommunityPage;