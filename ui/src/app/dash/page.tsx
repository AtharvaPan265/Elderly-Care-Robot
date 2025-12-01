'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { GiWalkingBoot, GiAce, GiCalendar, GiVibratingSmartphone, GiConversation, GiPhotoCamera } from 'react-icons/gi';
import { AiOutlineMedicineBox } from 'react-icons/ai';
import { FaCheckSquare, FaPills, FaQuestion, FaUserCircle } from 'react-icons/fa';
import { IconType } from 'react-icons';

import { useUserWeather } from '@/utils/weather';
import { useUserProfile } from '@/utils/userProfile';
import { collectionNames } from '@/app/data/memoriesData';
import { getDailyMedicationTasks } from '@/app/calendar/page';
import { usePersistentEvents } from '../api/mcp/route';

const ORANGE_ACCENT = '#ffb573';
const GREEN_ACCENT = '#8fbc8f';
const BLUE_ACCENT = '#87ceeb';
const PARCHMENT_LIGHT = '#f5f5e0';
const PARCHMENT_DARKER = '#eee2d0';

const getGreeting = (hour: number): string => {
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
};

interface ActionButtonProps {
    label: string;
    bgColor: string;
    Icon: IconType;
    href: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, bgColor, Icon, href }) => {
    const isParchment = bgColor.includes(PARCHMENT_DARKER);

    return (
        <Link
            href={href}
            className={`
                flex items-center justify-start gap-4 p-4 rounded-xl 
                h-30 font-bold cursor-pointer transition-transform duration-150 
                shadow-md hover:shadow-lg hover:scale-[1.01]
                ${bgColor} ${isParchment ? 'text-gray-800' : 'text-white'}
            `}
            style={{ width: '100%' }}
        >
            <Icon size={50} />
            <div className="text-4xl text-left">{label}</div>
        </Link>
    );
}

