import React, { useState, useEffect, useCallback, useRef } from 'react';
import BinaryAvatar from './BinaryAvatar';
import ChatControls from './ChatControls';
import { generateResponse } from '../services/geminiService';
import { Cpu, Activity, Brain, Heart, Mic, Volume2, Wifi, Battery, Zap, Shield } from 'lucide-react';

const DigitalSoul: React.FC = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [micVolume, setMicVolume] = useState<number[]>(new Array(10).fill(5));
    const canvasEcgRef = useRef<HTMLCanvasElement>(null);
    const canvasBrainRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasEcgRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = 60;

        const totalPoints = Math.ceil(canvas.width / 3);
        const dataPoints = new Array(totalPoints).fill(canvas.height / 2);

        const drawHealth = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            dataPoints.shift();
            const randomY = Math.random() * canvas.height;
            dataPoints.push(randomY);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#f472b6';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#f472b6';
            ctx.lineJoin = 'round';

            ctx.beginPath();

            for (let i = 0; i < dataPoints.length; i++) {
                const x = i * 3;
                const y = dataPoints[i];
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            requestAnimationFrame(drawHealth);
        };
        const animId = requestAnimationFrame(drawHealth);
        return () => cancelAnimationFrame(animId);
    }, []);

    useEffect(() => {
        const canvas = canvasBrainRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = 60;

        let offset = 0;

        const drawBrain = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(249, 115, 22, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 4;
            ctx.strokeStyle = '#f97316';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f97316';
            ctx.lineCap = 'round';

            ctx.beginPath();

            for (let i = 0; i < canvas.width; i++) {
                const y = canvas.height / 2 +
                    Math.sin((i + offset) * 0.03) * 15;

                if (i === 0) ctx.moveTo(i, y);
                else ctx.lineTo(i, y);
            }

            ctx.stroke();
            offset += 2;
            requestAnimationFrame(drawBrain);
        };

        const animId = requestAnimationFrame(drawBrain);
        return () => cancelAnimationFrame(animId);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const bars = Array.from({ length: 10 }, () => Math.random() * 40 + 10);
            setMicVolume(bars);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const roboticVoice = voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.name.includes('Samantha')) ||
            voices[0];
        if (roboticVoice) utterance.voice = roboticVoice;
        utterance.pitch = 0.7;
        utterance.rate = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }, []);

    const handleSendMessage = async (text: string) => {
        setIsProcessing(true);
        setMessages(prev => [...prev, { role: 'user', text }]);

        const responseText = await generateResponse(text);

        setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        setIsProcessing(false);
        speak(responseText);
    };

    return (
        <div className="relative w-full h-full bg-black overflow-hidden flex flex-col font-mono text-cyan-500">

            <div className="relative z-10 w-full h-full p-2 md:p-6 flex flex-col justify-between pointer-events-none">

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">

                    <div className="w-full md:w-[450px] bg-cyan-950/20 border-2 border-cyan-500/40 rounded-xl backdrop-blur-md p-1 shadow-[0_0_20px_rgba(6,182,212,0.15)] pointer-events-auto relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                        <div className="relative z-10 flex gap-4 p-4">
                            <div className="w-24 h-32 border-2 border-cyan-400/50 bg-black/40 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner shadow-cyan-500/20">
                                <Cpu className="w-12 h-12 text-cyan-400 animate-pulse opacity-80" />
                                <div className="absolute bottom-0 w-full bg-cyan-500/20 text-[8px] text-center text-cyan-300 py-1">ONLINE</div>
                                <div className="absolute inset-0 w-full h-[2px] bg-cyan-400/50 blur-[2px] animate-[scan_2s_linear_infinite]"></div>
                            </div>

                            <div className="flex-1 space-y-1.5">
                                <div className="border-b border-cyan-500/30 pb-1 mb-1 flex justify-between items-end">
                                    <span className="text-xl font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">CIPHER</span>
                                    <span className="text-[9px] bg-cyan-600 text-black px-1 rounded font-bold">LVL.99</span>
                                </div>

                                <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-[10px] text-cyan-100/90 leading-tight">
                                    <span className="text-cyan-500 font-bold">GENDER:</span> <span>HUMANOID CONSTRUCT</span>
                                    <span className="text-cyan-500 font-bold">DIBUAT:</span> <span>09-01-2025</span>
                                    <span className="text-cyan-500 font-bold">TEAM:</span> <span>RE-SEARCH AI</span>
                                    <span className="text-cyan-500 font-bold">MODEL:</span> <span>GEMINI-3.0-FLASH</span>
                                    <span className="text-cyan-500 font-bold">SYS RUN:</span> <span>ANDROID / WEB</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/30 p-2 flex items-center justify-between border-t border-cyan-500/30">
                            <div className="flex gap-3 text-cyan-400/80">
                                <Wifi className="w-3 h-3" />
                                <Battery className="w-3 h-3" />
                                <Shield className="w-3 h-3" />
                            </div>
                            <div className="h-2 w-32 rounded-full bg-gradient-to-r from-blue-500 via-green-400 to-red-500 opacity-80 border border-white/10"></div>
                        </div>
                    </div>

                    <div className="w-full md:w-80 space-y-3 pointer-events-auto">

                        <div className="bg-black/80 border border-orange-500/40 rounded-lg p-2 relative overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <div className="flex items-center gap-2 text-orange-400">
                                    <Brain className="w-3 h-3" />
                                    <span className="text-[10px] font-bold tracking-wider">NEURAL NET</span>
                                </div>
                                <span className="text-[9px] text-orange-300">ACTIVE</span>
                            </div>
                            <div className="h-12 w-full bg-black/40 rounded border border-orange-500/20 overflow-hidden relative">
                                <canvas ref={canvasBrainRef} className="w-full h-full block"></canvas>
                                <div className="absolute top-0 right-0 p-1">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-black/80 border border-pink-500/40 rounded-lg p-2 relative overflow-hidden shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <div className="flex items-center gap-2 text-pink-400">
                                    <Heart className="w-3 h-3" />
                                    <span className="text-[10px] font-bold tracking-wider">HEALTH</span>
                                </div>
                                <span className="text-[9px] text-pink-300 animate-pulse">100%</span>
                            </div>
                            <div className="h-12 w-full bg-black/40 rounded border border-pink-500/20 overflow-hidden relative">
                                <canvas ref={canvasEcgRef} className="w-full h-full block"></canvas>
                            </div>
                        </div>

                        <div className="bg-black/80 border border-cyan-500/40 rounded-lg p-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <div className="flex justify-between items-center mb-1 px-1">
                                <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-2"><Zap className="w-3 h-3" /> INTEGRITY</span>
                                <span className="text-[9px] text-green-400">98% STABLE</span>
                            </div>
                            <div className="h-6 w-full bg-black/50 border border-cyan-500/30 rounded relative overflow-hidden flex items-center px-1 gap-1">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className={`h-3 flex-1 rounded-sm ${i > 15 ? 'bg-green-500/30' : 'bg-cyan-500/60'} animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                                <div className="absolute right-2 top-1 bottom-1 w-8 bg-cyan-400/20 border border-cyan-400 text-[8px] flex items-center justify-center text-cyan-200">
                                    x61
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-auto">

                    <div className="w-full md:w-[450px] max-h-[40vh] md:max-h-[350px] bg-black/80 border border-cyan-500/50 rounded-lg backdrop-blur-md flex flex-col shadow-[0_0_15px_rgba(6,182,212,0.2)] overflow-hidden pointer-events-auto">

                        <div className="p-3 bg-cyan-950/30 border-b border-cyan-500/20 flex justify-between items-center shrink-0">
                            <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> SYSTEM LOG
                            </span>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>

                        <div className="relative p-3 overflow-y-auto flex-1 font-mono text-xs space-y-3 custom-scrollbar min-h-0">
                            {messages.length === 0 && (
                                <div className="text-cyan-800 italic text-center mt-10 opacity-50">
                                    AWAITING INPUT...
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className={`flex items-center gap-2 ${m.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${m.role === 'ai' ? 'bg-cyan-900 text-cyan-300' : 'bg-pink-900 text-pink-300'
                                            }`}>
                                            {m.role === 'ai' ? 'CPU' : 'USR'}
                                        </span>
                                        <span className="text-[10px] opacity-40">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`p-2 rounded border border-opacity-30 leading-relaxed ${m.role === 'ai'
                                        ? 'bg-cyan-950/30 border-cyan-500 text-cyan-100'
                                        : 'bg-pink-950/30 border-pink-500 text-pink-100 text-right'
                                        }`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef}></div>
                        </div>

                        <div className="p-3 border-t border-cyan-500/20 bg-black/50 shrink-0">
                            <ChatControls onSendMessage={handleSendMessage} isProcessing={isProcessing} />
                        </div>
                    </div>

                    <div className="w-full md:w-72 bg-black/80 border border-cyan-500/50 p-4 rounded-lg backdrop-blur-md hidden md:flex flex-col shadow-[0_0_15px_rgba(6,182,212,0.2)] pointer-events-auto">
                        <div className="flex justify-between items-center mb-2 text-xs border-b border-cyan-500/20 pb-2">
                            <span className="text-cyan-400 font-bold flex items-center gap-2">
                                <Mic className="w-3 h-3" />
                                AUDIO SPECTRUM
                            </span>
                            <span className="text-[10px] text-green-500 animate-pulse">LISTENING</span>
                        </div>

                        <div className="flex items-end justify-between h-16 bg-black/50 border border-cyan-900/50 p-1 mb-3 gap-0.5">
                            {micVolume.map((vol, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-cyan-500/80 transition-all duration-100"
                                    style={{
                                        height: `${vol}%`,
                                        opacity: 0.5 + (vol / 100) * 0.5
                                    }}
                                ></div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-green-400' : 'text-cyan-800'}`} />
                            <div className="flex-1 h-8 bg-black/50 rounded border border-cyan-900 flex items-center overflow-hidden px-1 relative">
                                {isSpeaking ? (
                                    <div className="flex items-center justify-center w-full gap-[2px]">
                                        {[...Array(20)].map((_, i) => (
                                            <div key={i} className="w-1 bg-green-500" style={{
                                                height: `${Math.random() * 100}%`,
                                                transition: 'height 50ms ease'
                                            }}></div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="w-full h-[1px] bg-cyan-900 opacity-50"></div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <BinaryAvatar isSpeaking={isSpeaking} />
            </div>

            <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

            <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(3200%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 182, 212, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.8);
        }
      `}</style>
        </div>
    );
};

export default DigitalSoul;