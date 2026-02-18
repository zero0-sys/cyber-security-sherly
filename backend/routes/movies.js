import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const router = express.Router();

// Base URL for LK21 (can be overridden by env)
const BASE_URL = process.env.LK21_URL || 'https://tv15.lk21official.my';

// Helper to scrape search results
const scrapeSearch = (html, protocol, host) => {
    const $ = cheerio.load(html);
    const results = [];

    $('div.search-wrapper > div.search-item').each((i, el) => {
        const content = $(el).find('div.search-content');
        const posterImg = $(el).find('figure > a > img').attr('src');
        const title = $(content).find('h2 > a').text().trim();
        const urlPath = $(content).find('h2 > a').attr('href');

        // Extract ID from URL (e.g. https://.../movie-title/ -> movie-title)
        // Adjust for different URL structures
        let id = '';
        if (urlPath) {
            const parts = urlPath.split('/').filter(Boolean); // remove empty strings
            id = parts[parts.length - 1];
        }

        const genres = [];
        $(el).find('p.cat-links > a').each((i, el2) => {
            const href = $(el2).attr('href');
            if (href && href.includes('/genre/')) {
                genres.push($(el2).text().trim());
            }
        });

        if (title && id) {
            results.push({
                title,
                id,
                poster: posterImg ? `https:${posterImg}`.replace('https:https:', 'https:') : null, // handle protocol-less src
                genres,
                url: urlPath
            });
        }
    });

    return results;
};

// Helper to scrape stream sources
const scrapeStream = (html) => {
    const $ = cheerio.load(html);
    const sources = [];

    $('#load-sources').find('ul > li').each((i, el) => {
        const provider = $(el).find('a').text().trim();
        const url = $(el).find('a').attr('href');
        const resolutions = [];

        $(el).find('div > span').each((j, span) => {
            resolutions.push($(span).text().trim());
        });

        if (url) {
            sources.push({
                provider,
                url,
                resolutions
            });
        }
    });

    // Also try to find iframe if direct sources aren't listed explicitly like api
    // Usually lk21 has iframes. The api might depend on specific button structure.
    // Fallback: check other selectors if empty.

    return sources;
};

// Search endpoint
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

        const url = `${BASE_URL}/?s=${encodeURIComponent(q)}`;
        // User-Agent often needed for scrapers
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const results = scrapeSearch(response.data, req.protocol, req.get('host'));
        res.json(results);
    } catch (error) {
        console.error('Search Error:', error.message);
        res.status(500).json({ error: 'Failed to search movies', details: error.message });
    }
});

// Stream endpoint
router.get('/stream/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const url = `${BASE_URL}/${id}`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const streams = scrapeStream(response.data);

        // Also get movie details for context
        const $ = cheerio.load(response.data);
        const title = $('h1.entry-title').text().trim();
        const synopsis = $('div.entry-content p').first().text().trim(); // Rough selector
        const poster = $('meta[property="og:image"]').attr('content');

        res.json({
            id,
            title,
            synopsis,
            poster,
            originalUrl: url,
            streams
        });

    } catch (error) {
        console.error('Stream Error:', error.message);
        res.status(500).json({ error: 'Failed to get stream', details: error.message });
    }
});

export default router;
