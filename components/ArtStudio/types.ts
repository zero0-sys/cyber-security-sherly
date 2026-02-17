export enum ToolType {
    BRUSH = 'BRUSH',
    ERASER = 'ERASER',
    FILL = 'FILL',
    PICKER = 'PICKER',
    MOVE = 'MOVE',
    SELECTION = 'SELECTION',
    TEXT = 'TEXT',
    STAMP = 'STAMP',
    GRADIENT = 'GRADIENT'
}

export enum BrushType {
    BASIC = 'BASIC',
    PEN = 'PEN',
    PENCIL = 'PENCIL',
    AIRBRUSH = 'AIRBRUSH',
    MARKER = 'MARKER',
    CALLIGRAPHY = 'CALLIGRAPHY',
    CLOUD = 'CLOUD',
    GROUND = 'GROUND',
    WATER = 'WATER',
    BUILDING = 'BUILDING'
}

export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    opacity: number; // 0 to 100
    blendMode: string;
    type: 'layer' | 'group';
    parentId: string | null; // For grouping
    thumbnail?: string; // Data URL
    // Transform properties
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    // Content dimensions for the bounding box
    width: number;
    height: number;
}

export interface BrushSettings {
    size: number;
    opacity: number; // 0 to 100
    hardness: number; // 0 to 100
    color: string; // Hex
    type: BrushType;
    symmetry: boolean;
    gradientType: 'linear' | 'radial';
    gradientColor2: string;
    texture: string | null; // Data URL for pattern
    textContent: string; // Text to add
}

export interface GeneratedImage {
    url: string;
    prompt: string;
}

export interface ProjectConfig {
    name: string;
    width: number;
    height: number;
}
