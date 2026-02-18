import React, { useState } from 'react';
import { Search, BookOpen, Tv, XCircle, Loader, X, Calendar, Tag } from 'lucide-react';

interface AnimeDetails {
    id: string;
    gid: string;
    type: string;
    name: string;
    precision: string;
    vintage?: string;
    plot?: string;
    image?: string;
    genres?: string[];
    themes?: string[];
    staff?: string[];
    altTitles?: string[];
    episodes?: string;
    rating?: string;
}

const AnimeInfo: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AnimeDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<AnimeDetails | null>(null);

    const searchAnime = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);
        setSelected(null);

        try {
            const url = `https://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=~${encodeURIComponent(query)}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const textData = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(textData, "text/xml");

            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error("Failed to parse XML response");
            }

            const animeNodes = xmlDoc.getElementsByTagName("anime");
            const mangaNodes = xmlDoc.getElementsByTagName("manga");
            const combined = [...Array.from(animeNodes), ...Array.from(mangaNodes)];

            if (combined.length === 0) {
                setError("No results found in the neural archives.");
                return;
            }

            const parsedResults: AnimeDetails[] = combined.map(node => {
                const infoNodes = node.getElementsByTagName("info");
                let img = '';
                let plot = '';
                let vintage = '';
                const genres: string[] = [];
                const themes: string[] = [];
                const staff: string[] = [];
                const altTitles: string[] = [];
                let episodes = '';
                let rating = '';

                for (let i = 0; i < infoNodes.length; i++) {
                    const type = infoNodes[i].getAttribute("type");
                    if (type === "Picture") {
                        const src = infoNodes[i].getAttribute("src");
                        if (src) img = src;
                    } else if (type === "Plot Summary") {
                        plot = infoNodes[i].textContent || '';
                    } else if (type === "Vintage") {
                        vintage = infoNodes[i].textContent || '';
                    } else if (type === "Genres") {
                        genres.push(infoNodes[i].textContent || '');
                    } else if (type === "Themes") {
                        themes.push(infoNodes[i].textContent || '');
                    } else if (type === "Number of episodes") {
                        episodes = infoNodes[i].textContent || '';
                    } else if (type === "Objectionable content") {
                        rating = infoNodes[i].textContent || '';
                    } else if (type === "Alternative title") {
                        altTitles.push(infoNodes[i].textContent || '');
                    } else if (type === "Director" || type === "Chief Director") {
                        staff.push(`Director: ${infoNodes[i].textContent || ''}`);
                    } else if (type === "Music") {
                        staff.push(`Music: ${infoNodes[i].textContent || ''}`);
                    }
                }

                return {
                    id: node.getAttribute("id") || '',
                    gid: node.getAttribute("gid") || '',
                    type: node.tagName,
                    name: node.getAttribute("name") || 'Unknown Artifact',
                    precision: node.getAttribute("precision") || '',
                    vintage, plot, image: img,
                    genres, themes, staff, altTitles, episodes, rating
                };
            });

            setResults(parsedResults);
        } catch (err: any) {
            console.error(err);
            setError("Connection interrupted. " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black text-white font-sans overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,0,20,0.2)_0%,black_100%)] pointer-events-none"></div>

            {/* Header */}
            <div className="p-4 md:p-6 border-b border-pink-900/30 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-900/20 rounded-lg flex items-center justify-center border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        <BookOpen className="text-pink-400 w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                            ANIME ARCHIVE
                        </h1>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                            DATABASE ONLINE
                        </div>
                    </div>
                </div>

                <form onSubmit={searchAnime} className="flex w-full md:w-auto gap-2">
                    <div className="relative group flex-1 md:w-80">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter designation (e.g. Naruto)..."
                            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all font-mono text-pink-100 placeholder-gray-600"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-pink-400 transition-colors" />
                    </div>
                    <button
                        type="submit"
                        className="bg-pink-900/30 border border-pink-500/50 text-pink-400 px-4 py-2 rounded-lg hover:bg-pink-500/20 hover:text-pink-300 transition-all font-bold text-sm tracking-wide"
                    >
                        SEARCH
                    </button>
                </form>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative z-10 flex">
                {/* Results List */}
                <div className={`${selected ? 'hidden md:block md:w-1/3 lg:w-1/4 border-r border-gray-800' : 'w-full'} overflow-y-auto p-4 custom-scrollbar-pink transition-all`}>
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader className="w-12 h-12 text-pink-500 animate-spin" />
                            <p className="text-pink-500 font-mono animate-pulse text-sm">DECODING NEURAL DATA...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2 opacity-80">
                            <XCircle className="w-10 h-10 mb-2" />
                            <h3 className="text-lg font-bold font-orbitron">DATA RETRIEVAL FAILED</h3>
                            <p className="font-mono text-xs max-w-sm text-center">{error}</p>
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50">
                            <BookOpen className="w-20 h-20 stroke-1" />
                            <p className="font-mono text-xs tracking-widest">ARCHIVE READY FOR QUERY</p>
                        </div>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <div className={`${selected ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}`}>
                            {results.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelected(item)}
                                    className={`w-full text-left rounded-lg overflow-hidden transition-all duration-300 border ${selected?.id === item.id
                                            ? 'border-pink-500 bg-pink-900/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                                            : 'border-gray-800 bg-black/60 hover:border-pink-500/40'
                                        } ${selected ? 'flex items-center gap-3 p-2' : 'flex'}`}
                                >
                                    {/* Thumbnail */}
                                    <div className={`${selected ? 'w-12 h-16 shrink-0 rounded overflow-hidden' : 'w-28 md:w-32 shrink-0'} bg-gray-900 relative overflow-hidden`}>
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                <Tv className="w-5 h-5 text-gray-700" />
                                            </div>
                                        )}
                                        {!selected && (
                                            <div className="absolute top-0 left-0 bg-pink-600 text-white text-[8px] font-bold px-1 py-0.5 uppercase">{item.type}</div>
                                        )}
                                    </div>

                                    {/* Brief Info */}
                                    <div className={`${selected ? 'flex-1 min-w-0' : 'p-3 flex-1'} overflow-hidden`}>
                                        <h3 className={`font-bold text-pink-100 truncate ${selected ? 'text-xs' : 'text-sm mb-1'}`}>{item.name}</h3>
                                        <p className={`text-pink-400/60 font-mono ${selected ? 'text-[9px]' : 'text-[10px] mb-2'}`}>{item.vintage || item.type.toUpperCase()}</p>
                                        {!selected && (
                                            <p className="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                                                {item.plot || "No plot data available."}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail Panel (Inline) */}
                {selected && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar-pink bg-[#050505]">
                        {/* Close / Back button (mobile) */}
                        <div className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-sm border-b border-gray-800 p-3 flex items-center justify-between">
                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-400 hover:text-pink-400 flex items-center gap-2 text-xs font-mono transition-colors"
                            >
                                <X size={14} /> CLOSE_PANEL
                            </button>
                            <span className="text-[10px] text-gray-600 font-mono">ID: {selected.id} | {selected.type.toUpperCase()}</span>
                        </div>

                        {/* Detail Content */}
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Cover Image */}
                                <div className="w-full md:w-48 lg:w-56 shrink-0">
                                    {selected.image ? (
                                        <img
                                            src={selected.image}
                                            alt={selected.name}
                                            className="w-full rounded-xl border border-gray-800 shadow-2xl"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                                            <Tv className="w-16 h-16 text-gray-700" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="inline-block bg-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2">
                                            {selected.type}
                                        </div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white font-orbitron">{selected.name}</h2>
                                        {selected.altTitles && selected.altTitles.length > 0 && (
                                            <p className="text-sm text-gray-400 mt-1">{selected.altTitles.join(' / ')}</p>
                                        )}
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-3 text-xs font-mono">
                                        {selected.vintage && (
                                            <span className="flex items-center gap-1 text-pink-400 bg-pink-900/20 px-2 py-1 rounded border border-pink-500/20">
                                                <Calendar size={12} /> {selected.vintage}
                                            </span>
                                        )}
                                        {selected.episodes && (
                                            <span className="flex items-center gap-1 text-cyan-400 bg-cyan-900/20 px-2 py-1 rounded border border-cyan-500/20">
                                                <Tv size={12} /> {selected.episodes} eps
                                            </span>
                                        )}
                                        {selected.rating && (
                                            <span className="flex items-center gap-1 text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded border border-yellow-500/20">
                                                <Tag size={12} /> {selected.rating}
                                            </span>
                                        )}
                                    </div>

                                    {/* Genres & Themes */}
                                    {(selected.genres?.length || selected.themes?.length) ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {selected.genres?.map((g, i) => (
                                                <span key={`g-${i}`} className="text-[10px] bg-pink-900/30 text-pink-300 px-2 py-1 rounded-full border border-pink-500/20">{g}</span>
                                            ))}
                                            {selected.themes?.map((t, i) => (
                                                <span key={`t-${i}`} className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20">{t}</span>
                                            ))}
                                        </div>
                                    ) : null}

                                    {/* Staff */}
                                    {selected.staff && selected.staff.length > 0 && (
                                        <div className="text-xs text-gray-400 space-y-1">
                                            {selected.staff.map((s, i) => (
                                                <p key={i} className="font-mono">{s}</p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Synopsis */}
                                    <div className="pt-4 border-t border-gray-800">
                                        <h3 className="text-sm font-bold text-pink-400 mb-3 font-orbitron">TRANSMISSION DATA</h3>
                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                            {selected.plot || "No plot data decrypted for this artifact."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar-pink::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-pink::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.3); }
                .custom-scrollbar-pink::-webkit-scrollbar-thumb { background: rgba(236, 72, 153, 0.3); border-radius: 3px; }
                .custom-scrollbar-pink::-webkit-scrollbar-thumb:hover { background: rgba(236, 72, 153, 0.6); }
                .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default AnimeInfo;
