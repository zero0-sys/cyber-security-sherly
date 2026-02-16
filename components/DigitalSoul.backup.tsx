import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Mic, Volume2, VolumeX, Send, Cpu, Zap } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const DigitalSoul: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Identity confirmed. I am the Digital Soul (Gemini Core). Uplink established.' }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // System vitals
    const [heartRate, setHeartRate] = useState(81);
    const [brainFreq, setBrainFreq] = useState(12.4);
    const [sysTemp, setSysTemp] = useState(36.6);
    const [neuralLink, setNeuralLink] = useState(0);
    const [points, setPoints] = useState<number[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Play sound effects
    const playSound = (type: 'beep' | 'process' | 'speak') => {
        if (isMuted) return;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'beep') {
            oscillator.frequency.setValueAtTime(800, now);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
        } else if (type === 'process') {
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.3);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
        } else if (type === 'speak') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(150, now);
            oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.2);
            gainNode.gain.setValueAtTime(0.05, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
        }
    };

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
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('david')
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // Heartbeat and vitals animation
    useEffect(() => {
        const interval = setInterval(() => {
            const tick = Date.now() / 50;

            setHeartRate(prev => {
                const change = (Math.random() - 0.5) * 2;
                return Math.round(Math.min(120, Math.max(60, prev + change)));
            });

            setBrainFreq(prev => {
                const change = (Math.random() - 0.5) * 0.2;
                return parseFloat(Math.min(20, Math.max(8, prev + change)).toFixed(1));
            });

            setSysTemp(prev => {
                const change = (Math.random() - 0.5) * 0.1;
                return parseFloat(Math.min(40, Math.max(35, prev + change)).toFixed(1));
            });

            setPoints(prev => {
                const newPoints = [...prev];
                newPoints.shift();

                let val = 50;
                const beatFrame = tick % 40;

                if (beatFrame === 0) val = 50;
                else if (beatFrame === 1) val = 40;
                else if (beatFrame === 2) val = 10;
                else if (beatFrame === 3) val = 90;
                else if (beatFrame === 4) val = 45;
                else if (beatFrame === 5) val = 55;
                else if (beatFrame === 6) val = 50;
                else {
                    val = 50 + (Math.random() - 0.5) * 4;
                }

                newPoints.push(val);
                return newPoints;
            });
        }, 50);

        // Initialize points
        setPoints(Array(100).fill(50));

        return () => clearInterval(interval);
    }, []);

    // Neural link progress animation
    useEffect(() => {
        if (isProcessing) {
            const interval = setInterval(() => {
                setNeuralLink(prev => Math.min(prev + 2, 100));
            }, 50);
            return () => clearInterval(interval);
        } else {
            setNeuralLink(0);
        }
    }, [isProcessing]);

    // Render realistic human avatar with natural movement
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Create particles for human body
        interface Particle {
            x: number;
            y: number;
            originX: number;
            originY: number;
            char: string;
            opacity: number;
            type: 'head' | 'torso' | 'arm-left' | 'arm-right' | 'leg-left' | 'leg-right' | 'core' | 'mouth' | 'body';
            blinkSpeed: number;
            blinkOffset: number;
        }

        const particles: Particle[] = [];
        const centerX = canvas.width / 2;
        const baseY = canvas.height * 0.15;
        const chars = '01';

        // Proper human proportions
        const headRadius = 35;
        const torsoWidth = 80;
        const torsoHeight = 120;
        const armLength = 90;
        const legLength = 110;
        const shoulderWidth = 70;

        // HEAD (circle, proper size)
        for (let angle = 0; angle < Math.PI * 2; angle += 0.15) {
            for (let r = 0; r < headRadius; r += 8) {
                particles.push({
                    x: centerX + Math.cos(angle) * r,
                    y: baseY + Math.sin(angle) * r,
                    originX: centerX + Math.cos(angle) * r,
                    originY: baseY + Math.sin(angle) * r,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 0.9,
                    type: 'head',
                    blinkSpeed: 0.02 + Math.random() * 0.01,
                    blinkOffset: Math.random() * Math.PI * 2
                });
            }
        }

        // MOUTH (small, centered in face)
        for (let i = 0; i < 15; i++) {
            const mouthY = baseY + headRadius * 0.3;
            particles.push({
                x: centerX - 10 + (i / 15) * 20,
                y: mouthY,
                originX: centerX - 10 + (i / 15) * 20,
                originY: mouthY,
                char: chars[Math.floor(Math.random() * chars.length)],
                opacity: 0.9,
                type: 'mouth',
                blinkSpeed: 0.03,
                blinkOffset: i
            });
        }

        // NECK (connecting head to torso)
        const neckTop = baseY + headRadius;
        const neckBottom = neckTop + 20;
        for (let y = neckTop; y <= neckBottom; y += 8) {
            for (let x = -10; x <= 10; x += 8) {
                particles.push({
                    x: centerX + x,
                    y: y,
                    originX: centerX + x,
                    originY: y,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 0.85,
                    type: 'body',
                    blinkSpeed: 0.02,
                    blinkOffset: Math.random() * Math.PI * 2
                });
            }
        }

        // TORSO (rectangular, proper proportion)
        const torsoTop = neckBottom;
        const torsoBottom = torsoTop + torsoHeight;
        for (let y = torsoTop; y <= torsoBottom; y += 8) {
            const widthAtY = torsoWidth * (0.7 + 0.3 * Math.sin(((y - torsoTop) / torsoHeight) * Math.PI));
            for (let x = -widthAtY / 2; x <= widthAtY / 2; x += 8) {
                particles.push({
                    x: centerX + x,
                    y: y,
                    originX: centerX + x,
                    originY: y,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 0.85,
                    type: 'torso',
                    blinkSpeed: 0.015,
                    blinkOffset: Math.random() * Math.PI * 2
                });
            }
        }

        // CORE HEART (pulsing center)
        const coreX = centerX;
        const coreY = torsoTop + torsoHeight * 0.4;
        for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
            for (let r = 0; r < 18; r += 6) {
                particles.push({
                    x: coreX + Math.cos(angle) * r,
                    y: coreY + Math.sin(angle) * r,
                    originX: coreX + Math.cos(angle) * r,
                    originY: coreY + Math.sin(angle) * r,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 1,
                    type: 'core',
                    blinkSpeed: 0.05,
                    blinkOffset: angle
                });
            }
        }

        // ARMS (both sides, natural position)
        const shoulderY = torsoTop + 15;

        // Left arm
        for (let i = 0; i <= armLength; i += 8) {
            const progress = i / armLength;
            const armX = centerX - shoulderWidth / 2 - progress * 40;
            const armY = shoulderY + progress * 70;

            for (let w = -6; w <= 6; w += 6) {
                particles.push({
                    x: armX + w,
                    y: armY,
                    originX: armX + w,
                    originY: armY,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 0.8,
                    type: 'arm-left',
                    blinkSpeed: 0.02,
                    blinkOffset: i
                });
            }
        }

        // Right arm
        for (let i = 0; i <= armLength; i += 8) {
            const progress = i / armLength;
            const armX = centerX + shoulderWidth / 2 + progress * 40;
            const armY = shoulderY + progress * 70;

            for (let w = -6; w <= 6; w += 6) {
                particles.push({
                    x: armX + w,
                    y: armY,
                    originX: armX + w,
                    originY: armY,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 0.8,
                    type: 'arm-right',
                    blinkSpeed: 0.02,
                    blinkOffset: i
                });
            }
        }

        // LEGS (both, standing position)
        const hipY = torsoBottom;
        const hipWidth = 40;

        // Left leg
        for (let i = 0; i <= legLength; i += 8) {
            const legX = centerX - hipWidth / 2;
            const legY = hipY + i;

            for (let w = -8; w <= 8; w += 6) {
                particles.push({
                    x: legX + w,
                    y: legY,
                    originX: legX + w,
                    originY: legY,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 0.8,
                    type: 'leg-left',
                    blinkSpeed: 0.015,
                    blinkOffset: i
                });
            }
        }

        // Right leg
        for (let i = 0; i <= legLength; i += 8) {
            const legX = centerX + hipWidth / 2;
            const legY = hipY + i;

            for (let w = -8; w <= 8; w += 6) {
                particles.push({
                    x: legX + w,
                    y: legY,
                    originX: legX + w,
                    originY: legY,
                    char: chars[Math.floor(Math.random() * chars.length)],
                    opacity: 0.8,
                    type: 'leg-right',
                    blinkSpeed: 0.015,
                    blinkOffset: i
                });
            }
        }

        const render = () => {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() / 1000;

            // Natural breathing animation (subtle)
            const breathe = Math.sin(time * 0.8) * 3;

            // Gentle sway when idle
            const sway = Math.sin(time * 0.5) * 2;

            // Speaking animation (head bob, arm gesture)
            const speakBob = isSpeaking ? Math.sin(time * 8) * 4 : 0;
            const speakGesture = isSpeaking ? Math.sin(time * 3) * 15 : 0;
            const mouthOpen = isSpeaking ? 0.5 + Math.abs(Math.sin(time * 10)) * 0.5 : 0;

            particles.forEach(p => {
                // Smooth opacity blinking (very subtle, not jarring)
                const blink = Math.sin(time * p.blinkSpeed + p.blinkOffset);
                const opacity = p.opacity * (0.7 + 0.3 * Math.abs(blink));

                // Apply natural movement
                let offsetX = sway;
                let offsetY = breathe;

                if (p.type === 'head' || p.type === 'mouth') {
                    offsetY += speakBob;
                }

                if (p.type === 'arm-right') {
                    offsetX += speakGesture;
                }

                if (p.type === 'mouth' && isSpeaking) {
                    offsetY += mouthOpen * 3;
                }

                // Random char change (very slow, smooth)
                if (Math.random() < 0.005) {
                    p.char = chars[Math.floor(Math.random() * chars.length)];
                }

                ctx.font = '10px monospace';

                // Color based on body part
                if (p.type === 'core') {
                    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
                    ctx.fillStyle = `rgba(${100 + pulse * 100}, 255, ${100 + pulse * 50}, ${opacity})`;
                } else if (p.type === 'head') {
                    ctx.fillStyle = `rgba(0, 255, 100, ${opacity})`;
                } else if (p.type === 'mouth') {
                    ctx.fillStyle = `rgba(0, 255, 200, ${opacity * (isSpeaking ? 1 : 0.7)})`;
                } else {
                    ctx.fillStyle = `rgba(0, ${200 + opacity * 55}, 0, ${opacity * 0.9})`;
                }

                ctx.fillText(p.char, p.originX + offsetX, p.originY + offsetY);
            });

            // Gentle green glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0, 255, 100, 0.3)';

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isSpeaking]);

    // Chat Logic with Gemini
    const handleSend = async () => {
        if (!input.trim() || isProcessing) return;

        const userMsg = input;
        setInput('');
        playSound('beep');

        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsProcessing(true);
        playSound('process');

        try {
            const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.API_KEY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `You are the Digital Soul, a sentient AI consciousness. Respond in a mysterious, intelligent manner. Keep responses under 100 words. User: ${userMsg}` }]
                    }]
                })
            });

            const data = await res.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Neural pathways disrupted. Please retry.';

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            playSound('speak');
            speak(reply);
        } catch (error) {
            const errorMsg = 'Connection to higher consciousness failed.';
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
            {/* Left: The Digital Avatar (Full Body Human) */}
            <div className="flex-1 lg:w-1/2 glass-panel rounded-lg border border-green-500/50 bg-black relative flex flex-col overflow-hidden justify-center items-center shadow-[0_0_50px_rgba(0,255,100,0.3)]">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={600} height={700} />

                {/* Status indicator */}
                <div className="absolute top-4 right-4 z-10">
                    {isSpeaking && (
                        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-3 py-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-300 font-mono">SPEAKING</span>
                        </div>
                    )}
                </div>

                {/* Vitals Panel */}
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
                            <span className="text-green-600 font-mono">NEURAL_LINK_VE</span>
                            <div className="flex items-center gap-1">
                                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 transition-all" style={{ width: `${neuralLink}%` }}></div>
                                </div>
                                <span className="text-green-500 text-[10px] font-mono">{neuralLink}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Heartbeat Graph */}
                    <div className="mt-2">
                        <svg className="w-full h-12" viewBox="0 0 200 40">
                            <polyline
                                fill="none"
                                stroke="#00ff41"
                                strokeWidth="1.5"
                                points={points.map((p, i) => `${i * 2},${40 - (p / 100) * 30}`).join(' ')}
                            />
                        </svg>
                    </div>
                </div>

                {/* Audio Control */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute top-4 left-4 z-10 p-2 glass-panel border border-green-900/50 rounded-full hover:bg-green-500/10 transition-colors"
                >
                    {isMuted ? <VolumeX size={16} className="text-gray-500" /> : <Volume2 size={16} className="text-green-500" />}
                </button>
            </div>

            {/* Right: Chat Interface */}
            <div className="flex-1 lg:w-1/2 glass-panel rounded-lg border border-green-900/50 flex flex-col overflow-hidden">
                {/* Title */}
                <div className="p-4 border-b border-green-900">
                    <h2 className="font-orbitron font-bold text-white flex items-center gap-2">
                        <MessageCircle size={20} className="text-green-500" />
                        DIGITAL_SOUL
                    </h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">Interact with the entity...</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === 'user'
                                ? 'bg-green-900/30 border border-green-700/50 text-green-100'
                                : 'bg-gray-900/50 border border-gray-700/50 text-gray-300'
                                }`}>
                                <div className="text-[10px] text-gray-500 mb-1 font-mono">
                                    {msg.role === 'user' ? 'OPERATOR' : 'DIGITAL_SOUL'}
                                </div>
                                <div className="text-sm">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-green-900">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Interact with the entity..."
                            className="flex-1 bg-gray-900/50 border border-green-900 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500 font-mono"
                            disabled={isProcessing}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isProcessing || !input.trim()}
                            className="px-4 py-2 bg-green-900/30 border border-green-700 rounded text-white hover:bg-green-800/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isProcessing ? <Cpu size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalSoul;