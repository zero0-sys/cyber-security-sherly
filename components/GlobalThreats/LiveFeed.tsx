import React, { useEffect, useRef, useState } from 'react';
import { AttackEvent } from './types';
import { COLORS } from './constants';

interface LiveFeedProps {
    events: AttackEvent[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ events }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        if (scrollRef.current && isExpanded) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [events, isExpanded]);

    if (!isExpanded) {
        return (
            <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="bg-[#0f172a]/90 border border-slate-700 text-emerald-500 px-3 py-1 font-mono text-xs uppercase hover:bg-slate-800"
                >
                    ▲ Show Log
                </button>
            </div>
        );
    }

    return (
        <div className="absolute bottom-4 right-4 w-72 z-10 pointer-events-none flex flex-col items-end transition-all duration-300">
            <div className="flex items-center gap-2 pointer-events-auto bg-[#0f172a]/90 px-2 py-1 mb-1 border-l-2 border-emerald-500 w-full justify-between">
                <h3 className="text-slate-400 text-xs uppercase font-bold">
                    Detection Log
                </h3>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="text-slate-500 hover:text-white px-2"
                    title="Hide Log"
                >
                    ▼
                </button>
            </div>

            <div
                ref={scrollRef}
                className="w-full h-64 bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700 overflow-y-auto pointer-events-auto font-mono text-[10px]"
            >
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-800 text-slate-400 shadow-md">
                        <tr>
                            <th className="p-1 font-normal">Time</th>
                            <th className="p-1 font-normal">Type</th>
                            <th className="p-1 font-normal">Target</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.slice(-50).map((ev) => (
                            <tr key={ev.id} className="border-b border-slate-800/50 hover:bg-slate-800/50">
                                <td className="p-1 text-slate-500">
                                    {new Date(ev.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                                <td className="p-1 font-bold" style={{ color: COLORS[ev.type] }}>
                                    {ev.type}
                                </td>
                                <td className="p-1 text-slate-300">
                                    Lat: {ev.target.lat.toFixed(1)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LiveFeed;
