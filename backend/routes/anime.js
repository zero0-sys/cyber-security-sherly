import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = express.Router();
const BASE_URL = 'https://otakudesu.cloud';

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Referer": "https://otakudesu.cloud/",
    "Upgrade-Insecure-Requests": "1",
};

const axiosConfig = {
    headers: HEADERS,
    timeout: 15000,
    httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: false }),
};

// Helper
const handleError = (res, err, context) => {
    console.error(`Anime API Error [${context}]:`, err.message);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
};

// GET Latest / Ongoing Anime
router.get('/latest/:page?', async (req, res) => {
    try {
        const page = req.params.page || 1;
        const url = `${BASE_URL}/ongoing-anime/page/${page}/`;

        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);
        const data = [];

        $('div.venz > ul > li').each((i, el) => {
            const link = $(el).find('a').attr('href') || '';
            const slugMatch = link.match(/\/anime\/([^/]+)\//);
            const slug = slugMatch ? slugMatch[1] : link.replace(BASE_URL, '').replace(/\//g, '');

            data.push({
                title: $(el).find('h2.jdlz').text().trim(),
                slug: slug,
                poster: $(el).find('img').attr('src') || $(el).find('img').attr('data-src'),
                episode: $(el).find('span.epz').text().trim(),
                url: link
            });
        });

        res.json({ page, data });
    } catch (err) {
        handleError(res, err, 'latest');
    }
});

// GET Search Anime
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const url = `${BASE_URL}/?s=${encodeURIComponent(q)}&post_type=anime`;
        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);
        const data = [];

        $('.chivsrc li').each((i, el) => {
            const link = $(el).find('a').attr('href') || '';
            const slugMatch = link.match(/\/anime\/([^/]+)\//);
            const slug = slugMatch ? slugMatch[1] : '';

            data.push({
                title: $(el).find('h2').text().trim(),
                poster: $(el).find('img').attr('src') || $(el).find('img').attr('data-src'),
                slug: slug,
                url: link,
                genres: $(el).find('span.set').text().trim(),
                status: $(el).find('span.set').last().text().trim(),
            });
        });

        res.json({ query: q, data });
    } catch (err) {
        handleError(res, err, 'search');
    }
});

// GET Anime Details
router.get('/detail/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const url = `${BASE_URL}/anime/${slug}/`;

        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);

        const data = {};
        data.title = $('h1.jdlrx').text().trim() || $('h1').first().text().trim();
        data.poster = $('.fotoanime img').attr('src') || $('.fotoanime img').attr('data-src');
        data.synopsis = $('.sinopc').text().trim();

        const genres = [];
        $('.infozingle span').each((i, el) => {
            const label = $(el).find('b').text().trim();
            if (label.toLowerCase().includes('genre')) {
                $(el).find('a').each((j, a) => genres.push($(a).text().trim()));
            }
        });
        data.genres = genres;

        const episodes = [];
        $('.episodelist ul li').each((i, el) => {
            const epLink = $(el).find('a').attr('href') || '';
            const epSlugMatch = epLink.match(/\/([^/]+)\/?$/);
            const epSlug = epSlugMatch ? epSlugMatch[1] : '';
            episodes.push({
                title: $(el).find('a').text().trim(),
                slug: epSlug,
                url: epLink
            });
        });
        data.episodes = episodes.reverse(); // oldest first

        res.json(data);
    } catch (err) {
        handleError(res, err, 'detail');
    }
});

// GET Stream Source (Episode)
router.get('/watch/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const url = `${BASE_URL}/${slug}/`;

        const response = await axios.get(url, axiosConfig);
        const $ = cheerio.load(response.data);

        const data = {};
        data.title = $('.episodetitle h1').text().trim() || $('h1').first().text().trim();

        // Collect all mirror servers
        const servers = [];
        $('.mirrorstream ul li').each((i, el) => {
            const serverName = $(el).find('a').text().trim();
            const encodedUrl = $(el).find('a').attr('data-content') || $(el).find('a').attr('href');
            if (encodedUrl && encodedUrl !== '#') {
                servers.push({ name: serverName, url: encodedUrl });
            }
        });

        // Fallback: try iframe
        if (servers.length === 0) {
            const iframeSrc = $('iframe').attr('src');
            if (iframeSrc) servers.push({ name: 'Default', url: iframeSrc });
        }

        data.streamUrl = servers.length > 0 ? servers[0].url : null;
        data.servers = servers;

        // Navigation
        const prevLink = $('.flnavleft a').attr('href');
        const nextLink = $('.flnavright a').attr('href');
        data.prevSlug = prevLink ? prevLink.replace(BASE_URL, '').replace(/\//g, '') : null;
        data.nextSlug = nextLink ? nextLink.replace(BASE_URL, '').replace(/\//g, '') : null;

        res.json(data);
    } catch (err) {
        handleError(res, err, 'watch');
    }
});

export default router;
