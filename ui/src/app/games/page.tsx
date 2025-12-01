'use client';

import React from 'react';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { FaCrosshairs, FaBorderAll, FaSearch, FaPuzzlePiece } from 'react-icons/fa';
import { GiCardExchange } from "react-icons/gi";
const GREEN_COLOR = "#8fbc8f"; 

interface GameButtonProps {
    title: string;
    description: string;
    href: string;
    Icon: React.ElementType;
}

const GameButton: React.FC<GameButtonProps> = ({ title, description, href, Icon }) => (
    <Link 
        href={href} 
        className={`
            flex flex-col items-center justify-center text-center
            p-6 bg-white rounded-2xl shadow-xl transition-all duration-300 h-64
            border-b-4 border-r-4 border-gray-200 hover:border-b-8 hover:border-r-8 hover:border-gray-400
        `}
    >
        <Icon size={48} className={`text-[${GREEN_COLOR}] mb-3`} />
        <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
        <p className="text-lg text-gray-500 mt-1">{description}</p>
    </Link>
);


export default function GamesHubPage() {
    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center">
            <div className="w-full max-w-5xl bg-white p-8 rounded-3xl shadow-2xl">
                <Link href="/dash" className="text-2xl text-gray-700 hover:text-gray-900 flex items-center mb-10 font-semibold transition">
                    <IoIosArrowBack size={24} className="mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="text-5xl font-extrabold text-gray-900 mb-8 border-b-2 border-blue-100 pb-3">
                    Games and Brain Teasers
                </h1>
                <p className="text-2xl text-gray-700 mb-10">
                    Select a game below to start playing.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    <GameButton
                        title="My Memories Game"
                        description="Quiz yourself on the past."
                        href="/games/my-memories"
                        Icon={FaCrosshairs}
                    />
                    <GameButton
                        title="Full Crossword"
                        description="Traditional crossword."
                        href="/games/crossword-full"
                        Icon={FaPuzzlePiece}
                    />
                    <GameButton
                        title="Sudoku"
                        description="Classic numbers logic puzzle."
                        href="/games/sudoku"
                        Icon={FaBorderAll}
                    />
                    <GameButton
                        title="Word Search"
                        description="Find the hidden words."
                        href="/games/word-search"
                        Icon={FaSearch}
                    />
                    <GameButton
                        title="Card Matching Game"
                        description="Flip the cards to match them."
                        href="/games/card-memory"
                        Icon={GiCardExchange}
                        
                    />
                </div>
            </div>
        </div>
    );
}