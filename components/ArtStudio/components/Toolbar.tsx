import React from 'react';
import { ToolType } from '../types';
import {
    Brush,
    Eraser,
    PaintBucket,
    Pipette,
    Move,
    Type,
    Lasso,
    ScanLine
} from 'lucide-react';

interface ToolbarProps {
    activeTool: ToolType;
    onSelectTool: (tool: ToolType) => void;
    color: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onSelectTool, color }) => {
    const tools = [
        { type: ToolType.MOVE, icon: <Move size={18} />, label: "Move / Pan" },
        { type: ToolType.SELECTION, icon: <Lasso size={18} />, label: "Lasso" },
        { type: ToolType.BRUSH, icon: <Brush size={18} />, label: "Brush" },
        { type: ToolType.ERASER, icon: <Eraser size={18} />, label: "Eraser" },
        { type: ToolType.FILL, icon: <PaintBucket size={18} />, label: "Bucket Fill" },
        { type: ToolType.GRADIENT, icon: <ScanLine size={18} />, label: "Gradient" },
        { type: ToolType.PICKER, icon: <Pipette size={18} />, label: "Color Picker" },
        { type: ToolType.TEXT, icon: <Type size={18} />, label: "Text" },
    ];

    return (
        <aside className="w-12 bg-[#333333] border-r border-[#1a1a1a] flex flex-col items-center py-2 space-y-1 z-20">
            {tools.map((tool) => (
                <button
                    key={tool.type}
                    onClick={() => onSelectTool(tool.type)}
                    title={tool.label}
                    className={`p-2 rounded flex items-center justify-center transition-colors ${activeTool === tool.type
                            ? 'bg-blue-600 text-white shadow-inner'
                            : 'text-gray-400 hover:bg-[#444444] hover:text-white'
                        }`}
                >
                    {tool.icon}
                </button>
            ))}

            <div className="flex-1"></div>

            {/* Primary/Secondary Color Preview */}
            <div className="mb-4 relative w-8 h-8">
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-600 rounded-sm"></div>
                <div
                    className="absolute top-0 left-0 w-6 h-6 border border-gray-400 rounded-sm shadow-md"
                    style={{ backgroundColor: color }}
                ></div>
            </div>
        </aside>
    );
};
