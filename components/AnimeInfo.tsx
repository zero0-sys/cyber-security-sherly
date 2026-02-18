import React, { useState } from 'react';
import { Search, BookOpen, Tv, XCircle, Loader, X, Calendar, Tag, ExternalLink, Users, Music, Film, Star } from 'lucide-react';

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
    staff?: { role: string; name: string }[];
    cast?: { role: string; name: string }[];
    altTitles?: string[];
    episodes?: string;
    rating?: string;
    openingThemes?: string[];
    endingThemes?: string[];
    episodeList?: { number: string; title: string }[];
    ratings?: { bayesian: string; count: string };
    relatedPrev?: string[];
    relatedNext?: string[];
}

// Parse search results (basic info)
function parseSearchResults(xmlDoc: Document): AnimeDetails[] {
    const animeNodes = xmlDoc.getElementsByTagName("anime");
    const mangaNodes = xmlDoc.getElementsByTagName("manga");
    const combined = [...Array.from(animeNodes), ...Array.from(mangaNodes)];

    return combined.map(node => {
        const infoNodes = node.getElementsByTagName("info");
        let img = '', plot = '', vintage = '';
        const genres: string[] = [];

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
            }
        }

        return {
            id: node.getAttribute("id") || '',
            gid: node.getAttribute("gid") || '',
            type: node.tagName,
            name: node.getAttribute("name") || 'Unknown',
            precision: node.getAttribute("precision") || '',
            vintage, plot, image: img, genres
        };
    });
}

// Parse full detail response from api.xml?anime={id} or api.xml?manga={id}
function parseDetailResult(xmlDoc: Document): AnimeDetails | null {
    const animeNodes = xmlDoc.getElementsByTagName("anime");
    const mangaNodes = xmlDoc.getElementsByTagName("manga");
    const combined = [...Array.from(animeNodes), ...Array.from(mangaNodes)];
    if (combined.length === 0) return null;

    const node = combined[0];
    const infoNodes = node.getElementsByTagName("info");
    let img = '', plot = '', vintage = '', episodes = '', rating = '';
    const genres: string[] = [];
    const themes: string[] = [];
    const staff: { role: string; name: string }[] = [];
    const cast: { role: string; name: string }[] = [];
    const altTitles: string[] = [];
    const openingThemes: string[] = [];
    const endingThemes: string[] = [];

    for (let i = 0; i < infoNodes.length; i++) {
        const type = infoNodes[i].getAttribute("type");
        const text = infoNodes[i].textContent || '';
        if (type === "Picture") {
            const src = infoNodes[i].getAttribute("src");
            if (src) img = src;
        } else if (type === "Plot Summary") {
            plot = text;
        } else if (type === "Vintage") {
            vintage = text;
        } else if (type === "Genres") {
            genres.push(text);
        } else if (type === "Themes") {
            themes.push(text);
        } else if (type === "Number of episodes") {
            episodes = text;
        } else if (type === "Objectionable content") {
            rating = text;
        } else if (type === "Alternative title") {
            altTitles.push(text);
        } else if (type === "Opening Theme") {
            openingThemes.push(text);
        } else if (type === "Ending Theme") {
            endingThemes.push(text);
        } else if (
            type === "Director" || type === "Chief Director" || type === "Music" ||
            type === "Original creator" || type === "Character Design" || type === "Animation Director" ||
            type === "Art Director" || type === "Series Composition" || type === "Screenplay" ||
            type === "Sound Director" || type === "Producer"
        ) {
            staff.push({ role: type, name: text });
        }
    }

    // Parse cast (voice actors)
    const castNodes = node.getElementsByTagName("cast");
    for (let i = 0; i < castNodes.length; i++) {
        const role = castNodes[i].getElementsByTagName("role");
        const person = castNodes[i].getElementsByTagName("person");
        if (role.length > 0 && person.length > 0) {
            cast.push({
                role: role[0].textContent || '',
                name: person[0].textContent || ''
            });
        }
    }

    // Parse episodes
    const epList: { number: string; title: string }[] = [];
    const episodeNodes = node.getElementsByTagName("episode");
    for (let i = 0; i < episodeNodes.length; i++) {
        const num = episodeNodes[i].getAttribute("num") || '';
        const titleNode = episodeNodes[i].getElementsByTagName("title");
        let title = '';
        for (let j = 0; j < titleNode.length; j++) {
            if (titleNode[j].getAttribute("lang") === "EN") {
                title = titleNode[j].textContent || '';
                break;
            }
        }
        if (!title && titleNode.length > 0) title = titleNode[0].textContent || '';
        epList.push({ number: num, title });
    }

    // Parse ratings
    const ratingNodes = node.getElementsByTagName("ratings");
    let ratings: { bayesian: string; count: string } | undefined;
    if (ratingNodes.length > 0) {
        ratings = {
            bayesian: ratingNodes[0].getAttribute("bayesian_score") || '',
            count: ratingNodes[0].getAttribute("nb_votes") || ''
        };
    }

    return {
        id: node.getAttribute("id") || '',
        gid: node.getAttribute("gid") || '',
        type: node.tagName,
        name: node.getAttribute("name") || 'Unknown',
        precision: node.getAttribute("precision") || '',
        vintage, plot, image: img,
        genres, themes, staff, cast, altTitles, episodes, rating,
        openingThemes, endingThemes,
        episodeList: epList,
        ratings
    };
}

