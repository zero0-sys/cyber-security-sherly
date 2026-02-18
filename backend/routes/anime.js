import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const router = express.Router();
const BASE_URL = 'https://anime-indo.biz';

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip,deflate",
};

// Helper to handle errors
const handleError = (res, err, context) => {
    console.error(`Anime API Error [${context}]:`, err.message);
    res.status(500).json({ error: 'Failed to fetch data', details: err.message });
};

// GET Latest Anime
router.get('/latest/:page?', async (req, res) => {
    try {
        const page = req.params.page || 1;
        const url = `${BASE_URL}/page/${page}/`;

        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const data = [];

        $("#content-wrap > div.ngiri > div.menu > a").each((i, el) => {
            const link = $(el).attr('href');
            // Extract slug from URL e.g. https://anime-indo.biz/anime-slug/ -> anime-slug
            // Or https://anime-indo.biz/episode-slug/ -> episode-slug
            // kumanime logic: this.attribs.href.match(/\/([^/]+)\/$/)[1]
            const slugMatch = link.match(/\/([^/]+)\/$/);
            const slug = slugMatch ? slugMatch[1] : '';

            data.push({
                title: $(el).find("div > p").text().trim(),
                slug: slug,
                poster: $(el).find("div > img").attr("data-original"),
                episode: $(el).find("span.eps").text().trim(),
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

        const url = `${BASE_URL}/search/${encodeURIComponent(q)}/`;
        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const data = [];

        $("#content-wrap > div.menu > table").each((i, el) => {
            const titleLink = $(el).find("tbody > tr > td.videsc > a");
            const thumbLink = $(el).find("tbody > tr > td.vithumb > a");

            // Extract slug (anime slug usually inside /anime/slug/)
            const href = thumbLink.attr("href");
            const slugMatch = href ? href.match(/\/anime\/([^/]+)\//) : null;
            const slug = slugMatch ? slugMatch[1] : '';

            data.push({
                title: titleLink.text().trim(),
                poster: $(el).find("img").attr("data-original"),
                slug: slug,
                type: $(el).find("tbody > tr > td.videsc > span:nth-child(3)").text().trim(),
                synopsis: $(el).find("tbody > tr > td.videsc > p").text().trim(),
                release: $(el).find("tbody > tr > td.videsc > span:nth-child(5)").text().trim(),
                duration: $(el).find("tbody > tr > td.videsc > span:nth-child(4)").text().trim(),
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

        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const mainElement = $("div.detail");

        const data = {};
        data.title = mainElement.find("h2").text().replace(/^Nonton\s/, '').trim();
        data.poster = mainElement.find("img").attr("src");
        if (data.poster && !data.poster.startsWith('http')) {
            data.poster = BASE_URL + data.poster;
        }
        data.synopsis = mainElement.find("p").text().trim();

        const genreList = [];
        mainElement.find("li").each((i, el) => {
            // Check if it's a genre link (usually inside detailed list)
            // kumanime logic just grabs all `li a` text? It seems to grab genres.
            // Let's stick to kumanime logic:
            const genreTitle = $(el).find("a").text().trim();
            if (genreTitle) genreList.push(genreTitle);
        });
        data.genres = genreList;

        const episodes = [];
        // kumanime selector: $("#content-wrap > div.ngirix > div:nth-child(4) > div > a")
        // This selector seems brittle. Let's try to be a bit more robust if possible, or stick to it.
        // It selects the episode list.
        $("#content-wrap > div.ngirix > div:nth-child(4) > div > a").each((i, el) => {
            const link = $(el).attr("href");
            const slugMatch = link.match(/\/([^/]+)\/$/);
            const epSlug = slugMatch ? slugMatch[1] : '';

            episodes.push({
                title: `Episode ${$(el).text().trim()}`,
                slug: epSlug,
                url: link
            });
        });
        data.episodes = episodes;

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

        const response = await axios.get(url, { headers: HEADERS });
        const $ = cheerio.load(response.data);
        const mainElement = $(".detail");

        const data = {};
        data.title = mainElement.find("strong").text().trim();

        // Stream URL logic from kumanime
        // const RawStreamUrl = domainUrl + $(".server:contains('B-TUBE')").attr("data-video");
        // const streamUrl = $(".server:nth-child(1)").attr("data-video") || $(".server:nth-child(2)").attr("data-video") || "-";

        // Let's try to find available servers
        const servers = [];
        $(".server").each((i, el) => {
            const serverName = $(el).text().trim();
            let videoUrl = $(el).attr("data-video");

            if (videoUrl) {
                if (!videoUrl.startsWith('http')) {
                    videoUrl = BASE_URL + videoUrl; // Some might be relative? kumanime adds domainUrl if not http
                    // kumanime logic: eps_detail.stream_url = streamUrl.startsWith("//gdrive") ? streamUrl : streamUrl.startsWith("https://") ? streamUrl : domainUrl + streamUrl;
                    // Note: //gdrive is protocol relative.
                }
                servers.push({ name: serverName, url: videoUrl });
            }
        });

        // Default stream (first one)
        data.streamUrl = servers.length > 0 ? servers[0].url : null;
        data.servers = servers;

        // Navigation
        data.prevSlug = $(".navi > a:contains('Prev')").attr("href")?.match(/\/([^\/]+)\/$/)?.[1] || null;
        data.nextSlug = $(".navi > a:contains('Next')").attr("href")?.match(/\/([^\/]+)\/$/)?.[1] || null;

        // Use a scraper for the iframe src if it's not direct
        // kumanime uses `getData(RawStreamUrl)` which does `axios.get(url)` and finds `video > source`. 
        // If the `data-video` is an embed URL (like /embed/...), we might need to fetch it to get the real source.
        // However, usually putting the embed URL in an iframe works.
        // Let's assume the `data-video` is the iframe source.

        res.json(data);
    } catch (err) {
        handleError(res, err, 'watch');
    }
});

export default router;
