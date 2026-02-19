import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const router = express.Router();
const BASE_URL = 'https://otakudesu.best';

// Shared Axios instance with SSL bypass
const agent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': BASE_URL + '/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    },
    httpsAgent: agent,
    maxRedirects: 5 // follow redirects but maybe detect if we land on home
});

// Helper to extract slug from URL
const getSlug = (url) => {
    if (!url) return null;
    const parts = url.split('/').filter(p => p.length > 0);
    return parts[parts.length - 1];
};

// GET Latest / Ongoing Anime
router.get('/latest/:page?', async (req, res) => {
    try {
        const page = req.params.page || 1;
        // Page 1 is usually the root ongoing page, other pages are /page/N/
        const url = page == 1
            ? `${BASE_URL}/ongoing-anime/`
            : `${BASE_URL}/ongoing-anime/page/${page}/`;

        const { data } = await client.get(url);
        const $ = cheerio.load(data);

        const items = [];
        $('.venz ul li').each((i, el) => {
            const title = $(el).find('.jdlfl a').text();
            const link = $(el).find('.jdlfl a').attr('href');
            const thumb = $(el).find('.thumbz img').attr('src');
            const episode = $(el).find('.epz').text().trim();
            const day = $(el).find('.epztipe').text().trim();
            const date = $(el).find('.newnime').text().trim();

            if (link) {
                items.push({
                    title,
                    slug: getSlug(link),
                    poster: thumb,
                    episode,
                    day,
                    date,
                    url: link
                });
            }
        });

        res.json({ page, data: items });
    } catch (err) {
        console.error('Scraper Error [latest]:', err.message);
        res.status(500).json({ error: 'Failed to fetch ongoing anime', details: err.message });
    }
});

// GET Completed Anime
router.get('/completed/:page?', async (req, res) => {
    try {
        const page = req.params.page || 1;
        const url = page == 1
            ? `${BASE_URL}/complete-anime/`
            : `${BASE_URL}/complete-anime/page/${page}/`;

        const { data } = await client.get(url);
        const $ = cheerio.load(data);

        const items = [];
        $('.venz ul li').each((i, el) => {
            const title = $(el).find('.jdlfl a').text();
            const link = $(el).find('.jdlfl a').attr('href');
            const thumb = $(el).find('.thumbz img').attr('src');
            const episode = $(el).find('.epz').text().trim();
            const rating = $(el).find('.epztipe').text().trim(); // Usually rating in completed list
            const date = $(el).find('.newnime').text().trim();

            if (link) {
                items.push({
                    title,
                    slug: getSlug(link),
                    poster: thumb,
                    episode,
                    rating,
                    date,
                    url: link
                });
            }
        });

        res.json({ page, data: items });
    } catch (err) {
        console.error('Scraper Error [completed]:', err.message);
        res.status(500).json({ error: 'Failed to fetch completed anime', details: err.message });
    }
});

// GET Search Anime
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query "q" required' });

        const url = `${BASE_URL}/?s=${encodeURIComponent(q)}&post_type=anime`;
        const { data } = await client.get(url);
        const $ = cheerio.load(data);

        const items = [];
        $('.chivsrc li').each((i, el) => {
            const title = $(el).find('h2 a').text();
            const link = $(el).find('h2 a').attr('href');
            const poster = $(el).find('img').attr('src');

            const genres = [];
            $(el).find('.set a').each((j, g) => genres.push($(g).text()));

            let status = '';
            let rating = '';
            $(el).find('.set').each((j, s) => {
                const text = $(s).text();
                if (text.includes('Status')) status = text.replace('Status : ', '').trim();
                if (text.includes('Rating')) rating = text.replace('Rating : ', '').trim();
            });

            if (link) {
                items.push({
                    title,
                    slug: getSlug(link),
                    poster,
                    genres,
                    status,
                    rating,
                    url: link
                });
            }
        });

        res.json({ query: q, data: items });
    } catch (err) {
        console.error('Scraper Error [search]:', err.message);
        res.status(500).json({ error: 'Failed to search anime', details: err.message });
    }
});

// GET Anime Details
router.get('/detail/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const url = `${BASE_URL}/anime/${slug}/`;
        const { data } = await client.get(url);
        const $ = cheerio.load(data);

        // Basic Info
        const title = $('.jdlrx h1').text().trim() || $('.fotoanime .infozin .jdlz').text(); // Fallback selector
        const poster = $('.fotoanime img').attr('src');
        const synopsis = $('.sinopc').text().trim();

        const info = {};
        $('.infozingle p').each((i, el) => {
            const text = $(el).text();
            const parts = text.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim().toLowerCase().replace(/\s+/g, '_');
                const value = parts.slice(1).join(':').trim();
                info[key] = value;
            }
        });

        // Episodes
        const episodes = [];
        $('.episodelist ul li').each((i, el) => {
            const epTitle = $(el).find('a').text();
            const link = $(el).find('a').attr('href');
            const date = $(el).find('.zeebr').text();

            if (link && link.includes('/episode/')) {
                episodes.push({
                    title: epTitle,
                    slug: getSlug(link),
                    date,
                    url: link
                });
            }
        });

        // Reverse to have Episode 1 first (optional, but UI might prefer it sorted)
        // Otakudesu usually lists newest first.

        res.json({
            slug,
            title,
            poster,
            synopsis,
            info,
            episodes
        });
    } catch (err) {
        console.error('Scraper Error [detail]:', err.message);
        res.status(500).json({ error: 'Failed to fetch anime details', details: err.message });
    }
});

// GET Watch/Stream
router.get('/watch/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const url = `${BASE_URL}/episode/${slug}/`;
        const { data } = await client.get(url);
        const $ = cheerio.load(data);

        const title = $('.venutama h1').text().trim();
        const streamUrl = $('.responsive-embed-stream iframe').attr('src');

        const mirrors = [];
        $('.mirrorstream ul li').each((i, el) => {
            const name = $(el).find('a').text().trim();
            const content = $(el).find('a').data('content'); // might need decoding if base64
            // Otakudesu often uses data-content for mirrors. 
            // For now, we will just return the default streamUrl as primary.
            // If needed, we can expand this.
        });

        const prevSlug = getSlug($('.flir a[title="Episode Sebelumnya"]').attr('href'));
        const nextSlug = getSlug($('.flir a[title="Episode Selanjutnya"]').attr('href'));

        res.json({
            title,
            streamUrl,
            slug,
            prevSlug,
            nextSlug
        });
    } catch (err) {
        console.error('Scraper Error [watch]:', err.message);
        res.status(500).json({ error: 'Failed to fetch stream', details: err.message });
    }
});

export default router;
