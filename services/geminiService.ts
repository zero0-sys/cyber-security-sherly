export interface ThreatNews {
    headline: string;
    summary: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    date: string;
}

// Fallback static threat intel data
const STATIC_THREAT_INTEL: ThreatNews[] = [
    {
        headline: "APT41 Resurfaces with New Malware Strain",
        summary: "Chinese state-sponsored group APT41 has been observed deploying a new backdoor targeting financial institutions across Southeast Asia.",
        severity: "Critical",
        date: new Date().toISOString().split('T')[0]
    },
    {
        headline: "Critical Zero-Day in OpenSSL Patched",
        summary: "A critical buffer overflow vulnerability (CVE-2024-XXXX) in OpenSSL 3.x has been patched. Immediate update recommended for all servers.",
        severity: "Critical",
        date: new Date().toISOString().split('T')[0]
    },
    {
        headline: "Ransomware Campaign Targeting Healthcare",
        summary: "LockBit 3.0 operators are actively targeting hospital networks. Over 12 facilities reported encrypted systems in the past 48 hours.",
        severity: "High",
        date: new Date().toISOString().split('T')[0]
    },
    {
        headline: "Botnet C2 Infrastructure Taken Down",
        summary: "Joint operation by Europol and FBI successfully dismantled the Qakbot botnet C2 infrastructure, affecting over 700,000 infected machines.",
        severity: "Medium",
        date: new Date().toISOString().split('T')[0]
    },
    {
        headline: "Phishing Campaign Mimics Microsoft 365",
        summary: "A sophisticated phishing campaign using adversary-in-the-middle (AiTM) techniques is bypassing MFA to steal Microsoft 365 session tokens.",
        severity: "High",
        date: new Date().toISOString().split('T')[0]
    }
];

export const getCyberThreatIntel = async (): Promise<ThreatNews[]> => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            return STATIC_THREAT_INTEL;
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Generate 5 realistic cybersecurity threat intelligence news items for today. Return ONLY a valid JSON array with objects having these exact fields: headline (string), summary (string, max 100 chars), severity (one of: "Low", "Medium", "High", "Critical"), date (today's date YYYY-MM-DD). No markdown, just raw JSON array.`
                        }]
                    }]
                })
            }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return STATIC_THREAT_INTEL;
    } catch (error) {
        console.error('Threat intel fetch error:', error);
        return STATIC_THREAT_INTEL;
    }
};

export const generateResponse = async (userMessage: string): Promise<string> => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            return "Error: Gemini API key not configured. Please set VITE_GEMINI_API_KEY in Netlify environment variables.";
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are Binary Sentinel, an advanced AI cybersecurity entity. Respond to: ${userMessage}`
                        }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        return "I apologize, but I couldn't generate a proper response. Please try again.";

    } catch (error) {
        console.error('Gemini API Error:', error);
        return `Error communicating with AI core: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};
