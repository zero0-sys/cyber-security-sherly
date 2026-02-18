import express from 'express';
import axios from 'axios';

const router = express.Router();

const ANILIST_API = 'https://graphql.anilist.co';

// Helper to query AniList GraphQL
const queryAniList = async (query, variables = {}) => {
    const response = await axios.post(ANILIST_API, { query, variables }, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        timeout: 10000
    });
    return response.data.data;
};

// GET Latest / Airing Anime
router.get('/latest/:page?', async (req, res) => {
    try {
        const page = parseInt(req.params.page) || 1;

        const query = `
        query ($page: Int) {
            Page(page: $page, perPage: 20) {
                media(type: ANIME, status: RELEASING, sort: UPDATED_AT_DESC) {
                    id
                    title { romaji english native }
                    coverImage { large medium }
                    episodes
                    status
                    genres
                    averageScore
                    nextAiringEpisode { episode }
                }
            }
        }`;

        const data = await queryAniList(query, { page });
        const items = data.Page.media.map(m => ({
            id: m.id,
            slug: String(m.id),
            title: m.title.english || m.title.romaji,
            poster: m.coverImage.large || m.coverImage.medium,
            episode: m.nextAiringEpisode ? `EP ${m.nextAiringEpisode.episode}` : (m.episodes ? `${m.episodes} eps` : ''),
            genres: m.genres,
            score: m.averageScore
        }));

        res.json({ page, data: items });
    } catch (err) {
        console.error('Anime API Error [latest]:', err.message);
        res.status(500).json({ error: 'Failed to fetch data', details: err.message });
    }
});

// GET Search Anime
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query "q" required' });

        const query = `
        query ($search: String) {
            Page(page: 1, perPage: 20) {
                media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
                    id
                    title { romaji english native }
                    coverImage { large medium }
                    episodes
                    status
                    genres
                    averageScore
                    description(asHtml: false)
                }
            }
        }`;

        const data = await queryAniList(query, { search: q });
        const items = data.Page.media.map(m => ({
            id: m.id,
            slug: String(m.id),
            title: m.title.english || m.title.romaji,
            poster: m.coverImage.large || m.coverImage.medium,
            genres: m.genres,
            score: m.averageScore,
            synopsis: m.description?.replace(/<[^>]*>/g, '').slice(0, 200) + '...' || ''
        }));

        res.json({ query: q, data: items });
    } catch (err) {
        console.error('Anime API Error [search]:', err.message);
        res.status(500).json({ error: 'Failed to fetch data', details: err.message });
    }
});

// GET Anime Details by AniList ID
router.get('/detail/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const query = `
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
                id
                title { romaji english native }
                coverImage { extraLarge large }
                bannerImage
                description(asHtml: false)
                episodes
                status
                genres
                averageScore
                studios { nodes { name } }
                streamingEpisodes { title thumbnail url site }
                externalLinks { url site }
            }
        }`;

        const data = await queryAniList(query, { id });
        const m = data.Media;

        // Build episode list from streamingEpisodes or generate numbered list
        let episodes = [];
        if (m.streamingEpisodes && m.streamingEpisodes.length > 0) {
            episodes = m.streamingEpisodes.map((ep, i) => ({
                title: ep.title || `Episode ${i + 1}`,
                slug: String(id) + '-ep-' + (i + 1),
                url: ep.url,
                thumbnail: ep.thumbnail,
                site: ep.site
            }));
        } else if (m.episodes) {
            // Generate episode slugs for gogoanime embed
            const titleSlug = (m.title.romaji || m.title.english || '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            for (let i = 1; i <= m.episodes; i++) {
                episodes.push({
                    title: `Episode ${i}`,
                    slug: `${titleSlug}-episode-${i}`,
                    url: null
                });
            }
        }

        res.json({
            id: m.id,
            title: m.title.english || m.title.romaji,
            titleNative: m.title.native,
            poster: m.coverImage.extraLarge || m.coverImage.large,
            banner: m.bannerImage,
            synopsis: m.description?.replace(/<[^>]*>/g, '') || '',
            genres: m.genres,
            episodes,
            totalEpisodes: m.episodes,
            status: m.status,
            score: m.averageScore,
            studios: m.studios.nodes.map(s => s.name),
            externalLinks: m.externalLinks
        });
    } catch (err) {
        console.error('Anime API Error [detail]:', err.message);
        res.status(500).json({ error: 'Failed to fetch data', details: err.message });
    }
});

// GET Watch - returns embed URL for gogoanime player
router.get('/watch/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        // slug format: "gogoanime-episode-slug" e.g. "one-piece-episode-1100"
        // We embed via gogoanime embed player
        const embedUrl = `https://gogoanime3.co/videos/${slug}`;
        const altEmbedUrl = `https://embtaku.pro/videos/${slug}`;

        res.json({
            title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            streamUrl: embedUrl,
            servers: [
                { name: 'GogoAnime', url: embedUrl },
                { name: 'EmbTaku', url: altEmbedUrl }
            ],
            prevSlug: null,
            nextSlug: null
        });
    } catch (err) {
        console.error('Anime API Error [watch]:', err.message);
        res.status(500).json({ error: 'Failed to fetch stream', details: err.message });
    }
});

export default router;
