import React, { useRef, useEffect } from 'react';

interface BinaryAvatarProps {
    isSpeaking: boolean;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
    isActive?: boolean;
}

interface Particle {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    char: string;
    speed: number;
}

const BinaryAvatar: React.FC<BinaryAvatarProps> = ({ isSpeaking }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    const particlesRef = useRef<Particle[]>([]);
    const isSpeakingRef = useRef(isSpeaking);

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    const PARTICLES_COUNT = 6000;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const torsoCount = 1800;
        const headCount = 900;

        const handleResize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        if (particlesRef.current.length === 0) {
            for (let i = 0; i < PARTICLES_COUNT; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z: Math.random() * 100,
                    vx: 0,
                    vy: 0,
                    char: Math.random() > 0.5 ? '1' : '0',
                    speed: 0.1 + Math.random() * 0.2
                });
            }
        }

        const rotateX = (p: Point3D, angle: number): Point3D => ({
            x: p.x,
            y: p.y * Math.cos(angle) - p.z * Math.sin(angle),
            z: p.y * Math.sin(angle) + p.z * Math.cos(angle),
            isActive: p.isActive
        });

        const rotateY = (p: Point3D, angle: number): Point3D => ({
            x: p.x * Math.cos(angle) + p.z * Math.sin(angle),
            y: p.y,
            z: -p.x * Math.sin(angle) + p.z * Math.cos(angle),
            isActive: p.isActive
        });

        const translate = (p: Point3D, x: number, y: number, z: number): Point3D => ({
            x: p.x + x,
            y: p.y + y,
            z: p.z + z,
            isActive: p.isActive
        });

        const project = (p: Point3D, cx: number, cy: number) => {
            const fov = 450;
            const scale = fov / (fov + p.z - 180);
            return {
                x: p.x * scale + cx,
                y: p.y * scale + cy,
                scale: scale,
                visible: scale > 0
            };
        };

        const getSpherePoint = (radius: number, ox: number, oy: number, oz: number): Point3D => {
            let x, y, z, d;
            do {
                x = (Math.random() * 2 - 1);
                y = (Math.random() * 2 - 1);
                z = (Math.random() * 2 - 1);
                d = x * x + y * y + z * z;
            } while (d > 1);

            return {
                x: ox + x * radius,
                y: oy + y * radius,
                z: oz + z * radius
            };
        };

        const getCylinderPoint = (radius: number, height: number, ox: number, oy: number, oz: number): Point3D => {
            const theta = Math.random() * 2 * Math.PI;
            const r = radius * Math.sqrt(Math.random());
            const h = Math.random() * height;
            return {
                x: ox + r * Math.cos(theta),
                y: oy + h,
                z: oz + r * Math.sin(theta)
            };
        };

        const generatePose = (t: number) => {
            const targetPoints: Point3D[] = [];
            const phase = t * 0.005;

            const speaking = isSpeakingRef.current;

            let headNod = 0;

            if (speaking) {
                headNod += Math.sin(t * 0.1) * 0.08;
            }

            for (let i = 0; i < torsoCount; i++) {
                let p = getCylinderPoint(16, 55, 0, -55, 0);
                if (p.y > -20) { p.x *= 0.85; p.z *= 0.85; }
                if (p.y < -40) { p.x *= 1.5; p.z *= 1.2; }
                targetPoints.push(p);
            }

            const headY = -68;
            for (let i = 0; i < headCount; i++) {
                let p = getSpherePoint(13, 0, 0, 0);
                p.y *= 1.1;

                let isActive = false;

                if (speaking) {
                    if (p.z > 8 && p.y > 2 && p.y < 10 && Math.abs(p.x) < 9) {
                        const wave = Math.sin(p.x * 0.6 + t * 0.2);
                        if (wave > 0.4) {
                            isActive = true;
                            p.z += 2.5;
                        }
                    }
                }

                let pFinal = translate(p, 0, headY, 0);
                pFinal = translate(pFinal, 0, -headY, 0);
                pFinal = rotateX(pFinal, headNod);
                pFinal = translate(pFinal, 0, headY, 0);

                pFinal.isActive = isActive;
                targetPoints.push(pFinal);
            }

            const addLimb = (
                origin: Point3D,
                length1: number,
                length2: number,
                angle: { x: number, z: number, elbow: number },
                thickness: number
            ) => {
                const limbCount = 450;

                for (let i = 0; i < limbCount; i++) {
                    let p = getCylinderPoint(thickness, length1, 0, 0, 0);
                    p = rotateX(p, angle.x);
                    p = translate(p, origin.x, origin.y, origin.z);
                    targetPoints.push(p);
                }

                for (let i = 0; i < limbCount; i++) {
                    let p = getCylinderPoint(thickness * 0.8, length2, 0, 0, 0);
                    let elbowAngle = angle.elbow;
                    p = rotateX(p, elbowAngle);
                    p = translate(p, 0, length1, 0);
                    p = rotateX(p, angle.x);
                    p = translate(p, origin.x, origin.y, origin.z);
                    targetPoints.push(p);
                }
            };

            addLimb({ x: 22, y: -50, z: 0 }, 28, 25, { x: 0, z: -0.15, elbow: -0.2 }, 5.5);
            addLimb({ x: -22, y: -50, z: 0 }, 28, 25, { x: 0, z: 0.15, elbow: -0.2 }, 5.5);

            return targetPoints;
        };

        const render = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.shadowBlur = 0;

            const cx = canvas.width / 2;
            const cy = canvas.height / 2 + 150;

            const targets = generatePose(time);
            const particles = particlesRef.current;

            particles.forEach((p, i) => {
                const targetIndex = i % targets.length;
                const target = targets[targetIndex];

                const lerpSpeed = 0.8;

                p.x += (target.x - p.x) * lerpSpeed;
                p.y += (target.y - p.y) * lerpSpeed;
                p.z += (target.z - p.z) * lerpSpeed;

                const proj = project({ x: p.x, y: p.y, z: p.z }, cx, cy);

                if (proj.visible) {
                    const size = Math.max(0.2, proj.scale * 20);

                    if (Math.random() < 0.02) p.char = Math.random() > 0.5 ? '1' : '0';

                    let color = 'rgba(34, 197, 94, 0.9)';

                    if (target.isActive) {
                        color = '#ffffff';
                    }

                    ctx.font = `${size}px "Share Tech Mono"`;
                    ctx.fillStyle = color;
                    ctx.fillText(p.char, proj.x, proj.y);
                }
            });

            animationRef.current = requestAnimationFrame(render);
        };

        animationRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
        />
    );
};

export default BinaryAvatar;
