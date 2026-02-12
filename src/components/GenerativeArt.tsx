"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * GenerativeArt — A flowing wireframe terrain with connected particles.
 * Inspired by computational/data-landscape aesthetics.
 * Pure Canvas 2D — no dependencies, ~4KB.
 */

interface Point {
  x: number;
  y: number;
  z: number;
  baseY: number;
  sx: number;
  sy: number;
  opacity: number;
}

export default function GenerativeArt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);
  const pointsRef = useRef<Point[]>([]);
  const gridRef = useRef({ cols: 0, rows: 0 });

  const initGrid = useCallback((width: number, height: number) => {
    const points: Point[] = [];
    const spacing = 32;
    const cols = Math.ceil(width / spacing) + 4;
    const rows = Math.ceil(height / spacing) + 4;
    const offsetX = (width - (cols - 1) * spacing) / 2;
    const offsetY = (height - (rows - 1) * spacing) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        points.push({
          x: offsetX + col * spacing,
          y: offsetY + row * spacing,
          z: 0,
          baseY: offsetY + row * spacing,
          sx: 0,
          sy: 0,
          opacity: 0,
        });
      }
    }

    pointsRef.current = points;
    gridRef.current = { cols, rows };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initGrid(width, height);
    }

    resize();
    window.addEventListener("resize", resize);

    // Track mouse for subtle interactive parallax
    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    }
    canvas.addEventListener("mousemove", onMouseMove);

    // === ANIMATION LOOP ===
    function draw() {
      timeRef.current += 0.004;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Clear to black
      ctx!.fillStyle = "#0A0A0A";
      ctx!.fillRect(0, 0, width, height);

      const { cols, rows } = gridRef.current;
      const points = pointsRef.current;

      // Perspective parameters
      const focalLength = 600;
      const cameraZ = -200;
      const tiltX = (my - 0.5) * 0.3;
      const tiltY = (mx - 0.5) * 0.3;

      // Update point positions with wave functions
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        // Multiple overlapping sine waves for organic terrain
        const nx = col / cols;
        const ny = row / rows;

        const wave1 = Math.sin(nx * 4 + t * 1.2) * Math.cos(ny * 3 + t * 0.8) * 40;
        const wave2 = Math.sin(nx * 7 - t * 0.6 + ny * 2) * 18;
        const wave3 = Math.cos(ny * 5 + t * 1.5 + nx * 3) * 25;
        const wave4 = Math.sin((nx + ny) * 6 + t * 0.4) * 12;

        // Mouse influence — gentle repulsion wave
        const dx = nx - mx;
        const dy = ny - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseWave = Math.exp(-dist * 3) * Math.sin(dist * 12 - t * 3) * 30;

        p.z = wave1 + wave2 + wave3 + wave4 + mouseWave;

        // Apply perspective projection with camera tilt
        const px = p.x - width / 2;
        const py = p.baseY - height / 2;
        const pz = p.z;

        // Rotate around X (tilt)
        const ry = py * Math.cos(tiltX) - pz * Math.sin(tiltX);
        const rz1 = py * Math.sin(tiltX) + pz * Math.cos(tiltX);

        // Rotate around Y (pan)
        const rx = px * Math.cos(tiltY) + rz1 * Math.sin(tiltY);
        const rz = -px * Math.sin(tiltY) + rz1 * Math.cos(tiltY);

        const perspective = focalLength / (focalLength + rz - cameraZ);
        p.sx = rx * perspective + width / 2;
        p.sy = ry * perspective + height / 2;

        // Depth-based opacity — farther points fade
        const depthFactor = Math.max(0, Math.min(1, (rz + 200) / 400));
        p.opacity = 0.15 + depthFactor * 0.55;
      }

      // Draw connections (grid edges)
      ctx!.lineWidth = 0.5;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          const p = points[i];

          // Horizontal edge
          if (col < cols - 1) {
            const right = points[i + 1];
            const alpha = Math.min(p.opacity, right.opacity) * 0.5;
            ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx!.beginPath();
            ctx!.moveTo(p.sx, p.sy);
            ctx!.lineTo(right.sx, right.sy);
            ctx!.stroke();
          }

          // Vertical edge
          if (row < rows - 1) {
            const below = points[i + cols];
            const alpha = Math.min(p.opacity, below.opacity) * 0.5;
            ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx!.beginPath();
            ctx!.moveTo(p.sx, p.sy);
            ctx!.lineTo(below.sx, below.sy);
            ctx!.stroke();
          }
        }
      }

      // Draw vertex points — larger points at wave peaks
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const heightIntensity = Math.abs(p.z) / 80;
        const radius = 0.8 + heightIntensity * 2;
        const alpha = p.opacity * (0.4 + heightIntensity * 0.6);

        // Terracotta tint on peaks, white everywhere else
        if (p.z > 25) {
          const terracottaBlend = Math.min(1, (p.z - 25) / 40);
          const r = Math.round(255 + (204 - 255) * terracottaBlend);
          const g = Math.round(255 + (85 - 255) * terracottaBlend);
          const b = Math.round(255 + (54 - 255) * terracottaBlend);
          ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        }

        ctx!.beginPath();
        ctx!.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Floating accent particles — drifting embers
      const particleCount = 20;
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 137.508; // golden angle
        const px = ((Math.sin(seed + t * 0.3) * 0.5 + 0.5) * width * 1.2) - width * 0.1;
        const py = ((Math.cos(seed * 0.7 + t * 0.2) * 0.5 + 0.5) * height * 1.2) - height * 0.1;
        const pAlpha = (Math.sin(t * 2 + seed) * 0.5 + 0.5) * 0.3 + 0.05;
        const pRadius = 1 + Math.sin(t + seed * 0.5) * 0.8;

        // Terracotta ember color
        ctx!.fillStyle = `rgba(204, 85, 54, ${pAlpha})`;
        ctx!.beginPath();
        ctx!.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Subtle scan line effect — horizontal lines
      ctx!.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx!.lineWidth = 0.5;
      for (let y = 0; y < height; y += 4) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }

      // Corner vignette
      const gradient = ctx!.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.7
      );
      gradient.addColorStop(0, "rgba(10, 10, 10, 0)");
      gradient.addColorStop(1, "rgba(10, 10, 10, 0.6)");
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, width, height);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animRef.current);
    };
  }, [initGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#0A0A0A" }}
    />
  );
}
