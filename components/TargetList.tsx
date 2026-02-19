import React, { useState } from 'react';
import { TargetProfile } from '../types';
import { Target, Skull, MapPin, DollarSign, X, Activity, AlertTriangle, ShieldAlert, Satellite, CheckCircle, Fingerprint } from 'lucide-react';
import { faker } from '@faker-js/faker';

// Realistic Data Generation
const REALISTIC_TARGETS: Partial<TargetProfile>[] = [
    {
        codename: "VIPER_ZHANG",
        realName: "Wei Zhang",
        nationality: "China",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300",
        bio: "Former MSS operative turned freelance cyber-mercenary. Specializes in industrial sabotage and stealing proprietary semiconductor blueprints.",
        riskLevel: "CRITICAL"
    },
    {
        codename: "GHOST_IVAN",
        realName: "Ivan Petrov",
        nationality: "Russia",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=300&h=300",
        bio: "Orchestrator of the 'Red October' banking trojan. Known for leaving zero forensic footprint. Suspected ties to organized crime syndicates.",
        riskLevel: "CRITICAL"
    },
    {
        codename: "SCARLET_WIDOW",
        realName: "Natasha Romanoff (Alias)",
        nationality: "Unknown",
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=300&h=300",
        bio: "Expert social engineer. Infiltrates high-security facilities physically to plant hardware backdoors. Highly dangerous and armed.",
        riskLevel: "HIGH"
    },
    {
        codename: "PHANTOM_X",
        realName: "Unknown",
        nationality: "International",
        avatarUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?fit=crop&w=300&h=300",
        bio: "Leader of the 'DarkSide' ransomware group. Responsible for crippling critical infrastructure across three continents.",
        riskLevel: "CRITICAL"
    },
    {
        codename: "EL_LOBO",
        realName: "Mateo Silva",
        nationality: "Mexico",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=300&h=300",
        bio: "Cartel cyber-enforcer. Manages encrypted comms and money laundering via cryptocurrency mixing services.",
        riskLevel: "HIGH"
    },
    {
        codename: "BLACK_LOTUS",
        realName: "Yuki Tanaka",
        nationality: "Japan",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=300&h=300",
        bio: "Rogue AI researcher. Developing autonomous malware swarms capable of self-replication and mutation.",
        riskLevel: "MODERATE"
    },
    {
        codename: "IRON_FIST",
        realName: "Malik Al-Sayed",
        nationality: "UAE",
        avatarUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?fit=crop&w=300&h=300",
        bio: "Arms dealer operating on the dark web. Facilitates sales of zero-day exploits to highest bidders.",
        riskLevel: "HIGH"
    },
    {
        codename: "NIGHTSHADE",
        realName: "Elena Fischer",
        nationality: "Germany",
        avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?fit=crop&w=300&h=300",
        bio: "Hacktivist leader. Targets government databases to leak classified information. Expert in cryptography.",
        riskLevel: "MODERATE"
    }
];

const generateTargets = (): TargetProfile[] => {
    faker.seed(123);
    const crimesList = [
        "Ransomware", "Identity Theft", "DDoS",
        "Espionage", "Trafficking", "Cryptojacking",
        "Zero-Day Exploits"
    ];

    return REALISTIC_TARGETS.map((t, i) => ({
        id: faker.string.uuid(),
        codename: t.codename!,
        realName: t.realName!,
        age: faker.number.int({ min: 25, max: 50 }),
        nationality: t.nationality!,
        crimes: faker.helpers.arrayElements(crimesList, { min: 2, max: 4 }),
        bounty: faker.number.int({ min: 100000, max: 5000000 }),
        currency: 'USD',
        riskLevel: t.riskLevel as 'CRITICAL' | 'HIGH' | 'MODERATE',
        status: i < 2 ? 'ACTIVE' : faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'CAPTURED', 'MIA']),
        lastSeen: `${faker.location.city()}, ${t.nationality === 'Unknown' ? faker.location.country() : t.nationality}`,
        avatarUrl: t.avatarUrl!,
        bio: t.bio!
    }));
};

