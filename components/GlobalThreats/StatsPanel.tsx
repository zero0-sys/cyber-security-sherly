import React, { useState, useMemo } from 'react';
import { AttackType, CountryStats } from './types';
import { COLORS, ATTACK_TYPES_LIST } from './constants';

interface StatsPanelProps {
    countryStats: CountryStats[];
    totalAttacks: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ countryStats, totalAttacks }) => {
    const [isVisible, setIsVisible] = useState(true);

    const topCountry = countryStats.length > 0 ? countryStats[0] : { name: "Initializing...", count: 0 };

    const breakdownStats = useMemo(() => {
        return ATTACK_TYPES_LIST.map(type => ({
            type,
            count: Math.floor(Math.random() * 50000) + 1000
        }));
    }, [topCountry.name]);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="absolute top-24 left-4 z-10 bg-[#0f172a]/90 border border-slate-700 p-2 text-emerald-500 hover:text-emerald-400 hover:border-emerald-500 transition-all font-mono text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto"
            >
                + Show Stats
            </button>
        );
    }

    return (
        <div className="absolute top-24 left-4 w-80 z-10 pointer-events-none flex flex-col items-start gap-4">
            <button
                onClick={() => setIsVisible(false)}
                className="pointer-events-auto bg-[#0f172a]/90 text-slate-500 hover:text-white border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-wider mb-1 self-start"
            >
                - Hide Stats
            </button>

            {/* Country Stats Box */}
            <div className="w-full bg-[#0f172a]/90 backdrop-blur-sm border border-slate-700 p-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-auto relative">
                <h2 className="text-gray-300 font-bold text-xl mb-1 uppercase tracking-widest font-mono truncate">
                    {topCountry.name}
                </h2>
                <div className="text-xs text-gray-500 mb-4 font-mono uppercase">
                    # 1 Most-Attacked Country
                </div>

                <div className="space-y-2">
                    {breakdownStats.map((stat) => (
                        <div key={stat.type} className="flex justify-between items-center text-sm font-mono group">
                            <span style={{ color: COLORS[stat.type] }} className="font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                                {stat.type}
                            </span>
                            <span className="text-gray-300">
                                {stat.count.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-xs text-slate-400 font-mono">
                        Live Detections: <span className="text-white animate-pulse">{totalAttacks.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Global Ranking */}
            <div className="w-full bg-[#0f172a]/80 backdrop-blur-sm border border-slate-700 p-2 shadow-lg pointer-events-auto">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-2 px-2">Top Targets</h3>
                <ul className="text-xs font-mono">
                    {countryStats.map((c) => (
                        <li key={c.name} className={`flex justify-between py-1 px-2 cursor-default ${c.rank === 1 ? 'bg-emerald-900/30 border-l-2 border-emerald-500' : 'hover:bg-slate-800'}`}>
                            <span className="text-slate-300">{c.rank}. {c.name}</span>
                            <span className="text-emerald-500">{c.count.toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StatsPanel;
