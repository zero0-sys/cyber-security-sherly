import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="h-8 bg-[#2d2d2d] border-b border-[#1a1a1a] flex items-center px-2 text-xs select-none">
            <div className="flex items-center space-x-4 mr-8 text-gray-300">
                <span className="font-bold text-blue-400">ArtStudio</span>
            </div>

            <div className="flex-1"></div>
        </header>
    );
};
