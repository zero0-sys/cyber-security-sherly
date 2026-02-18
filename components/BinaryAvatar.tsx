import React, { useRef, useEffect } from 'react';

interface BinaryAvatarProps {
    isSpeaking: boolean;
    gesture: 'idle' | 'wave' | 'think';
}

interface Point3D {
    x: number;
    y: number;
    z: number;
    isActive?: boolean; // Flag for special effects (like speech wave)
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

const BinaryAvatar: React.FC<BinaryAvatarProps> = ({ isSpeaking, gesture }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    // Refs to store state and particles to prevent re-initialization (flashing)
    const particlesRef = useRef<Particle[]>([]);
    const isSpeakingRef = useRef(isSpeaking);
    const gestureRef = useRef(gesture);

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    useEffect(() => {
        gestureRef.current = gesture;
    }, [gesture]);

    // Physics constants - Reduced slightly for a lighter, "thinner" feel
    const PARTICLES_COUNT = 4000;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Define counts in shared scope - reduced for slimmer build
        const torsoCount = 1200;
        const headCount = 600;

        const handleResize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        // Initialize Particles ONLY ONCE to prevent resetting
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

        // --------------------------
        // 3D Math Helpers
        // --------------------------
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

        const rotateZ = (p: Point3D, angle: number): Point3D => ({
            x: p.x * Math.cos(angle) - p.y * Math.sin(angle),
            y: p.x * Math.sin(angle) + p.y * Math.cos(angle),
            z: p.z,
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
            // ZOOM LOGIC: -360 Brings it much CLOSER (Forward)
            const scale = fov / (fov + p.z - 360);
            return {
                x: p.x * scale + cx,
                y: p.y * scale + cy,
                scale: scale,
                visible: scale > 0
            };
        };

        // --------------------------
        // Volumetric Body Generators
        // --------------------------

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

        // --------------------------
        // Skeletal Rig & Animation
        // --------------------------
        const generatePose = (t: number) => {
            const targetPoints: Point3D[] = [];
            const phase = t * 0.005;

            const speaking = isSpeakingRef.current;
            const currentGesture = gestureRef.current;

            // --- Animation Variables ---
            let torsoRotY = 0;
            let headRotY = 0;
            let headNod = 0;

            // Default static arm/leg positions
            // Moved arms closer to body (x: 16 instead of 22) for narrower shoulders
            let rArm = { x: 0, z: 0.15, elbow: 0.2 };
            let lArm = { x: 0, z: -0.15, elbow: 0.2 };
            // Legs
            let rLeg = { x: 0, z: 0, knee: 0.1 };
            let lLeg = { x: 0, z: 0, knee: 0.1 };

            // Gesture Logic
            if (currentGesture === 'wave') {
                rArm.z = 2.5; rArm.x = 0; rArm.elbow = 0.5 + Math.sin(phase * 4) * 0.5;
                headRotY = 0.3;
            }
            else if (currentGesture === 'think') {
                rArm.z = 2.0; rArm.x = 0.5; rArm.elbow = 2.2;
                headNod = 0.3; headRotY = -0.3;
            }

            // --- Speaking Logic (Movement) ---
            if (speaking) {
                // More noticeable nod
                headNod += Math.sin(t * 0.1) * 0.08;
                // Torso sway
                torsoRotY += Math.sin(t * 0.05) * 0.05;
                // Subtle hand gestures
                rArm.z += Math.sin(t * 0.1) * 0.2;
                lArm.z -= Math.sin(t * 0.12) * 0.1;
                rArm.elbow += Math.sin(t * 0.1) * 0.1;
            }

            // --- Construction ---

            // 1. Torso (Slimmer)
            // Radius reduced from 16 to 11
            for (let i = 0; i < torsoCount; i++) {
                let p = getCylinderPoint(11, 55, 0, -55, 0);
                // Taper waist slightly more for "teenager" look
                if (p.y > -20) { p.x *= 0.8; p.z *= 0.8; }
                let pFinal = rotateY(p, torsoRotY);
                targetPoints.push(pFinal);
            }

            // 2. Head (Smaller)
            const headY = -68; // Neck position
            for (let i = 0; i < headCount; i++) {
                // Radius reduced from 13 to 10
                let p = getSpherePoint(10, 0, 0, 0);
                p.y *= 1.1; // Elongate

                let isActive = false;

                // SPEECH WAVE VISUALIZER ON FACE
                if (speaking) {
                    // Target the mouth area
                    if (p.z > 6 && p.y > 1 && p.y < 8 && Math.abs(p.x) < 7) {
                        // Wave moving across face
                        const wave = Math.sin(p.x * 0.6 + t * 0.2);
                        if (wave > 0.4) {
                            isActive = true;
                            p.z += 2.0; // Pop out effect
                        }
                    }
                }

                // Transformations
                let pFinal = translate(p, 0, headY, 0);
                pFinal = translate(pFinal, 0, -headY, 0);
                pFinal = rotateX(pFinal, headNod);
                pFinal = rotateY(pFinal, headRotY + torsoRotY);
                pFinal = translate(pFinal, 0, headY, 0);

                pFinal.isActive = isActive;
                targetPoints.push(pFinal);
            }

            // 3. Limbs Helper
            const addLimb = (
                origin: Point3D,
                length1: number,
                length2: number,
                angle: { x: number, z: number, elbow: number }, // elbow/knee bend
                isLeft: boolean,
                thickness: number,
                isLeg: boolean = false
            ) => {
                const limbCount = 300; // Reduced count per limb

                // Upper
                for (let i = 0; i < limbCount; i++) {
                    let p = getCylinderPoint(thickness, length1, 0, 0, 0);

                    if (!isLeg) {
                        p = rotateX(p, angle.x); p = rotateZ(p, angle.z);
                    } else {
                        p = rotateX(p, angle.x); // Legs mainly rotate X for walking (if animated)
                    }

                    p = translate(p, origin.x, origin.y, origin.z);
                    p = rotateY(p, torsoRotY);
                    targetPoints.push(p);
                }

                // Lower
                for (let i = 0; i < limbCount; i++) {
                    let p = getCylinderPoint(thickness * 0.8, length2, 0, 0, 0);

                    if (!isLeg) {
                        // Arm elbow logic
                        let elbowAngle = angle.elbow;
                        p = rotateX(p, elbowAngle);
                        p = translate(p, 0, length1, 0);
                        p = rotateX(p, angle.x); p = rotateZ(p, angle.z);
                    } else {
                        // Leg knee logic (bend backwards)
                        let kneeAngle = angle.elbow; // Reusing 'elbow' prop for knee
                        p = rotateX(p, kneeAngle);
                        p = translate(p, 0, length1, 0);
                        p = rotateX(p, angle.x);
                    }

                    p = translate(p, origin.x, origin.y, origin.z);
                    p = rotateY(p, torsoRotY);
                    targetPoints.push(p);
                }
            };

            // Arms - Narrower shoulders (x: +/- 16), Thinner (thickness: 3.5)
            addLimb({ x: 16, y: -50, z: 0 }, 28, 25, { x: rArm.x, z: -rArm.z, elbow: -Math.abs(rArm.elbow) }, false, 3.5, false);
            addLimb({ x: -16, y: -50, z: 0 }, 28, 25, { x: lArm.x, z: -lArm.z, elbow: -Math.abs(lArm.elbow) }, true, 3.5, false);

            // Legs - Added for complete figure, thinner (4.0)
            addLimb({ x: 7, y: 0, z: 0 }, 32, 30, { x: rLeg.x, z: 0, elbow: Math.abs(rLeg.knee) }, false, 4.0, true);
            addLimb({ x: -7, y: 0, z: 0 }, 32, 30, { x: lLeg.x, z: 0, elbow: Math.abs(lLeg.knee) }, true, 4.0, true);

            return targetPoints;
        };

        // --------------------------
        // Render Loop
        // --------------------------
        const render = (time: number) => {
            // Clear canvas fully to remove trails/blur effect for a cleaner look
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.shadowBlur = 0;

            const cx = canvas.width / 2;
            // Adjusted CY to center the body including legs
            const cy = canvas.height / 2 + 100;

            const targets = generatePose(time);
            const particles = particlesRef.current;

            particles.forEach((p, i) => {
                const targetIndex = i % targets.length;
                const target = targets[targetIndex];

                // High lerp speed for solid "Hologram" feel
                const lerpSpeed = 0.8;

                p.x += (target.x - p.x) * lerpSpeed;
                p.y += (target.y - p.y) * lerpSpeed;
                p.z += (target.z - p.z) * lerpSpeed;

                const proj = project({ x: p.x, y: p.y, z: p.z }, cx, cy);

                if (proj.visible) {
                    // Increased size multiplier for boldness
                    const size = Math.max(0.2, proj.scale * 15); // Slightly reduced from 20 for cleaner look

                    if (Math.random() < 0.02) p.char = Math.random() > 0.5 ? '1' : '0';

                    let color = 'rgba(34, 197, 94, 0.9)'; // Dense Green

                    // White highlight for voice wave on face
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
    }, []); // Empty dependency array -> No re-init on prop change

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
        />
    );
};

export default BinaryAvatar;
