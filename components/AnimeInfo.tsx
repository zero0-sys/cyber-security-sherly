import React, { useState } from 'react';
import { Search, Info, Star, Calendar, BookOpen, Tv, XCircle, Loader, ExternalLink } from 'lucide-react';

interface AnimeDetails {
    id: string;
    gid: string;
    type: string;
    name: string;
    precision: string;
    vintage?: string;
    plot?: string;
    image?: string;
    ratings?: string;
}

const AnimeInfo: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AnimeDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parseError, setParseError] = useState<boolean>(false);

    const searchAnime = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults([]);
        setParseError(false);

        try {
            // Using a CORS proxy might be needed in production, but trying direct first as requested.
            // If direct fails, we might need a workaround, but for now we follow the user's URL pattern.
            // Note: The user provided https://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=~[SEARCH]
            const url = `https://cdn.animenewsnetwork.com/encyclopedia/api.xml?title=~${encodeURIComponent(query)}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const textData = await response.text();

            // Parse XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(textData, "text/xml");

            if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
                setParseError(true);
                throw new Error("Failed to parse XML response");
            }

            const animeNodes = xmlDoc.getElementsByTagName("anime");
            const mangaNodes = xmlDoc.getElementsByTagName("manga");

            const combined = [...Array.from(animeNodes), ...Array.from(mangaNodes)];

            if (combined.length === 0) {
                // Try searching for warning/message?
                // Sometimes ANN returns <ann><warning>No results found</warning></ann>
                setError("No results found in the neural archives.");
                return;
            }

            const parsedResults: AnimeDetails[] = combined.map(node => {
                const infoNodes = node.getElementsByTagName("info");
                let img = '';
                let plot = '';
                let vintage = '';

                for (let i = 0; i < infoNodes.length; i++) {
                    const type = infoNodes[i].getAttribute("type");
                    if (type === "Picture") {
                        const src = infoNodes[i].getAttribute("src");
                        if (src) img = src;
                    }
                    else if (type === "Main title") {
                        // already got name from attribute
                    }
                    else if (type === "Plot Summary") {
                        plot = infoNodes[i].textContent || '';
                    }
                    else if (type === "Vintage") {
                        vintage = infoNodes[i].textContent || '';
                    }
                }

                // If image is relative or missing protocol
                if (img && !img.startsWith('http')) {
                    // ANN sometimes returns relative paths or full URLs? Usually they are full cdn urls.
                    // Checking just in case.
                }

                return {
                    id: node.getAttribute("id") || '',
                    gid: node.getAttribute("gid") || '',
                    type: node.tagName, // 'anime' or 'manga'
                    name: node.getAttribute("name") || 'Unknown Artifact',
                    precision: node.getAttribute("precision") || '',
                    vintage,
                    plot,
                    image: img
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
            <div className="p-6 border-b border-pink-900/30 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-900/20 rounded-lg flex items-center justify-center border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        <BookOpen className="text-pink-400 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                            ANIME ARCHIVE
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                            DATABASE ONLINE
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
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

            {/* Content Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-transparent relative z-10 custom-scrollbar-pink">

                {loading && (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader className="w-12 h-12 text-pink-500 animate-spin" />
                        <p className="text-pink-500 font-mono animate-pulse">DECODING NEURAL DATA...</p>
                    </div>
                )}
                {!loading && error && (
                    <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2 opacity-80">
                        <XCircle className="w-12 h-12 mb-2" />
                        <h3 className="text-xl font-bold font-orbitron">DATA RETRIEVAL FAILED</h3>
                        <p className="font-mono text-sm max-w-sm text-center">{error}</p>
                    </div>
                )}

                {!loading && !error && results.length === 0 && !query && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50">
                        <BookOpen className="w-24 h-24 stroke-1" />
                    </div>
                )}

                {!loading && !error && results.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {results.map((item) => (
                            <div key={item.id} className="bg-black/60 border border-gray-800 rounded-xl overflow-hidden hover:border-pink-500/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all duration-300 flex">
                                {/* Image Column */}
                                <div className="w-32 md:w-40 bg-gray-900 shrink-0 relative overflow-hidden group">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <Tv className="w-8 h-8 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-0 left-0 bg-pink-600 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
                                        {item.type}
                                    </div>
                                </div>

                                {/* Info Column */}
                                <div className="p-4 flex flex-col flex-1 overflow-hidden">
                                    <h3 className="text-lg font-bold text-pink-100 font-orbitron mb-1 truncate">{item.name}</h3>
                                    <p className="text-xs text-pink-400/80 mb-2 font-mono">{item.vintage}</p>

                                    <div className="flex-1 overflow-y-auto mb-3 custom-scrollbar-thin">
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            {item.plot || "No plot data available in current sector."}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-2 border-t border-gray-800 flex justify-between items-center">
                                        <span className="text-[10px] text-gray-500 font-mono">ID: {item.id}</span>
                                        <a
                                            href={`https://www.animenewsnetwork.com/encyclopedia/${item.type}.php?id=${item.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-pink-500 hover:text-pink-300 text-[10px] font-bold transition-colors"
                                        >
                                            ANN_LINK <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar-pink::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar-pink::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                }
                .custom-scrollbar-pink::-webkit-scrollbar-thumb {
                    background: rgba(236, 72, 153, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar-pink::-webkit-scrollbar-thumb:hover {
                    background: rgba(236, 72, 153, 0.6);
                }
                .custom-scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};

export default AnimeInfo;
