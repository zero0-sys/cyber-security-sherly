import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CyberMap from './CyberMap';
import MapHeader from './MapHeader';
import StatsPanel from './StatsPanel';
import LiveFeed from './LiveFeed';
import BuzzPanel from './BuzzPanel';
import { AttackEvent, AttackType, CountryStats, Coordinates } from './types';
import { NODES, ATTACK_TYPES_LIST, COLORS } from './constants';

const GlobalThreatsMap: React.FC = () => {
    const [attacks, setAttacks] = useState<AttackEvent[]>([]);
    const [totalAttacks, setTotalAttacks] = useState(6715200);
    const [primaryTargetIndex, setPrimaryTargetIndex] = useState(0);

    // Rotate the primary target every 15 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setPrimaryTargetIndex(prev => {
                let nextIndex;
                do {
                    nextIndex = Math.floor(Math.random() * NODES.length);
                } while (nextIndex === prev);
                return nextIndex;
            });
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const getCountryName = (nodeName: string) => {
        if (nodeName.includes(',')) {
            const parts = nodeName.split(',');
            return parts[parts.length - 1].trim();
        }
        return nodeName;
    };

    const countryStats: CountryStats[] = useMemo(() => {
        const primaryNode = NODES[primaryTargetIndex];
        const primaryName = getCountryName(primaryNode.name);

        const stats = [
            { rank: 1, name: primaryName, count: Math.floor(Math.random() * 500000) + 1500000 }
        ];

        const otherIndices = NODES.map((_, i) => i).filter(i => i !== primaryTargetIndex);
        otherIndices.sort(() => Math.random() - 0.5);

        for (let i = 0; i < 4; i++) {
            const idx = otherIndices[i];
            stats.push({
                rank: i + 2,
                name: getCountryName(NODES[idx].name),
                count: Math.floor(stats[0].count * (0.8 - (i * 0.15)))
            });
        }
        return stats;
    }, [primaryTargetIndex]);

    const generateRandomAttack = useCallback((): AttackEvent => {
        const isHotspotAttack = Math.random() < 0.7;

        let targetNode;
        if (isHotspotAttack) {
            targetNode = NODES[primaryTargetIndex];
        } else {
            targetNode = NODES[Math.floor(Math.random() * NODES.length)];
        }

        const sourceNode = NODES[Math.floor(Math.random() * NODES.length)];

        const jitter = 2;
        const source: Coordinates = {
            lat: sourceNode.lat + (Math.random() * jitter - jitter / 2),
            lng: sourceNode.lng + (Math.random() * jitter - jitter / 2)
        };
        const target: Coordinates = {
            lat: targetNode.lat + (Math.random() * jitter - jitter / 2),
            lng: targetNode.lng + (Math.random() * jitter - jitter / 2)
        };

        const type = ATTACK_TYPES_LIST[Math.floor(Math.random() * ATTACK_TYPES_LIST.length)];

        return {
            id: Math.random().toString(36).substr(2, 9),
            source,
            target,
            type,
            timestamp: Date.now()
        };
    }, [primaryTargetIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            const count = Math.floor(Math.random() * 3) + 1;
            const newAttacks = Array.from({ length: count }, () => generateRandomAttack());

            setAttacks(prev => {
                const updated = [...prev, ...newAttacks];
                if (updated.length > 40) return updated.slice(updated.length - 40);
                return updated;
            });

            setTotalAttacks(prev => prev + count);
        }, 250);

        return () => clearInterval(interval);
    }, [generateRandomAttack]);

    return (
        <div className="relative w-full h-full bg-[#050505] overflow-hidden text-white font-sans">
            <MapHeader />

            {/* Big Counter Overlay */}
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 text-center pointer-events-none">
                <h2 className="text-gray-200 text-lg font-normal tracking-widest font-mono mb-1 uppercase">
                    Live Cyber Threat Map
                </h2>
                <div className="text-red-500 text-2xl md:text-3xl font-bold font-mono drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                    {totalAttacks.toLocaleString()} <span className="text-base md:text-lg text-gray-400 font-normal">ATTACKS ON THIS DAY</span>
                </div>
            </div>

            {/* Background Map Layer */}
            <CyberMap attacks={attacks} />

            {/* Foreground UI Layer */}
            <StatsPanel countryStats={countryStats} totalAttacks={totalAttacks} />
            <BuzzPanel />
            <LiveFeed events={attacks} />

            {/* Legend / Footer */}
            <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-black to-transparent flex justify-center gap-6 text-[10px] text-slate-500 font-mono pointer-events-none z-20">
                {ATTACK_TYPES_LIST.map(type => (
                    <span key={type} className="flex items-center gap-1">
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: COLORS[type], boxShadow: `0 0 5px ${COLORS[type]}` }}
                        ></span>
                        {type}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default GlobalThreatsMap;
