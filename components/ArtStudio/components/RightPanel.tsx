
import React, { useState, useEffect, useRef } from 'react';
import { Layers, Eye, Lock, Plus, Trash2, Sliders, Wand2, Search, Loader2, ArrowRightLeft, Folder, ChevronRight, ChevronDown, GripHorizontal, Maximize2, FileImage } from 'lucide-react';
import { Layer, BrushSettings, GeneratedImage, BrushType, ToolType } from '../types';
import { generateReferenceImage } from '../services/geminiService';

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
};
const rgbToHex = (r: number, g: number, b: number) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) h = 0;
    else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s, v };
};
const hsvToRgb = (h: number, s: number, v: number) => {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
        default: r = 0; g = 0; b = 0;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const blendModeOptions = [
    { label: 'Normal', value: 'source-over' },
    { label: 'Multiply', value: 'multiply' },
    { label: 'Screen', value: 'screen' },
    { label: 'Overlay', value: 'overlay' },
    { label: 'Soft Light', value: 'soft-light' },
    { label: 'Hard Light', value: 'hard-light' },
    { label: 'Color Dodge', value: 'color-dodge' },
    { label: 'Color Burn', value: 'color-burn' },
    { label: 'Linear Dodge', value: 'lighter' },
    { label: 'Linear Burn', value: 'linear-burn' },
    { label: 'Linear Light', value: 'linear-light' },
    { label: 'Pin Light', value: 'pin-light' },
    { label: 'Hard Mix', value: 'hard-mix' },
    { label: 'Difference', value: 'difference' },
    { label: 'Exclusion', value: 'exclusion' },
    { label: 'Hue', value: 'hue' },
    { label: 'Saturation', value: 'saturation' },
    { label: 'Color', value: 'color' },
    { label: 'Luminosity', value: 'luminosity' },
];

interface RightPanelProps {
    layers: Layer[];
    brushSettings: BrushSettings;
    setBrushSettings: (s: BrushSettings) => void;
    onAddLayer: () => void;
    onRemoveLayer: (id: string) => void;
    activeLayerId: string;
    setActiveLayerId: (id: string) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    activeTool: ToolType;
    onAddGroup: () => void;
    showStartup: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({
    layers,
    brushSettings,
    setBrushSettings,
    onAddLayer,
    onRemoveLayer,
    activeLayerId,
    setActiveLayerId,
    updateLayer,
    activeTool,
    onAddGroup,
    showStartup
}) => {
    const [activeTab, setActiveTab] = useState<'layers' | 'ai'>('layers');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [rgb, setRgb] = useState(hexToRgb(brushSettings.color));
    const [hsv, setHsv] = useState(rgbToHsv(rgb.r, rgb.g, rgb.b));

    // Draggable Window State
    // Default to a safe visible position (e.g., top-left/center relative to container)
    const [position, setPosition] = useState({ x: 60, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const svCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDraggingSv = useRef(false);

    // Sync color
    useEffect(() => {
        const newRgb = hexToRgb(brushSettings.color);
        if (newRgb.r !== rgb.r || newRgb.g !== rgb.g || newRgb.b !== rgb.b) {
            setRgb(newRgb);
            setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
        }
    }, [brushSettings.color]);

    // SV Canvas Drawing
    useEffect(() => {
        const canvas = svCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `hsl(${hsv.h}, 100%, 50%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const gradWhite = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradWhite.addColorStop(0, 'rgba(255,255,255,1)');
        gradWhite.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradWhite;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const gradBlack = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradBlack.addColorStop(0, 'rgba(0,0,0,0)');
        gradBlack.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = gradBlack;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [hsv.h]);

    const updateColorFromHsv = (h: number, s: number, v: number) => {
        const newRgb = hsvToRgb(h / 360, s, v);
        setHsv({ h, s, v });
        setRgb(newRgb);
        setBrushSettings({ ...brushSettings, color: rgbToHex(newRgb.r, newRgb.g, newRgb.b) });
    };

    const handleSvInteract = (e: React.MouseEvent) => {
        const canvas = svCanvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        updateColorFromHsv(hsv.h, x / rect.width, 1 - (y / rect.height));
    };

    // Window Drag Logic
    const handleDragStart = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    useEffect(() => {
        const handleDrag = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
            }
        };
        const handleUp = () => setIsDragging(false);
        window.addEventListener('mousemove', handleDrag);
        window.addEventListener('mouseup', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleDrag);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isDragging]);

    const activeLayer = layers.find(l => l.id === activeLayerId);

    // Hide logic


    return (
        <aside
            className="absolute w-72 bg-[#2d2d2d] border border-[#444] shadow-2xl flex flex-col text-xs z-50 rounded-lg overflow-hidden"
            style={{ left: position.x, top: position.y, height: '80vh' }}
        >
            {/* Drag Handle */}
            <div
                className="bg-[#333] p-1 cursor-move flex justify-between items-center border-b border-[#444]"
                onMouseDown={handleDragStart}
            >
                <div className="flex items-center text-gray-400 gap-2 px-2">
                    <GripHorizontal size={14} />
                    <span className="font-bold">Tools & Layers</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar" onMouseUp={() => isDraggingSv.current = false} onMouseLeave={() => isDraggingSv.current = false}>
                {/* Color Picker */}
                <div className="p-3 border-b border-[#333]">
                    <div className="font-semibold text-gray-400 mb-2 flex justify-between">
                        <span>Color</span>
                    </div>
                    <div className="relative mb-2">
                        <canvas
                            ref={svCanvasRef} width={260} height={128}
                            className="w-full h-32 rounded border border-gray-600 cursor-crosshair touch-none"
                            onMouseDown={(e) => { isDraggingSv.current = true; handleSvInteract(e); }}
                            onMouseMove={(e) => isDraggingSv.current && handleSvInteract(e)}
                        />
                        <div
                            className="absolute w-3 h-3 rounded-full border border-white ring-1 ring-black pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: brushSettings.color }}
                        ></div>
                    </div>
                    <input
                        type="range" min="0" max="360" value={hsv.h}
                        onChange={(e) => updateColorFromHsv(parseInt(e.target.value), hsv.s, hsv.v)}
                        className="w-full h-3 rounded appearance-none cursor-pointer mb-2"
                        style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)' }}
                    />
                </div>

                {/* Settings */}
                <div className="p-3 border-b border-[#333]">
                    <div className="font-semibold text-gray-400 mb-2">
                        {activeTool === ToolType.GRADIENT ? 'Gradient' : activeTool === ToolType.TEXT ? 'Text Settings' : 'Brush Settings'}
                    </div>
                    {/* Text Tool UI */}
                    {activeTool === ToolType.TEXT ? (
                        <div className="space-y-3">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-400">Content (Click canvas to place)</span>
                                <input
                                    type="text"
                                    value={brushSettings.textContent}
                                    onChange={(e) => setBrushSettings({ ...brushSettings, textContent: e.target.value })}
                                    className="w-full bg-[#1e1e1e] border border-gray-600 rounded p-2 text-white"
                                />
                            </div>
                            <div className="flex items-center justify-between text-gray-400">
                                <span>Font Size</span>
                                <input type="range" min="8" max="200" value={brushSettings.size} onChange={(e) => setBrushSettings({ ...brushSettings, size: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-600 rounded-lg" />
                                <span>{brushSettings.size}px</span>
                            </div>

                            {/* Active Layer Transform Controls */}
                            {activeLayer && (
                                <div className="pt-2 border-t border-[#444] mt-2">
                                    <span className="text-xs font-semibold text-gray-400 block mb-2">Active Layer Transform</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[10px] text-gray-500 block mb-1">Scale X (Width)</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="range" min="0.1" max="5" step="0.1"
                                                    value={activeLayer.scaleX}
                                                    onChange={(e) => updateLayer(activeLayer.id, { scaleX: parseFloat(e.target.value) })}
                                                    className="w-full h-1 bg-gray-600 rounded-lg"
                                                />
                                                <span className="text-[10px] w-6 text-right">{activeLayer.scaleX.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 block mb-1">Scale Y (Height)</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="range" min="0.1" max="5" step="0.1"
                                                    value={activeLayer.scaleY}
                                                    onChange={(e) => updateLayer(activeLayer.id, { scaleY: parseFloat(e.target.value) })}
                                                    className="w-full h-1 bg-gray-600 rounded-lg"
                                                />
                                                <span className="text-[10px] w-6 text-right">{activeLayer.scaleY.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTool === ToolType.GRADIENT ? (
                        <div className="text-gray-500 italic">No extra settings</div>
                    ) : (
                        /* Brush Settings */
                        <div className="space-y-3">
                            {/* Brush Types */}
                            <div>
                                <span className="block text-gray-400 mb-1">Type</span>
                                <div className="grid grid-cols-3 gap-1">
                                    {Object.values(BrushType).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setBrushSettings({ ...brushSettings, type: t })}
                                            className={`px-2 py-1 text-[9px] rounded border truncate ${brushSettings.type === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#1e1e1e] border-[#444] text-gray-400 hover:border-gray-500'}`}
                                            title={t}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-gray-400">
                                <span>Size</span>
                                <input type="range" min="1" max="200" value={brushSettings.size} onChange={(e) => setBrushSettings({ ...brushSettings, size: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-600 rounded-lg" />
                                <span>{brushSettings.size}px</span>
                            </div>

                            <div className="flex items-center justify-between text-gray-400">
                                <span>Hardness</span>
                                <input type="range" min="1" max="100" value={brushSettings.hardness} onChange={(e) => setBrushSettings({ ...brushSettings, hardness: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-600 rounded-lg" />
                                <span>{brushSettings.hardness}%</span>
                            </div>

                            <div className="flex items-center justify-between text-gray-400">
                                <span>Opacity</span>
                                <input type="range" min="1" max="100" value={brushSettings.opacity} onChange={(e) => setBrushSettings({ ...brushSettings, opacity: parseInt(e.target.value) })} className="w-24 h-1 bg-gray-600 rounded-lg" />
                                <span>{brushSettings.opacity}%</span>
                            </div>

                            {/* Texture/Pattern Removed as requested */}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#333] bg-[#252525]">
                    <button className={`flex-1 py-2 ${activeTab === 'layers' ? 'bg-[#3d3d3d] text-white' : 'text-gray-500'}`} onClick={() => setActiveTab('layers')}>Layers</button>
                    <button className={`flex-1 py-2 ${activeTab === 'ai' ? 'bg-[#3d3d3d] text-blue-400' : 'text-gray-500'}`} onClick={() => setActiveTab('ai')}>AI</button>
                </div>

                {/* Layers List */}
                {activeTab === 'layers' && (
                    <div className="flex flex-col">
                        {/* Blend Mode & Opacity Header */}
                        <div className="p-2 border-b border-[#333] bg-[#2d2d2d] flex items-center gap-2">
                            <select
                                className="flex-1 bg-[#1e1e1e] border border-[#444] rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-blue-500"
                                value={activeLayer?.blendMode === 'normal' ? 'source-over' : (activeLayer?.blendMode || 'source-over')}
                                onChange={(e) => activeLayer && updateLayer(activeLayer.id, { blendMode: e.target.value })}
                                disabled={!activeLayer}
                            >
                                {blendModeOptions.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1 w-20">
                                <span className="text-[10px] text-gray-500">Op</span>
                                <input
                                    type="number"
                                    className="w-full bg-[#1e1e1e] border border-[#444] rounded px-1 py-1 text-xs text-gray-300 text-right focus:outline-none"
                                    value={activeLayer?.opacity ?? 100}
                                    onChange={(e) => activeLayer && updateLayer(activeLayer.id, { opacity: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                                />
                            </div>
                        </div>

                        <div className="p-2 border-b border-[#333] flex justify-between bg-[#2a2a2a]">
                            <button onClick={onAddLayer} title="New Layer" className="hover:text-white"><Plus size={16} /></button>
                            <button onClick={onAddGroup} title="New Group" className="hover:text-white"><Folder size={16} /></button>
                            <button onClick={() => activeLayerId && onRemoveLayer(activeLayerId)} title="Delete" className="hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                        <div className="space-y-1 p-1">
                            {layers.map((layer) => (
                                <div
                                    key={layer.id}
                                    onClick={() => setActiveLayerId(layer.id)}
                                    className={`flex items-center p-1 rounded cursor-pointer ${activeLayerId === layer.id ? 'bg-blue-900/40 border border-blue-700' : 'hover:bg-[#3d3d3d] border border-transparent'} ${layer.parentId ? 'ml-4 border-l-2 border-gray-600 pl-2' : ''}`}
                                >
                                    {layer.type === 'group' ? (
                                        <Folder size={14} className="text-yellow-500 mr-2" />
                                    ) : (
                                        <div className="w-8 h-8 bg-black border border-gray-600 mr-2 flex-shrink-0">
                                            {layer.thumbnail ? <img src={layer.thumbnail} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-checkered opacity-20" />}
                                        </div>
                                    )}

                                    <button onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }} className="text-gray-400 mr-2">
                                        {layer.visible ? <Eye size={12} /> : <div className="w-3 h-3 border rounded border-gray-600" />}
                                    </button>

                                    <span className="flex-1 truncate text-gray-300 select-none">{layer.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="p-3">
                        <textarea className="w-full bg-[#1e1e1e] border border-gray-600 rounded p-2 text-white mb-2" placeholder="Describe..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                        <button onClick={() => setIsGenerating(true)} className="w-full bg-blue-600 p-2 rounded text-white">{isGenerating ? 'Generating...' : 'Generate'}</button>
                    </div>
                )}
            </div>
        </aside>
    );
};
