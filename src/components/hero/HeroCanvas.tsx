/**
 * HeroCanvas — GigEasy Signature "Gig Network" Living Canvas
 *
 * Visualizing Worker ↔ Job ↔ Employer connections.
 * Cohesive Brand Blue System (#1A68D5) — ZERO random orange accents.
 * Guaranteed safe boundaries: zero clipping at phone screen edges.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';

export type HeroPhase =
  | 'SPAWN'
  | 'GIGS'
  | 'CONNECT'
  | 'HIRED'
  | 'ACCELERATE'
  | 'EMERGE'
  | 'LIFT'
  | 'INTERACTIVE';

export interface HeroCanvasProps {
  onPhaseChange?: (phase: HeroPhase) => void;
  activeModeTransition?: 'worker' | 'employer' | null;
}

// ─── Cohesive Brand Palette (Zero Random Orange) ──────────────────────────────
const C = {
  bg: '#F8FAFC',                          // Clean crisp warm off-white
  bgVignette: '#EEF4FC',                  // Soft ambient radial tint
  cardBg: '#FFFFFF',                      // Pure white floating surface
  cardBorder: '#E2E8F0',                  // Subtle clean border
  cardShadow: 'rgba(15, 23, 42, 0.08)',
  ink: '#0F172A',                         // Crisp dark slate text
  textMuted: '#64748B',                   // Secondary text
  primary: '#1A68D5',                     // Vibrant brand blue
  primaryDark: '#124FA8',                 // Deep brand blue
  primaryLight: '#D6E6FA',                // Soft blue accent
  primaryMuted: '#EBF3FC',                // Lightest blue surface
  lineColor: 'rgba(26, 104, 213, 0.24)',  // Thread line
  lineActive: 'rgba(26, 104, 213, 0.85)',
};

// Easing Helpers
const easeOutCubic = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const easeOutBack = (t: number) => {
  const c1 = 1.35;
  const c3 = c1 + 1;
  const p = Math.min(Math.max(t, 0), 1) - 1;
  return 1 + c3 * Math.pow(p, 3) + c1 * Math.pow(p, 2);
};
const easeInOutQuad = (t: number) => {
  const p = Math.min(Math.max(t, 0), 1);
  return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
};

// Entities
interface WorkerNode {
  id: string;
  name: string;
  role: string;
  initialY: number;
  delay: number;
}

interface EmployerNode {
  id: string;
  company: string;
  location: string;
  initialY: number;
  delay: number;
}

interface GigNode {
  id: string;
  workerId: string;
  employerId: string;
  wage: string;
  title: string;
  initialY: number;
  delay: number;
  isHero?: boolean;
}

const WORKERS: WorkerNode[] = [
  { id: 'w1', name: 'Ravi K.', role: 'Loading', initialY: 0.50, delay: 0.05 },
  { id: 'w2', name: 'Rajesh V.', role: 'Electrician', initialY: 0.24, delay: 0.14 },
  { id: 'w3', name: 'Sanjay M.', role: 'Delivery', initialY: 0.76, delay: 0.20 },
];

const EMPLOYERS: EmployerNode[] = [
  { id: 'e1', company: 'Bharat Log.', location: 'Noida 62', initialY: 0.50, delay: 0.10 },
  { id: 'e2', company: 'TechnoFab', location: 'Gr. Noida', initialY: 0.24, delay: 0.18 },
  { id: 'e3', company: 'QuickHaul', location: 'Sec 18', initialY: 0.76, delay: 0.24 },
];

const GIGS: GigNode[] = [
  { id: 'g1', workerId: 'w1', employerId: 'e1', wage: '₹1,000', title: 'Loading Helper', initialY: 0.50, delay: 0.35, isHero: true },
  { id: 'g2', workerId: 'w2', employerId: 'e2', wage: '₹1,400', title: 'Electrician', initialY: 0.24, delay: 0.48 },
  { id: 'g3', workerId: 'w3', employerId: 'e3', wage: '₹850', title: 'Delivery', initialY: 0.76, delay: 0.56 },
];

export const HeroCanvas: React.FC<HeroCanvasProps> = ({
  onPhaseChange,
  activeModeTransition,
}) => {
  const containerRef = useRef<View>(null);
  const cbRef = useRef(onPhaseChange);
  cbRef.current = onPhaseChange;

  const transRef = useRef(activeModeTransition);
  transRef.current = activeModeTransition;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const t = setTimeout(() => cbRef.current?.('INTERACTIVE'), 150);
      return () => clearTimeout(t);
    }

    let rafHandle = 0;
    let cleanupFn: () => void = () => {};

    function init() {
      const container = containerRef.current as unknown as HTMLElement;
      if (!container || container.clientWidth === 0) {
        setTimeout(init, 30);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const W = container.clientWidth;
      const H = container.clientHeight || Dimensions.get('window').height;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);

      let phase: HeroPhase = 'SPAWN';
      let globalTime = 0;
      let lastTs = 0;
      let mouseX = 0, mouseY = 0;
      let targetMouseX = 0, targetMouseY = 0;
      let settleProgress = 0;
      let transProgress = 0;

      function updatePhase(time: number) {
        let nextPhase: HeroPhase = phase;
        if (time < 0.32) nextPhase = 'SPAWN';
        else if (time < 0.80) nextPhase = 'GIGS';
        else if (time < 1.55) nextPhase = 'CONNECT';
        else if (time < 2.25) nextPhase = 'HIRED';
        else if (time < 2.55) nextPhase = 'ACCELERATE';
        else if (time < 2.85) nextPhase = 'EMERGE';
        else if (time < 3.35) nextPhase = 'LIFT';
        else nextPhase = 'INTERACTIVE';

        if (nextPhase !== phase) {
          phase = nextPhase;
          cbRef.current?.(phase);
        }
      }

      function render(ts: number) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min((ts - lastTs) / 1000, 0.05);
        lastTs = ts;
        globalTime += dt;

        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        updatePhase(globalTime);

        if (globalTime > 2.85) {
          const st = (globalTime - 2.85) / 0.50;
          settleProgress = Math.min(easeOutCubic(st), 1);
        }

        if (transRef.current) {
          transProgress = Math.min(transProgress + dt * 2.5, 1);
        }

        draw(ctx, W, H, globalTime, mouseX, mouseY, settleProgress, transProgress);
        rafHandle = requestAnimationFrame(render);
      }

      function draw(
        c: CanvasRenderingContext2D,
        width: number,
        height: number,
        time: number,
        px: number,
        py: number,
        settle: number,
        trans: number
      ) {
        c.clearRect(0, 0, width, height);

        // 1. Background
        c.fillStyle = C.bg;
        c.fillRect(0, 0, width, height);

        // 2. Soft Ambient Vignette
        const isMobile = width < 480;
        const centerY = height * (isMobile ? 0.46 : 0.45);
        const centerX = width * 0.5 + px * 0.12;

        const radGrad = c.createRadialGradient(
          centerX,
          centerY,
          20,
          centerX,
          centerY,
          width * 0.62
        );
        radGrad.addColorStop(0, '#FFFFFF');
        radGrad.addColorStop(0.65, C.bg);
        radGrad.addColorStop(1, C.bgVignette);
        c.fillStyle = radGrad;
        c.fillRect(0, 0, width, height);

        // Responsive Dimensions & Clamped Safe Zones (Guaranteed zero clipping)
        const cardW = isMobile ? 86 : 104;
        const cardH = 34;
        const safePad = 14;
        const xSpan = Math.max(isMobile ? width * 0.60 : Math.min(width * 0.68, 440), 160);
        const yTop = height * (isMobile ? 0.28 : 0.26);
        const ySpan = height * (isMobile ? 0.32 : 0.30);

        const isHiredActive = time >= 1.55;
        const hireAge = Math.max(0, time - 1.55);
        const heroPull = isHiredActive ? Math.sin(Math.min(hireAge * 4.0, Math.PI)) * 0.04 : 0;
        const livingAlpha = 1 - settle * 0.08;

        const workerPosMap: Record<string, { x: number; y: number; alpha: number; scale: number }> = {};
        const employerPosMap: Record<string, { x: number; y: number; alpha: number; scale: number }> = {};
        const gigPosMap: Record<string, { x: number; y: number; alpha: number; scale: number }> = {};

        // Worker Positions (Safely Clamped)
        WORKERS.forEach((w) => {
          const spawnT = Math.max(0, time - w.delay);
          const alpha = Math.min(spawnT / 0.32, 1);
          const scale = easeOutBack(Math.min(spawnT / 0.36, 1));

          let curX = width * 0.5 - xSpan * 0.5 + px * 0.16;
          let curY = yTop + (w.initialY - 0.24) * (ySpan / 0.52) + py * 0.12;
          if (w.id === 'w1' && isHiredActive) curX += xSpan * heroPull;

          // Safe clamping: left side card stays inside viewport
          curX = Math.max(cardW + safePad, Math.min(curX, width * 0.5 - 42));
          workerPosMap[w.id] = { x: curX, y: curY, alpha, scale };
        });

        // Employer Positions (Safely Clamped)
        EMPLOYERS.forEach((e) => {
          const spawnT = Math.max(0, time - e.delay);
          const alpha = Math.min(spawnT / 0.32, 1);
          const scale = easeOutBack(Math.min(spawnT / 0.36, 1));

          let curX = width * 0.5 + xSpan * 0.5 + px * 0.16;
          let curY = yTop + (e.initialY - 0.24) * (ySpan / 0.52) + py * 0.12;
          if (e.id === 'e1' && isHiredActive) curX -= xSpan * heroPull;

          // Safe clamping: right side card stays inside viewport
          curX = Math.min(width - cardW - safePad, Math.max(curX, width * 0.5 + 42));
          employerPosMap[e.id] = { x: curX, y: curY, alpha, scale };
        });

        // Gig Positions
        GIGS.forEach((g) => {
          const spawnT = Math.max(0, time - g.delay);
          const alpha = Math.min(spawnT / 0.32, 1);
          const scale = easeOutBack(Math.min(spawnT / 0.36, 1));

          let curX = width * 0.5 + px * 0.08;
          let curY = yTop + (g.initialY - 0.24) * (ySpan / 0.52) + py * 0.08;
          curY += Math.sin(time * 2.0 + g.initialY * 5) * 2.5;

          gigPosMap[g.id] = { x: curX, y: curY, alpha, scale };
        });

        // 3. Connecting Threads & Traveling Opportunity Pulses (All Brand Blue)
        if (time >= 0.80) {
          GIGS.forEach((g, i) => {
            const wPos = workerPosMap[g.workerId];
            const ePos = employerPosMap[g.employerId];
            const gPos = gigPosMap[g.id];
            if (!wPos || !ePos || !gPos || gPos.alpha < 0.2) return;

            const connectStart = 0.80 + i * 0.15;
            const connProg = easeInOutQuad(Math.max(0, time - connectStart) / 0.40);
            if (connProg <= 0) return;

            const isHero = g.isHero;
            const isHiredNow = isHero && time >= 1.65;

            c.save();
            c.globalAlpha = (isHero ? 1 : Math.min(connProg, 0.60)) * livingAlpha;

            // Worker -> Gig Curve
            c.beginPath();
            c.moveTo(wPos.x, wPos.y);
            const targetX1 = wPos.x + (gPos.x - 30 - wPos.x) * connProg;
            const targetY1 = wPos.y + (gPos.y - wPos.y) * connProg;
            c.quadraticCurveTo((wPos.x + gPos.x) * 0.5, (wPos.y + gPos.y) * 0.5 - 4, targetX1, targetY1);
            c.lineWidth = isHero ? (isHiredNow ? 2.0 : 1.5) : 1.0;
            c.strokeStyle = isHero ? (isHiredNow ? C.primary : C.lineActive) : C.lineColor;
            c.stroke();

            // Gig -> Employer Curve
            c.beginPath();
            c.moveTo(gPos.x + 30, gPos.y);
            const targetX2 = (gPos.x + 30) + (ePos.x - (gPos.x + 30)) * connProg;
            const targetY2 = gPos.y + (ePos.y - gPos.y) * connProg;
            c.quadraticCurveTo((gPos.x + ePos.x) * 0.5, (gPos.y + ePos.y) * 0.5 - 4, targetX2, targetY2);
            c.lineWidth = isHero ? (isHiredNow ? 2.0 : 1.5) : 1.0;
            c.strokeStyle = isHero ? (isHiredNow ? C.primary : C.lineActive) : C.lineColor;
            c.stroke();
            c.restore();

            // Traveling Signal Pulse (Subtle Brand Blue Signal)
            if (connProg >= 0.90) {
              const pulseT = (time * 1.4 + i * 0.33) % 1;
              const pulseX = wPos.x + (ePos.x - wPos.x) * pulseT;
              const pulseY = wPos.y + (ePos.y - wPos.y) * pulseT;

              c.save();
              c.globalAlpha = (isHero ? 0.90 : 0.45) * livingAlpha;
              c.fillStyle = C.primary;
              c.beginPath();
              c.arc(pulseX, pulseY, isHero ? 2.6 : 1.6, 0, Math.PI * 2);
              c.fill();
              c.restore();
            }
          });
        }

        // 4. Worker Nodes (Cards)
        WORKERS.forEach((w) => {
          const pos = workerPosMap[w.id];
          if (!pos || pos.alpha <= 0.01) return;

          c.save();
          c.translate(pos.x, pos.y);
          c.scale(pos.scale, pos.scale);
          c.globalAlpha = pos.alpha * livingAlpha;

          c.shadowColor = C.cardShadow;
          c.shadowBlur = 8;
          c.shadowOffsetY = 2;

          drawRoundedRect(c, -cardW, -cardH * 0.5, cardW, cardH, 17);
          c.fillStyle = C.cardBg;
          c.fill();

          c.shadowColor = 'transparent';
          c.strokeStyle = w.id === 'w1' && isHiredActive ? C.primary : C.cardBorder;
          c.lineWidth = w.id === 'w1' && isHiredActive ? 1.5 : 1;
          c.stroke();

          // Avatar Icon
          c.beginPath();
          c.arc(-cardW + 16, 0, 11, 0, Math.PI * 2);
          c.fillStyle = C.primaryMuted;
          c.fill();
          c.strokeStyle = C.primary;
          c.lineWidth = 1;
          c.stroke();

          c.fillStyle = C.primary;
          c.font = 'bold 9px Inter, system-ui, sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(w.name[0], -cardW + 16, 0);

          // Name & Role
          c.fillStyle = C.ink;
          c.font = `bold ${isMobile ? '8.5px' : '9.5px'} Inter, system-ui, sans-serif`;
          c.textAlign = 'left';
          c.fillText(w.name, -cardW + 32, -4);

          c.fillStyle = C.primary;
          c.font = '600 7.5px Inter, system-ui, sans-serif';
          c.fillText(w.role, -cardW + 32, 6);

          c.restore();
        });

        // 5. Employer Nodes (Cards)
        EMPLOYERS.forEach((e) => {
          const pos = employerPosMap[e.id];
          if (!pos || pos.alpha <= 0.01) return;

          c.save();
          c.translate(pos.x, pos.y);
          c.scale(pos.scale, pos.scale);
          c.globalAlpha = pos.alpha * livingAlpha;

          c.shadowColor = C.cardShadow;
          c.shadowBlur = 8;
          c.shadowOffsetY = 2;

          drawRoundedRect(c, 0, -cardH * 0.5, cardW, cardH, 17);
          c.fillStyle = C.cardBg;
          c.fill();

          c.shadowColor = 'transparent';
          c.strokeStyle = e.id === 'e1' && isHiredActive ? C.primary : C.cardBorder;
          c.lineWidth = e.id === 'e1' && isHiredActive ? 1.5 : 1;
          c.stroke();

          // Company Icon
          c.beginPath();
          c.arc(cardW - 16, 0, 11, 0, Math.PI * 2);
          c.fillStyle = C.primaryMuted;
          c.fill();
          c.strokeStyle = C.primaryLight;
          c.lineWidth = 1;
          c.stroke();

          c.fillStyle = C.primary;
          c.font = 'bold 9px Inter, system-ui, sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(e.company[0], cardW - 16, 0);

          // Company Name & Location
          c.fillStyle = C.ink;
          c.font = `bold ${isMobile ? '8.5px' : '9.5px'} Inter, system-ui, sans-serif`;
          c.textAlign = 'left';
          c.fillText(e.company, 10, -4);

          c.fillStyle = C.textMuted;
          c.font = '500 7.5px Inter, system-ui, sans-serif';
          c.fillText(e.location, 10, 6);

          c.restore();
        });

        // 6. Center Gig Wage Nodes (Cohesive Neutral / Brand Blue System)
        GIGS.forEach((g) => {
          const pos = gigPosMap[g.id];
          if (!pos || pos.alpha <= 0.01) return;

          c.save();
          c.translate(pos.x, pos.y);
          c.scale(pos.scale, pos.scale);
          c.globalAlpha = pos.alpha * livingAlpha;

          const isHero = g.isHero;
          const isHired = isHero && isHiredActive;
          const gCardW = isMobile ? 76 : 90;
          const gCardH = 30;

          c.shadowColor = isHired ? 'rgba(26, 104, 213, 0.22)' : C.cardShadow;
          c.shadowBlur = 10;
          c.shadowOffsetY = 2;

          drawRoundedRect(c, -gCardW * 0.5, -gCardH * 0.5, gCardW, gCardH, 15);
          c.fillStyle = isHired ? C.primary : C.cardBg;
          c.fill();

          c.shadowColor = 'transparent';
          c.strokeStyle = isHired ? C.primaryDark : C.cardBorder;
          c.lineWidth = isHired ? 1.5 : 1;
          c.stroke();

          // Wage Text
          c.fillStyle = isHired ? '#FFFFFF' : C.ink;
          c.font = `bold ${isMobile ? '10px' : '11px'} Inter, system-ui, sans-serif`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(g.wage, 0, isHired ? -4 : 0);

          if (isHired) {
            c.fillStyle = 'rgba(255,255,255,0.90)';
            c.font = 'bold 7px Inter, system-ui, sans-serif';
            c.fillText('Matched ✓', 0, 6);
          }

          c.restore();
        });

        // 7. Hero Match Ring Burst (Brand Blue)
        if (isHiredActive && time < 2.50 && gigPosMap['g1']) {
          const hg = gigPosMap['g1'];
          const burstAge = (time - 1.55) / 0.85;
          const burstRadius = burstAge * 42;
          const burstAlpha = Math.max(0, 1 - burstAge);

          c.save();
          c.translate(hg.x, hg.y);
          c.beginPath();
          c.arc(0, 0, burstRadius, 0, Math.PI * 2);
          c.strokeStyle = `rgba(26, 104, 213, ${burstAlpha * 0.35})`;
          c.lineWidth = 1.6;
          c.stroke();
          c.restore();
        }

        // 8. Outro Transition on CTA Tap
        if (trans > 0) {
          c.fillStyle = `rgba(248, 250, 252, ${trans})`;
          c.fillRect(0, 0, width, height);
        }
      }

      function drawRoundedRect(
        ctx2: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
      ) {
        ctx2.beginPath();
        ctx2.moveTo(x + r, y);
        ctx2.lineTo(x + w - r, y);
        ctx2.arcTo(x + w, y, x + w, y + r, r);
        ctx2.lineTo(x + w, y + h - r);
        ctx2.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx2.lineTo(x + r, y + h);
        ctx2.arcTo(x, y + h, x, y + h - r, r);
        ctx2.lineTo(x, y + r);
        ctx2.arcTo(x, y, x + r, y, r);
        ctx2.closePath();
      }

      const handleMouseMove = (e: MouseEvent) => {
        targetMouseX = ((e.clientX / W) - 0.5) * 14;
        targetMouseY = ((e.clientY / H) - 0.5) * 8;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          targetMouseX = ((t.clientX / W) - 0.5) * 10;
          targetMouseY = ((t.clientY / H) - 0.5) * 6;
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      rafHandle = requestAnimationFrame(render);

      cleanupFn = () => {
        cancelAnimationFrame(rafHandle);
        canvas.remove();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
      };
    }

    init();
    return () => cleanupFn();
  }, []);

  return <View ref={containerRef} style={styles.fill} />;
};

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
