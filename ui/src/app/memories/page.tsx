'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { FaRegImages, FaCameraRetro, FaThLarge, FaFolderOpen, FaFileAlt } from 'react-icons/fa';

import { memories, collectionNames, Memory, MemoryCollection } from '@/app/data/memoriesData';

type ViewMode = 'grid' | 'gallery' | 'collections';

const PARCHMENT_LIGHT = '#f5f5e0';
const PARCHMENT_DARK = '#eee2d0';
const BORDER_PARCHMENT = '#ddd0bb';

interface ModeButtonProps {
    mode: ViewMode;
    label: string;
    currentMode: ViewMode;
    onClick: () => void;
    Icon: React.ElementType;
}

interface MemoryCardProps {
    memory: Memory;
    imageHeightClass?: string; 
}

const ModeButton: React.FC<ModeButtonProps> = ({ mode, label, currentMode, onClick, Icon }) => {
    const isActive = currentMode === mode;
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition 
                ${isActive 
                    ? 'bg-[#ffb573] text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
};

const MemoryCard: React.FC<MemoryCardProps> = ({ memory, imageHeightClass = 'h-64' }) => {
    const isTextOnly = memory.type === 'Text';

    const tags = [
        memory.date && `Date: ${memory.date}`,
        memory.year && `Year: ${memory.year}`,
        memory.event && `Event: ${memory.event}`,
        memory.location && `Location: ${memory.location}`,
        memory.people && `People: ${memory.people.join(', ')}`,
    ].filter(Boolean) as string[];

    return (
        <div className={`bg-white rounded-xl shadow-lg overflow-hidden border-t-8 ${memory.color} transition-shadow duration-300 hover:shadow-2xl`}>
            <div className={`relative w-full ${imageHeightClass} flex-shrink-0 p-2 
                ${isTextOnly ? `bg-[${PARCHMENT_LIGHT}] flex items-center justify-center` : `bg-[${PARCHMENT_DARK}]`}`
            }> 
                {memory.type === 'Photo' || memory.type === 'Both' ? (
                    memory.imagePath ? (
                        <Image
                            src={memory.imagePath}
                            alt={memory.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'contain' }}
                            className="transition-transform duration-500 hover:scale-105"
                            unoptimized
                        />
                    ) : (
                         <FaFileAlt size={64} className="text-red-400" /> 
                    )
                ) : (
                    <FaFileAlt size={64} className="text-gray-400" />
                )}
            </div>
            <div className="p-4">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">{memory.title}</h3>
                <p className="text-gray-700 text-sm mb-3 italic line-clamp-3">{memory.caption}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {memory.collection || 'Unsorted'}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {memory.type}
                    </span>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Tags:</p>
                    <p className="text-xs text-gray-600 space-y-1">
                        {tags.map((tag, i) => (
                            <span key={i} className="block">{tag}</span>
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );
};

const GridView: React.FC<{ memories: Memory[] }> = ({ memories }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {memories.map(memory => (
            <MemoryCard 
                key={memory.id}
                memory={memory}
                imageHeightClass='h-64' 
            />
        ))}
    </div>
);

const GalleryView: React.FC<{ memories: Memory[] }> = ({ memories }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentMemory = memories[currentIndex];

    const goToNext = () => setCurrentIndex((currentIndex + 1) % memories.length);
    const goToPrev = () => setCurrentIndex((currentIndex - 1 + memories.length) % memories.length);

    if (memories.length === 0) return <p className="text-center p-10 text-xl font-medium">No memories to display here.</p>;
    
    return (
        <div className="flex flex-col items-center w-full"> 
            <div className="w-full max-w-4xl"> 
                <MemoryCard 
                    memory={currentMemory} 
                    imageHeightClass="h-[400px] md:h-[500px]" 
                />
                <div className="mt-4 flex justify-center items-center gap-4">
                    <button 
                        onClick={goToPrev} 
                        disabled={memories.length <= 1} 
                        className="p-3 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50 transition"
                    >
                        <IoIosArrowBack size={24} />
                    </button>
                    
                    <span className="self-center text-lg font-bold">
                        {currentIndex + 1} of {memories.length}
                    </span>
                    
                    <button 
                        onClick={goToNext} 
                        disabled={memories.length <= 1} 
                        className="p-3 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50 transition"
                    >
                        <IoIosArrowForward size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const CollectionsView: React.FC<{ setCollection: (c: MemoryCollection) => void, currentCollection: MemoryCollection }> = ({ setCollection, currentCollection }) => {
    const albums = collectionNames.filter(name => name !== 'All');
    const getCount = (album: MemoryCollection) => {
        if (album === 'Unsorted') {
            return memories.filter(m => !m.collection).length;
        }
        return memories.filter(m => m.collection === album).length;
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {albums.map(album => (
                <button
                    key={album}
                    onClick={() => {
                        setCollection(album);
                    }}
                    className={`
                        flex flex-col items-center justify-center p-6 rounded-2xl h-40 font-extrabold shadow-lg transition
                        ${currentCollection === album 
                            ? 'bg-[#ffb573] text-white border-4 border-white ring-2 ring-[#ffb573]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                >
                    <FaFolderOpen size={32} className="mb-2" />
                    <span className="text-lg">{album}</span>
                    <span className="text-sm font-normal mt-1">
                        ({getCount(album)} items)
                    </span>
                </button>
            ))}
        </div>
    );
};

export default function MemoriesPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [currentCollection, setCurrentCollection] = useState<MemoryCollection>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const filteredMemories = memories.filter(m => {
        // Filter by collection first
        if (currentCollection === 'All') {
            // No collection filter
        } else if (currentCollection === 'Unsorted') {
            if (m.collection) return false;
        } else {
            if (m.collection !== currentCollection) return false;
        }

        if (!searchTerm) return true;

        const lowerSearch = searchTerm.toLowerCase();
        const searchableText = `${m.title} ${m.caption} ${m.event || ''} ${m.location || ''} ${m.people?.join(' ') || ''}`;
        return searchableText.toLowerCase().includes(lowerSearch);
    });

    const renderContent = () => {
        switch (viewMode) {
            case 'grid':
                return <GridView memories={filteredMemories} />;
            case 'gallery':
                return <GalleryView memories={filteredMemories} />;
            case 'collections':
                return <CollectionsView setCollection={setCurrentCollection} currentCollection={currentCollection} />;
            default:
                return <GridView memories={filteredMemories} />;
        }
    };

    return (
        <div className="bg-[#e0f7fa] min-h-screen p-6 md:p-10 flex justify-center">
            <div className="w-full max-w-6xl bg-white p-8 rounded-3xl shadow-2xl">
                <Link href="/dash" className="text-gray-700 hover:text-gray-900 flex items-center mb-8 font-semibold transition">
                    <IoIosArrowBack size={24} className="mr-1" />
                    Back to Dashboard
                </Link>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 border-b-2 border-orange-200 pb-3 flex items-center">
                    <FaRegImages size={36} className="mr-3 text-[#ffb573]" />
                    My Memories
                </h1>
                <p className="text-lg text-gray-700 mb-6">
                    Your most cherished memories.
                </p>
                <input
                    type="text"
                    placeholder="Search memories by title, caption, or tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 mb-6 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-md transition"
                />
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div className="flex flex-wrap gap-3">
                        <ModeButton mode="grid" label="Grid View" currentMode={viewMode} onClick={() => setViewMode('grid')} Icon={FaThLarge} />
                        <ModeButton mode="gallery" label="Gallery View" currentMode={viewMode} onClick={() => setViewMode('gallery')} Icon={FaCameraRetro} />
                        <ModeButton mode="collections" label="Albums" currentMode={viewMode} onClick={() => setViewMode('collections')} Icon={FaFolderOpen} />
                    </div>
                    {viewMode !== 'collections' && (
                        <div className="relative flex items-center">
                            <label className="text-sm font-semibold text-gray-700 mr-2">Album:</label>
                            <select
                                value={currentCollection}
                                onChange={(e) => setCurrentCollection(e.target.value as MemoryCollection)}
                                className="p-2 border rounded-lg bg-white shadow-sm"
                            >
                                {collectionNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                {filteredMemories.length > 0 && viewMode !== 'collections' ? (
                    renderContent()
                ) : viewMode === 'collections' ? (
                    <CollectionsView setCollection={(c) => { setCurrentCollection(c); setViewMode('grid'); }} currentCollection={currentCollection} />
                ) : (
                    <div className="text-center p-10 text-xl font-medium text-gray-500">
                        No memories found matching the current search or filter.
                    </div>
                )}
            </div>
        </div>
    );
}