import React, { useState } from 'react';
import { Search, Play, ArrowLeft, Film, AlertCircle } from 'lucide-react';

interface Movie {
    title: string;
    id: string;
    poster: string | null;
    genres: string[];
    url: string;
}

interface StreamSource {
    provider: string;
    url: string;
    resolutions: string[];
}

interface MovieDetail {
    id: string;
    title: string;
    synopsis: string;
    poster: string;
    originalUrl: string;
    streams: StreamSource[];
}

const Cinema: React.FC = () => {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [streamUrl, setStreamUrl] = useState<string | null>(null);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setMovies([]);
        setSelectedMovie(null);

        try {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${backendUrl}/api/movies/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Search failed');

            const data = await res.json();
            setMovies(data);
            if (data.length === 0) setError('No movies found');
        } catch (err: any) {
            setError(err.message || 'Failed to search movies');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMovie = async (movieVal: Movie) => {
        setLoading(true);
        setError('');

        try {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const res = await fetch(`${backendUrl}/api/movies/stream/${movieVal.id}`);
            if (!res.ok) throw new Error('Failed to load stream');

            const data = await res.json();
            setSelectedMovie(data);

            // Auto select first stream if available
            if (data.streams && data.streams.length > 0) {
                setStreamUrl(data.streams[0].url);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load movie details');
        } finally {
            setLoading(false);
        }
    };

    const handleClosePlayer = () => {
        setSelectedMovie(null);
        setStreamUrl(null);
    };

    return (
        <div className="h-full bg-gray-900 text-white flex flex-col font-sans">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-2 text-yellow-500">
                    <Film size={24} />
                    <h1 className="text-xl font-bold font-orbitron">LK21 CINEMA</h1>
                </div>
                {!selectedMovie && (
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search movie..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <button type="submit" className="bg-yellow-600 hover:bg-yellow-500 px-4 py-1 rounded text-sm font-bold transition-colors">
                            <Search size={16} />
                        </button>
                    </form>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {error && (
                    <div className="bg-red-900/30 text-red-400 p-4 rounded border border-red-800 mb-6 flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                ) : selectedMovie ? (
                    <div className="max-w-5xl mx-auto animate-fadeIn">
                        <button onClick={handleClosePlayer} className="mb-4 text-gray-400 hover:text-white flex items-center gap-2 text-sm">
                            <ArrowLeft size={16} /> Back to Search
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Main Player Area */}
                            <div className="lg:col-span-3 space-y-4">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)] border border-gray-800 relative">
                                    {streamUrl ? (
                                        <iframe
                                            src={streamUrl}
                                            className="w-full h-full border-0"
                                            allowFullScreen
                                            title={selectedMovie.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
                                            <AlertCircle size={32} />
                                            <span>No stream source selected or available</span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                                    <h2 className="text-2xl font-bold text-yellow-500 mb-2">{selectedMovie.title}</h2>
                                    <p className="text-gray-300 text-sm leading-relaxed">{selectedMovie.synopsis}</p>
                                </div>
                            </div>

                            {/* Sidebar / Sources */}
                            <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700 h-fit">
                                <h3 className="font-bold text-gray-400 mb-4 text-sm uppercase tracking-wider">Stream Sources</h3>
                                <div className="space-y-2">
                                    {selectedMovie.streams && selectedMovie.streams.length > 0 ? (
                                        selectedMovie.streams.map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setStreamUrl(s.url)}
                                                className={`w-full text-left p-3 rounded text-xs transition-colors border ${streamUrl === s.url
                                                        ? 'bg-yellow-600/20 border-yellow-600 text-yellow-400'
                                                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300'
                                                    }`}
                                            >
                                                <div className="font-bold mb-1">{s.provider}</div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {s.resolutions.map((r, rIdx) => (
                                                        <span key={rIdx} className="bg-black/40 px-1.5 py-0.5 rounded text-[10px] text-gray-400">{r}</span>
                                                    ))}
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-gray-500 text-sm italic">No sources found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fadeIn">
                        {movies.map((movie) => (
                            <button
                                key={movie.id}
                                onClick={() => handleSelectMovie(movie)}
                                className="group relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden border border-gray-800 hover:border-yellow-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                            >
                                {movie.poster ? (
                                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                        <Film size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <h3 className="text-sm font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-2">{movie.title}</h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {movie.genres.slice(0, 2).map((g, i) => (
                                            <span key={i} className="text-[10px] bg-yellow-600/80 text-black px-1.5 py-0.5 rounded font-bold">{g}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-yellow-500/90 rounded-full p-3 shadow-lg transform scale-50 group-hover:scale-110 transition-transform duration-300">
                                        <Play size={24} className="text-black fill-current ml-1" />
                                    </div>
                                </div>
                            </button>
                        ))}
                        {movies.length === 0 && !loading && !error && (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500 gap-4">
                                <Film size={48} className="opacity-20" />
                                <p>Search for a movie to start watching</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cinema;
