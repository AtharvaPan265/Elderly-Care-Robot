'use client';

import React from 'react';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { GiCardExchange } from "react-icons/gi";

const CARD_EMBED_URL = "https://memorymatching.com/"; 

export default function CardMemoryPage() {
    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center">
            <div className="w-full max-w-4xl bg-white p-8 rounded-3xl shadow-2xl">
                
                <Link href="/games" className="text-gray-700 hover:text-gray-900 flex items-center mb-8 font-semibold transition">
                    <IoIosArrowBack size={24} className="mr-1" />
                    Back to Games
                </Link>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-2 border-[#8fbc8f] pb-3 flex items-center">
                    <GiCardExchange size={36} className="mr-3 text-blue-500" />
                    Card Matching Game
                </h1>
                
                <div className="w-full bg-gray-100 rounded-xl overflow-hidden shadow-inner flex flex-col items-center p-4">
                    <iframe
                        src={CARD_EMBED_URL}
                        title="Card Memory Game"
                        width="80%" 
                        height="800px"
                        style={{ border: 'none', minHeight: '800px', marginTop: "-150px", marginBottom: "" }}
                        sandbox="allow-scripts allow-same-origin allow-popups" 
                    >
                        Your browser does not support iframes.
                    </iframe>
                    
                    <p className="mt-6 text-sm text-red-600 font-semibold">
                        
                    </p>
                </div>
            </div>
        </div>
    );
}