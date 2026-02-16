export const generateResponse = async (userMessage: string): Promise<string> => {
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        if (!apiKey) {
            return "Error: Gemini API key not configured. Please set VITE_GOOGLE_API_KEY in your environment.";
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
