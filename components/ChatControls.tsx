import React, { useState } from 'react';
import { Send, Hand, Brain, Pause } from 'lucide-react';

interface ChatControlsProps {
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
    onGesture?: (gesture: 'idle' | 'wave' | 'think') => void;
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
        <div className="w-full space-y-2">
            {/* Gesture Controls */}
            {onGesture && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                        onClick={() => onGesture('wave')}
                        className="px-3 py-1 bg-cyan-900/50 hover:bg-cyan-800 border border-cyan-500/30 hover:border-cyan-500 rounded text-cyan-400 text-xs font-mono transition-all flex items-center gap-2"
                    >
                        <Hand size={12} /> Wave
                    </button>
                    <button
                        onClick={() => onGesture('think')}
                        className="px-3 py-1 bg-cyan-900/50 hover:bg-cyan-800 border border-cyan-500/30 hover:border-cyan-500 rounded text-cyan-400 text-xs font-mono transition-all flex items-center gap-2"
                    >
                        <Brain size={12} /> Think
                    </button>
                    <button
                        onClick={() => onGesture('idle')}
                        className="px-3 py-1 bg-gray-900/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 rounded text-gray-400 text-xs font-mono transition-all flex items-center gap-2"
                    >
                        <Pause size={12} /> Idle
                    </button>
                </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isProcessing}
                    placeholder={isProcessing ? "Processing..." : "Message Cipher..."}
                    className="flex-1 bg-black/50 border border-cyan-500/50 focus:border-cyan-400 rounded px-3 py-2 text-cyan-300 font-mono text-xs placeholder-cyan-900 focus:outline-none disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isProcessing || !input.trim()}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded transition-all flex items-center gap-2 text-xs"
                >
                    <Send size={14} />
                    {isProcessing ? 'Processing...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ChatControls;
