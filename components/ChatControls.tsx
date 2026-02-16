import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatControlsProps {
    onSendMessage: (text: string) => void;
    isProcessing: boolean;
}

const ChatControls: React.FC<ChatControlsProps> = ({ onSendMessage, isProcessing }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isProcessing) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="w-full">
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
                    {isProcessing ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default ChatControls;
