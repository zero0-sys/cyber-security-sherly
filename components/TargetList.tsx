
import React, { useState } from 'react';
import { TargetProfile } from '../types';
import { Target, Skull, MapPin, DollarSign, X, Activity, AlertTriangle, ShieldAlert, Satellite } from 'lucide-react';
import { faker } from '@faker-js/faker';

// Generate Static Mock Data
const generateTargets = (): TargetProfile[] => {
    faker.seed(42);
    const crimesList = [
        "Ransomware Deployment", "Identity Theft", "DDoS Orchestration", 
        "Corporate Espionage", "Dark Web Arms Trafficking", "Cryptojacking",
        "State-Sponsored Hacking", "Zero-Day Exploitation"
    ];

    return Array.from({ length: 12 }, (_, i) => ({
        id: faker.string.uuid(),
        codename: faker.internet.username().toUpperCase(),
        realName: faker.person.fullName(),
        age: faker.number.int({ min: 21, max: 55 }),
        nationality: faker.location.country(),
        crimes: faker.helpers.arrayElements(crimesList, { min: 1, max: 3 }),
        bounty: faker.number.int({ min: 50000, max: 5000000 }),
        currency: 'USD',
        riskLevel: faker.helpers.arrayElement(['CRITICAL', 'HIGH', 'MODERATE']),
        status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'CAPTURED', 'MIA']),
        lastSeen: `${faker.location.city()}, ${faker.location.countryCode()}`,
        avatarUrl: `https://robohash.org/${i}?set=set1&bgset=bg1`,
        bio: faker.lorem.paragraph()
    }));
};

