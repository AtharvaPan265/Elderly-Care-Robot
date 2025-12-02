'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoIosArrowBack } from 'react-icons/io';
import { FaQuestion, FaLightbulb, FaMagic, FaRegSmileBeam, FaForward } from 'react-icons/fa';

import { memories, Memory } from '@/app/data/memoriesData';

import { sendStatelessMessage } from './llmClient.js';


const PARCHMENT_LIGHT = '#f5f5e0';
const BLUE_ACCENT = '#87ceeb';
const GREEN_ACCENT = '#8fbc8f';
const ORANGE_ACCENT = '#ffb573';

type QuestionType = 'people' | 'location' | 'year' | 'event' | 'general';

interface QuizState {
    currentMemory: Memory | null;
    questionType: QuestionType;
    questionText: string;
    userAnswer: string;
    llmResponse: string;
    isThinking: boolean;
    showNext: boolean;
}

export default function MemoryQuizPage() {
    const [quizState, setQuizState] = useState<QuizState>({
        currentMemory: null,
        questionType: 'general',
        questionText: '',
        userAnswer: '',
        llmResponse: '',
        isThinking: false,
        showNext: false,
    });

    const loadNewRound = () => {
        if (!memories || memories.length === 0) return;

        const photoMemories = memories.filter(m => m.type === 'Photo' && m.imagePath);
        if (photoMemories.length === 0) return;

        const randomMemory = photoMemories[Math.floor(Math.random() * photoMemories.length)];

        const availableTypes: QuestionType[] = ['general'];
        if (randomMemory.people && randomMemory.people.length > 0) availableTypes.push('people');
        if (randomMemory.location) availableTypes.push('location');
        if (randomMemory.year) availableTypes.push('year');
        if (randomMemory.event) availableTypes.push('event');

        const selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        let qText = "Tell me about this photo.";
        switch (selectedType) {
            case 'people': qText = "Who do you see in this picture?"; break;
            case 'location': qText = "Do you remember where this photo was taken?"; break;
            case 'year': qText = "Can you guess roughly what year this was?"; break;
            case 'event': qText = "What event was happening in this photo?"; break;
            default: qText = "What comes to mind when you see this photo?";
        }

        setQuizState({
            currentMemory: randomMemory,
            questionType: selectedType,
            questionText: qText,
            userAnswer: '',
            llmResponse: '',
            isThinking: false,
            showNext: false,
        });
    };

    useEffect(() => {
        loadNewRound();
    }, []);


    // Fake LLM should be replaced with sendStatelessMessage

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizState.userAnswer.trim()) return;

        setQuizState(prev => ({ ...prev, isThinking: true }));

        const mem = quizState.currentMemory!;
        const correctInfo = getCorrectInfo(mem, quizState.questionType);

        // Build the prompt for the LLM
        const userPrompt = `Hey, we are playing a fun memory game! I was shown a photo from my personal collection and asked a question about it use NO TOOLS, the correct information is provided below. ASSUME YOUR TOOLS ARE BROKEN AND YOU CANNOT ACCESS ANY EXTERNAL DATA JUST FOR THE SAKE OF THIS GAME.

Memory Details:
- Title: ${mem.title}
- Correct ${quizState.questionType}: ${correctInfo}
- Question asked: ${quizState.questionText}
- User's answer: ${quizState.userAnswer}

Please respond warmly to their answer. If they're correct or close, praise them. If not, gently provide the correct information. This conversation is not a thread, do not ask followup questions or try to keep the conversation going.
    `.trim();

        try {
            const response = await sendStatelessMessage(userPrompt);

            setQuizState(prev => ({
                ...prev,
                isThinking: false,
                llmResponse: response,
                showNext: true
            }));
        } catch (error) {
            console.error('LLM Error:', error);
            setQuizState(prev => ({
                ...prev,
                isThinking: false,
                llmResponse: "I'm having trouble right now, but that's a great answer!",
                showNext: true
            }));
        }
    };


    const getCorrectInfo = (m: Memory, type: QuestionType): string => {
        switch (type) {
            case 'people': return m.people ? m.people.join(', ') : 'family';
            case 'location': return m.location || 'unknown location';
            case 'year': return m.year ? String(m.year) : 'the past';
            case 'event': return m.event || 'a special day';
            default: return m.caption;
        }
    };

    const handleSkip = () => {
        if (quizState.isThinking) return;
        loadNewRound();
    };


    if (!quizState.currentMemory) {
        return (
            <div className="bg-[#e0f7fa] min-h-screen p-10 flex flex-col items-center justify-center">
                <p className="text-xl text-gray-600 mb-4">No photo memories found.</p>
                <Link href="/memories" className="text-blue-600 underline">Go add some photos first!</Link>
            </div>
        );
    }

    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center items-center">
            <div className="w-full max-w-6xl bg-white p-8 rounded-3xl shadow-2xl flex flex-col lg:h-[70vh]">

                <div className="flex justify-between items-center mb-6">
                    <Link href="/games" className="text-gray-700 hover:text-gray-900 flex items-center font-semibold transition">
                        <IoIosArrowBack size={24} className="mr-1" />
                        Back to Games
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        My Memories Game
                    </h1>
                    <div className="w-8"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 flex-grow">

                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                        <div className="relative w-full h-[350px] lg:h-full bg-gray-100 rounded-2xl overflow-hidden shadow-inner border border-gray-300">
                            {quizState.currentMemory.imagePath && (
                                <Image
                                    src={quizState.currentMemory.imagePath}
                                    alt="Memory to identify"
                                    layout="fill"
                                    objectFit="contain"
                                    className="p-2"
                                    unoptimized
                                />
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col justify-between">

                        <div className={`p-6 rounded-2xl mb-auto shadow-sm border border-orange-100`} style={{ backgroundColor: PARCHMENT_LIGHT }}>
                            <div className="flex items-start gap-3">
                                <FaQuestion className="text-orange-500 mt-1 flex-shrink-0" size={24} />
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
                                        Question
                                    </h3>
                                    <p className="text-xl font-bold text-gray-800">
                                        {quizState.questionText}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!quizState.llmResponse ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-auto">
                                <div className="relative">
                                    <textarea
                                        value={quizState.userAnswer}
                                        onChange={(e) => setQuizState(prev => ({ ...prev, userAnswer: e.target.value }))}
                                        placeholder="Type your answer here..."
                                        disabled={quizState.isThinking}
                                        rows={3}
                                        className="w-full p-4 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200 outline-none text-lg transition"
                                    />
                                </div>

                                <div className="flex justify-between gap-4">
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        disabled={quizState.isThinking}
                                        className={`
                                            py-4 px-6 rounded-xl font-bold text-lg transition shadow-md w-1/3 flex items-center justify-center
                                            ${quizState.isThinking
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : `bg-[${ORANGE_ACCENT}] hover:brightness-90 text-white`
                                            }
                                        `}
                                    >
                                        <FaForward className="mr-2" /> Skip
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={!quizState.userAnswer.trim() || quizState.isThinking}
                                        className={`
                                            py-4 px-6 rounded-xl font-bold text-white text-lg transition shadow-lg flex items-center justify-center w-2/3
                                            ${quizState.isThinking
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : `bg-[${BLUE_ACCENT}] hover:brightness-90`
                                            }
                                        `}
                                    >
                                        {quizState.isThinking ? (
                                            <span className="animate-pulse">Checking...</span>
                                        ) : (
                                            "Check My Answer"
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-6 animate-fade-in mt-auto">
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FaLightbulb className="text-blue-500" />
                                        <span className="font-bold text-blue-800">Feedback</span>
                                    </div>
                                    <p className="text-lg text-gray-800 leading-relaxed">
                                        {quizState.llmResponse}
                                    </p>
                                </div>

                                <button
                                    onClick={loadNewRound}
                                    className={`py-4 px-6 rounded-xl font-bold text-white text-lg transition shadow-lg bg-[${GREEN_ACCENT}] hover:brightness-90 flex items-center justify-center`}
                                >
                                    <FaRegSmileBeam className="mr-2" size={24} />
                                    Next Memory
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}