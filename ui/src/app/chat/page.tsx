'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { GiConversation } from 'react-icons/gi';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import {createThread, sendMessage} from './llmClient.js'

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

    
        const [threadId, setThreadId] = useState<string | null>(null);

        useEffect(() => {
            let mounted = true;
            const initThread = async () => {
                try {
                    setIsLoading(true);
                    const res = await createThread();
                    if (!mounted) return;
                    if (typeof res === 'string') {
                        setThreadId(res);
                    } else if (res && typeof res === 'object' && 'threadId' in res) {
                        setThreadId((res as any).threadId);
                    } else {
                        console.warn('createThread returned unexpected value:', res);
                    }
                } catch (err) {
                    console.error('createThread failed', err);
                } finally {
                    if (mounted) setIsLoading(false);
                }
            };

            initThread();
            return () => {
                mounted = false;
            };
        }, []);
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input.trim(), sender: 'user' };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // call LLM API endpoint
        // ensure we have a thread id (create one if needed)
        let effectiveThreadId = threadId;
        if (!effectiveThreadId) {
            try {
            const newThread = await createThread();
            if (typeof newThread === 'string') {
                effectiveThreadId = newThread;
                setThreadId(newThread);
            } else if (newThread && typeof newThread === 'object' && 'threadId' in newThread) {
                effectiveThreadId = (newThread as any).threadId;
                setThreadId(effectiveThreadId);
            }
            } catch (err) {
            console.error('createThread failed inside send flow', err);
            }
        }

        // send the message
        let sendResponse: any = undefined;
        try {
            if (!effectiveThreadId) throw new Error('no thread id available');
            sendResponse = await sendMessage(String(effectiveThreadId), userMessage.text);
            // if sendMessage returns/updates a threadId, persist it
            if (sendResponse && typeof sendResponse === 'object' && 'threadId' in sendResponse) {
            setThreadId((sendResponse as any).threadId);
            }
        } catch (err) {
            console.error('sendMessage failed', err);
            sendResponse = undefined;
        }

        // normalize response text
        let llmResponseText = 'Sorry, I could not reach the assistant right now.';
        if (sendResponse != null) {
            if (typeof sendResponse === 'string') {
            llmResponseText = sendResponse;
            } else if (typeof sendResponse === 'object') {
            if (typeof (sendResponse as any).text === 'string') {
                llmResponseText = (sendResponse as any).text;
            } else if (typeof (sendResponse as any).message === 'string') {
                llmResponseText = (sendResponse as any).message;
            } else {
                try {
                llmResponseText = JSON.stringify(sendResponse);
                } catch {
                llmResponseText = String(sendResponse);
                }
            }
            } else {
            llmResponseText = String(sendResponse);
            }
        }
        
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