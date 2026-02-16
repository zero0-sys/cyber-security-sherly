import React, { useState, useEffect, useCallback } from 'react';
import BinaryAvatar from './BinaryAvatar';
import ChatControls from './ChatControls';
import { generateResponse } from '../services/geminiService';
import { Cpu, Wifi } from 'lucide-react';

const DigitalSoul: React.FC = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [gesture, setGesture] = useState<'idle' | 'wave' | 'think' | 'dance'>('idle');
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

    useEffect(() => {
        const synth = window.speechSynthesis;
        synth.getVoices();
    }, []);

    const speak = useCallback((text: string) => {
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        const roboticVoice = voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.name.includes('Samantha')) ||
            voices[0];

        if (roboticVoice) utterance.voice = roboticVoice;
        utterance.pitch = 0.8;
        utterance.rate = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setGesture('dance');
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setGesture('idle');
        };

        utterance.onerror = () => {
            setIsSpeaking(false);
            setGesture('idle');
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const handleSendMessage = async (text: string) => {
        setIsProcessing(true);
        setMessages(prev => [...prev, { role: 'user', text }]);

        setGesture('think');

        const responseText = await generateResponse(text);

        setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        setIsProcessing(false);

        speak(responseText);
    };

    const handleGesture = (g: 'idle' | 'wave' | 'think' | 'dance') => {
        setGesture(g);
        if (g !== 'idle') {
            setTimeout(() => setGesture('idle'), 4000);
        }
    };

    const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user');
    const lastAiMessage = messages.slice().reverse().find(m => m.role === 'ai');

    return (
        <div className="relative w-full h-full bg-black overflow-hidden flex flex-col font-['Share_Tech_Mono']">

            {/* Header */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none select-none">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-green-500 tracking-tighter flex items-center gap-2">
                        <Cpu className="w-8 h-8" />
                        BINARY SENTINEL
                    </h1>
                    <div className="flex items-center gap-2 text-green-800 text-xs tracking-widest pl-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        CORE_ONLINE
                        <span className="ml-2 opacity-50">V.3.0.0</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 text-green-600/60 font-mono text-xs">
                    <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        Signal: STRONG
                    </div>
                    <div>Mem: 64TB / 128TB</div>
                    <div>Lat: 12ms</div>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 relative z-0 flex items-center justify-center">
                <BinaryAvatar isSpeaking={isSpeaking} gesture={gesture} />

                {/* HUD Chat Interface */}
                <div className="absolute inset-0 pointer-events-none p-6 md:p-12 flex flex-col justify-center">
                    <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center h-full gap-8">

                        {/* AI Message */}
                        <div className={`transition-all duration-500 ease-out transform ${lastAiMessage ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} w-full md:w-1/3 mt-20 md:mt-0`}>
                            {lastAiMessage && (
                                <div className="bg-black border border-green-500 rounded-lg overflow-hidden">
                                    <div className="px-4 py-2 bg-green-900/20 border-b border-green-500/20 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        <span className="text-[10px] text-green-500/80 uppercase tracking-widest font-bold">SENTINEL</span>
                                    </div>
                                    <div className="p-4 text-green-400 font-mono text-sm leading-relaxed md:text-base">
                                        {lastAiMessage.text}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1"></div>

                        {/* User Message */}
                        <div className={`transition-all duration-500 ease-out transform ${lastUserMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'} w-full md:w-auto md:max-w-xs self-end md:self-start md:mt-[-100px]`}>
                            {lastUserMessage && (
                                <div className="flex flex-col items-end">
                                    <div className="mb-1 border border-green-500/50 bg-green-900/30 text-green-300 text-[10px] uppercase px-2 py-0.5 tracking-wider rounded-sm">
                                        USER
                                    </div>
                                    <div className="bg-black border border-green-500 rounded-lg rounded-tr-none p-3 text-white font-mono text-sm min-w-[100px] text-right">
                                        {lastUserMessage.text}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <ChatControls
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                onGesture={handleGesture}
            />
        </div>
    );
};

export default DigitalSoul;