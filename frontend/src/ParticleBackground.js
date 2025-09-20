// ParticleBackground.js
import React, { useRef, useEffect } from "react";


const PARTICLE_COUNT = 35;
const PARTICLE_RADIUS = 5;
const LINE_COLOR = "rgba(106, 90, 205, 0.5)";
const PARTICLE_COLOR = "#8ec5fc";
const TRIANGLE_COLOR = "rgba(142,197,252,0.09)";

function getTriangles(points) {
  // Return all unique triangles (combinations of 3 indices)
  const triangles = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      for (let k = j + 1; k < points.length; k++) {
        triangles.push([i, j, k]);
      }
    }
  }
  return triangles;
}

function randomVelocity() {
  return (Math.random() - 0.5) * 1.6;
}

export default function ParticleBackground({ blurOff = false }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    // Initialize particles
    particles.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7 + 40,
      vx: randomVelocity(),
      vy: randomVelocity(),
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);
      // Draw triangles (only those with short edges)
      const triangles = getTriangles(particles.current);
      for (const [i, j, k] of triangles) {
        const a = particles.current[i], b = particles.current[j], c = particles.current[k];
        const d1 = Math.hypot(a.x - b.x, a.y - b.y);
        const d2 = Math.hypot(b.x - c.x, b.y - c.y);
        const d3 = Math.hypot(c.x - a.x, c.y - a.y);
        if (d1 < 140 && d2 < 140 && d3 < 140) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineTo(c.x, c.y);
          ctx.closePath();
          ctx.fillStyle = TRIANGLE_COLOR;
          ctx.fill();
        }
      }
      // Draw lines between close particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const a = particles.current[i], b = particles.current[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = LINE_COLOR;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
      // Draw particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        ctx.beginPath();
        ctx.arc(particles.current[i].x, particles.current[i].y, PARTICLE_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = PARTICLE_COLOR;
        ctx.shadowColor = LINE_COLOR;
        ctx.shadowBlur = blurOff ? 0 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // Move particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        // Bounce off edges
        if (p.x < PARTICLE_RADIUS || p.x > width - PARTICLE_RADIUS) p.vx *= -1;
        if (p.y < PARTICLE_RADIUS || p.y > height - PARTICLE_RADIUS) p.vy *= -1;
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [blurOff]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      aria-hidden="true"
    />
  );
}
