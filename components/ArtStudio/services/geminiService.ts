export const generateReferenceImage = async (prompt: string): Promise<{ url: string, prompt: string }> => {
    // Placeholder implementation
    console.log("Generating image for prompt:", prompt);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                url: "https://via.placeholder.com/150",
                prompt: prompt
            });
        }, 1000);
    });
};
