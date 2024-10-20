'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Predefined health topics with explanations
const HEALTH_TOPICS = [
    { id: 1, name: "Disease Recovery", explanation: "Information about recovering from various diseases and illnesses." },
    { id: 2, name: "Longevity", explanation: "Strategies and research on extending lifespan and improving quality of life in older age." },
    { id: 3, name: "Physical Exercise", explanation: "Types of exercises, workout routines, and their benefits for overall health." },
    { id: 4, name: "Mental Health", explanation: "Understanding and managing mental health conditions, stress, and emotional well-being." },
    { id: 5, name: "Nutrition", explanation: "Healthy eating habits, dietary guidelines, and nutritional information for various foods." },
    { id: 6, name: "Sleep Quality", explanation: "Importance of good sleep, sleep disorders, and tips for improving sleep quality." },
    { id: 7, name: "Stress Management", explanation: "Techniques and strategies to cope with and reduce stress in daily life." },
    { id: 8, name: "Heart Health", explanation: "Cardiovascular health, heart disease prevention, and heart-healthy lifestyle choices." },
    { id: 9, name: "Weight Management", explanation: "Healthy approaches to weight loss, maintenance, and understanding body composition." },
    { id: 10, name: "Chronic Disease Prevention", explanation: "Preventive measures and lifestyle changes to reduce the risk of chronic diseases." }
];

const TopicSelection = ({ onSave }) => {
    const [topics, setTopics] = useState(HEALTH_TOPICS.map(topic => ({ ...topic, selected: false })));
    const [newTopic, setNewTopic] = useState({ name: '', explanation: '' });

    const handleTopicToggle = (id) => {
        setTopics(prevTopics =>
            prevTopics.map(topic =>
                topic.id === id ? { ...topic, selected: !topic.selected } : topic
            )
        );
    };

    const handleAddTopic = () => {
        if (newTopic.name.trim() && newTopic.explanation.trim()) {
            const newId = Math.max(...topics.map(t => t.id)) + 1;
            setTopics(prevTopics => [...prevTopics, { id: newId, ...newTopic, selected: true }]);
            setNewTopic({ name: '', explanation: '' });
        }
    };

    const handleSave = () => {
        const selectedTopics = topics.filter(topic => topic.selected);
        onSave(selectedTopics);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Select Health Topics of Interest</h2>
            <div className="space-y-4">
                {topics.map((topic) => (
                    <div key={topic.id} className="flex items-start space-x-2">
                        <Checkbox
                            id={`topic-${topic.id}`}
                            checked={topic.selected}
                            onCheckedChange={() => handleTopicToggle(topic.id)}
                            className="mt-1"
                        />
                        <div>
                            <Label
                                htmlFor={`topic-${topic.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {topic.name}
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">{topic.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 space-y-2">
                <Input
                    value={newTopic.name}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Add new health topic"
                />
                <Textarea
                    value={newTopic.explanation}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Provide an explanation for the new topic"
                    rows={3}
                />
                <Button onClick={handleAddTopic} className="w-full">Add New Topic</Button>
            </div>
            <Button className="mt-4 w-full" onClick={handleSave}>Save Selection</Button>
        </div>
    );
};

export default TopicSelection;