import React, { useState, useEffect } from 'react';
import { Search, Play, ArrowLeft, Tv, AlertCircle, ChevronLeft, ChevronRight, Star, Calendar, Clock, List, Film, X } from 'lucide-react';

// Jikan API Types
interface JikanImage {
    image_url: string;
    large_image_url: string;
}

interface JikanImages {
    jpg: JikanImage;
    webp: JikanImage;
}

interface JikanTrailer {
    youtube_id: string;
    url: string;
    embed_url: string;
    images: {
        image_url: string;
        small_image_url: string;
        medium_image_url: string;
        large_image_url: string;
        maximum_image_url: string;
    }
}

interface JikanAnime {
    mal_id: number;
    url: string;
    images: JikanImages;
    trailer: JikanTrailer;
    title: string;
    title_english: string;
    title_japanese: string;
    type: string;
    source: string;
    episodes: number;
    status: string;
    airing: boolean;
    duration: string;
    rating: string;
    score: number;
    scored_by: number;
    rank: number;
    popularity: number;
    members: number;
    favorites: number;
    synopsis: string;
    season: string;
    year: number;
    studios: { name: string }[];
    genres: { name: string }[];
}

interface JikanEpisode {
    mal_id: number;
    title: string;
    title_japanese: string;
    title_romanji: string;
    aired: string;
    filler: boolean;
    recap: boolean;
    url: string;
}

interface JikanPromo {
    title: string;
    trailer: {
        youtube_id: string;
        url: string;
        embed_url: string;
        images: { image_url: string; medium_image_url: string; large_image_url: string };
    };
}

