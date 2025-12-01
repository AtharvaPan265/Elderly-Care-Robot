// src/app/api/mcp/route.ts
import { NextResponse } from 'next/server';
import { useState, useEffect } from 'react';
import { DEFAULT_PROFILE, UserProfile } from '@/app/data/profileData'; 
import { consolidateDataForLLM } from '@/utils/dataProcessor';

const ORANGE_ACCENT = '#ffb573';
const BLUE_ACCENT = '#87ceeb';
const LOCAL_STORAGE_KEY = 'scheduleEvents';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export interface scheduleEvent {
    id: number;
    date: Date;
    title: string;
    type: 'Doctor' | 'Personal' | 'Routine' | 'Medication' | 'Other';
    location?: string;
    notes?: string;
    color?: string;
}

const initialEvents: scheduleEvent[] = [
    { id: 1, date: new Date(new Date(new Date().setHours(10, 0, 0, 0)).getTime() + (5 * ONE_DAY_MS)), title: "Annual Physical Exam", type: 'Doctor', location: 'Dr. Smith Office', notes: 'Bring bloodwork results.', color: `text-[${BLUE_ACCENT}]` },
    { id: 2, date: new Date(new Date(new Date().setHours(9, 0, 0, 0)).getTime() + (2 * ONE_DAY_MS)), title: "Call Electrician", type: 'Personal', location: 'Home', notes: 'Need to fix light switch in kitchen.' },
    { id: 3, date: new Date(new Date(new Date().setHours(13, 30, 0, 0)).getTime() + (6 * ONE_DAY_MS)), title: "Dentist Checkup", type: 'Doctor', location: 'Downtown Clinic', notes: 'Check dentures for damage.', color: `text-[${BLUE_ACCENT}]` },
    { id: 4, date: new Date(new Date().setHours(8, 0, 0, 0)), title: 'Eat Breakfast', type: 'Routine', color: 'text-[${BLUE_ACCENT}]' },
    { id: 5, date: new Date(new Date().setHours(9, 0, 0, 0)), title: 'Take Morning Medication', type: 'Medication', color: `text-[${BLUE_ACCENT}]` },
    { id: 6, date: new Date(new Date().setHours(11, 0, 0, 0)), title: 'Nurse Arrives', location: 'Home', type: 'Doctor', color: `text-[${BLUE_ACCENT}]` },
    { id: 7, date: new Date(new Date().setHours(12, 30, 0, 0)), title: 'Eat Lunch', type: 'Routine', color: 'text-[${BLUE_ACCENT}]' },
    { id: 8, date: new Date(new Date().setHours(16, 0, 0, 0)), title: 'Read or Nap', type: 'Routine', color: 'text-[${BLUE_ACCENT}]' },
    { id: 9, date: new Date(new Date().setHours(18, 0, 0, 0)), title: 'Eat Dinner', type: 'Routine', color: 'text-[${BLUE_ACCENT}]' },
    { id: 10, date: new Date(new Date().setHours(20, 30, 0, 0)), title: 'Take Evening Medication', type: 'Medication', color: `text-[${BLUE_ACCENT}]` },
    { id: 11, date: new Date(new Date().setHours(22, 0, 0, 0)), title: 'Go to Bed', type: 'Routine', color: 'text-[${BLUE_ACCENT}]' },
];

const getStoredEvents = (): scheduleEvent[] => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            try {
                const parsed: scheduleEvent[] = JSON.parse(stored);
                return parsed.map(event => ({
                    ...event,
                    date: new Date(event.date),
                }));
            } catch (error) {
                console.error('Error parsing stored events:', error);
                return initialEvents;
            }
        }
    }
    return initialEvents;
};

const saveEventsToLocalStorage = (events: scheduleEvent[]) => {
    if (typeof window !== 'undefined') {
        const eventsForStorage = events.map(event => ({
            ...event,
            date: event.date.toISOString(), 
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventsForStorage));
    }
};

export const usePersistentEvents = () => {
    const [events, setEventsState] = useState<scheduleEvent[]>(initialEvents);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = getStoredEvents();
        setEventsState(stored);
        setIsLoaded(true);
    }, []);

    const setEvents = (updater: scheduleEvent[] | ((prev: scheduleEvent[]) => scheduleEvent[])) => {
        setEventsState(prev => {
            const newEvent = typeof updater === 'function' ? updater(prev) : updater;
            saveEventsToLocalStorage(newEvent);
            return newEvent;
        });
    };
    return { events: events, setEvents: setEvents, isLoaded };
};


export async function GET() {
    try {      
        let profileData: UserProfile = {
            ...DEFAULT_PROFILE,
            name: "Jane Doe",
            healthConditions: "Diabetes, High Blood Pressure",
            medicationList: [
                { id: 101, name: "Metformin", dosage: "500mg", frequency: "Twice daily", lastCheckedDate: "2025-10-26" },
                { id: 102, name: "Lisinopril", dosage: "10mg", frequency: "Every 3 days" },
            ],
        };

        const processedData = consolidateDataForLLM(getStoredEvents(), profileData, 7);
        return NextResponse.json(processedData, { status: 200 });
    } catch (error) {
        console.error("Error processing MCP request:", error);
        return NextResponse.json(
            { error: "Failed to process calendar data for LLM." },
            { status: 500 }
        );
    }
}