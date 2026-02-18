import React from 'react';
import {
    Shield, Activity, Zap, Lock, Radio, Terminal as TerminalIcon, Crosshair,
    Globe, Server, Wifi, AlertTriangle
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { LogEntry } from '../types';

interface DashboardProps {
    stats: {
        threats: number;
        blocked: number;
        networkLoad: number;
        systemIntegrity: number;
    };
    networkData: any[];
    logs: LogEntry[];
    honeypotData: any[];
    freqData: any[];
    webActivityData: any[]; // New prop
    securityAnalytics: { // New prop
        attackTypes: any[];
        trafficComposition: any[];
    };
}

const Dashboard: React.FC<DashboardProps> = ({
    stats,
    networkData,
    logs,
    honeypotData,
    freqData,
    webActivityData,
    securityAnalytics
}) => {
    return (
        <div className="space-y-6 overflow-y-auto h-full pb-20 scrollbar-hide">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Threats" value={stats.threats} icon={<Zap size={20} className="text-red-500" />} color="red" />
                <StatCard label="Mitigated Attacks" value={stats.blocked} icon={<Shield size={20} className="text-green-500" />} color="green" />
                <StatCard label="Net Traffic" value={`${stats.networkLoad}%`} icon={<Activity size={20} className="text-blue-500" />} color="blue" />
                <StatCard label="System Integrity" value={`${stats.systemIntegrity}%`} icon={<Lock size={20} className="text-green-400" />} color="green" />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Web Activity Wave Graph (NEW) */}
                <div className="lg:col-span-2 glass-panel p-4 rounded-lg h-64 md:h-80 relative overflow-hidden border border-green-900 bg-black/40 flex flex-col">
                    <h3 className="text-lg font-orbitron mb-4 flex items-center gap-2 relative z-10">
                        <Globe size={18} className="text-cyan-400" /> Web Activity Wave
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={webActivityData}>
                                <defs>
                                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="time" hide />
                                <YAxis stroke="#4b5563" fontSize={10} tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#06b6d4', color: '#06b6d4', fontFamily: 'monospace' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                                <Area type="monotone" dataKey="latency" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attack Vector Radar (NEW) */}
                <div className="glass-panel p-4 rounded-lg border border-green-900 bg-black/40 flex flex-col relative overflow-hidden h-64 md:h-80">
                    <h3 className="text-lg font-orbitron mb-4 flex items-center gap-2 relative z-10">
                        <Crosshair size={18} className="text-red-500 animate-pulse" /> Threat Analysis
                    </h3>
                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={securityAnalytics.attackTypes}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="type" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Threat Level" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#ef4444', color: '#fff', fontFamily: 'monospace' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Network Traffic (Existing) */}
                <div className="lg:col-span-2 glass-panel p-4 rounded-lg h-64 relative overflow-hidden border border-green-900 bg-black/40 flex flex-col">
                    <h3 className="text-lg font-orbitron mb-4 flex items-center gap-2 relative z-10">
                        <Activity size={18} className="text-green-500" /> Network Bytes I/O
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={networkData}>
                                <defs>
                                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ff41" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00ff41" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0096ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0096ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tick={{ fill: '#6b7280' }} />
                                <YAxis stroke="#4b5563" fontSize={10} tick={{ fill: '#6b7280' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#00ff41', color: '#00ff41', fontFamily: 'monospace' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="inbound" stroke="#00ff41" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                                <Area type="monotone" dataKey="outbound" stroke="#0096ff" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Frequency Spectrum (Existing) */}
                <div className="glass-panel p-4 rounded-lg border border-green-900 bg-black/40 flex flex-col relative overflow-hidden h-64">
                    <h3 className="text-lg font-orbitron mb-4 flex items-center gap-2 relative z-10">
                        <Radio size={18} className="text-yellow-500" /> RF Spectrum
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={freqData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#eab308', color: '#eab308', fontFamily: 'monospace' }}
                                />
                                <Bar dataKey="val" fill="#eab308">
                                    {freqData?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fillOpacity={0.4 + (entry.val / 200)} fill={entry.val > 80 ? '#ef4444' : '#eab308'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logs */}
                <div className="lg:col-span-2 glass-panel p-4 rounded-lg border border-green-900 bg-black/40">
                    <h3 className="text-lg font-orbitron mb-3 flex items-center gap-2">
                        <TerminalIcon size={18} /> System Event Logs
                    </h3>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2 font-mono text-xs">
                        {logs.map((log: LogEntry) => (
                            <div key={log.id} className="flex gap-3 p-2 bg-black/40 rounded border-l-2 border-green-500/20 hover:bg-green-500/5 hover:border-green-500 transition-all">
                                <span className="text-gray-500 shrink-0">{log.timestamp}</span>
                                <span className={`break-words ${log.type === 'warning' ? 'text-yellow-400' : log.type === 'success' ? 'text-green-400' : 'text-blue-300'}`}>
                                    {log.type.toUpperCase()}: {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Honeypot & Traffic Composition (Combined) */}
                <div className="space-y-6">
                    {/* Honeypot Stats */}
                    <div className="glass-panel p-4 rounded-lg flex flex-col border border-green-900 bg-black/40 h-48">
                        <h3 className="text-lg font-orbitron mb-3 flex items-center gap-2">
                            <Crosshair size={18} className="text-purple-500" /> Honeypot Hits
                        </h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={honeypotData || []} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="protocol" type="category" width={40} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#8b5cf6' }} />
                                    <Bar dataKey="attacks" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                                        {honeypotData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#ec4899'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Traffic Composition (NEW) */}
                    <div className="glass-panel p-4 rounded-lg flex flex-col border border-green-900 bg-black/40 h-48">
                        <h3 className="text-lg font-orbitron mb-3 flex items-center gap-2">
                            <Server size={18} className="text-orange-500" /> Packet Types
                        </h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={securityAnalytics.trafficComposition}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {securityAnalytics.trafficComposition.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#f97316', '#3b82f6', '#10b981', '#6366f1'][index % 4]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
    <div className={`glass-panel p-4 rounded-lg border border-${color}-900/30 bg-black/40 flex items-center gap-4 hover:border-${color}-500 transition-colors group`}>
        <div className={`p-3 rounded-full bg-${color}-900/20 text-${color}-500 group-hover:bg-${color}-500 group-hover:text-black transition-all`}>
            {icon}
        </div>
        <div>
            <div className="text-gray-500 text-xs uppercase tracking-wider font-mono">{label}</div>
            <div className={`text-2xl font-bold font-orbitron text-${color}-400 group-hover:text-white`}>{value}</div>
        </div>
    </div>
);

export default Dashboard;
