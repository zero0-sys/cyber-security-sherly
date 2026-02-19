import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const BASE_URL = 'https://otakudesu.best';

const agent = new https.Agent({
    rejectUnauthorized: false
});

const axiosConfig = {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
    httpsAgent: agent
};

// ... (search and detail functions same as before, omitted for brevity but I need to include them or module won't run)
// Actually I need to include everything since I'm overwriting.

async function testSearch() {
    try {
        console.log('--- Testing Search ---');
        const url = `${BASE_URL}/?s=boruto&post_type=anime`;
        const { data } = await axios.get(url, axiosConfig);
        const $ = cheerio.load(data);

        const results = [];
        $('.chivsrc li').each((i, el) => {
            const title = $(el).find('h2 a').text();
            const link = $(el).find('h2 a').attr('href');
            const poster = $(el).find('img').attr('src');
            if (link) results.push({ title, link, poster });
        });

        console.log(`Found ${results.length} results.`);
        if (results.length > 0) return results[0].link;
    } catch (err) { console.error(err.message); }
    return null;
}

async function testDetail(url) {
    if (!url) return;
    try {
        console.log('\n--- Testing Detail ---');
        const { data } = await axios.get(url, axiosConfig);
        const $ = cheerio.load(data);

        const episodes = [];
        $('.episodelist ul li').each((i, el) => {
            const title = $(el).find('a').text();
            const link = $(el).find('a').attr('href');
            if (link && link.includes('/episode/')) episodes.push({ title, link });
        });

        console.log(`Found ${episodes.length} episodes.`);
        if (episodes.length > 0) return episodes[0].link;
    } catch (err) { console.error(err.message); }
    return null;
}

async function testStream(url) {
    if (!url) return;
    try {
        console.log('\n--- Testing Stream ---');
        console.log('Fetching:', url);
        const { data } = await axios.get(url, axiosConfig);
        const $ = cheerio.load(data);

        // Debug player structure
        console.log('Searching for player elements...');

        const iframes = [];
        $('iframe').each((i, el) => {
            iframes.push($(el).attr('src'));
        });
        console.log('All iframes:', iframes);

        const responsiveEmbed = $('.responsive-embed-stream').html();
        if (responsiveEmbed) console.log('.responsive-embed-stream content:', responsiveEmbed.trim());

        const streamOptions = [];
        $('.mirrorstream .m360p li, .mirrorstream .m480p li, .mirrorstream .m720p li').each((i, el) => {
            streamOptions.push({
                res: $(el).text(),
                content: $(el).find('a').data('content')
            });
        });
        if (streamOptions.length > 0) console.log('Stream options found:', streamOptions.length);

        const downloadLinks = [];
        $('.download ul li a').each((i, el) => {
            downloadLinks.push($(el).attr('href'));
        });
        console.log('Download links found:', downloadLinks.length);

    } catch (err) {
        console.error('Stream failed:', err.message);
    }
}

async function run() {
    const detailLink = await testSearch();
    const episodeLink = await testDetail(detailLink);
    await testStream(episodeLink);
}

run();