const TargetList: React.FC = () => {
    const [targets] = useState<TargetProfile[]>(generateTargets());
    const [selectedTarget, setSelectedTarget] = useState<TargetProfile | null>(null);
    const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState<TargetProfile | null>(null);
    const [reportForm, setReportForm] = useState({ name: '', phone: '', email: '', details: '' });
    const [reportSuccess, setReportSuccess] = useState(false);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const handleTrack = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(trackedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setTrackedIds(newSet);
    };

    const handleReportSighting = (target: TargetProfile) => {
        setReportTarget(target);
        setShowReportModal(true);
        setReportSuccess(false);
        setReportForm({ name: '', phone: '', email: '', details: '' });
    };

    const submitReport = async () => {
        if (!reportForm.name) return;
        setReportSuccess(true);
        setTimeout(() => setShowReportModal(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-black">
            {/* Header */}
            <div className="p-4 border-b border-red-900/30 bg-[#0a0a0a] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-red-900/20 p-2 rounded-lg border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        <Fingerprint size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-orbitron text-white tracking-widest">WANTED LIST</h2>
                        <p className="text-[10px] text-red-500 font-mono tracking-widest">GLOBAL PRIORITY TARGETS // KILL OR CAPTURE</p>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-gray-500 font-mono">INTERPOL DATABASE: SYNCED</div>
                    <div className="text-green-500 font-bold text-xs">{targets.filter(t => t.status === 'ACTIVE').length} ACTIVE FUGITIVES</div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {targets.map(target => (
                        <div
                            key={target.id}
                            onClick={() => setSelectedTarget(target)}
                            className={`group relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer flex flex-row sm:flex-col ${target.status === 'CAPTURED'
                                    ? 'border-gray-800 bg-gray-900/40 grayscale opacity-70'
                                    : trackedIds.has(target.id)
                                        ? 'border-green-500 bg-green-950/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                                        : 'border-gray-800 bg-gray-900/40 hover:border-red-500/50 hover:bg-gray-900/80'
                                }`}
                        >
                            {/* Image Part */}
                            <div className="w-32 sm:w-full h-32 sm:h-48 relative shrink-0">
                                <img src={target.avatarUrl} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                {/* Status Badge */}
                                <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border backdrop-blur-md ${target.status === 'ACTIVE' ? 'bg-red-600/80 text-white border-red-500 animate-pulse' :
                                        target.status === 'CAPTURED' ? 'bg-green-600/80 text-white border-green-500' :
                                            'bg-yellow-600/80 text-white border-yellow-500'
                                    }`}>
                                    {target.status}
                                </div>
                            </div>

                            {/* Info Part */}
                            <div className="p-3 flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-orbitron font-bold text-white truncate text-sm sm:text-base">{target.codename}</h3>
                                    {target.riskLevel === 'CRITICAL' && <ShieldAlert size={14} className="text-red-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-gray-500 font-mono mb-2 truncate">{target.realName}</p>

                                <div className="mt-auto space-y-1 text-[10px] font-mono text-gray-400">
                                    <div className="flex justify-between">
                                        <span>BOUNTY</span>
                                        <span className="text-green-400 font-bold">{formatMoney(target.bounty)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ORIGIN</span>
                                        <span className="text-white truncate max-w-[80px] text-right">{target.nationality}</span>
                                    </div>
                                </div>

                                {/* Mobile/Quick Action */}
                                <button
                                    onClick={(e) => handleTrack(target.id, e)}
                                    className={`mt-3 w-full py-1.5 text-[10px] font-bold rounded border transition-colors flex items-center justify-center gap-1 ${trackedIds.has(target.id)
                                            ? 'bg-green-900/30 border-green-500/50 text-green-400'
                                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 group-hover:border-red-500/30 group-hover:text-red-400'
                                        }`}
                                >
                                    {trackedIds.has(target.id) ? <><Satellite size={12} className="animate-spin" /> TRACKING</> : 'VIEW DOSSIER'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Compact Modal */}
            {selectedTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0f0f0f] border border-red-900/50 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(220,38,38,0.15)] relative">

                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedTarget(null)}
                            className="absolute top-3 right-3 z-50 p-1.5 bg-black/50 text-gray-400 hover:text-white rounded-full border border-gray-700 hover:bg-red-900/50 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {/* Left: Visual Identity */}
                        <div className="w-full md:w-2/5 relative h-64 md:h-auto shrink-0">
                            <img src={selectedTarget.avatarUrl} alt={selectedTarget.codename} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent md:bg-gradient-to-r"></div>

                            <div className="absolute bottom-4 left-4 right-4">
                                <h2 className="text-2xl font-orbitron font-bold text-white mb-1 drop-shadow-lg">{selectedTarget.codename}</h2>
                                <p className="text-sm text-red-400 font-mono font-bold drop-shadow-md">{selectedTarget.realName}</p>
                            </div>
                        </div>

                        {/* Right: Intel Data */}
                        <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar">

                            {/* Key Stats Bar */}
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-800 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Risk Level</div>
                                    <div className={`font-bold text-sm ${selectedTarget.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500'}`}>{selectedTarget.riskLevel}</div>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-800 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Age</div>
                                    <div className="font-bold text-white text-sm">{selectedTarget.age}</div>
                                </div>
                                <div className="bg-gray-900/50 p-2 rounded border border-gray-800 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase">Origin</div>
                                    <div className="font-bold text-white text-sm truncate">{selectedTarget.nationality}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
                                        <Activity size={12} className="text-red-500" /> KNOWN OFFENSES
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedTarget.crimes.map((crime, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-950/30 border border-red-900/30 text-red-200 text-[10px] rounded">
                                                {crime}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-900/30 p-3 rounded border border-gray-800">
                                    <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
                                        <Skull size={12} /> BIO / INTEL
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed font-mono">
                                        {selectedTarget.bio}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between bg-green-950/10 p-3 rounded border border-green-900/30">
                                    <div className="text-xs text-green-700 font-mono">CURRENT BOUNTY</div>
                                    <div className="text-lg font-bold text-green-400 font-mono">{formatMoney(selectedTarget.bounty)}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex gap-3">
                                {selectedTarget.status === 'ACTIVE' && (
                                    <button
                                        onClick={(e) => handleTrack(selectedTarget.id, e)}
                                        className={`flex-1 py-2.5 rounded text-xs font-bold border flex items-center justify-center gap-2 transition-all ${trackedIds.has(selectedTarget.id)
                                                ? 'bg-green-600 hover:bg-green-500 border-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                                : 'bg-red-600 hover:bg-red-500 border-red-500 text-black shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                                            }`}
                                    >
                                        <Satellite size={16} className={trackedIds.has(selectedTarget.id) ? "animate-spin" : ""} />
                                        {trackedIds.has(selectedTarget.id) ? 'TRACKING SIGNAL ACTIVE' : 'INITIATE TRACKING'}
                                    </button>
                                )}
                                <button
                                    onClick={() => handleReportSighting(selectedTarget)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded border border-gray-700 transition-colors"
                                >
                                    <AlertTriangle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal - Simplified */}
            {showReportModal && reportTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
                    <div className="bg-gray-950 border border-yellow-600 rounded-lg w-full max-w-sm">
                        <div className="p-4 border-b border-yellow-900/30 flex justify-between items-center">
                            <h3 className="font-bold text-yellow-500">REPORT SIGHTING</h3>
                            <button onClick={() => setShowReportModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
                        </div>
                        <div className="p-5 text-center">
                            {reportSuccess ? (
                                <>
                                    <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                                    <p className="text-white font-bold">Report Filed</p>
                                    <p className="text-xs text-gray-500 mt-1">Thank you for your cooperation.</p>
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-400 text-left">Reporting target: <span className="text-white font-bold">{reportTarget.codename}</span></p>
                                    <input
                                        className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white focus:border-yellow-500 outline-none"
                                        placeholder="Location details..."
                                        value={reportForm.name}
                                        onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                                    />
                                    <button onClick={submitReport} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded text-sm mt-2">
                                        SEND ENCRYPTED TIP
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TargetList;
