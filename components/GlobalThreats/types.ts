export enum AttackType {
    OAS = 'OAS', // On-Access Scan
    ODS = 'ODS', // On-Demand Scan
    WAV = 'WAV', // Web Anti-Virus
    IDS = 'IDS', // Intrusion Detection System
    VUL = 'VUL', // Vulnerability Scan
    KAS = 'KAS', // Kaspersky Anti-Spam (Legacy name reference)
    BAD = 'BAD', // Botnet Activity Detection
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface AttackEvent {
    id: string;
    source: Coordinates;
    target: Coordinates;
    type: AttackType;
    timestamp: number;
}

export interface CountryStats {
    rank: number;
    name: string;
    count: number;
}

export interface ThreatNews {
    headline: string;
    summary: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    date: string;
}
