import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';

const throttle = (func, limit) => {
  let lastCall = 0;
  return function (...args) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};


function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 82, g: 39, b: 255 }; // Default baseColor
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

function parseColor(color) {
    if (!color) return { r: 255, g: 255, b: 255, a: 0.1 };
    
    if (color.startsWith('#')) return hexToRgb(color);
    
    if (color.startsWith('rgb')) {
        const parts = color.match(/[\d.]+/g);
        if (parts && parts.length >= 3) {
            return {
                r: parseInt(parts[0]),
                g: parseInt(parts[1]),
                b: parseInt(parts[2]),
                a: parts[3] ? parseFloat(parts[3]) : 1
            };
        }
    }
    
    return { r: 255, g: 255, b: 255, a: 0.1 };
}

const DotGrid = ({
  dotSize = 3,
  gap = 25,
  baseColor = 'rgba(255,255,255,0.1)',
  activeColor = '#6366f1',
  proximity = 120,
  speedTrigger = 100,
  shockRadius = 200,
  shockStrength = 15,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.2,
  className = '',
  style
}) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const dotsRef = useRef([]);
  const pointerRef = useRef({
    x: -1000,
    y: -1000,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0
  });

  const baseRgb = useMemo(() => parseColor(baseColor), [baseColor]);
  const activeRgb = useMemo(() => parseColor(activeColor), [activeColor]);


  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    const cell = dotSize + gap;
    const cols = Math.floor(width / cell) + 1;
    const rows = Math.floor(height / cell) + 1;

    const startX = (width - (cols - 1) * cell) / 2;
    const startY = (height - (rows - 1) * cell) / 2;

    const dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({ 
          cx: startX + x * cell, 
          cy: startY + y * cell, 
          xOffset: 0, 
          yOffset: 0, 
          active: 0 
        });
      }
    }
    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    let rafId;
    const proxSq = proximity * proximity;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { x: px, y: py } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const dx = dot.cx - px;
        const dy = dot.cy - py;
        const dsq = dx * dx + dy * dy;

        let alpha = baseRgb.a !== undefined ? baseRgb.a : 1;
        let r = baseRgb.r;
        let g = baseRgb.g;
        let b = baseRgb.b;

        if (dsq <= proxSq) {
          const dist = Math.sqrt(dsq);
          const t = 1 - dist / proximity;
          r = Math.round(r + (activeRgb.r - r) * t);
          g = Math.round(g + (activeRgb.g - g) * t);
          b = Math.round(b + (activeRgb.b - b) * t);
          alpha = alpha + (1 - alpha) * t;
        }

        ctx.beginPath();
        ctx.arc(dot.cx + dot.xOffset, dot.cy + dot.yOffset, dotSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [proximity, baseColor, activeColor, activeRgb, baseRgb, dotSize]);

  useEffect(() => {
    buildGrid();
    const handleResize = () => buildGrid();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [buildGrid]);

  useEffect(() => {
    const onMove = e => {
      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;
      
      let vx = (dx / Math.max(dt, 1)) * 1000;
      let vy = (dy / Math.max(dt, 1)) * 1000;
      let speed = Math.hypot(vx, vy);
      
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }
      
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      const rect = canvasRef.current.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      if (speed > speedTrigger) {
        for (const dot of dotsRef.current) {
          const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
          if (dist < proximity) {
            gsap.to(dot, {
              xOffset: vx * 0.02,
              yOffset: vy * 0.02,
              duration: 0.1,
              overwrite: 'auto',
              onComplete: () => {
                gsap.to(dot, {
                  xOffset: 0,
                  yOffset: 0,
                  duration: returnDuration,
                  ease: 'power2.out'
                });
              }
            });
          }
        }
      }
    };

    const onClick = e => {
      const rect = canvasRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      
      for (const dot of dotsRef.current) {
        const dx = dot.cx - cx;
        const dy = dot.cy - cy;
        const dist = Math.hypot(dx, dy);
        
        if (dist < shockRadius) {
          const falloff = Math.max(0, 1 - dist / shockRadius);
          gsap.to(dot, {
            xOffset: (dx / dist) * shockStrength * falloff * 20,
            yOffset: (dy / dist) * shockStrength * falloff * 20,
            duration: 0.1,
            overwrite: 'auto',
            onComplete: () => {
              gsap.to(dot, {
                xOffset: 0,
                yOffset: 0,
                duration: returnDuration,
                ease: 'elastic.out(1, 0.3)'
              });
            }
          });
        }
      }
    };

    const throttledMove = throttle(onMove, 16);
    window.addEventListener('mousemove', throttledMove);
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('mousemove', throttledMove);
      window.removeEventListener('click', onClick);
    };
  }, [maxSpeed, speedTrigger, proximity, returnDuration, shockRadius, shockStrength]);

  return (
    <div ref={wrapperRef} className={`w-full h-full relative overflow-hidden ${className}`} style={style}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

export default DotGrid;
