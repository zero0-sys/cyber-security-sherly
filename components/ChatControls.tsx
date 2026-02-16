import React, { useState } from 'react';
import { Send, Hand, Brain, Music, Pause } from 'lucide-react';

interface ChatControlsProps {
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
    onGesture: (gesture: 'idle' | 'wave' | 'think' | 'dance') => void;
}

const ChatControls: React.FC<ChatControlsProps> = ({ onSendMessage, isProcessing, onGesture }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isProcessing) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="w-full p-6 bg-black border-t border-green-900/50 z-10">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Gesture Controls */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                        onClick={() => onGesture('wave')}
                        className="px-3 py-1.5 bg-green-900/20 hover:bg-green-900/40 border border-green-500/30 hover:border-green-500 rounded text-green-400 text-xs font-mono transition-all flex items-center gap-2"
                    >
                        <Hand size={14} /> Wave
                    </button>
                    <button
                        onClick={() => onGesture('think')}
                        className="px-3 py-1.5 bg-green-900/20 hover:bg-green-900/40 border border-green-500/30 hover:border-green-500 rounded text-green-400 text-xs font-mono transition-all flex items-center gap-2"
                    >
                        <Brain size={14} /> Think
                    </button>
                    <button
                        onClick={() => onGesture('dance')}
                        className="px-3 py-1.5 bg-green-900/20 hover:bg-green-900/40 border border-green-500/30 hover:border-green-500 rounded text-green-400 text-xs font-mono transition-all flex items-center gap-2"
                    >
                        <Music size={14} /> Dance
                    </button>
                    <button
                        onClick={() => onGesture('idle')}
                        className="px-3 py-1.5 bg-gray-900/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 rounded text-gray-400 text-xs font-mono transition-all flex items-center gap-2"
                    >
                        <Pause size={14} /> Idle
                    </button>
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isProcessing}
                        placeholder={isProcessing ? "Processing..." : "Speak to Binary Sentinel..."}
                        className="flex-1 bg-black border border-green-500/50 focus:border-green-500 rounded px-4 py-3 text-green-400 font-mono text-sm placeholder-green-900 focus:outline-none disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isProcessing || !input.trim()}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded transition-all flex items-center gap-2"
                    >
                        <Send size={16} />
                        {isProcessing ? 'Processing...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatControls;
