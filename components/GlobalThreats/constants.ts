import { AttackType } from './types';

export const COLORS = {
    [AttackType.OAS]: '#4ade80', // green-400
    [AttackType.ODS]: '#f87171', // red-400
    [AttackType.WAV]: '#38bdf8', // sky-400
    [AttackType.IDS]: '#e879f9', // fuchsia-400
    [AttackType.VUL]: '#fbbf24', // amber-400
    [AttackType.KAS]: '#a78bfa', // violet-400
    [AttackType.BAD]: '#2dd4bf', // teal-400
};

export const ATTACK_TYPES_LIST = [
    AttackType.OAS,
    AttackType.ODS,
    AttackType.WAV,
    AttackType.IDS,
    AttackType.VUL,
    AttackType.KAS,
    AttackType.BAD,
];

// More realistic coordinates based on major internet exchanges
export const NODES = [
    { name: 'MO, United States', lat: 38.6270, lng: -90.1994 },
    { name: 'California, US', lat: 37.7749, lng: -122.4194 },
    { name: 'Virginia, US', lat: 38.8048, lng: -77.0469 },
    { name: 'Netherlands', lat: 52.1326, lng: 5.2913 },
    { name: 'France', lat: 46.2276, lng: 2.2137 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Israel', lat: 31.0461, lng: 34.8516 },
    { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6173 },
    { name: 'Beijing, China', lat: 39.9042, lng: 116.4074 },
    { name: 'India', lat: 20.5937, lng: 78.9629 },
    { name: 'Indonesia', lat: -0.7893, lng: 113.9213 },
    { name: 'Brazil', lat: -14.2350, lng: -51.9253 },
    { name: 'South Africa', lat: -30.5595, lng: 22.9375 },
    { name: 'Sydney, AU', lat: -33.8688, lng: 151.2093 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Frankfurt, DE', lat: 50.1109, lng: 8.6821 }
];
