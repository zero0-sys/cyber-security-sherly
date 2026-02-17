import React, { useEffect, useRef } from 'react';

const SherlyAvatar: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let time = 0;
        let animationId: number;

        const animate = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            // Draw outer circle
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
            ctx.stroke();

            // Rotating segments
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(time);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 90, 0, Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();

            // Inner data stream
            ctx.fillStyle = '#0f0';
            ctx.font = '14px monospace';
            const rows = 10;
            for (let i = 0; i < rows; i++) {
                const text = Math.random() > 0.5 ? "1 0 1 1 0" : "0 1 0 0 1";
                const yOffset = (i - rows / 2) * 12;
                ctx.globalAlpha = Math.max(0, 1 - Math.abs(yOffset) / 60);
                ctx.fillText(text, centerX - 35, centerY + yOffset);
            }
            ctx.globalAlpha = 1.0;

            time += 0.02;
            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <canvas ref={canvasRef} width={300} height={300} />
            <div className="text-center text-green-500 font-mono tracking-widest mt-[-40px]">SHERLY AI</div>
        </div>
    );
};

export default SherlyAvatar;
