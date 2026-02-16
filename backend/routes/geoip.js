import express from 'express';
import geoip from 'geoip-lite';

const router = express.Router();

// In-memory threat log (simulating real-time attacks)
const threatLog = [];
const MAX_THREATS = 100;

// Generate realistic threat IPs from various countries
const generateThreatIP = () => {
    const threatCountries = {
        'CN': ['114.114.114.', '220.181.38.', '123.125.114.'],
        'RU': ['5.255.255.', '46.229.168.', '77.88.55.'],
        'US': ['8.8.8.', '1.1.1.', '104.16.249.'],
        'BR': ['200.221.11.', '191.36.8.'],
        'IN': ['103.21.244.', '106.51.'],
        'KR': ['175.209.', '121.162.'],
        'VN': ['113.160.', '14.231.'],
        'ID': ['103.14.', '36.72.'],
        'DE': ['46.4.', '217.110.'],
        'FR': ['212.27.', '90.63.']
    };

    const countries = Object.keys(threatCountries);
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const prefixes = threatCountries[randomCountry];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    const ip = randomPrefix + Math.floor(Math.random() * 256);
    return ip;
};

// Generate threat data periodically
setInterval(() => {
    const ip = generateThreatIP();
    const geo = geoip.lookup(ip);

    if (geo) {
        const threat = {
            id: Date.now() + Math.random(),
            ip,
            country: geo.country,
            city: geo.city || 'Unknown',
            lat: geo.ll[0],
            lon: geo.ll[1],
            type: ['SQL Injection', 'DDoS', 'Port Scan', 'Brute Force', 'Malware'][Math.floor(Math.random() * 5)],
            severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
            timestamp: new Date().toISOString()
        };

        threatLog.unshift(threat);
        if (threatLog.length > MAX_THREATS) {
            threatLog.pop();
        }
    }
}, 3000); // New threat every 3 seconds

// Get real-time threats
router.get('/threats', (req, res) => {
    res.json({
        success: true,
        threats: threatLog.slice(0, 50), // Return last 50 threats
        total: threatLog.length
    });
});

// Get threat by IP
router.post('/lookup', (req, res) => {
    try {
        const { ip } = req.body;

        if (!ip) {
            return res.status(400).json({ error: 'IP address required' });
        }

        const geo = geoip.lookup(ip);

        if (!geo) {
            return res.status(404).json({ error: 'IP location not found' });
        }

        res.json({
            success: true,
            ip,
            country: geo.country,
            region: geo.region,
            city: geo.city,
            latitude: geo.ll[0],
            longitude: geo.ll[1],
            timezone: geo.timezone
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get threat statistics by country
router.get('/stats', (req, res) => {
    const countryStats = {};

    threatLog.forEach(threat => {
        if (!countryStats[threat.country]) {
            countryStats[threat.country] = {
                country: threat.country,
                count: 0,
                severities: { low: 0, medium: 0, high: 0, critical: 0 }
            };
        }
        countryStats[threat.country].count++;
        countryStats[threat.country].severities[threat.severity]++;
    });

    const topCountries = Object.values(countryStats)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    res.json({
        success: true,
        topCountries,
        totalThreats: threatLog.length
    });
});

export default router;
