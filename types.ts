

export type TabType = 'dashboard' | 'ai_chat' | 'tools' | 'terminal' | 'database' | 'attack' | 'docs' | 'about' | 'c2' | 'crypto' | 'map' | 'avatar' | 'targets' | 'code_editor';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface TerminalLine {
  type: 'input' | 'output';
  content: string;
  timestamp: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any; // Using any for React Node flexibility
  command: string;
}

export interface AttackStats {
  active: boolean;
  requestsPerSecond: number;
  bandwidth: number; // MB/s
  targetsCompromised: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface CitizenData {
  id: string;
  nik: string;
  fullName: string;
  email: string;
  ipAddress: string;
  source: string;
  passwordHash: string;
  status: 'BOCOR' | 'TERENKRIPSI' | 'TEREKSPOS' | 'DIJUAL';
}

export interface TargetProfile {
  id: string;
  codename: string;
  realName: string;
  age: number;
  nationality: string;
  crimes: string[];
  bounty: number;
  currency: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  status: 'ACTIVE' | 'CAPTURED' | 'MIA';
  lastSeen: string;
  avatarUrl: string;
  bio: string;
}
