import React, { useState } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { RightPanel } from './components/RightPanel';
import { ToolType, BrushSettings, Layer, ProjectConfig, BrushType } from './types';
import { ZoomIn, ZoomOut, RotateCw, ImagePlus, Download } from 'lucide-react';

const ArtStudio: React.FC = () => {
    const [showStartup, setShowStartup] = useState(true);
    const [projectConfig, setProjectConfig] = useState<ProjectConfig>({ name: 'Untitled-1', width: 800, height: 600 });
    const [activeTool, setActiveTool] = useState<ToolType>(ToolType.BRUSH);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [importTrigger, setImportTrigger] = useState(0);
    const [saveTrigger, setSaveTrigger] = useState(0);

    const [brushSettings, setBrushSettings] = useState<BrushSettings>({
        size: 15, opacity: 100, hardness: 80, color: '#3b82f6',
        type: BrushType.BASIC, symmetry: false, gradientType: 'linear', gradientColor2: '#ffffff',
        texture: null, textContent: 'Type Here'
    });

    const [layers, setLayers] = useState<Layer[]>([
        {
            id: 'l1', name: 'Background', visible: true, locked: false, opacity: 100, blendMode: 'normal',
            type: 'layer', parentId: null, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, width: 800, height: 600
        },
    ]);
    const [activeLayerId, setActiveLayerId] = useState<string>('l1');

    const handleCreateProject = () => setShowStartup(false);

    const handleAddLayer = (newLayer?: Layer) => {
        const layerToAdd: Layer = newLayer || {
            id: `l${Date.now()}`,
            name: `Layer ${layers.length + 1}`,
            visible: true, locked: false, opacity: 100, blendMode: 'source-over',
            type: 'layer', parentId: null, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
            width: projectConfig.width, height: projectConfig.height
        };
        // Insert active layer or top
        const idx = layers.findIndex(l => l.id === activeLayerId);
        const newLayers = [...layers];
        if (idx !== -1) newLayers.splice(idx, 0, layerToAdd);
        else newLayers.unshift(layerToAdd); // Add to top
        setLayers(newLayers);
        setActiveLayerId(layerToAdd.id);
    };

    const handleAddGroup = () => {
        const group: Layer = {
            id: `g${Date.now()}`, name: `Group ${layers.length + 1}`,
            visible: true, locked: false, opacity: 100, blendMode: 'pass-through',
            type: 'group', parentId: null, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
            width: 0, height: 0
        };
        setLayers([group, ...layers]);
    };

    const handleRemoveLayer = (id: string) => {
        const newLayers = layers.filter(l => l.id !== id && l.parentId !== id);
        if (newLayers.length > 0) {
            setLayers(newLayers);
            if (activeLayerId === id) setActiveLayerId(newLayers[0].id);
        }
    };

    const updateLayer = (id: string, updates: Partial<Layer>) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-gray-200 overflow-hidden font-sans relative">
            {showStartup && (
                <div className="absolute inset-0 bg-black/80 z-[60] flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-[#2d2d2d] p-8 rounded-lg shadow-2xl border border-gray-600 w-96">
                        <h2 className="text-xl font-bold mb-6 text-white">New Project</h2>
                        <div className="space-y-4">
                            <input type="text" className="w-full bg-[#1e1e1e] border border-gray-500 rounded p-2 text-sm" value={projectConfig.name} onChange={(e) => setProjectConfig({ ...projectConfig, name: e.target.value })} />
                            <div className="flex gap-4">
                                <input type="number" className="w-full bg-[#1e1e1e] border border-gray-500 rounded p-2 text-sm" value={projectConfig.width} onChange={(e) => setProjectConfig({ ...projectConfig, width: parseInt(e.target.value) })} />
                                <input type="number" className="w-full bg-[#1e1e1e] border border-gray-500 rounded p-2 text-sm" value={projectConfig.height} onChange={(e) => setProjectConfig({ ...projectConfig, height: parseInt(e.target.value) })} />
                            </div>
                            <button onClick={handleCreateProject} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded mt-4">Create Canvas</button>
                        </div>
                    </div>
                </div>
            )}

            <Header />

            <div className="h-10 bg-[#252525] border-b border-[#1a1a1a] flex items-center px-4 space-x-2 shrink-0">
                <button onClick={() => setImportTrigger(Date.now())} className="p-1.5 hover:bg-[#3d3d3d] rounded"><ImagePlus size={18} /></button>
                <button onClick={() => setSaveTrigger(Date.now())} className="p-1.5 hover:bg-[#3d3d3d] rounded"><Download size={18} /></button>
                <div className="w-px h-6 bg-gray-600 mx-2"></div>
                <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="p-1.5 hover:bg-[#3d3d3d] rounded"><ZoomOut size={18} /></button>
                <span className="text-xs w-12 text-center text-gray-400">{zoom}%</span>
                <button onClick={() => setZoom(z => Math.min(500, z + 10))} className="p-1.5 hover:bg-[#3d3d3d] rounded"><ZoomIn size={18} /></button>
                <button onClick={() => setRotation(r => r + 90)} className="p-1.5 hover:bg-[#3d3d3d] rounded"><RotateCw size={18} /></button>
            </div>

            <div className="flex-1 flex overflow-hidden relative min-h-0">
                <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} color={brushSettings.color} />
                <Canvas
                    tool={activeTool} brushSettings={brushSettings} projectConfig={projectConfig}
                    zoom={zoom} rotation={rotation} setBrushSettings={setBrushSettings}
                    importTrigger={importTrigger} saveTrigger={saveTrigger}
                    layers={layers} activeLayerId={activeLayerId} updateLayer={updateLayer}
                    onLayerChange={() => { }} onAddLayer={handleAddLayer}
                />
                <RightPanel
                    layers={layers} brushSettings={brushSettings} setBrushSettings={setBrushSettings}
                    onAddLayer={() => handleAddLayer()} onRemoveLayer={handleRemoveLayer}
                    activeLayerId={activeLayerId} setActiveLayerId={setActiveLayerId} updateLayer={updateLayer}
                    activeTool={activeTool} onAddGroup={handleAddGroup}
                    showStartup={showStartup}
                />
            </div>
            <div className="h-6 bg-[#2d2d2d] border-t border-[#1a1a1a] flex items-center px-4 text-[10px] text-gray-500 justify-between select-none z-20 shrink-0">
                <span>{projectConfig.name}: {projectConfig.width}x{projectConfig.height}px</span>
                <span>Tool: {activeTool}</span>
            </div>
        </div>
    );
};

export default ArtStudio;
