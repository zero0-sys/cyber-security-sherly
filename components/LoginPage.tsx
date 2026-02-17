import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playClickSound, playErrorSound, playSuccessSound, playSequenceCommitSound, speakSherly } from '../utils/audio';
import RippleCanvas from './RippleCanvas';
import SherlyAvatar from './SherlyAvatar';

interface LoginPageProps {
    onUnlock: () => void;
}

const TARGET_SEQUENCE = [2, 4, 2, 1];
const PAUSE_THRESHOLD_MS = 600;
const MAX_MISTAKES = 3;

const LoginPage: React.FC<LoginPageProps> = ({ onUnlock }) => {
    const [currentClicks, setCurrentClicks] = useState(0);
    const [sequence, setSequence] = useState<number[]>([]);
    const [visualMode, setVisualMode] = useState<'normal' | 'error' | 'success'>('normal');
    const [lastClickEvent, setLastClickEvent] = useState<{ x: number, y: number, timestamp: number } | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const [introDone, setIntroDone] = useState(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Check Lockout on Mount
    useEffect(() => {
        const blocked = localStorage.getItem('sherly_lockout');
        if (blocked === 'true') {
            setIsBlocked(true);
        } else {
            // Start Intro if not blocked
            const timer = setTimeout(() => {
                speakSherly("Welcome back, Sir. Sherly is online. How may I assist you?");
                setTimeout(() => {
                    setIntroDone(true);
                }, 4000);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleLockout = () => {
        setIsBlocked(true);
        localStorage.setItem('sherly_lockout', 'true');
        playErrorSound();
        speakSherly("Security violation detected. Access permanently denied.");
    };

    const resetSequence = useCallback(() => {
        setSequence([]);
        setCurrentClicks(0);
        setVisualMode('error');
        playErrorSound();

        setMistakes(prev => {
            const newCount = prev + 1;
            if (newCount >= MAX_MISTAKES) {
                handleLockout();
            } else {
                const remaining = MAX_MISTAKES - newCount;
                speakSherly(`Incorrect sequence. ${remaining} attempts remaining.`);
            }
            return newCount;
        });

        setTimeout(() => {
            setVisualMode('normal');
        }, 500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSequenceCommit = useCallback((clicksInGroup: number) => {
        playSequenceCommitSound();

        setSequence(prev => {
            const newSequence = [...prev, clicksInGroup];
            const targetSlice = TARGET_SEQUENCE.slice(0, newSequence.length);

            const isValidSoFar = newSequence.every((val, index) => val === targetSlice[index]);

            if (!isValidSoFar) {
                resetSequence();
                return [];
            }

            if (newSequence.length === TARGET_SEQUENCE.length) {
                setVisualMode('success');
                playSuccessSound();
                speakSherly("Access granted.");
                setTimeout(onUnlock, 2000);
                return newSequence;
            }

            return newSequence;
        });

        setCurrentClicks(0);
    }, [onUnlock, resetSequence]);

    useEffect(() => {
        if (currentClicks > 0) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                handleSequenceCommit(currentClicks);
            }, PAUSE_THRESHOLD_MS);
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [currentClicks, handleSequenceCommit]);

    const handleClick = (e: React.MouseEvent) => {
        if (isBlocked || !introDone) return;

        setLastClickEvent({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });

        const pitch = 1.0 + (currentClicks * 0.1);
        playClickSound(pitch);
        setCurrentClicks(prev => prev + 1);
    };

    if (isBlocked) {
        return (
            <div className="w-full h-full bg-black flex flex-col items-center justify-center text-red-600 font-mono">
                <h1 className="text-6xl font-bold blink mb-4">SYSTEM LOCKOUT</h1>
                <p className="text-xl">HOSTILE ACTIVITY DETECTED</p>
                <p className="text-sm mt-8 text-red-800">IP ADDRESS LOGGED AND REPORTED</p>
                <style>{`.blink { animation: blinker 1s linear infinite; } @keyframes blinker { 50% { opacity: 0; } }`}</style>
            </div>
        );
    }

    return (
        <div
            className={`relative w-full h-full cursor-pointer overflow-hidden transition-colors duration-200 ${visualMode === 'error' ? 'bg-red-950/30' :
                    visualMode === 'success' ? 'bg-green-900/30' : 'bg-black'
                }`}
            onClick={handleClick}
        >
            <SherlyAvatar />

            {!introDone && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-500 font-mono text-xl animate-pulse">
                    INITIALIZING SHERLY AI...
                </div>
            )}

            {introDone && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-800/50 font-mono text-sm pointer-events-none">
                    AWAITING INPUT
                </div>
            )}

            <RippleCanvas clickEvent={lastClickEvent} mode={visualMode} />

            {/* Progress Indicators */}
            <div className="absolute bottom-20 left-0 w-full flex justify-center gap-6 pointer-events-none">
                {TARGET_SEQUENCE.map((_, i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 border border-green-500 transition-all duration-300 ${i < sequence.length ? 'bg-green-500 shadow-[0_0_10px_#0f0]' : 'bg-transparent opacity-30'
                            }`}
                    />
                ))}
            </div>

            {/* Mistake Counter */}
            <div className="absolute bottom-5 right-5 text-red-500 font-mono text-xs">
                STRIKES: {mistakes}/{MAX_MISTAKES}
            </div>
        </div>
    );
};

export default LoginPage;
