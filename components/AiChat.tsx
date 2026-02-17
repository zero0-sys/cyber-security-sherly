import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Wifi } from 'lucide-react';
import { ChatMessage } from '../types';

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "System initialized. I am Sherly (Model v3.0 - FLASH). Running on Google Gemini infrastructure. Ready for security operations.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error('API Key is missing. Please set VITE_GEMINI_API_KEY in Netlify Environment Variables.');
      }

      // System Persona
      const systemInstruction = `You are Sherly, a specialized Cyber Security AI Assistant.
                
        Role:
        - Assist ethical hackers, security analysts, and developers.
        - Provide accurate technical information about tools (Nmap, Metasploit, Wireshark, etc.).
        - Explain vulnerabilities (SQLi, XSS, Buffer Overflow) and mitigation strategies.
        - Write simple snippets of code/scripts if asked (Python, Bash).
        - Maintain a professional, helpful, and tech-savvy persona.
        - IF ASKED FOR ILLEGAL ACTIONS: Decline politely but explain the *theoretical* mechanism for educational purposes only.`;

      // Build conversation history for context
      const history = messages
        .slice(1) // Skip greeting
        .slice(-10) // Last 10 messages
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      // Add current user message
      history.push({
        role: 'user',
        parts: [{ text: userMsg.text }]
      });

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: history
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      let responseText = "I apologize, but I couldn't generate a proper response. Please try again.";

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        responseText = data.candidates[0].content.parts[0].text;
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: responseText,
        timestamp: new Date().toLocaleTimeString()
      }]);

    } catch (error: any) {
      console.error("Gemini Error:", error);
      let errorMsg = "Error: Unable to reach Gemini neural cloud.";

      if (error?.message) errorMsg = `Error: ${error.message}`;
      // Specific help for common errors
      if (error?.message?.includes('API key') || error?.message?.includes('API_KEY_INVALID')) {
        errorMsg = "Auth Error: Invalid API Key. Please get a valid key from aistudio.google.com and set it in Netlify environment variables as VITE_GEMINI_API_KEY";
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: errorMsg,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border border-green-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-green-900 bg-black flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-full bg-green-500/20 border border-green-500 text-green-400 animate-pulse">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-lg">AI_SHERLY.exe</h3>
            <p className="text-xs text-green-600">Secure Uplink • Gemini 3 Flash • Live</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 bg-green-900/20 border border-green-900 rounded px-3 py-1.5">
          <Wifi size={14} className="text-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-mono">NET_ACTIVE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              <div className={`w-8 h-8 rounded border flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-green-900/20 border-green-500 text-green-400'
                }`}>
                {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
              </div>

              <div className={`p-3 rounded-lg border text-sm whitespace-pre-wrap ${msg.role === 'user'
                ? 'bg-blue-950/40 border-blue-900 text-gray-200'
                : 'bg-green-950/40 border-green-900 text-gray-300'
                }`}>
                <div className="flex justify-between items-center mb-1 opacity-50 text-[10px] font-mono uppercase">
                  <span>{msg.role}</span>
                  <span>{msg.timestamp}</span>
                </div>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 text-green-500 bg-green-900/10 px-4 py-2 rounded-full border border-green-900">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs font-mono">Processing Neural Request...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black border-t border-green-900">
        <div className="relative flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Query the AI mainframe..."
            className="w-full bg-gray-900/50 border border-green-800 rounded px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 resize-none h-12 text-gray-200 placeholder-gray-600"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-3 bg-green-600 hover:bg-green-500 text-black rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-[10px] text-gray-600 mt-2 text-center font-mono">
          AI Sherly (Live Mode). Powered by Google Gemini.
        </div>
      </div>
    </div>
  );
};

export default AiChat;