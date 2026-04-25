import { useEffect, useRef } from "react";

interface BokehOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  speedX: number;
  speedY: number;
  pulseSpeed: number;
  pulsePhase: number;
}

const BOKEH_COLORS = [
  "0, 0%, 80%",      // Soft white
  "0, 0%, 70%",      // Light gray
  "220, 10%, 60%",   // Cool gray
  "0, 0%, 50%",      // Mid gray
  "200, 8%, 65%",    // Blue-gray
  "30, 8%, 60%",     // Warm gray
];

const BokehBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<BokehOrb[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initOrbs();
    };

    const initOrbs = () => {
      const numOrbs = Math.floor((canvas.width * canvas.height) / 80000) + 8;
      orbsRef.current = [];
      
      for (let i = 0; i < numOrbs; i++) {
        const radius = Math.random() * 120 + 60;
        orbsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          color: BOKEH_COLORS[Math.floor(Math.random() * BOKEH_COLORS.length)],
          opacity: Math.random() * 0.12 + 0.04,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          pulseSpeed: Math.random() * 0.0008 + 0.0003,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbsRef.current.forEach((orb) => {
        // Move orb slowly
        orb.x += orb.speedX;
        orb.y += orb.speedY;

        // Wrap around edges
        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        // Pulse effect
        const pulse = Math.sin(time * orb.pulseSpeed + orb.pulsePhase);
        const currentOpacity = orb.opacity + pulse * 0.03;
        const currentRadius = orb.radius + pulse * 8;

        // Create bokeh gradient
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, currentRadius
        );
        gradient.addColorStop(0, `hsla(${orb.color}, ${currentOpacity})`);
        gradient.addColorStop(0.4, `hsla(${orb.color}, ${currentOpacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${orb.color}, 0)`);

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ filter: "blur(40px)" }}
      aria-hidden="true"
    />
  );
};

export default BokehBackground;