const DailySchedulePanel: React.FC = () => {
    const { profile, toggleMedicationCheck } = useUserProfile();
    const { events: events } = usePersistentEvents();
    const today = new Date();

    const dailyEventsSorted = useMemo(() => {
        const todayDateString = today.toDateString();
        return events
            .filter(event => event.date.toDateString() === todayDateString)
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [events, today]);

    const dailyMedicationTasks = useMemo(() => {
        return getDailyMedicationTasks(profile.medicationList, today);
    }, [profile.medicationList, today]);

    const [randomGame, setRandomGame] = useState<{ title: string; href: string } | null>(null);
    const [randomAlbum, setRandomAlbum] = useState<string | null>(null);

    const gameList = useMemo(() => [
        { title: "Crossword Puzzle", href: "/games/crossword-full" },
        { title: "Sudoku", href: "/games/sudoku" },
        { title: "Word Search", href: "/games/word-search" },
        { title: "Card Memory Game", href: "/games/card-memory" },
    ], []);
    const albumList = useMemo(() => collectionNames.filter(name => name !== 'All' && name !== 'Unsorted'), []);

    useEffect(() => {
        setRandomGame(gameList[Math.floor(Math.random() * gameList.length)]);
        setRandomAlbum(albumList[Math.floor(Math.random() * albumList.length)]);
    }, [gameList, albumList]);

    return (
        <div className={`p-6 rounded-3xl shadow-2xl w-full h-full border border-gray-200 flex flex-col justify-between`} style={{ backgroundColor: PARCHMENT_LIGHT }}>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 border-b-2 border-orange-100 pb-2">
                Daily Schedule
            </h2>
            <div className="mb-8 max-h-[60vh] overflow-y-auto">
                <h3 className={`text-2xl font-bold text-gray-700 mb-3 border-l-4 border-[${BLUE_ACCENT}] pl-2`}>Hourly Agenda</h3>
                <ul className="space-y-2">
                    {dailyEventsSorted.map((item, index) => (
                        <li key={index} className="flex items-center text-base border-b border-gray-100 pb-1">
                            <span className="text-xl font-semibold w-1/4 min-w-[80px] text-gray-500">{item.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            <span className={`text-xl font-medium ${item.color} ml-4`}>{item.title}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex-grow min-h-[1rem]"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div className="bg-white p-4 rounded-xl shadow-md border border-green-100">
                    <h3 className={`text-lg font-bold mb-3 flex items-center text-[${GREEN_ACCENT}]`}>
                        Today's Medications
                    </h3>
                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {dailyMedicationTasks.length > 0 ? (
                            dailyMedicationTasks.map(task => (
                                <li key={task.taskId} className="flex justify-between items-center text-sm">
                                    <span className="text-lg">{task.title}</span>
                                    <button
                                        onClick={() => toggleMedicationCheck(task.medId)}
                                        className={`p-1 rounded-full transition ${task.isChecked ? 'bg-green-100 text-green-600' : 'border border-gray-300 text-gray-500 hover:bg-gray-100'}`}
                                        title="Check off medication"
                                    >
                                        <FaCheckSquare size={25} />
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500 text-sm italic">No medications to take today.</li>
                        )}
                    </ul>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-blue-100 flex flex-col justify-between">
                    <h3 className={`text-lg font-bold mb-3 flex items-center text-[${BLUE_ACCENT}]`}>
                        Daily Game Suggestion
                    </h3>
                    {randomGame ? (
                        <>
                            <p className="text-xl mb-3">Play {randomGame.title}!</p>
                            <Link href={randomGame.href} className={`text-center text-lg bg-blue-100 px-4 py-2 rounded-lg`}>
                                Start Game
                            </Link>
                        </>
                    ) : (
                        <p className="text-sm">Loading game suggestion...</p>
                    )}
                </div>
                <div className="bg-white p-4 rounded-xl shadow-md border border-orange-100 flex flex-col justify-between">
                    <h3 className={`text-lg font-bold mb-3 flex items-center`}>
                        Daily Album Suggestion
                    </h3>
                    {randomAlbum ? (
                        <>
                            <p className="text-xl mb-3">View your {randomAlbum} album today!</p>
                            <Link href={`/memories?collection=${randomAlbum}`} className={`text-center text-lg bg-orange-100 px-4 py-2 rounded-lg`}>
                                See Memories
                            </Link>
                        </>
                    ) : (
                        <p className="text-sm">Loading album suggestion...</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    const [isMounted, setIsMounted] = useState(false);
    const { profile, toggleMedicationCheck } = useUserProfile();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const { main, temp, error, loading, CurrentIcon } = useUserWeather();

    useEffect(() => {
        setIsMounted(true);
        setCurrentTime(new Date());

        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    const dateStr = currentTime
        ? currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : 'Loading Date...';

    const timeStr = currentTime
        ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : '00:00';

    const currentHour = currentTime ? currentTime.getHours() : 12;

    const greeting = getGreeting(currentHour) + ' ' + profile.nickname + '!';
    const isLoaded = currentTime !== null && isMounted;

    return (
        <main className="bg-[#e0f7fa] min-h-screen p-6 flex justify-center">
            <div className="w-full max-w-7xl flex flex-col lg:grid lg:grid-cols-2 gap-8">
                <div className="w-full flex flex-col gap-6">
                    <div className="p-6 bg-white rounded-2xl shadow-xl text-center">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex flex-col items-start">
                                <div className="text-3xl font-bold">{isLoaded ? timeStr : 'Loading...'}</div>
                                <span className="text-2xl font-normal text-gray-600">{isLoaded ? dateStr : '...'}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                {loading ? (
                                    <p className="text-lg">Locating...</p>
                                ) : error ? (
                                    <p className="text-red-500 text-xs text-center max-w-[100px]">{error.split(':')[0]}</p>
                                ) : (
                                    <>
                                        <CurrentIcon size={50} className="text-gray-700" title={main} />
                                        <p className="text-3xl font-bold mt-1">{temp}°F</p>
                                        <p className="text-lg capitalize">{main}</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <h1 className="text-5xl font-extrabold text-gray-900 mt-2">
                            {isLoaded ? greeting : 'Hello!'}
                        </h1>
                    </div>
                    <div className="flex flex-col gap-4">
                        <ActionButton label="Play Games" bgColor={`bg-[${GREEN_ACCENT}]`} Icon={GiAce} href="/games" />
                        <ActionButton label="Check Calendar" bgColor={`bg-[${BLUE_ACCENT}]`} Icon={GiCalendar} href="/calendar" />
                        <ActionButton label="View Memories" bgColor={`bg-[${ORANGE_ACCENT}]`} Icon={GiPhotoCamera} href="/memories" />
                        <ActionButton label="Chat With Me" bgColor={`bg-[#202A44]`} Icon={GiConversation} href="/chat" />

                    </div>
                </div>
                <div className="w-full">
                    <DailySchedulePanel />
                </div>
            </div>
            <Link
                href="/settings"
                className="absolute top-6 right-6 flex flex-col items-center cursor-pointer hover:text-blue-600 transition"
            >
                <FaUserCircle size={60} />
                <span className="mt-1 text-lg font-semibold">My Settings</span>
            </Link>
        </main>
    );
}