import React, { useState } from 'react';
import { Gamepad2, Palette, ChevronLeft } from 'lucide-react';
import MazeGame from './MazeGame';
import ArtStudio from './ArtStudio/ArtStudio';

const FunHub: React.FC = () => {
    const [mode, setMode] = useState<'menu' | 'maze' | 'art'>('menu');

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
            </div>
        </div>
    );
};

export default FunHub;