const TargetList: React.FC = () => {
  const [targets] = useState<TargetProfile[]>(generateTargets());
  const [selectedTarget, setSelectedTarget] = useState<TargetProfile | null>(null);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleTrack = (id: string) => {
      const newSet = new Set(trackedIds);
      newSet.add(id);
      setTrackedIds(newSet);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-green-900 bg-black/40 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <div className="bg-red-900/20 p-2 rounded border border-red-500 animate-pulse text-red-500">
                 <Target size={24} />
             </div>
             <div>
                 <h2 className="text-xl font-orbitron text-red-500 tracking-widest">WANTED LIST</h2>
                 <p className="text-xs text-red-400/60 font-mono">GLOBAL PRIORITY TARGETS - KILL ON SIGHT / CAPTURE</p>
             </div>
         </div>
         <div className="text-right hidden md:block">
             <div className="text-xs text-gray-500 font-mono">DATABASE SYNCED</div>
             <div className="text-green-500 font-bold">{targets.filter(t => t.status === 'ACTIVE').length} ACTIVE TARGETS</div>
         </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-black/80">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {targets.map(target => (
                  <div 
                    key={target.id} 
                    onClick={() => setSelectedTarget(target)}
                    className={`glass-panel p-4 rounded border group cursor-pointer transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col ${
                        target.status === 'CAPTURED' 
                        ? 'border-gray-800 bg-gray-900/50 grayscale' 
                        : trackedIds.has(target.id)
                            ? 'border-green-500 bg-green-900/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                            : 'border-red-900/50 bg-black/60 hover:border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                    }`}
                  >
                      {/* Status Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded border ${
                          target.status === 'ACTIVE' ? 'bg-red-600 text-white border-red-400 animate-pulse' :
                          target.status === 'CAPTURED' ? 'bg-green-600 text-white border-green-400' :
                          'bg-yellow-600 text-black border-yellow-400'
                      }`}>
                          {target.status}
                      </div>

                      {/* Tracking Indicator on Card */}
                      {trackedIds.has(target.id) && (
                          <div className="absolute top-2 left-2 text-green-500 animate-pulse">
                              <Satellite size={16} />
                          </div>
                      )}

                      {/* Avatar */}
                      <div className={`w-24 h-24 mx-auto rounded-full border-2 overflow-hidden mb-4 transition-colors bg-gray-900 ${
                          trackedIds.has(target.id) ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'border-red-900/50 group-hover:border-red-500'
                      }`}>
                          <img src={target.avatarUrl} alt={target.codename} className="w-full h-full object-cover" />
                      </div>

                      {/* Info */}
                      <div className="text-center mb-4">
                          <h3 className="text-lg font-orbitron font-bold text-white">{target.codename}</h3>
                          <p className="text-xs text-gray-500 font-mono">{target.realName}</p>
                      </div>

                      <div className="space-y-2 text-xs font-mono text-gray-400 flex-1">
                          <div className="flex justify-between border-b border-gray-800 pb-1">
                              <span>RISK LEVEL:</span>
                              <span className={target.riskLevel === 'CRITICAL' ? 'text-red-500 font-bold' : 'text-yellow-500'}>{target.riskLevel}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-800 pb-1">
                              <span>BOUNTY:</span>
                              <span className="text-green-400 font-bold">{formatMoney(target.bounty)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>NATIONALITY:</span>
                              <span className="text-white">{target.nationality}</span>
                          </div>
                      </div>

                      {/* Footer Action */}
                      <div className={`mt-4 pt-3 border-t text-center text-xs font-bold transition-opacity ${
                          trackedIds.has(target.id) ? 'border-green-900 text-green-500' : 'border-gray-800 text-red-500 opacity-0 group-hover:opacity-100'
                      }`}>
                          {trackedIds.has(target.id) ? 'TRACKING ACTIVE' : 'VIEW FULL PROFILE >>'}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Detail Modal */}
      {selectedTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
              <div className={`bg-gray-950 border rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row shadow-[0_0_50px_rgba(220,38,38,0.3)] ${
                  trackedIds.has(selectedTarget.id) ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.2)]' : 'border-red-500'
              }`}>
                  <button 
                    onClick={() => setSelectedTarget(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white z-50 bg-black/50 p-1 rounded-full border border-gray-700 hover:bg-red-900/50 transition-colors"
                  >
                      <X size={20} />
                  </button>

                  {/* Left Column: Image & Stats */}
                  <div className="w-full md:w-1/3 bg-red-950/10 p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-red-900/30 relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                      
                      <div className={`w-40 h-40 rounded-full border-4 overflow-hidden mb-6 z-10 bg-black ${
                          trackedIds.has(selectedTarget.id) ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]'
                      }`}>
                          <img src={selectedTarget.avatarUrl} alt={selectedTarget.codename} className="w-full h-full object-cover" />
                      </div>

                      <h2 className="text-2xl font-orbitron font-bold text-white text-center mb-1 z-10 break-words w-full">{selectedTarget.codename}</h2>
                      <p className="text-sm text-red-400 font-mono mb-6 z-10">{selectedTarget.realName}</p>

                      <div className="w-full space-y-3 font-mono text-sm z-10">
                          <div className="bg-black/50 p-3 rounded border border-red-900/30 flex justify-between items-center">
                              <span className="text-gray-400">STATUS</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  selectedTarget.status === 'ACTIVE' ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'
                              }`}>{selectedTarget.status}</span>
                          </div>
                          <div className="bg-black/50 p-3 rounded border border-red-900/30">
                              <div className="text-gray-400 text-xs mb-1">TOTAL BOUNTY</div>
                              <div className="text-xl text-green-400 font-bold flex items-center gap-2">
                                  <DollarSign size={16} /> {formatMoney(selectedTarget.bounty)}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="w-full md:w-2/3 p-6 md:p-8 space-y-6 bg-gray-950">
                      <div className="flex items-center gap-2 text-red-500 border-b border-red-900/50 pb-2 pr-8">
                          <ShieldAlert size={20} />
                          <h3 className="font-orbitron font-bold text-lg">CRIMINAL DOSSIER</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                          <div className="bg-gray-900/30 p-2 rounded">
                              <span className="text-gray-500 block text-[10px] uppercase">Age</span>
                              <span className="text-white">{selectedTarget.age}</span>
                          </div>
                          <div className="bg-gray-900/30 p-2 rounded">
                              <span className="text-gray-500 block text-[10px] uppercase">Nationality</span>
                              <span className="text-white">{selectedTarget.nationality}</span>
                          </div>
                          <div className="bg-gray-900/30 p-2 rounded col-span-2 sm:col-span-1">
                              <span className="text-gray-500 block text-[10px] uppercase flex items-center gap-1"><MapPin size={10}/> Last Known Location</span>
                              <span className="text-white truncate block" title={selectedTarget.lastSeen}>{selectedTarget.lastSeen}</span>
                          </div>
                          <div className="bg-gray-900/30 p-2 rounded col-span-2 sm:col-span-1">
                              <span className="text-gray-500 block text-[10px] uppercase">Risk Class</span>
                              <span className="text-red-400 font-bold">{selectedTarget.riskLevel}</span>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-gray-500 text-xs font-bold mb-2 flex items-center gap-2"><Activity size={12}/> KNOWN OFFENSES</h4>
                          <div className="flex flex-wrap gap-2">
                              {selectedTarget.crimes.map((crime, i) => (
                                  <span key={i} className="px-3 py-1 bg-red-900/20 border border-red-900/50 text-red-300 text-xs rounded-full">
                                      {crime}
                                  </span>
                              ))}
                          </div>
                      </div>

                      <div className="bg-gray-900/50 p-4 rounded border border-gray-800">
                          <h4 className="text-gray-500 text-xs font-bold mb-2 flex items-center gap-2"><Skull size={12}/> INTEL BRIEF</h4>
                          <p className="text-gray-300 text-sm leading-relaxed font-mono break-words whitespace-pre-wrap">
                              {selectedTarget.bio}
                          </p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-800">
                          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded border border-gray-600 transition-colors">
                              EXPORT PDF
                          </button>
                          {selectedTarget.status === 'ACTIVE' && (
                              trackedIds.has(selectedTarget.id) ? (
                                <button className="px-4 py-2 bg-green-900/30 border border-green-500 text-green-400 text-xs font-bold rounded flex items-center gap-2 cursor-default animate-pulse">
                                    <Satellite size={14} className="animate-spin" /> TRACKING SIGNAL ACTIVE
                                </button>
                              ) : (
                                <button 
                                    onClick={() => handleTrack(selectedTarget.id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-black text-xs font-bold rounded flex items-center gap-2 transition-colors"
                                >
                                    <Target size={14} /> INITIATE TRACKING
                                </button>
                              )
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TargetList;
