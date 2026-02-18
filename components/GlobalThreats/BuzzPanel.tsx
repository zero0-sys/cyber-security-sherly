import React, { useEffect, useState } from 'react';
import { ThreatNews } from './types';
import { getCyberThreatIntel } from '../../services/geminiService';

const BuzzPanel: React.FC = () => {
    const [news, setNews] = useState<ThreatNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            const data = await getCyberThreatIntel();
            setNews(data);
            setLoading(false);
        };
        fetchNews();
    }, []);

    if (loading) return null;

    if (!isVisible) {
        return (
            <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-[#0f172a]/90 border border-slate-700 text-emerald-500 px-3 py-1 font-mono text-xs uppercase hover:bg-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all"
                >
                    ▲ Intel Feed
                </button>
            </div>
        );
    }

    return (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto w-80">
            <div className="bg-[#0f172a]/90 backdrop-blur-md border border-slate-700 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-900/50 to-transparent p-2 border-b border-emerald-500/30 flex justify-between items-center">
                    <h3 className="text-emerald-400 font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Intel Feed (AI)
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase">Gemini 2.0</span>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-slate-500 hover:text-white transition-colors px-1"
                            title="Hide Feed"
                        >
                            ▼
                        </button>
                    </div>
                </div>

                <div className="p-3 space-y-3 max-h-60 overflow-y-auto">
                    {news.map((item, idx) => (
                        <div key={idx} className="border-l-2 border-slate-600 pl-3 py-1">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-slate-200 text-xs font-bold leading-tight">{item.headline}</h4>
                                <span className={`text-[10px] px-1 rounded ${item.severity === 'Critical' ? 'bg-red-900 text-red-200' :
                                        item.severity === 'High' ? 'bg-orange-900 text-orange-200' :
                                            'bg-slate-800 text-slate-300'
                                    }`}>{item.severity}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-normal">{item.summary}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuzzPanel;