const AnimeInfo: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AnimeDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<AnimeDetails | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<'info' | 'episodes' | 'cast' | 'staff'>('info');

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

            const parsedResults = parseSearchResults(xmlDoc);
            if (parsedResults.length === 0) {
                setError("No results found in the neural archives.");
                return;
            }

            setResults(parsedResults);
        } catch (err: any) {
            console.error(err);
            setError("Connection interrupted. " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    // Fetch full detail using api.xml?anime={id} or api.xml?manga={id}
    const fetchDetail = async (item: AnimeDetails) => {
        setDetailLoading(true);
        setDetailTab('info');
        setSelected(item); // Show basic info immediately

        try {
            const param = item.type === 'manga' ? 'manga' : 'anime';
            const url = `https://cdn.animenewsnetwork.com/encyclopedia/api.xml?${param}=${item.id}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Detail API Error: ${response.status}`);

            const textData = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(textData, "text/xml");

            const detail = parseDetailResult(xmlDoc);
            if (detail) {
                setSelected(detail);
            }
        } catch (err: any) {
            console.error("Failed to fetch detail:", err);
            // Keep the basic info from search
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black text-white font-sans overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,0,20,0.2)_0%,black_100%)] pointer-events-none"></div>

            {/* Header */}
            <div className="p-3 md:p-4 border-b border-pink-900/30 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-center gap-3 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-pink-900/20 rounded-lg flex items-center justify-center border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        <BookOpen className="text-pink-400 w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">
                            ANIME NEWS
                        </h1>
                        <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                            ANN ENCYCLOPEDIA API
                        </div>
                    </div>
                </div>

                <form onSubmit={searchAnime} className="flex w-full md:w-auto gap-2">
                    <div className="relative group flex-1 md:w-72">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search anime/manga..."
                            className="w-full bg-black border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all font-mono text-pink-100 placeholder-gray-600"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 group-focus-within:text-pink-400 transition-colors" />
                    </div>
                    <button
                        type="submit"
                        className="bg-pink-900/30 border border-pink-500/50 text-pink-400 px-4 py-2 rounded-lg hover:bg-pink-500/20 hover:text-pink-300 transition-all font-bold text-sm"
                    >
                        SEARCH
                    </button>
                </form>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative z-10 flex">
                {/* Results List */}
                <div className={`${selected ? 'hidden md:block md:w-1/3 lg:w-1/4 border-r border-gray-800' : 'w-full'} overflow-y-auto p-3 custom-scrollbar-pink transition-all`}>
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader className="w-10 h-10 text-pink-500 animate-spin" />
                            <p className="text-pink-500 font-mono animate-pulse text-sm">QUERYING ANN DATABASE...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2 opacity-80">
                            <XCircle className="w-8 h-8 mb-2" />
                            <h3 className="text-base font-bold font-orbitron">DATA RETRIEVAL FAILED</h3>
                            <p className="font-mono text-xs max-w-sm text-center">{error}</p>
                        </div>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 opacity-50">
                            <BookOpen className="w-16 h-16 stroke-1" />
                            <p className="font-mono text-xs tracking-widest">SEARCH ANIME NEWS NETWORK</p>
                        </div>
                    )}

                    {!loading && !error && results.length > 0 && (
                        <div className={`${selected ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}`}>
                            {results.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => fetchDetail(item)}
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

                {/* Detail Panel */}
                {selected && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar-pink bg-[#050505]">
                        {/* Close / Back */}
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
                        <div className="p-4 md:p-6">
                            <div className="flex flex-col md:flex-row gap-5">
                                {/* Cover Image */}
                                <div className="w-full md:w-44 lg:w-52 shrink-0 space-y-3">
                                    {selected.image ? (
                                        <img
                                            src={selected.image}
                                            alt={selected.name}
                                            className="w-full rounded-xl border border-gray-800 shadow-2xl"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full aspect-[2/3] bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                                            <Tv className="w-14 h-14 text-gray-700" />
                                        </div>
                                    )}

                                    {/* ANN Link (Terms of Service requirement) */}
                                    <a
                                        href={`https://www.animenewsnetwork.com/encyclopedia/${selected.type}.php?id=${selected.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2 bg-pink-900/30 border border-pink-500/30 text-pink-400 rounded-lg font-mono text-xs flex items-center justify-center gap-2 hover:bg-pink-900/50 transition-all"
                                    >
                                        <ExternalLink size={12} /> View on ANN
                                    </a>

                                    {/* Ratings */}
                                    {selected.ratings && (
                                        <div className="bg-gray-800/40 p-3 rounded-lg border border-gray-700 text-center">
                                            <div className="flex items-center justify-center gap-1.5 mb-1">
                                                <Star size={16} className="text-yellow-400" fill="currentColor" />
                                                <span className="text-xl font-bold text-white">{parseFloat(selected.ratings.bayesian).toFixed(2)}</span>
                                            </div>
                                            <span className="text-[9px] text-gray-500 font-mono">{selected.ratings.count} VOTES</span>
                                        </div>
                                    )}

                                    {/* Quick Stats */}
                                    <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700 space-y-2 font-mono text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type:</span>
                                            <span className="text-white uppercase">{selected.type}</span>
                                        </div>
                                        {selected.episodes && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Episodes:</span>
                                                <span className="text-white">{selected.episodes}</span>
                                            </div>
                                        )}
                                        {selected.vintage && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Vintage:</span>
                                                <span className="text-white text-right text-[10px]">{selected.vintage}</span>
                                            </div>
                                        )}
                                        {selected.rating && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Rating:</span>
                                                <span className="text-white">{selected.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Info */}
                                <div className="flex-1 space-y-4 min-w-0">
                                    <div>
                                        <div className="inline-block bg-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-2">
                                            {selected.type}
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-bold text-white font-orbitron">{selected.name}</h2>
                                        {selected.altTitles && selected.altTitles.length > 0 && (
                                            <p className="text-xs text-gray-400 mt-1">{selected.altTitles.slice(0, 3).join(' / ')}</p>
                                        )}
                                    </div>

                                    {/* Genres & Themes */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {selected.genres?.map((g, i) => (
                                            <span key={`g-${i}`} className="text-[10px] bg-pink-900/30 text-pink-300 px-2 py-1 rounded-full border border-pink-500/20">{g}</span>
                                        ))}
                                        {selected.themes?.map((t, i) => (
                                            <span key={`t-${i}`} className="text-[10px] bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20">{t}</span>
                                        ))}
                                    </div>

                                    {/* Detail Tabs */}
                                    <div className="flex gap-1 border-b border-gray-700 text-xs overflow-x-auto">
                                        <button
                                            onClick={() => setDetailTab('info')}
                                            className={`px-3 py-2 font-mono border-b-2 transition-all whitespace-nowrap ${detailTab === 'info' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                        >
                                            SYNOPSIS
                                        </button>
                                        {selected.episodeList && selected.episodeList.length > 0 && (
                                            <button
                                                onClick={() => setDetailTab('episodes')}
                                                className={`px-3 py-2 font-mono border-b-2 transition-all whitespace-nowrap flex items-center gap-1 ${detailTab === 'episodes' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Film size={12} /> EPISODES ({selected.episodeList.length})
                                            </button>
                                        )}
                                        {selected.cast && selected.cast.length > 0 && (
                                            <button
                                                onClick={() => setDetailTab('cast')}
                                                className={`px-3 py-2 font-mono border-b-2 transition-all whitespace-nowrap flex items-center gap-1 ${detailTab === 'cast' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Users size={12} /> CAST ({selected.cast.length})
                                            </button>
                                        )}
                                        {selected.staff && selected.staff.length > 0 && (
                                            <button
                                                onClick={() => setDetailTab('staff')}
                                                className={`px-3 py-2 font-mono border-b-2 transition-all whitespace-nowrap flex items-center gap-1 ${detailTab === 'staff' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Users size={12} /> STAFF ({selected.staff.length})
                                            </button>
                                        )}
                                    </div>

                                    {/* Loading indicator for detail fetch */}
                                    {detailLoading && (
                                        <div className="flex items-center gap-2 text-pink-500 font-mono text-xs p-2">
                                            <Loader size={14} className="animate-spin" />
                                            FETCHING FULL DATA FROM ANN...
                                        </div>
                                    )}

                                    {/* Tab Content */}
                                    <div className="min-h-[150px]">
                                        {/* Synopsis Tab */}
                                        {detailTab === 'info' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-pink-400 mb-2 font-orbitron">TRANSMISSION DATA</h3>
                                                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                                        {selected.plot || "No plot data available."}
                                                    </p>
                                                </div>

                                                {/* Opening/Ending Themes */}
                                                {(selected.openingThemes?.length || selected.endingThemes?.length) ? (
                                                    <div className="pt-3 border-t border-gray-800">
                                                        <h3 className="text-xs font-bold text-cyan-400 mb-2 font-orbitron flex items-center gap-1.5">
                                                            <Music size={12} /> THEME SONGS
                                                        </h3>
                                                        {selected.openingThemes && selected.openingThemes.length > 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-[10px] text-gray-500 font-mono mb-1">OPENING:</p>
                                                                {selected.openingThemes.map((t, i) => (
                                                                    <p key={i} className="text-xs text-gray-300 pl-2 border-l border-cyan-900 mb-1">{t}</p>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {selected.endingThemes && selected.endingThemes.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 font-mono mb-1">ENDING:</p>
                                                                {selected.endingThemes.map((t, i) => (
                                                                    <p key={i} className="text-xs text-gray-300 pl-2 border-l border-purple-900 mb-1">{t}</p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}

                                        {/* Episodes Tab */}
                                        {detailTab === 'episodes' && selected.episodeList && (
                                            <div className="space-y-1">
                                                {selected.episodeList.map((ep, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-2.5 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-pink-500/20 transition-all"
                                                    >
                                                        <div className="w-9 h-9 bg-pink-900/30 rounded flex items-center justify-center shrink-0 border border-pink-500/20">
                                                            <span className="text-[10px] font-mono font-bold text-pink-400">{ep.number}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-bold text-white truncate">{ep.title || `Episode ${ep.number}`}</h4>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Cast Tab */}
                                        {detailTab === 'cast' && selected.cast && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {selected.cast.map((c, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded border border-gray-700/30">
                                                        <div className="w-7 h-7 bg-purple-900/30 rounded flex items-center justify-center shrink-0 border border-purple-500/20">
                                                            <Users size={10} className="text-purple-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-white truncate">{c.name}</p>
                                                            <p className="text-[9px] text-gray-500 font-mono truncate">as {c.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Staff Tab */}
                                        {detailTab === 'staff' && selected.staff && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {selected.staff.map((s, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-800/30 rounded border border-gray-700/30">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-white truncate">{s.name}</p>
                                                            <p className="text-[9px] text-pink-400 font-mono">{s.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Source Credit */}
                                    <div className="pt-3 border-t border-gray-800 text-[9px] text-gray-600 font-mono">
                                        Data source: Anime News Network Encyclopedia API
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