const Anime: React.FC = () => {
    const [view, setView] = useState<'list' | 'detail' | 'watch'>('list');
    const [query, setQuery] = useState('');
    const [animeList, setAnimeList] = useState<JikanAnime[]>([]);
    const [selectedAnime, setSelectedAnime] = useState<JikanAnime | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);

    // Episodes & Videos state
    const [episodes, setEpisodes] = useState<JikanEpisode[]>([]);
    const [promos, setPromos] = useState<JikanPromo[]>([]);
    const [epsPage, setEpsPage] = useState(1);
    const [epsHasNext, setEpsHasNext] = useState(false);
    const [epsLoading, setEpsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'episodes' | 'videos'>('info');
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [playingTitle, setPlayingTitle] = useState<string>('');

    const DEFAULT_API_URL = 'https://api.jikan.moe/v4/top/anime?filter=bypopularity&sfw';

    const fetchAnime = async (pageNum = 1, searchQuery = '') => {
        setLoading(true);
        setError('');
        try {
            let url = '';
            if (searchQuery) {
                url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&sfw`;
            } else {
                url = `${DEFAULT_API_URL}&page=${pageNum}`;
            }

            const res = await fetch(url);
            if (res.status === 429) throw new Error('Rate limit exceeded. Please wait a moment.');
            if (!res.ok) throw new Error(`Failed to fetch anime: ${res.status}`);

            const data = await res.json();
            setAnimeList(data.data);
            setPage(data.pagination.current_page);
            setHasNextPage(data.pagination.has_next_page);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEpisodes = async (malId: number, pageNum = 1) => {
        setEpsLoading(true);
        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=${pageNum}`);
            if (res.status === 429) {
                // Rate limited, wait and retry
                await new Promise(r => setTimeout(r, 1500));
                const retry = await fetch(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=${pageNum}`);
                const data = await retry.json();
                setEpisodes(data.data || []);
                setEpsPage(data.pagination?.current_page || 1);
                setEpsHasNext(data.pagination?.has_next_page || false);
                return;
            }
            if (!res.ok) return;

            const data = await res.json();
            setEpisodes(data.data || []);
            setEpsPage(data.pagination?.current_page || 1);
            setEpsHasNext(data.pagination?.has_next_page || false);
        } catch { /* silent */ } finally {
            setEpsLoading(false);
        }
    };

    const fetchVideos = async (malId: number) => {
        try {
            // Delay slightly to avoid rate limit after episodes fetch
            await new Promise(r => setTimeout(r, 500));
            const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}/videos`);
            if (!res.ok) return;
            const data = await res.json();
            setPromos(data.data?.promo || []);
        } catch { /* silent */ }
    };

    useEffect(() => { fetchAnime(); }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAnime(1, query);
    };

    const handleSelectAnime = (anime: JikanAnime) => {
        setSelectedAnime(anime);
        setView('detail');
        setActiveTab('info');
        setEpisodes([]);
        setPromos([]);
        setPlayingVideo(null);
        // Fetch episodes and videos
        fetchEpisodes(anime.mal_id);
        fetchVideos(anime.mal_id);
    };

    const handlePlayTrailer = () => {
        if (selectedAnime?.trailer?.embed_url) {
            setPlayingVideo(selectedAnime.trailer.embed_url);
            setPlayingTitle(`${selectedAnime.title} — Trailer`);
            setView('watch');
        }
    };

    const handlePlayPromo = (embedUrl: string, title: string) => {
        setPlayingVideo(embedUrl);
        setPlayingTitle(title);
        setView('watch');
    };

    const handlePlayEpisode = (epNumber: number, epTitle: string) => {
        if (!selectedAnime) return;
        // Build gogoanime-style slug from anime title
        const titleSlug = (selectedAnime.title_english || selectedAnime.title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const slug = `${titleSlug}-episode-${epNumber}`;
        // Use embtaku.pro embed (HTTPS, works with gogoanime slugs)
        const embedUrl = `https://embtaku.pro/videos/${slug}`;
        setPlayingVideo(embedUrl);
        setPlayingTitle(epTitle || `Episode ${epNumber}`);
        setView('watch');
    };

    return (
        <div className="h-full bg-gray-900 text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-gray-800 flex items-center justify-between bg-black/50 gap-3">
                <div className="flex items-center gap-2 text-pink-500 shrink-0">
                    <Tv size={20} />
                    <h1 className="text-lg font-bold font-orbitron hidden sm:block">ANIME STATION</h1>
                </div>

                {view === 'list' && (
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search anime..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-pink-500 transition-colors font-mono"
                        />
                        <button type="submit" className="bg-pink-600 hover:bg-pink-500 px-3 py-1.5 rounded text-sm font-bold transition-colors">
                            <Search size={16} />
                        </button>
                    </form>
                )}

                {view !== 'list' && (
                    <button
                        onClick={() => {
                            if (view === 'watch') { setView('detail'); setPlayingVideo(null); }
                            else { setView('list'); setSelectedAnime(null); }
                        }}
                        className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                {error && (
                    <div className="bg-red-900/30 text-red-400 p-3 rounded border border-red-800 mb-4 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto hover:text-white"><X size={14} /></button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-14 h-14 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                            <p className="text-pink-500 font-mono animate-pulse text-sm">CONNECTING TO JIKAN GRID...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* LIST VIEW */}
                        {view === 'list' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                                    {animeList.map((anime) => (
                                        <button
                                            key={anime.mal_id}
                                            onClick={() => handleSelectAnime(anime)}
                                            className="group relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-800 hover:border-pink-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] text-left"
                                        >
                                            <img
                                                src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                                                alt={anime.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                                <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-pink-400 transition-colors line-clamp-2">{anime.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] bg-pink-600/80 text-white px-1.5 py-0.5 rounded font-bold">{anime.type}</span>
                                                    {anime.score && (
                                                        <span className="text-[9px] flex items-center gap-0.5 text-yellow-400">
                                                            <Star size={8} fill="currentColor" /> {anime.score}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-center gap-3 mt-6 pb-6">
                                    <button
                                        onClick={() => fetchAnime(page - 1, query)}
                                        disabled={page <= 1}
                                        className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1 disabled:cursor-not-allowed text-sm"
                                    >
                                        <ChevronLeft size={14} /> Prev
                                    </button>
                                    <span className="px-3 py-2 bg-black rounded border border-gray-800 font-mono text-pink-500 text-sm">PAGE {page}</span>
                                    <button
                                        onClick={() => fetchAnime(page + 1, query)}
                                        disabled={!hasNextPage}
                                        className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1 disabled:cursor-not-allowed text-sm"
                                    >
                                        Next <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* DETAIL VIEW */}
                        {view === 'detail' && selectedAnime && (
                            <div className="max-w-6xl mx-auto">
                                {/* Top Section: Cover + Basic Info */}
                                <div className="flex flex-col md:flex-row gap-6 mb-6">
                                    {/* Cover */}
                                    <div className="w-full md:w-48 lg:w-56 shrink-0 space-y-3">
                                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                                            <img
                                                src={selectedAnime.images.webp.large_image_url}
                                                alt={selectedAnime.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Watch Trailer Button */}
                                        {selectedAnime.trailer?.embed_url && (
                                            <button
                                                onClick={handlePlayTrailer}
                                                className="w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold font-orbitron tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-pink-500/25 text-sm"
                                            >
                                                <Play size={16} fill="currentColor" /> WATCH TRAILER
                                            </button>
                                        )}

                                        {/* Quick Stats */}
                                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 space-y-2 font-mono text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Format:</span>
                                                <span className="text-white">{selectedAnime.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Episodes:</span>
                                                <span className="text-white">{selectedAnime.episodes || '?'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Status:</span>
                                                <span className={selectedAnime.airing ? 'text-green-400' : 'text-gray-400'}>{selectedAnime.status}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Season:</span>
                                                <span className="text-white capitalize">{selectedAnime.season} {selectedAnime.year}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Studio:</span>
                                                <span className="text-white text-right">{selectedAnime.studios.map(s => s.name).join(', ') || '?'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Info */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-bold text-white font-orbitron">{selectedAnime.title}</h2>
                                            {selectedAnime.title_english && (
                                                <h3 className="text-lg text-gray-400 mt-1">{selectedAnime.title_english}</h3>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedAnime.genres.map((g, i) => (
                                                <span key={i} className="text-xs bg-pink-900/30 text-pink-300 px-2.5 py-1 rounded-full border border-pink-500/30">
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                            <div className="flex items-center gap-2">
                                                <Star className="text-yellow-400" size={20} fill="currentColor" />
                                                <div>
                                                    <div className="text-xl font-bold text-white">{selectedAnime.score || 'N/A'}</div>
                                                    <div className="text-[9px] text-gray-500 font-mono">{selectedAnime.scored_by?.toLocaleString()} VOTES</div>
                                                </div>
                                            </div>
                                            <div className="w-px h-8 bg-gray-700"></div>
                                            <div>
                                                <div className="text-xl font-bold text-white">#{selectedAnime.rank}</div>
                                                <div className="text-[9px] text-gray-500 font-mono">RANKED</div>
                                            </div>
                                            <div className="w-px h-8 bg-gray-700"></div>
                                            <div>
                                                <div className="text-xl font-bold text-white">#{selectedAnime.popularity}</div>
                                                <div className="text-[9px] text-gray-500 font-mono">POPULARITY</div>
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex gap-1 border-b border-gray-700">
                                            <button
                                                onClick={() => setActiveTab('info')}
                                                className={`px-4 py-2 text-sm font-mono border-b-2 transition-all ${activeTab === 'info' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                SYNOPSIS
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('episodes')}
                                                className={`px-4 py-2 text-sm font-mono border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'episodes' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <List size={14} /> EPISODES {selectedAnime.episodes ? `(${selectedAnime.episodes})` : ''}
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('videos')}
                                                className={`px-4 py-2 text-sm font-mono border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'videos' ? 'border-pink-500 text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                <Film size={14} /> VIDEOS {promos.length > 0 ? `(${promos.length})` : ''}
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        <div className="min-h-[200px]">
                                            {/* Synopsis Tab */}
                                            {activeTab === 'info' && (
                                                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                                                    {selectedAnime.synopsis || "No synopsis available."}
                                                </p>
                                            )}

                                            {/* Episodes Tab */}
                                            {activeTab === 'episodes' && (
                                                <div className="space-y-2">
                                                    {epsLoading ? (
                                                        <div className="flex items-center gap-2 text-pink-500 font-mono text-sm p-4">
                                                            <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                                                            Loading episodes...
                                                        </div>
                                                    ) : episodes.length === 0 ? (
                                                        <p className="text-gray-500 font-mono text-sm p-4">No episode data available.</p>
                                                    ) : (
                                                        <>
                                                            <div className="space-y-1">
                                                                {episodes.map((ep) => (
                                                                    <button
                                                                        key={ep.mal_id}
                                                                        onClick={() => handlePlayEpisode(ep.mal_id, ep.title || `Episode ${ep.mal_id}`)}
                                                                        className="w-full flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50 hover:border-pink-500/50 hover:bg-pink-900/10 transition-all group text-left"
                                                                    >
                                                                        <div className="w-10 h-10 bg-pink-900/30 rounded-lg flex items-center justify-center shrink-0 border border-pink-500/20 group-hover:bg-pink-600/30 transition-colors">
                                                                            <Play size={14} className="text-pink-400 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity absolute" fill="currentColor" />
                                                                            <span className="text-xs font-mono font-bold text-pink-400 group-hover:opacity-0 transition-opacity">{ep.mal_id}</span>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">{ep.title || `Episode ${ep.mal_id}`}</h4>
                                                                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono mt-0.5">
                                                                                {ep.aired && <span><Calendar size={10} className="inline mr-1" />{new Date(ep.aired).toLocaleDateString()}</span>}
                                                                                {ep.filler && <span className="text-yellow-500 bg-yellow-900/30 px-1.5 py-0.5 rounded">FILLER</span>}
                                                                                {ep.recap && <span className="text-blue-500 bg-blue-900/30 px-1.5 py-0.5 rounded">RECAP</span>}
                                                                                <span className="ml-auto text-pink-500/50 group-hover:text-pink-400 transition-colors text-[9px] font-bold">▶ WATCH</span>
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            {/* Episode Pagination */}
                                                            <div className="flex justify-center gap-3 pt-4">
                                                                <button
                                                                    onClick={() => fetchEpisodes(selectedAnime!.mal_id, epsPage - 1)}
                                                                    disabled={epsPage <= 1}
                                                                    className="px-3 py-1.5 bg-gray-800 rounded text-xs font-mono text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    ← PREV
                                                                </button>
                                                                <span className="px-3 py-1.5 bg-black rounded border border-gray-800 text-xs font-mono text-pink-500">
                                                                    PAGE {epsPage}
                                                                </span>
                                                                <button
                                                                    onClick={() => fetchEpisodes(selectedAnime!.mal_id, epsPage + 1)}
                                                                    disabled={!epsHasNext}
                                                                    className="px-3 py-1.5 bg-gray-800 rounded text-xs font-mono text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                                                >
                                                                    NEXT →
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {/* Videos Tab */}
                                            {activeTab === 'videos' && (
                                                <div>
                                                    {promos.length === 0 ? (
                                                        <p className="text-gray-500 font-mono text-sm p-4">No videos available for this title.</p>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {promos.map((promo, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => handlePlayPromo(promo.trailer.embed_url, promo.title)}
                                                                    className="group relative aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-pink-500 transition-all text-left"
                                                                >
                                                                    <img
                                                                        src={promo.trailer.images?.medium_image_url || promo.trailer.images?.image_url}
                                                                        alt={promo.title}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                                        <div className="w-12 h-12 bg-pink-600/80 rounded-full flex items-center justify-center group-hover:bg-pink-500 transition-colors shadow-lg">
                                                                            <Play size={20} fill="white" className="text-white ml-0.5" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black to-transparent">
                                                                        <p className="text-xs font-bold text-white truncate">{promo.title}</p>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* WATCH VIEW */}
                        {view === 'watch' && selectedAnime && playingVideo && (
                            <div className="max-w-5xl mx-auto flex flex-col h-full">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-pink-900 shadow-[0_0_50px_rgba(236,72,153,0.1)] relative">
                                    <iframe
                                        src={playingVideo.replace('autoplay=0', 'autoplay=1')}
                                        className="w-full h-full border-0"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        title={playingTitle || selectedAnime.title}
                                    />
                                </div>
                                <div className="mt-4 space-y-1">
                                    <h2 className="text-lg font-bold text-pink-400">{selectedAnime.title}</h2>
                                    <p className="text-sm text-gray-400">{playingTitle}</p>
                                    <p className="text-[10px] font-mono text-gray-600">SOURCE: EMBTAKU / YOUTUBE — If video doesn't load, try a different server or check your connection.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default Anime;
