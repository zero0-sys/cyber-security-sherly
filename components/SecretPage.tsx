import React, { useEffect, useState } from 'react';

interface SecretPageProps {
    onProceed: () => void;
}

const SecretPage: React.FC<SecretPageProps> = ({ onProceed }) => {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        setOpacity(1);
        // Auto-proceed to the login screen after 4 seconds
        const timer = setTimeout(() => {
            onProceed();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onProceed]);

    return (
        <div
            className="w-full h-full flex flex-col items-center justify-center bg-black text-green-500 font-mono transition-opacity duration-1000"
            style={{ opacity }}
        >
            <div className="max-w-2xl w-full p-8 border border-green-800 bg-green-900/10 shadow-[0_0_50px_rgba(0,255,0,0.2)]">
                <div className="flex justify-between items-center mb-8 border-b border-green-800 pb-4">
                    <h1 className="text-3xl tracking-widest">MAINFRAME ACCESS</h1>
                    <span className="animate-pulse">● LIVE</span>
                </div>

                <div className="space-y-4 text-sm text-green-400">
                    <p>&gt; DECRYPTING ARCHIVES...</p>
                    <p>&gt; LOADING NEURAL MODULES...</p>
                    <p>&gt; BYPASSING FIREWALL LEVEL 7...</p>
                    <br />
                    <p className="text-white">WELCOME, OPERATOR.</p>
                    <p>The system is now under your command.</p>
                </div>

                <div className="mt-12 grid grid-cols-4 gap-2 opacity-50">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="h-1 bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SecretPage;
