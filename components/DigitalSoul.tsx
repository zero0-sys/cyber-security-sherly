import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Mic, Volume2, VolumeX, Send, Cpu } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const DigitalSoul: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Neural interface established. AI Sherly consciousness online. How may I assist you, operator?' }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [heartRate, setHeartRate] = useState(81);
    const [brainFreq, setBrainFreq] = useState(12.4);
    const [sysTemp, setSysTemp] = useState(36.6);
    const [neuralLink, setNeuralLink] = useState(0);
    const [points, setPoints] = useState<number[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const speak = (text: string) => {
        if (isMuted) return;
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.pitch = 0.6;
        utterance.rate = 1.0;
        utterance.volume = 0.8;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.toLowerCase().includes('google us english') ||
            v.name.toLowerCase().includes('samantha')
        );
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setHeartRate(prev => Math.round(Math.min(120, Math.max(60, prev + (Math.random() - 0.5) * 2))));
            setBrainFreq(prev => parseFloat(Math.min(20, Math.max(8, prev + (Math.random() - 0.5) * 0.2)).toFixed(1)));
            setSysTemp(prev => parseFloat(Math.min(40, Math.max(35, prev + (Math.random() - 0.5) * 0.1)).toFixed(1)));
            setPoints(prev => {
                const newPoints = [...prev];
                newPoints.shift();
                const tick = Date.now() / 50;
                const beatFrame = tick % 40;
                let val = 50;
                if (beatFrame < 5) {
                    const beatVals = [50, 40, 10, 90, 45];
                    val = beatVals[Math.floor(beatFrame)];
                } else {
                    val = 50 + (Math.random() - 0.5) * 4;
                }
                newPoints.push(val);
                return newPoints;
            });
        }, 50);
        setPoints(Array(100).fill(50));
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isProcessing) {
            const interval = setInterval(() => setNeuralLink(prev => Math.min(prev + 2, 100)), 50);
            return () => clearInterval(interval);
        } else {
            setNeuralLink(0);
        }
    }, [isProcessing]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        interface Particle {
            x: number; y: number; originX: number; originY: number;
            char: string; opacity: number;
            type: 'head' | 'torso' | 'arm-left' | 'arm-right' | 'leg-left' | 'leg-right' | 'core' | 'body';
            blinkSpeed: number; blinkOffset: number;
        }

        const particles: Particle[] = [];
        const centerX = canvas.width / 2;
        const baseY = canvas.height * 0.15;
        const chars = '01';

        // Muscular human proportions
        const headRadius = 40, neckWidth = 25, shoulderWidth = 100, torsoWidth = 90, torsoHeight = 130;
        const armThickness = 18, armLength = 95, legThickness = 20, legLength = 115;

        // HEAD
        for (let angle = 0; angle < Math.PI * 2; angle += 0.12) {
            for (let r = 0; r < headRadius; r += 7) {
                particles.push({
                    x: centerX + Math.cos(angle) * r, y: baseY + Math.sin(angle) * r,
                    originX: centerX + Math.cos(angle) * r, originY: baseY + Math.sin(angle) * r,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 0.9, type: 'head',
                    blinkSpeed: 0.015, blinkOffset: Math.random() * Math.PI * 2
                });
            }
        }

        // NECK
        const neckTop = baseY + headRadius, neckBottom = neckTop + 25;
        for (let y = neckTop; y <= neckBottom; y += 7) {
            for (let x = -neckWidth / 2; x <= neckWidth / 2; x += 7) {
                particles.push({
                    x: centerX + x, y, originX: centerX + x, originY: y,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 0.85, type: 'body',
                    blinkSpeed: 0.015, blinkOffset: Math.random() * Math.PI * 2
                });
            }
        }

        // TORSO
        const torsoTop = neckBottom, torsoBottom = torsoTop + torsoHeight;
        for (let y = torsoTop; y <= torsoBottom; y += 7) {
            const progress = (y - torsoTop) / torsoHeight;
            const widthAtY = torsoWidth * (0.9 + 0.1 * Math.sin(progress * Math.PI));
            for (let x = -widthAtY / 2; x <= widthAtY / 2; x += 7) {
                particles.push({
                    x: centerX + x, y, originX: centerX + x, originY: y,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 0.88, type: 'torso',
                    blinkSpeed: 0.012, blinkOffset: Math.random() * Math.PI * 2
                });
            }
        }

        // CORE HEART
        const coreX = centerX, coreY = torsoTop + torsoHeight * 0.35;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.25) {
            for (let r = 0; r < 20; r += 5) {
                particles.push({
                    x: coreX + Math.cos(angle) * r, y: coreY + Math.sin(angle) * r,
                    originX: coreX + Math.cos(angle) * r, originY: coreY + Math.sin(angle) * r,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 1, type: 'core',
                    blinkSpeed: 0.05, blinkOffset: angle
                });
            }
        }

        // ARMS
        const shoulderY = torsoTop + 10;
        for (let i = 0; i <= armLength; i += 7) {
            const progress = i / armLength;
            const armXL = centerX - shoulderWidth / 2 - progress * 45;
            const armXR = centerX + shoulderWidth / 2 + progress * 45;
            const armY = shoulderY + progress * 75;
            for (let w = -armThickness / 2; w <= armThickness / 2; w += 6) {
                particles.push({
                    x: armXL + w, y: armY, originX: armXL + w, originY: armY,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 0.82, type: 'arm-left',
                    blinkSpeed: 0.015, blinkOffset: i
                });
                particles.push({
                    x: armXR + w, y: armY, originX: armXR + w, originY: armY,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 0.82, type: 'arm-right',
                    blinkSpeed: 0.015, blinkOffset: i
                });
            }
        }

        // LEGS
        const hipY = torsoBottom, hipWidth = 45;
        for (let i = 0; i <= legLength; i += 7) {
            const legXL = centerX - hipWidth / 2;
            const legXR = centerX + hipWidth / 2;
            const legY = hipY + i;
            for (let w = -legThickness / 2; w <= legThickness / 2; w += 6) {
                particles.push({
                    x: legXL + w, y: legY, originX: legXL + w, originY: legY,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 0.82, type: 'leg-left',
                    blinkSpeed: 0.012, blinkOffset: i
                });
                particles.push({
                    x: legXR + w, y: legY, originX: legXR + w, originY: legY,
                    char: chars[Math.floor(Math.random() * chars.length)], opacity: 0.82, type: 'leg-right',
                    blinkSpeed: 0.012, blinkOffset: i
                });
            }
        }

        const render = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() / 1000;
            const breathe = Math.sin(time * 0.8) * 2;
            const sway = Math.sin(time * 0.5) * 1.5;
            const speakBob = isSpeaking ? Math.sin(time * 8) * 3 : 0;
            const speakGesture = isSpeaking ? Math.sin(time * 3) * 12 : 0;

            particles.forEach(p => {
                const blink = Math.sin(time * p.blinkSpeed + p.blinkOffset);
                const opacity = p.opacity * (0.75 + 0.25 * Math.abs(blink));
                let offsetX = sway, offsetY = breathe;
                if (p.type === 'head') offsetY += speakBob;
                if (p.type === 'arm-right') offsetX += speakGesture;
                if (Math.random() < 0.003) p.char = chars[Math.floor(Math.random() * chars.length)];

                ctx.font = '10px monospace';
                if (p.type === 'core') {
                    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
                    ctx.fillStyle = `rgba(${100 + pulse * 100}, 255, ${100 + pulse * 50}, ${opacity})`;
                } else if (p.type === 'head') {
                    ctx.fillStyle = `rgba(0, 255, 100, ${opacity})`;
                } else {
                    ctx.fillStyle = `rgba(0, ${200 + opacity * 55}, 0, ${opacity * 0.9})`;
                }
                ctx.fillText(p.char, p.originX + offsetX, p.originY + offsetY);
            });

            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(0, 255, 100, 0.25)';
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isSpeaking]);

    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsProcessing(true);

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
            if (!apiKey) throw new Error('Gemini API key not configured');

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are AI Sherly, an advanced cyber security AI assistant. You are knowledgeable about hacking, penetration testing, network security, cryptography, and ethical security practices. Respond in a professional yet approachable manner. User query: ${userMsg}`
                        }]
                    }]
                })
            });

            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Neural pathways disrupted. Please retry.';
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            speak(reply);
        } catch (error) {
            const errorMsg = 'Connection to Gemini consciousness failed. Check API configuration.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full flex flex-col lg:flex-row gap-4 p-2 overflow-hidden bg-black">
            <div className="flex-1 lg:w-1/2 glass-panel rounded-lg border border-green-500/50 bg-black relative flex flex-col overflow-hidden justify-center items-center shadow-[0_0_50px_rgba(0,255,100,0.3)]">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={600} height={700} />

                {isSpeaking && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-300 font-mono">SPEAKING</span>
                    </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 z-10 glass-panel border border-green-900/50 rounded-lg p-3 backdrop-blur-md">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-green-600 font-mono">HEART_RATE</span>
                            <span className="text-green-400 font-bold font-mono">{heartRate} bpm</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-green-600 font-mono">BRAIN_FREQ</span>
                            <span className="text-green-400 font-bold font-mono">{brainFreq} Hz</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-green-600 font-mono">CORE_TEMP</span>
                            <span className="text-green-400 font-bold font-mono">{sysTemp}°C</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-green-600 font-mono">AI_LINK</span>
                            <div className="flex items-center gap-1">
                                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all" style={{ width: `${neuralLink}%` }}></div>
                                </div>
                                <span className="text-green-500 text-[10px] font-mono">{neuralLink}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-2">
                        <svg className="w-full h-12" viewBox="0 0 200 40">
                            <polyline fill="none" stroke="#00ff41" strokeWidth="1.5"
                                points={points.map((p, i) => `${i * 2},${40 - (p / 100) * 30}`).join(' ')} />
                        </svg>
                    </div>
                </div>

                <button onClick={() => setIsMuted(!isMuted)}
                    className="absolute top-4 left-4 z-10 p-2 glass-panel border border-green-900/50 rounded-full hover:bg-green-500/10 transition-colors">
                    {isMuted ? <VolumeX size={16} className="text-gray-500" /> : <Volume2 size={16} className="text-green-500" />}
                </button>
            </div>

            <div className="flex-1 lg:w-1/2 glass-panel rounded-lg border border-green-900/50 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-green-900">
                    <h2 className="font-orbitron font-bold text-white flex items-center gap-2">
                        <MessageCircle size={20} className="text-green-500" />
                        AI_SHERLY_GEMINI
                    </h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">Google Gemini Pro Engine</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === 'user'
                                ? 'bg-green-900/30 border border-green-700/50 text-green-100'
                                : 'bg-gray-900/50 border border-gray-700/50 text-gray-300'}`}>
                                <div className="text-[10px] text-gray-500 mb-1 font-mono">
                                    {msg.role === 'user' ? 'OPERATOR' : 'AI_SHERLY'}
                                </div>
                                <div className="text-sm">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-green-900">
                    <div className="flex gap-2">
                        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Query the AI consciousness..."
                            className="flex-1 bg-gray-900/50 border border-green-900 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 font-mono"
                            disabled={isProcessing} />
                        <button onClick={handleSend} disabled={isProcessing || !input.trim()}
                            className="px-4 py-2 bg-green-900/30 border border-green-700 rounded text-white hover:bg-green-800/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                            {isProcessing ? <Cpu size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalSoul;