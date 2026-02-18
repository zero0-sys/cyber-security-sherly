import React, { useEffect, useRef } from 'react';

const BinaryProfile: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            // Clear with slight transparency for trail effect (optional, but requested "no glow", so maybe just clear)
            // Actually "continuously" implies movement. Let's make a grid of changing numbers.
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = '14px monospace';
            ctx.fillStyle = '#00ff41'; // Flat green, no glow
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const cols = 8;
            const rows = 8;
            const cellWidth = canvas.width / cols;
            const cellHeight = canvas.height / rows;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const bit = Math.random() > 0.5 ? '1' : '0';
                    ctx.fillText(bit, i * cellWidth + cellWidth / 2, j * cellHeight + cellHeight / 2);
                }
            }

            // Slower animation
            setTimeout(() => {
                animationFrameId = requestAnimationFrame(render);
            }, 100);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-900 bg-black relative">
            <canvas ref={canvasRef} width={128} height={128} className="w-full h-full" />
            {/* Overlay to make it look like a rounded monitor or lens */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"></div>
        </div>
    );
};

export default BinaryProfile;
