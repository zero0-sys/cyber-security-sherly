import React from 'react';

const MapHeader: React.FC = () => {
    return (
        <header className="absolute top-0 w-full z-20 bg-gradient-to-b from-black to-transparent pt-4 pb-8 px-6 flex justify-between items-center pointer-events-none">
            <div className="flex items-baseline gap-4 pointer-events-auto">
                <h1 className="text-2xl font-bold text-gray-100 tracking-tighter uppercase font-mono">
                    CyberThreat <span className="text-emerald-500">Real-Time Map</span>
                </h1>
            </div>
        </header>
    );
};

export default MapHeader;
