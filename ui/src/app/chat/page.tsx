'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { GiConversation } from 'react-icons/gi';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

// import { useUserProfile } from '@/utils/useUserProfile';

const PARCHMENT_LIGHT = '#f5f5e0';
const BLUE_ACCENT = '#87ceeb';

// --- Types ---
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'assistant';
}

export default function ChatPage() {
    // const { profile } = useUserProfile();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input.trim(), sender: 'user' };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // call LLM API endpoint
        await new Promise(resolve => setTimeout(resolve, 1500));

        const llmResponseText = `Hello, ${/* profile.name || */ 'Tippi'}. I am ready to chat! You asked about ${userMessage.text}.`;
        
        const assistantMessage: Message = {
            id: Date.now() + 1,
            text: llmResponseText,
            sender: 'assistant',
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
    };
    
    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center">
            
            <div className="w-full max-w-4xl bg-white p-8 rounded-3xl shadow-2xl flex flex-col h-[90vh]">
                
                <Link href="/" className="text-gray-700 hover:text-gray-900 flex items-center mb-8 font-semibold transition flex-shrink-0">
                    <IoIosArrowBack size={24} className="mr-1" />
                    Back to Dashboard
                </Link>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b-2 border-blue-200 pb-3 flex items-center flex-shrink-0">
                    <GiConversation size={36} className={`mr-3 text-[${BLUE_ACCENT}]`} />
                    Chat With Me
                </h1>

                <div className="flex-grow overflow-y-auto space-y-4 p-4 rounded-xl mb-4 shadow-inner" style={{ backgroundColor: PARCHMENT_LIGHT }}>
                    
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 pt-10">
                            <p className="mb-2 text-xl font-bold">Start a conversation!</p>
                            <p>Talk to me about your schedule, photo albums, and more.</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] px-4 py-3 rounded-xl shadow-md ${
                                    msg.sender === 'user'
                                        ? 'bg-blue-100 text-gray-800 rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                                }`}
                            >
                                <div className="text-xs font-semibold mb-1 flex items-center">
                                    {msg.sender === 'assistant' ? <GiConversation size={14} className="mr-1 text-blue-500"/> : <FaUserCircle size={14} className="mr-1 text-gray-600"/>}
                                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                                </div>
                                <p className="text-base whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="max-w-[75%] px-4 py-3 rounded-xl bg-white shadow-md border border-gray-200">
                                <p className="text-sm text-gray-500 animate-pulse">Assistant is thinking...</p>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
                
                {/* 2. Input Form */}
                <form onSubmit={handleSendMessage} className="flex flex-shrink-0">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-grow p-3 border-2 border-gray-300 rounded-l-xl shadow-inner focus:border-blue-500 outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={`bg-[${BLUE_ACCENT}] text-white px-6 rounded-r-xl font-bold transition hover:bg-sky-500 flex items-center justify-center`}
                        disabled={isLoading}
                    >
                        <FaPaperPlane size={20} />
                    </button>
                </form>

            </div>
        </div>
    );
}