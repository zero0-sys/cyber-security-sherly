import React, { useRef, useEffect, useState } from 'react';
import { BrushSettings, ToolType, ProjectConfig, BrushType, Layer } from '../types';

interface CanvasProps {
    tool: ToolType;
    brushSettings: BrushSettings;
    projectConfig: ProjectConfig;
    zoom: number;
    rotation: number;
    setBrushSettings: (s: BrushSettings) => void;
    importTrigger: number;
    saveTrigger: number;
    layers: Layer[];
    activeLayerId: string;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    onLayerChange: () => void;
    onAddLayer: (newLayer: Layer) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
    tool,
    brushSettings,
    projectConfig,
    zoom,
    rotation,
    setBrushSettings,
    importTrigger,
    saveTrigger,
    layers,
    activeLayerId,
    updateLayer,
    onLayerChange,
    onAddLayer
}) => {
    const mainCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const layerCanvases = useRef<Map<string, HTMLCanvasElement>>(new Map());
    const selectionPath = useRef<{ x: number, y: number }[]>([]);

    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPos, setLastPos] = useState<{ x: number, y: number } | null>(null);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);
    const [textureImage, setTextureImage] = useState<HTMLImageElement | null>(null);

    // Transform State
    const [transformAction, setTransformAction] = useState<'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null>(null);

    const getLayerCanvas = (layerId: string) => {
        if (!layerCanvases.current.has(layerId)) {
            const c = document.createElement('canvas');
            c.width = projectConfig.width;
            c.height = projectConfig.height;
            layerCanvases.current.set(layerId, c);
        }
        return layerCanvases.current.get(layerId)!;
    };

    useEffect(() => {
        if (brushSettings.texture) {
            const img = new Image();
            img.src = brushSettings.texture;
            img.onload = () => setTextureImage(img);
        } else {
            setTextureImage(null);
        }
    }, [brushSettings.texture]);

    // Transform Point utility for gizmo rendering
    const transformPoint = (x: number, y: number, layer: Layer, cw: number, ch: number) => {
        // 1. Center of object in layer space (0,0) due to how we draw centered content
        // 2. Scale
        const sx = x * layer.scaleX;
        const sy = y * layer.scaleY;
        // 3. Rotate
        const rad = (layer.rotation * Math.PI) / 180;
        const rx = sx * Math.cos(rad) - sy * Math.sin(rad);
        const ry = sx * Math.sin(rad) + sy * Math.cos(rad);
        // 4. Translate to screen space
        // Layer.x is offset from center of canvas
        const cx = cw / 2 + layer.x;
        const cy = ch / 2 + layer.y;
        return { x: cx + rx, y: cy + ry };
    };

    const composeLayers = () => {
        const mainCtx = mainCanvasRef.current?.getContext('2d');
        if (!mainCtx || !mainCanvasRef.current) return;

        mainCtx.clearRect(0, 0, projectConfig.width, projectConfig.height);
        mainCtx.fillStyle = '#ffffff';
        mainCtx.fillRect(0, 0, projectConfig.width, projectConfig.height);

        [...layers].reverse().forEach(layer => {
            if (!layer.visible) return;

            const layerCanvas = layerCanvases.current.get(layer.id);
            if (layerCanvas) {
                mainCtx.save();
                mainCtx.globalAlpha = layer.opacity / 100;
                mainCtx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;

                mainCtx.translate(layer.x + projectConfig.width / 2, layer.y + projectConfig.height / 2);
                mainCtx.rotate((layer.rotation * Math.PI) / 180);
                mainCtx.scale(layer.scaleX, layer.scaleY);

                // Draw centered relative to the pivot
                mainCtx.translate(-projectConfig.width / 2, -projectConfig.height / 2);

                mainCtx.drawImage(layerCanvas, 0, 0);
                mainCtx.restore();
            }
        });

        // Draw Transform Gizmo for Active Layer if Move Tool
        if (tool === ToolType.MOVE) {
            const activeLayer = layers.find(l => l.id === activeLayerId);
            if (activeLayer && !activeLayer.locked) {
                const w = activeLayer.width;
                const h = activeLayer.height;
                const hw = w / 2;
                const hh = h / 2;

                const p1 = transformPoint(-hw, -hh, activeLayer, projectConfig.width, projectConfig.height);
                const p2 = transformPoint(hw, -hh, activeLayer, projectConfig.width, projectConfig.height);
                const p3 = transformPoint(hw, hh, activeLayer, projectConfig.width, projectConfig.height);
                const p4 = transformPoint(-hw, hh, activeLayer, projectConfig.width, projectConfig.height);

                mainCtx.save();
                mainCtx.strokeStyle = '#3b82f6';
                mainCtx.lineWidth = 1;
                mainCtx.beginPath();
                mainCtx.moveTo(p1.x, p1.y);
                mainCtx.lineTo(p2.x, p2.y);
                mainCtx.lineTo(p3.x, p3.y);
                mainCtx.lineTo(p4.x, p4.y);
                mainCtx.closePath();
                mainCtx.stroke();

                // Handles
                const drawHandle = (p: { x: number, y: number }) => {
                    mainCtx.fillStyle = '#fff';
                    mainCtx.strokeStyle = '#3b82f6';
                    mainCtx.beginPath();
                    mainCtx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                    mainCtx.fill();
                    mainCtx.stroke();
                };
                drawHandle(p1);
                drawHandle(p2);
                drawHandle(p3);
                drawHandle(p4);
                mainCtx.restore();
            }
        }
    };

    useEffect(() => {
        if (mainCanvasRef.current) {
            mainCanvasRef.current.width = projectConfig.width;
            mainCanvasRef.current.height = projectConfig.height;
            composeLayers();
        }
    }, [projectConfig]);

    useEffect(() => {
        composeLayers();
    }, [layers, zoom, rotation, tool]);

    useEffect(() => {
        if (importTrigger > 0 && fileInputRef.current) fileInputRef.current.click();
    }, [importTrigger]);

    useEffect(() => {
        if (saveTrigger > 0 && mainCanvasRef.current) {
            const link = document.createElement('a');
            link.download = `${projectConfig.name}.png`;
            link.href = mainCanvasRef.current.toDataURL();
            link.click();
        }
    }, [saveTrigger]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const newId = `img_${Date.now()}`;
                    const c = document.createElement('canvas');
                    c.width = projectConfig.width;
                    c.height = projectConfig.height;
                    const ctx = c.getContext('2d');
                    if (ctx) {
                        // Draw centered
                        const x = (projectConfig.width - img.width) / 2;
                        const y = (projectConfig.height - img.height) / 2;
                        ctx.drawImage(img, x, y);
                    }
                    layerCanvases.current.set(newId, c);

                    onAddLayer({
                        id: newId,
                        name: `Image ${file.name}`,
                        visible: true, locked: false, opacity: 100, blendMode: 'source-over',
                        type: 'layer', parentId: null,
                        thumbnail: c.toDataURL('image/png', 0.1),
                        x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,
                        width: img.width, height: img.height
                    });
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const getCoordinates = (e: React.MouseEvent) => {
        if (!mainCanvasRef.current) return { x: 0, y: 0 };
        const rect = mainCanvasRef.current.getBoundingClientRect();
        const scaleX = mainCanvasRef.current.width / rect.width;
        const scaleY = mainCanvasRef.current.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const updateLayerThumbnail = (layerId: string) => {
        const lc = layerCanvases.current.get(layerId);
        if (lc) {
            updateLayer(layerId, { thumbnail: lc.toDataURL('image/png', 0.1) });
        }
    };

    // --- BRUSH ENGINE ---
    const drawBrushSegment = (
        ctx: CanvasRenderingContext2D,
        start: { x: number, y: number },
        end: { x: number, y: number }
    ) => {
        const type = brushSettings.type;

        // Common settings
        ctx.globalAlpha = brushSettings.opacity / 100;
        ctx.fillStyle = brushSettings.color;
        ctx.strokeStyle = brushSettings.color;

        if (type === BrushType.BASIC || type === BrushType.PEN) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = brushSettings.size;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            // Symmetry
            if (brushSettings.symmetry) {
                const w = projectConfig.width;
                ctx.beginPath();
                ctx.moveTo(w - start.x, start.y);
                ctx.lineTo(w - end.x, end.y);
                ctx.stroke();
            }
        }
        else if (type === BrushType.PENCIL) {
            // Pencil: Thinner, maybe grainy
            const size = Math.max(1, brushSettings.size * 0.2);
            ctx.lineWidth = size;
            ctx.lineCap = 'butt';
            ctx.globalAlpha = (brushSettings.opacity / 100) * 0.8;

            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();

            if (brushSettings.symmetry) {
                const w = projectConfig.width;
                ctx.beginPath();
                ctx.moveTo(w - start.x, start.y);
                ctx.lineTo(w - end.x, end.y);
                ctx.stroke();
            }
        }
        else if (type === BrushType.AIRBRUSH) {
            const dist = Math.hypot(end.x - start.x, end.y - start.y);
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            // High density soft circles
            const stepSize = Math.max(1, brushSettings.size * 0.2);

            for (let i = 0; i < dist; i += stepSize) {
                const x = start.x + Math.cos(angle) * i;
                const y = start.y + Math.sin(angle) * i;

                const grad = ctx.createRadialGradient(x, y, 0, x, y, brushSettings.size);
                grad.addColorStop(0, brushSettings.color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.globalAlpha = (brushSettings.opacity / 100) * 0.1; // very faint per dot
                ctx.beginPath();
                ctx.arc(x, y, brushSettings.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        else if (type === BrushType.MARKER) {
            ctx.lineWidth = brushSettings.size;
            ctx.lineCap = 'square'; // Marker typically square or chisel
            ctx.lineJoin = 'bevel';
            ctx.globalAlpha = (brushSettings.opacity / 100) * 0.5; // Markers are semi-transparent overlapping
            // Markers shouldn't be fully additive in one stroke in real life, but composite 'darker' helps
            // Here we just use standard drawing with lower alpha
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
        else if (type === BrushType.CALLIGRAPHY) {
            const dist = Math.hypot(end.x - start.x, end.y - start.y);
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const stepSize = 2; // tight stepping

            const slant = Math.PI / 4; // 45 degree angle for the nib
            const w = brushSettings.size;

            ctx.globalAlpha = brushSettings.opacity / 100;

            for (let i = 0; i < dist; i += stepSize) {
                const x = start.x + Math.cos(angle) * i;
                const y = start.y + Math.sin(angle) * i;

                ctx.beginPath();
                // Draw a line at the slanted angle
                ctx.moveTo(x + Math.cos(slant) * w / 2, y + Math.sin(slant) * w / 2);
                ctx.lineTo(x - Math.cos(slant) * w / 2, y - Math.sin(slant) * w / 2);
                ctx.lineWidth = 2; // Thickness of the nib line itself
                ctx.stroke();
            }
        }
        else if (type === BrushType.BUILDING) {
            // Draw rectangles behaving like a skyline or bricks
            const dist = Math.hypot(end.x - start.x, end.y - start.y);
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const stepSize = Math.max(10, brushSettings.size * 0.8);

            for (let i = 0; i < dist; i += stepSize) {
                const x = start.x + Math.cos(angle) * i;
                const y = start.y + Math.sin(angle) * i;

                const w = brushSettings.size;
                const h = brushSettings.size * (Math.random() * 1.5 + 0.5);

                ctx.globalAlpha = brushSettings.opacity / 100;
                ctx.fillRect(x - w / 2, y - h, w, h);
            }
        }
        else {
            // Particle Brushes (Cloud, Ground, Water)
            const dist = Math.hypot(end.x - start.x, end.y - start.y);
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const stepSize = type === BrushType.CLOUD ? Math.max(1, brushSettings.size * 0.5) : Math.max(1, brushSettings.size * 0.2);

            for (let i = 0; i < dist; i += stepSize) {
                const x = start.x + Math.cos(angle) * i;
                const y = start.y + Math.sin(angle) * i;

                const scatter = brushSettings.size * 0.5;
                const offsetX = (Math.random() - 0.5) * scatter;
                const offsetY = (Math.random() - 0.5) * scatter;

                const r = (Math.random() * 0.5 + 0.5) * brushSettings.size;

                ctx.beginPath();

                if (type === BrushType.CLOUD) {
                    ctx.globalAlpha = (brushSettings.opacity / 100) * 0.1;
                    ctx.arc(x + offsetX, y + offsetY, r, 0, Math.PI * 2);
                    ctx.fill();
                } else if (type === BrushType.GROUND) {
                    ctx.globalAlpha = (brushSettings.opacity / 100) * 0.5;
                    ctx.fillRect(x + offsetX, y + offsetY, r / 2, r / 2);
                } else {
                    ctx.globalAlpha = (brushSettings.opacity / 100) * 0.3;
                    ctx.arc(x + offsetX, y + offsetY, r / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (brushSettings.symmetry) {
                    const w = projectConfig.width;
                    ctx.beginPath();
                    if (type === BrushType.CLOUD) {
                        ctx.arc(w - (x + offsetX), y + offsetY, r, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.arc(w - (x + offsetX), y + offsetY, r / 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
    };

    const handlePointerDown = (e: React.MouseEvent) => {
        const { x, y } = getCoordinates(e);

        // Color Picker Logic
        if (tool === ToolType.PICKER) {
            const ctx = mainCanvasRef.current?.getContext('2d');
            if (ctx) {
                const px = Math.floor(x);
                const py = Math.floor(y);
                // Ensure within bounds
                if (px >= 0 && px < projectConfig.width && py >= 0 && py < projectConfig.height) {
                    const pixel = ctx.getImageData(px, py, 1, 1).data;
                    const toHex = (n: number) => n.toString(16).padStart(2, '0');
                    const hex = `#${toHex(pixel[0])}${toHex(pixel[1])}${toHex(pixel[2])}`;
                    setBrushSettings({ ...brushSettings, color: hex });
                }
            }
            return; // Picker doesn't draw
        }

        const activeLayer = layers.find(l => l.id === activeLayerId);

        // Check if clicking a tool that doesn't need active layer check first
        if (tool === ToolType.MOVE && activeLayer) {
            // Check handles
            const w = activeLayer.width;
            const h = activeLayer.height;
            const hw = w / 2;
            const hh = h / 2;

            const corners = [
                { type: 'resize-nw', p: transformPoint(-hw, -hh, activeLayer, projectConfig.width, projectConfig.height) },
                { type: 'resize-ne', p: transformPoint(hw, -hh, activeLayer, projectConfig.width, projectConfig.height) },
                { type: 'resize-se', p: transformPoint(hw, hh, activeLayer, projectConfig.width, projectConfig.height) },
                { type: 'resize-sw', p: transformPoint(-hw, hh, activeLayer, projectConfig.width, projectConfig.height) }
            ];

            // Simple distance check
            const hitHandle = corners.find(c => Math.hypot(c.p.x - x, c.p.y - y) < 15); // generous hit area

            if (hitHandle) {
                setTransformAction(hitHandle.type as any);
            } else {
                setTransformAction('move');
            }

            setIsDrawing(true);
            setLastPos({ x, y });
            return;
        }

        if (!activeLayer || activeLayer.locked || activeLayer.type === 'group') return;
        const layerCanvas = getLayerCanvas(activeLayerId);
        const ctx = layerCanvas.getContext('2d');
        if (!ctx) return;

        if (tool === ToolType.TEXT) {
            const text = brushSettings.textContent || "Text";
            const newId = `txt_${Date.now()}`;
            const c = document.createElement('canvas');
            c.width = projectConfig.width;
            c.height = projectConfig.height;
            const tCtx = c.getContext('2d');
            let metrics = { width: 100, actualBoundingBoxAscent: 20, actualBoundingBoxDescent: 5 }; // Fallback

            if (tCtx) {
                const fontSize = brushSettings.size * 5;
                tCtx.font = `${fontSize}px sans-serif`;
                tCtx.fillStyle = brushSettings.color;
                tCtx.globalAlpha = brushSettings.opacity / 100;
                metrics = tCtx.measureText(text);

                // Draw centered in the layer canvas
                const tx = (projectConfig.width - metrics.width) / 2;
                const ty = (projectConfig.height + fontSize) / 2;
                tCtx.fillText(text, tx, ty);
            }

            layerCanvases.current.set(newId, c);

            onAddLayer({
                id: newId,
                name: `T: ${text.substring(0, 10)}`,
                visible: true, locked: false, opacity: 100, blendMode: 'source-over',
                type: 'layer', parentId: null,
                thumbnail: c.toDataURL('image/png', 0.1),
                x: x - projectConfig.width / 2,
                y: y - projectConfig.height / 2,
                scaleX: 1, scaleY: 1, rotation: 0,
                width: metrics.width,
                height: (brushSettings.size * 5)
            });
            return;
        }

        // Standard Drawing
        if (tool === ToolType.STAMP) {
            ctx.fillStyle = brushSettings.color;
            ctx.globalAlpha = brushSettings.opacity / 100;
            ctx.beginPath();
            const spikes = 5;
            const outerRadius = brushSettings.size;
            const innerRadius = brushSettings.size / 2;
            let rot = Math.PI / 2 * 3;
            let cx = x, cy = y;
            let step = Math.PI / spikes;

            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                cx = x + Math.cos(rot) * outerRadius;
                cy = y + Math.sin(rot) * outerRadius;
                ctx.lineTo(cx, cy);
                rot += step;
                cx = x + Math.cos(rot) * innerRadius;
                cy = y + Math.sin(rot) * innerRadius;
                ctx.lineTo(cx, cy);
                rot += step;
            }
            ctx.lineTo(x, y - outerRadius);
            ctx.closePath();
            ctx.fill();
            composeLayers();
            updateLayerThumbnail(activeLayerId);
            return;
        }

        if (tool === ToolType.FILL) {
            ctx.fillStyle = brushSettings.color;
            ctx.globalAlpha = brushSettings.opacity / 100;
            ctx.fillRect(0, 0, projectConfig.width, projectConfig.height);
            composeLayers();
            updateLayerThumbnail(activeLayerId);
            return;
        }

        if (tool === ToolType.GRADIENT) {
            setSnapshot(ctx.getImageData(0, 0, projectConfig.width, projectConfig.height));
        }

        if (tool === ToolType.SELECTION) {
            selectionPath.current = [{ x, y }];
        }

        setIsDrawing(true);
        setLastPos({ x, y });

        if (tool === ToolType.BRUSH || tool === ToolType.ERASER) {
            drawBrushSegment(ctx, { x, y }, { x, y });
        }
    };

    const handlePointerMove = (e: React.MouseEvent) => {
        if (!isDrawing || !lastPos) return;
        const { x, y } = getCoordinates(e);

        if (tool === ToolType.MOVE) {
            const activeLayer = layers.find(l => l.id === activeLayerId);
            if (activeLayer) {
                const dx = x - lastPos.x;
                const dy = y - lastPos.y;

                if (transformAction === 'move') {
                    updateLayer(activeLayerId, {
                        x: activeLayer.x + dx,
                        y: activeLayer.y + dy
                    });
                } else if (transformAction?.startsWith('resize')) {
                    const sensitivity = 0.005;
                    const scaleDeltaX = dx * sensitivity;
                    const scaleDeltaY = dy * sensitivity;

                    let sx = activeLayer.scaleX;
                    let sy = activeLayer.scaleY;

                    if (transformAction === 'resize-se') { sx += scaleDeltaX; sy += scaleDeltaY; }
                    if (transformAction === 'resize-sw') { sx -= scaleDeltaX; sy += scaleDeltaY; }
                    if (transformAction === 'resize-ne') { sx += scaleDeltaX; sy -= scaleDeltaY; }
                    if (transformAction === 'resize-nw') { sx -= scaleDeltaX; sy -= scaleDeltaY; }

                    updateLayer(activeLayerId, { scaleX: sx, scaleY: sy });
                }
                setLastPos({ x, y });
            }
            return;
        }

        const layerCanvas = getLayerCanvas(activeLayerId);
        const ctx = layerCanvas.getContext('2d');
        if (!ctx) return;

        if (tool === ToolType.GRADIENT && snapshot) {
            ctx.putImageData(snapshot, 0, 0);
            let grad;
            if (brushSettings.gradientType === 'radial') {
                const r = Math.sqrt(Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2));
                grad = ctx.createRadialGradient(lastPos.x, lastPos.y, 0, lastPos.x, lastPos.y, r);
            } else {
                grad = ctx.createLinearGradient(lastPos.x, lastPos.y, x, y);
            }
            grad.addColorStop(0, brushSettings.color);
            grad.addColorStop(1, brushSettings.gradientColor2);
            ctx.fillStyle = grad;
            ctx.globalAlpha = brushSettings.opacity / 100;
            ctx.fillRect(0, 0, projectConfig.width, projectConfig.height);
            composeLayers();
            return;
        }

        if (tool === ToolType.BRUSH || tool === ToolType.ERASER) {
            const isEraser = tool === ToolType.ERASER;
            ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';

            drawBrushSegment(ctx, lastPos, { x, y });
        }

        if (tool === ToolType.SELECTION) {
            selectionPath.current.push({ x, y });
            const mainCtx = mainCanvasRef.current?.getContext('2d');
            if (mainCtx) {
                composeLayers();
                // Draw entire path
                mainCtx.save();
                mainCtx.setLineDash([5, 5]);
                mainCtx.strokeStyle = 'black';
                mainCtx.lineWidth = 1;
                mainCtx.beginPath();
                if (selectionPath.current.length > 0) {
                    mainCtx.moveTo(selectionPath.current[0].x, selectionPath.current[0].y);
                    for (let i = 1; i < selectionPath.current.length; i++) {
                        mainCtx.lineTo(selectionPath.current[i].x, selectionPath.current[i].y);
                    }
                }
                mainCtx.stroke();

                // Draw closing line hint
                mainCtx.setLineDash([2, 2]);
                mainCtx.strokeStyle = '#666';
                mainCtx.beginPath();
                mainCtx.moveTo(x, y);
                mainCtx.lineTo(selectionPath.current[0].x, selectionPath.current[0].y);
                mainCtx.stroke();

                mainCtx.restore();
            }
        } else {
            composeLayers();
        }

        setLastPos({ x, y });
    };

    const handlePointerUp = () => {
        setIsDrawing(false);
        setLastPos(null);
        setSnapshot(null);
        setTransformAction(null);

        if (tool === ToolType.SELECTION) {
            const mainCtx = mainCanvasRef.current?.getContext('2d');
            if (mainCtx && selectionPath.current.length > 0) {
                composeLayers();
                mainCtx.save();
                mainCtx.setLineDash([5, 5]);
                mainCtx.strokeStyle = '#3b82f6';
                mainCtx.lineWidth = 1;
                mainCtx.beginPath();
                mainCtx.moveTo(selectionPath.current[0].x, selectionPath.current[0].y);
                for (let i = 1; i < selectionPath.current.length; i++) {
                    mainCtx.lineTo(selectionPath.current[i].x, selectionPath.current[i].y);
                }
                mainCtx.closePath();
                mainCtx.stroke();
                mainCtx.fillStyle = 'rgba(59, 130, 246, 0.1)';
                mainCtx.fill();
                mainCtx.restore();
            }
        }

        if (activeLayerId) {
            updateLayerThumbnail(activeLayerId);
        }
    };

    const displayWidth = projectConfig.width * (zoom / 100);
    const displayHeight = projectConfig.height * (zoom / 100);

    return (
        <div
            ref={containerRef}
            className="flex-1 bg-[#1e1e1e] overflow-auto flex relative shadow-inner touch-none"
            style={{
                backgroundImage: 'radial-gradient(#2a2a2a 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }}
        >
            <div className="min-w-full min-h-full flex items-center justify-center p-8">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

                <div
                    className="relative shadow-2xl bg-white transition-all duration-75 ease-linear origin-center"
                    style={{
                        width: `${displayWidth}px`,
                        height: `${displayHeight}px`,
                        transform: `rotate(${rotation}deg)`,
                    }}
                >
                    <canvas
                        ref={mainCanvasRef}
                        onMouseDown={handlePointerDown}
                        onMouseMove={handlePointerMove}
                        onMouseUp={handlePointerUp}
                        onMouseLeave={handlePointerUp}
                        className={`block bg-white w-full h-full ${tool === ToolType.MOVE ? 'cursor-move' : tool === ToolType.PICKER ? 'cursor-crosshair' : 'cursor-crosshair'}`}
                        style={{ cursor: tool === ToolType.PICKER ? 'crosshair' : undefined }}
                    />
                </div>
            </div>
        </div>
    );
};
