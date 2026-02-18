import CyberNews from './CyberNews';
import { Gamepad2, Palette, Tv, ChevronLeft, TrendingUp, Newspaper, BookOpen } from 'lucide-react';
import React, { useState } from 'react';
import MazeGame from './MazeGame';
import ArtStudio from './ArtStudio/ArtStudio';
import Anime from './Anime';
import TradingView from './TradingView';
import AnimeInfo from './AnimeInfo';

type Mode = 'menu' | 'maze' | 'art' | 'anime' | 'trading' | 'news' | 'anime-info';

const FunHub: React.FC = () => {
    const [mode, setMode] = useState<Mode>('menu');

    if (mode === 'anime-info') {
        return (
            <div className="h-full flex flex-col">
                <div className="p-2 border-b border-pink-900 bg-black flex items-center">
                    <button onClick={() => setMode('menu')} className="text-pink-500 hover:text-pink-400 flex items-center gap-2 text-sm font-bold">
                        <ChevronLeft size={16} /> Back to Hub
                    </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <AnimeInfo />
                </div>
            </div>
        );
    }

    if (mode === 'news') {
        return (
            <div className="h-full flex flex-col">
                <div className="p-2 border-b border-cyan-900 bg-black flex items-center">
                    <button onClick={() => setMode('menu')} className="text-cyan-500 hover:text-cyan-400 flex items-center gap-2 text-sm font-bold">
                        <ChevronLeft size={16} /> Back to Hub
                    </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <CyberNews />
                </div>
            </div>
        );
    }

    if (mode === 'maze') {
        return (
            <div className="h-full flex flex-col">
                <div className="p-2 border-b border-green-900 bg-black flex items-center">
                    <button onClick={() => setMode('menu')} className="text-green-500 hover:text-green-400 flex items-center gap-2 text-sm font-bold">
                        <ChevronLeft size={16} /> Back to Hub
                    </button>
                </div>
                <div className="flex-1 overflow-hidden">
                    <MazeGame />
                </div>
            </div>
        );
    }

    if (mode === 'art') {
        return (
            <div className="h-full flex flex-col">
                <div className="p-2 border-b border-gray-700 bg-[#2d2d2d] flex items-center">
                    <button onClick={() => setMode('menu')} className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-bold">
                        <ChevronLeft size={16} /> Back to Hub
                    </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <ArtStudio />
                </div>
            </div>
        );
    }



    if (mode === 'anime') {
        return (
            <div className="h-full flex flex-col">
                <div className="p-2 border-b border-pink-900 bg-black flex items-center">
                    <button onClick={() => setMode('menu')} className="text-pink-500 hover:text-pink-400 flex items-center gap-2 text-sm font-bold">
                        <ChevronLeft size={16} /> Back to Hub
                    </button>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <Anime />
                </div>
            </div>
        );
    }

    if (mode === 'trading') {
        return (
            <div className="h-full flex flex-col">
                {/* Header is handled inside TradingView component or we can wrap it here. 
                    TradingView component I wrote handles its own header.
                    Let's check TradingView.tsx content I wrote: 
                    It has a header with onBack.
                    So I should pass onBack.
                */}
                <div className="flex-1 overflow-hidden relative h-full">
                    <TradingView onBack={() => setMode('menu')} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-black p-8 font-sans">
            <h1 className="text-3xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 font-orbitron tracking-wider">
                ENTERTAINMENT SECTOR
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
                {/* Maze Game Card */}
                <button
                    onClick={() => setMode('maze')}
                    className="group relative h-64 bg-black border border-green-900 rounded-xl overflow-hidden hover:border-green-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,65,0.2)] text-left"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,0,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-grid-green opacity-10" />

                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="mb-4 bg-green-900/30 w-16 h-16 rounded-lg flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform">
                            <Gamepad2 size={32} className="text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-400 mb-2 font-orbitron">MAZE RUNNER</h2>
                        <p className="text-gray-400 text-sm">
                            Algorithm optimization challenge. Navigate complex algorithms and mazes.
                        </p>
                        <div className="mt-auto flex items-center text-green-500 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>LAUNCH_PROTOCOL</span>
                            <span className="ml-2 animate-pulse">_</span>
                        </div>
                    </div>
                </button>

                {/* Art Studio Card */}
                <button
                    onClick={() => setMode('art')}
                    className="group relative h-64 bg-[#1e1e1e] border border-blue-900 rounded-xl overflow-hidden hover:border-blue-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] text-left"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a),linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] opacity-20" />

                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="mb-4 bg-blue-900/30 w-16 h-16 rounded-lg flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                            <Palette size={32} className="text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-blue-400 mb-2 font-orbitron">ART STUDIO</h2>
                        <p className="text-gray-400 text-sm">
                            Digital creative suite. Layer-based editing, procedural brushes, and infinite canvas.
                        </p>
                        <div className="mt-auto flex items-center text-blue-500 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>OPEN_STUDIO</span>
                            <span className="ml-2 animate-pulse">_</span>
                        </div>
                    </div>
                </button>




                {/* Cyber News Card */}
                <button
                    onClick={() => setMode('news')}
                    className="group relative h-64 bg-black border border-cyan-900 rounded-xl overflow-hidden hover:border-cyan-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] text-left md:col-span-2 lg:col-span-1"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-grid-cyan opacity-10" />

                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="mb-4 bg-cyan-900/30 w-16 h-16 rounded-lg flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                            <Newspaper size={32} className="text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2 font-orbitron">CYBER NEWS</h2>
                        <p className="text-gray-400 text-sm">
                            Real-time intelligence feed. Global cybersecurity updates and tech news.
                        </p>
                        <div className="mt-auto flex items-center text-cyan-500 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>ACCESS_FEED</span>
                            <span className="ml-2 animate-pulse">_</span>
                        </div>
                    </div>
                </button>

                {/* Anime Database Card (User Request: newsanime) */}
                <button
                    onClick={() => setMode('anime-info')}
                    className="group relative h-64 bg-black border border-purple-900 rounded-xl overflow-hidden hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] text-left md:col-span-2 lg:col-span-1"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-grid-purple opacity-10" />

                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="mb-4 bg-purple-900/30 w-16 h-16 rounded-lg flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                            <BookOpen size={32} className="text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-purple-400 mb-2 font-orbitron">ANIME DB</h2>
                        <p className="text-gray-400 text-sm">
                            Access the neural archives. Comprehensive data on anime and manga artifacts.
                        </p>
                        <div className="mt-auto flex items-center text-purple-500 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>QUERY_DB</span>
                            <span className="ml-2 animate-pulse">_</span>
                        </div>
                    </div>
                </button>

                {/* Anime Card */}
                <button
                    onClick={() => setMode('anime')}
                    className="group relative h-64 bg-black border border-pink-900 rounded-xl overflow-hidden hover:border-pink-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] text-left md:col-span-2 lg:col-span-1"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-grid-pink opacity-10" />

                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="mb-4 bg-pink-900/30 w-16 h-16 rounded-lg flex items-center justify-center border border-pink-500/30 group-hover:scale-110 transition-transform">
                            <Tv size={32} className="text-pink-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-pink-400 mb-2 font-orbitron">ANIME STATION</h2>
                        <p className="text-gray-400 text-sm">
                            Watch latest anime releases. Daily updates and streaming.
                        </p>
                        <div className="mt-auto flex items-center text-pink-500 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>START_STREAM</span>
                            <span className="ml-2 animate-pulse">_</span>
                        </div>
                    </div>
                </button>

                {/* Trading View Card */}
                <button
                    onClick={() => setMode('trading')}
                    className="group relative h-64 bg-black border border-cyan-900 rounded-xl overflow-hidden hover:border-cyan-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] text-left md:col-span-2 lg:col-span-1"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-grid-cyan opacity-10" />

                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="mb-4 bg-cyan-900/30 w-16 h-16 rounded-lg flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                            <TrendingUp size={32} className="text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2 font-orbitron">TRADING ZONE</h2>
                        <p className="text-gray-400 text-sm">
                            Real-time market data stream. Monitor crypto and forex markets securely.
                        </p>
                        <div className="mt-auto flex items-center text-cyan-500 text-sm font-mono opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <span>INIT_STREAM</span>
                            <span className="ml-2 animate-pulse">_</span>
                        </div>
                    </div>
                </button>
            </div>
        </div >
    );
};

export default FunHub;
