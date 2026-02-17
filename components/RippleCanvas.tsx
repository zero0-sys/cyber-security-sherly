import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    opacity: number;
    char: string | null; // If null, it's a block
    color: string;
    vx: number;
    vy: number;
    life: number;
}

interface RippleCanvasProps {
    clickEvent: { x: number; y: number; timestamp: number } | null;
    mode: 'normal' | 'error' | 'success';
}

const RippleCanvas: React.FC<RippleCanvasProps> = ({ clickEvent, mode }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const requestRef = useRef<number>(0);

    const createParticles = (x: number, y: number, count: number, mode: string) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            const isChar = Math.random() > 0.5;

            let color = '0, 255, 0'; // Default Green
            if (mode === 'error') color = '255, 0, 0';
            if (mode === 'success') color = '0, 255, 255';

            particlesRef.current.push({
                x: x,
                y: y,
                size: Math.random() * 15 + 10,
                opacity: 1,
                char: isChar ? (Math.random() > 0.5 ? '1' : '0') : null,
                color: color,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
            });
        }
    };

    useEffect(() => {
        if (clickEvent) {
            createParticles(clickEvent.x, clickEvent.y, 12, mode);
        }
    }, [clickEvent, mode]);

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create trails by not clearing completely
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '16px "Share Tech Mono"';

        particlesRef.current.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.opacity = p.life;

            if (p.life <= 0) {
                particlesRef.current.splice(index, 1);
                return;
            }

            ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;

            if (p.char) {
                ctx.fillText(p.char, p.x, p.y);
            } else {
                // Draw Block
                ctx.fillRect(p.x, p.y, p.size, p.size);
            }
        });

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(requestRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        />
    );
};

export default RippleCanvas;
