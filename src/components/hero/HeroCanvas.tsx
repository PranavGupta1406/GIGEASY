/**
 * HeroCanvas — GigEasy Signature "Gig Network" Living Canvas
 *
 * Visualizing Worker ↔ Job ↔ Employer connections.
 * Warm Palette: Deep Charcoal, Warm Ivory & Muted Terracotta.
 * Guaranteed safe boundaries: zero clipping at phone screen edges.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';

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

// ─── Cohesive Warm Palette (Warm Ivory, Charcoal & Terracotta) ───────────────
const C = {
  bg: '#F7F3EC',                          // Warm ivory canvas
  bgVignette: '#EDE8DF',                  // Warm sand radial tint
  cardBg: '#FDFAF6',                      // Warm cream floating surface
  cardBorder: '#DDD6CB',                  // Subtle warm border
  cardShadow: 'rgba(30, 28, 26, 0.06)',
  ink: '#1E1C1A',                         // Crisp deep charcoal text
  textMuted: '#5C5147',                   // Secondary warm brown text
  primary: '#C96F4A',                     // Terracotta primary node
  primaryDark: '#A94F32',                 // Deep terracotta
  primaryLight: '#F5E8DF',                // Soft terracotta tint
  primaryMuted: '#EDE8DF',                // Warm sand surface
  lineColor: 'rgba(30, 28, 26, 0.10)',    // Thread line
  lineActive: 'rgba(201, 111, 74, 0.70)', // Terracotta active thread

  // Subtle Realistic Map Layer Palette (Warm Muted Neutral Cartography)
  mapLand: '#F5F1E8',
  mapBlock: 'rgba(242, 237, 228, 0.65)',
  mapBlockAlt: 'rgba(238, 232, 222, 0.60)',
  mapBorder: 'rgba(218, 210, 198, 0.45)',
  mapGreen: 'rgba(202, 215, 196, 0.35)',
  mapWater: 'rgba(196, 210, 214, 0.35)',
  mapRoadExpresswayCasing: 'rgba(214, 205, 193, 0.55)',
  mapRoadExpressway: 'rgba(255, 255, 255, 0.85)',
  mapRoadArterial: 'rgba(224, 216, 204, 0.65)',
  mapRoadLocal: 'rgba(228, 221, 211, 0.42)',
  mapText: 'rgba(100, 88, 76, 0.42)',
  mapTextSub: 'rgba(132, 120, 108, 0.34)',
  mapRadiusRing: 'rgba(201, 111, 74, 0.08)',
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

      // Safe, non-intrusive location display: default gracefully to Noida
      let localCityLabel = 'NOIDA NCR • 28.628° N, 77.365° E';
      try {
        if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
          navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((res) => {
            if (res.state === 'granted') {
              navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude.toFixed(3);
                const lon = pos.coords.longitude.toFixed(3);
                localCityLabel = `LOCAL NETWORK • ${lat}° N, ${lon}° E`;
              }, () => {});
            }
          }).catch(() => {});
        }
      } catch (e) {}

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

        // 2.5. Realistic Subtle Local Area Map Context Layer (Noida / NCR Hub)
        // Sits as background context directly behind the worker <-> employer network
        drawRealisticMapLayer(c, width, height, isMobile, px, py, time, livingAlpha, localCityLabel);

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

        // 3. Connecting Threads & Traveling Opportunity Pulses (Active Burnt Orange & Neutral Inactive)
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
            c.strokeStyle = isHero ? (isHiredNow ? C.primary : C.lineActive) : 'rgba(30, 28, 26, 0.12)';
            c.stroke();

            // Gig -> Employer Curve
            c.beginPath();
            c.moveTo(gPos.x + 30, gPos.y);
            const targetX2 = (gPos.x + 30) + (ePos.x - (gPos.x + 30)) * connProg;
            const targetY2 = gPos.y + (ePos.y - gPos.y) * connProg;
            c.quadraticCurveTo((gPos.x + ePos.x) * 0.5, (gPos.y + ePos.y) * 0.5 - 4, targetX2, targetY2);
            c.lineWidth = isHero ? (isHiredNow ? 2.0 : 1.5) : 1.0;
            c.strokeStyle = isHero ? (isHiredNow ? C.primary : C.lineActive) : 'rgba(30, 28, 26, 0.12)';
            c.stroke();
            c.restore();

            // Traveling Signal Pulse (Orange ONLY for active matched connection; neutral for inactive)
            if (connProg >= 0.90) {
              const pulseT = (time * 1.4 + i * 0.33) % 1;
              const pulseX = wPos.x + (ePos.x - wPos.x) * pulseT;
              const pulseY = wPos.y + (ePos.y - wPos.y) * pulseT;

              c.save();
              c.globalAlpha = (isHero ? 0.90 : 0.40) * livingAlpha;
              c.fillStyle = isHero ? C.primary : 'rgba(90, 80, 70, 0.30)';
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

        // 6. Center Gig Wage Nodes (Cohesive Neutral & Terracotta Matched System)
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

          c.shadowColor = isHired ? 'rgba(201, 111, 74, 0.25)' : C.cardShadow;
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

        // 7. Hero Match Ring Burst (Warm Terracotta)
        if (isHiredActive && time < 2.50 && gigPosMap['g1']) {
          const hg = gigPosMap['g1'];
          const burstAge = (time - 1.55) / 0.85;
          const burstRadius = burstAge * 42;
          const burstAlpha = Math.max(0, 1 - burstAge);

          c.save();
          c.translate(hg.x, hg.y);
          c.beginPath();
          c.arc(0, 0, burstRadius, 0, Math.PI * 2);
          c.strokeStyle = `rgba(201, 111, 74, ${burstAlpha * 0.4})`;
          c.lineWidth = 1.6;
          c.stroke();
          c.restore();
        }

        // 8. Outro Transition on CTA Tap
        if (trans > 0) {
          c.fillStyle = `rgba(247, 243, 236, ${trans})`;
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

      /**
       * Realistic, subtle, desaturated local geographic map layer.
       * Soft, low contrast cartography representing Noida urban grid, expressways,
       * sectors (Sec 62, 63, 18, Knowledge Park), parks, and Hindon waterway.
       */
      function drawRealisticMapLayer(
        c2: CanvasRenderingContext2D,
        width: number,
        height: number,
        isMob: boolean,
        px2: number,
        py2: number,
        t: number,
        alpha: number,
        locLabel: string
      ) {
        // Region bounds: seamlessly extends from top header down to CTA boundary
        const yTop = 0;
        const yBottom = height * (isMob ? 0.67 : 0.66);
        const mapH = yBottom;
        if (mapH <= 0) return;

        // Gentle organic entry fade
        const enterFade = Math.min(t / 0.8, 1);
        const totalAlpha = alpha * enterFade;
        if (totalAlpha <= 0) return;

        c2.save();

        // Parallax for map: subtle depth separation from floating foreground cards
        const mapOffsetX = px2 * 0.05;
        const mapOffsetY = py2 * 0.04;
        const cx = width * 0.5 + mapOffsetX;
        const cy = height * 0.44 + mapOffsetY;
        const scale = isMob ? Math.min(width / 380, 1.05) : Math.min(width / 580, 1.2);

        // Set global alpha for background map
        c2.globalAlpha = totalAlpha;

        // ─── 0. Subtle Warm Light & Radial Depth Behind Header Logo ───
        // Creates designed, intentional framing behind GigEasy wordmark so it feels grounded
        const logoAura = c2.createRadialGradient(cx, isMob ? 62 : 68, 8, cx, isMob ? 62 : 68, 145);
        logoAura.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        logoAura.addColorStop(0.35, 'rgba(253, 249, 243, 0.82)');
        logoAura.addColorStop(0.80, 'rgba(247, 243, 236, 0.40)');
        logoAura.addColorStop(1, 'rgba(247, 243, 236, 0)');
        c2.fillStyle = logoAura;
        c2.beginPath();
        c2.arc(cx, isMob ? 62 : 68, 145, 0, Math.PI * 2);
        c2.fill();

        // ─── A. Natural Water Feature (Hindon Canal / River Meander) ───
        c2.save();
        c2.beginPath();
        const riverStartX = cx + 135 * scale;
        const riverStartY = yTop - 25;
        c2.moveTo(riverStartX, riverStartY);
        c2.bezierCurveTo(
          cx + 180 * scale, yTop + mapH * 0.35,
          cx + 125 * scale, yTop + mapH * 0.65,
          cx + 165 * scale, yBottom + 30
        );
        c2.strokeStyle = C.mapWater;
        c2.lineWidth = 14 * scale;
        c2.lineCap = 'round';
        c2.stroke();
        c2.restore();

        // ─── B. Green Spaces & Urban Parks ───
        c2.fillStyle = C.mapGreen;
        // 1. Sector 62 City Park / Green Belt (North-West)
        c2.beginPath();
        c2.ellipse(cx - 110 * scale, cy - 65 * scale, 34 * scale, 22 * scale, -0.2, 0, Math.PI * 2);
        c2.fill();

        // 2. Botanical Reserve / Golf Course (South-West)
        c2.beginPath();
        c2.ellipse(cx - 125 * scale, cy + 55 * scale, 40 * scale, 24 * scale, 0.25, 0, Math.PI * 2);
        c2.fill();

        // 3. Central Park & Institutional Green (Center-East)
        c2.beginPath();
        c2.ellipse(cx + 65 * scale, cy - 40 * scale, 28 * scale, 18 * scale, 0.1, 0, Math.PI * 2);
        c2.fill();

        // ─── C. Urban Superblocks & Sector Boundaries ───
        const sectors = [
          // Northern sectors extending into upper hero area behind header
          { x: cx - 95 * scale, y: cy - 150 * scale, w: 90 * scale, h: 48 * scale, label: 'SEC 62 N' },
          { x: cx + 15 * scale, y: cy - 152 * scale, w: 95 * scale, h: 46 * scale, label: 'SEC 63 N' },
          // Sector 62 (Center-North Tech & Institutional Core)
          { x: cx - 95 * scale, y: cy - 90 * scale, w: 90 * scale, h: 62 * scale, label: 'SEC 62' },
          // Sector 63 (Industrial / Logistics Zone)
          { x: cx + 15 * scale, y: cy - 92 * scale, w: 95 * scale, h: 58 * scale, label: 'SEC 63' },
          // Sector 59 / 58 (West IT corridor)
          { x: cx - 180 * scale, y: cy - 35 * scale, w: 75 * scale, h: 56 * scale, label: 'SEC 59' },
          // Sector 50 / 51 (Residential Garden zone)
          { x: cx - 85 * scale, y: cy + 18 * scale, w: 78 * scale, h: 54 * scale, label: 'SEC 50' },
          // Sector 18 (Commercial & Metro Hub)
          { x: cx - 170 * scale, y: cy + 32 * scale, w: 72 * scale, h: 58 * scale, label: 'SEC 18' },
          // Greater Noida / Knowledge Park (South-East)
          { x: cx + 22 * scale, y: cy + 22 * scale, w: 98 * scale, h: 60 * scale, label: 'KNOWLEDGE PK' },
        ];

        sectors.forEach((sec, idx) => {
          c2.fillStyle = idx % 2 === 0 ? C.mapBlock : C.mapBlockAlt;
          drawRoundedRect(c2, sec.x, sec.y, sec.w, sec.h, 6 * scale);
          c2.fill();

          c2.strokeStyle = C.mapBorder;
          c2.lineWidth = 0.8 * scale;
          c2.setLineDash([4, 4]);
          c2.stroke();
          c2.setLineDash([]);

          c2.fillStyle = C.mapText;
          c2.font = `600 ${Math.max(7 * scale, 6.5)}px Inter, system-ui, sans-serif`;
          c2.textAlign = 'left';
          c2.textBaseline = 'top';
          c2.fillText(sec.label, sec.x + 8 * scale, sec.y + 6 * scale);
        });

        // ─── D. Secondary & Local Street Grid ───
        c2.strokeStyle = C.mapRoadLocal;
        c2.lineWidth = 1.0 * scale;
        c2.beginPath();
        for (let i = -2; i <= 2; i++) {
          const gy = cy + i * 40 * scale;
          c2.moveTo(cx - 190 * scale, gy);
          c2.lineTo(cx + 170 * scale, gy);
        }
        for (let j = -3; j <= 3; j++) {
          const gx = cx + j * 50 * scale;
          c2.moveTo(gx, cy - 100 * scale);
          c2.lineTo(gx, cy + 90 * scale);
        }
        c2.stroke();

        // ─── E. Major Arterial & Primary Roads ───
        // Vikas Marg / Master Plan Road (East-West Major Road)
        c2.save();
        c2.beginPath();
        c2.moveTo(cx - 200 * scale, cy - 26 * scale);
        c2.lineTo(cx + 180 * scale, cy - 26 * scale);
        c2.strokeStyle = C.mapRoadArterial;
        c2.lineWidth = 2.4 * scale;
        c2.stroke();
        c2.restore();

        // Sector 62 / Dadri Link Arterial (North-South)
        c2.save();
        c2.beginPath();
        c2.moveTo(cx + 5 * scale, cy - 110 * scale);
        c2.lineTo(cx + 5 * scale, cy + 95 * scale);
        c2.strokeStyle = C.mapRoadArterial;
        c2.lineWidth = 2.4 * scale;
        c2.stroke();
        c2.restore();

        // ─── F. Noida-Greater Noida Expressway (Primary Diagonal Corridor) ───
        c2.save();
        c2.beginPath();
        c2.moveTo(cx - 160 * scale, cy - 105 * scale);
        c2.lineTo(cx + 170 * scale, cy + 95 * scale);

        c2.strokeStyle = C.mapRoadExpresswayCasing;
        c2.lineWidth = 5.2 * scale;
        c2.lineCap = 'round';
        c2.stroke();

        c2.strokeStyle = C.mapRoadExpressway;
        c2.lineWidth = 3.4 * scale;
        c2.stroke();

        c2.strokeStyle = C.mapBorder;
        c2.lineWidth = 0.8 * scale;
        c2.setLineDash([4, 6]);
        c2.stroke();
        c2.setLineDash([]);
        c2.restore();

        // ─── G. NH 24 / Delhi-Meerut Expressway (Northern Boundary Corridor) ───
        c2.save();
        c2.beginPath();
        c2.moveTo(cx - 200 * scale, cy - 100 * scale);
        c2.bezierCurveTo(cx - 50 * scale, cy - 104 * scale, cx + 50 * scale, cy - 98 * scale, cx + 200 * scale, cy - 102 * scale);
        c2.strokeStyle = C.mapRoadExpresswayCasing;
        c2.lineWidth = 4.2 * scale;
        c2.stroke();
        c2.strokeStyle = C.mapRoadExpressway;
        c2.lineWidth = 2.6 * scale;
        c2.stroke();
        c2.restore();

        // ─── H. Subtle Highway & Landmark Labels ───
        c2.save();
        c2.translate(cx + 25 * scale, cy + 15 * scale);
        c2.rotate(Math.atan2(200, 330));
        c2.fillStyle = C.mapTextSub;
        c2.font = `500 ${Math.max(6.8 * scale, 6)}px Inter, system-ui, sans-serif`;
        c2.textAlign = 'center';
        c2.textBaseline = 'bottom';
        c2.fillText('NOIDA-GR. NOIDA EXPWY', 0, -3 * scale);
        c2.restore();

        c2.fillStyle = C.mapTextSub;
        c2.font = `500 ${Math.max(6.5 * scale, 6)}px Inter, system-ui, sans-serif`;
        c2.textAlign = 'left';
        c2.textBaseline = 'bottom';
        c2.fillText('NH 24 • MEERUT EXPWY', cx - 80 * scale, cy - 104 * scale);

        c2.save();
        c2.translate(cx + 140 * scale, cy + 20 * scale);
        c2.rotate(Math.PI * 0.38);
        c2.fillStyle = 'rgba(108, 138, 145, 0.42)';
        c2.font = `600 ${Math.max(6.5 * scale, 6)}px Inter, system-ui, sans-serif`;
        c2.textAlign = 'center';
        c2.fillText('HINDON CANAL', 0, 0);
        c2.restore();

        // ─── I. Understated Location Radius & Proximity Rings ───
        const epicenterX = cx;
        const epicenterY = cy;

        c2.save();
        c2.strokeStyle = C.mapRadiusRing;
        c2.lineWidth = 1;
        c2.setLineDash([3, 5]);

        c2.beginPath();
        c2.arc(epicenterX, epicenterY, 78 * scale, 0, Math.PI * 2);
        c2.stroke();

        c2.beginPath();
        c2.arc(epicenterX, epicenterY, 142 * scale, 0, Math.PI * 2);
        c2.stroke();
        c2.setLineDash([]);

        c2.fillStyle = C.mapTextSub;
        c2.font = `500 ${Math.max(6.5 * scale, 5.5)}px Inter, system-ui, sans-serif`;
        c2.textAlign = 'center';
        c2.textBaseline = 'top';
        c2.fillText('3.0 KM ACTIVE RADIUS', epicenterX, epicenterY + 80 * scale);
        c2.restore();

        // Coordinate & area micro-tag in quiet upper corner of visualization
        c2.fillStyle = C.mapTextSub;
        c2.font = `600 ${Math.max(6.8 * scale, 6)}px Inter, system-ui, sans-serif`;
        c2.textAlign = 'right';
        c2.textBaseline = 'top';
        c2.fillText(locLabel, width - 20, yTop + 6);

        // Gentle Living Location Radar Beacon (Restrained & Soft)
        const beaconCycle = (t * 0.5) % 1;
        const beaconR = (20 + beaconCycle * 65) * scale;
        const beaconAlpha = (1 - beaconCycle) * 0.12;

        c2.save();
        c2.beginPath();
        c2.arc(epicenterX, epicenterY, beaconR, 0, Math.PI * 2);
        c2.strokeStyle = `rgba(201, 111, 74, ${beaconAlpha})`;
        c2.lineWidth = 1.2;
        c2.stroke();
        c2.restore();

        // ─── J. Seamless Edge Masking & Blending ───
        // 1. Top Soft Feather: Faint status bar feather
        const topGrad = c2.createLinearGradient(0, 0, 0, 16);
        topGrad.addColorStop(0, C.bg);
        topGrad.addColorStop(1, 'rgba(247, 243, 236, 0)');
        c2.fillStyle = topGrad;
        c2.fillRect(0, 0, width, 16);

        // 2. Bottom Mask: Dissolves completely before CTA sheet
        const bottomGrad = c2.createLinearGradient(0, yBottom - 50 * scale, 0, yBottom);
        bottomGrad.addColorStop(0, 'rgba(247, 243, 236, 0)');
        bottomGrad.addColorStop(0.85, C.bg);
        bottomGrad.addColorStop(1, C.bg);
        c2.fillStyle = bottomGrad;
        c2.fillRect(0, yBottom - 50 * scale, width, height - (yBottom - 50 * scale));

        // 3. Left Vignette
        const leftGrad = c2.createLinearGradient(0, 0, Math.max(30, width * 0.08), 0);
        leftGrad.addColorStop(0, C.bg);
        leftGrad.addColorStop(1, 'rgba(247, 243, 236, 0)');
        c2.fillStyle = leftGrad;
        c2.fillRect(0, yTop, Math.max(30, width * 0.08), mapH);

        // 4. Right Vignette
        const rightGrad = c2.createLinearGradient(width - Math.max(30, width * 0.08), 0, width, 0);
        rightGrad.addColorStop(0, 'rgba(247, 243, 236, 0)');
        rightGrad.addColorStop(1, C.bg);
        c2.fillStyle = rightGrad;
        c2.fillRect(width - Math.max(30, width * 0.08), yTop, Math.max(30, width * 0.08), mapH);

        c2.restore();
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

  if (Platform.OS !== 'web') {
    const { width: scrW, height: scrH } = Dimensions.get('window');
    return (
      <View style={styles.fill}>
        {/* Subtle Map Layer for Native Mobile */}
        <View style={[styles.nativeMapRegion, { top: 0, height: scrH * 0.66 }]} pointerEvents="none">
          {/* Header Warm Light Halo behind Logo */}
          <View style={[styles.nativeHeaderAura, { top: 40, left: scrW * 0.5 - 100 }]} />

          {/* Locality & Coordinate Badge */}
          <Text style={styles.nativeLocLabel}>NOIDA NCR • 28.628° N, 77.365° E</Text>

          {/* Upper Northern Sectors */}
          <View style={[styles.nativeSectorBlock, { top: 38, left: scrW * 0.08, width: 84, height: 40 }]}>
            <Text style={styles.nativeSectorText}>SEC 62 N</Text>
          </View>
          <View style={[styles.nativeSectorBlock, { top: 34, right: scrW * 0.08, width: 88, height: 42 }]}>
            <Text style={styles.nativeSectorText}>SEC 63 N</Text>
          </View>

          {/* Middle Sectors */}
          <View style={[styles.nativeSectorBlock, { top: 105, left: scrW * 0.08, width: 86, height: 48 }]}>
            <Text style={styles.nativeSectorText}>SEC 62</Text>
          </View>
          <View style={[styles.nativeSectorBlock, { top: 100, right: scrW * 0.08, width: 90, height: 50 }]}>
            <Text style={styles.nativeSectorText}>SEC 63</Text>
          </View>
          <View style={[styles.nativeSectorBlock, { bottom: 30, left: scrW * 0.06, width: 82, height: 48 }]}>
            <Text style={styles.nativeSectorText}>SEC 18</Text>
          </View>
          <View style={[styles.nativeSectorBlock, { bottom: 26, right: scrW * 0.06, width: 98, height: 50 }]}>
            <Text style={styles.nativeSectorText}>KNOWLEDGE PK</Text>
          </View>

          {/* Park Greenery Patches */}
          <View style={[styles.nativePark, { top: 68, left: scrW * 0.12, width: 44, height: 28 }]} />
          <View style={[styles.nativePark, { bottom: 82, right: scrW * 0.14, width: 48, height: 30 }]} />

          {/* Arterial Road Lines */}
          <View style={[styles.nativeArterial, { top: 78, left: 0, right: 0 }]} />
          <View style={[styles.nativeArterialVertical, { top: 0, bottom: 0, left: scrW * 0.5 }]} />

          {/* Diagonal Expressway Corridor */}
          <View style={[styles.nativeExpressway, { width: scrW * 1.3, top: 96, left: -scrW * 0.15 }]} />

          {/* Radius Ring */}
          <View style={[styles.nativeRadiusRing, { width: 140, height: 140, top: '50%', left: '50%', marginTop: -70, marginLeft: -70 }]}>
            <Text style={styles.nativeRadiusTag}>3.0 KM RADIUS</Text>
          </View>
        </View>

        {/* Foreground Matching Nodes for Native */}
        <View style={[styles.nativeNodesContainer, { top: scrH * 0.22, height: scrH * 0.42 }]}>
          {/* Row 1: Rajesh V. (Electrician) ↔ ₹1,400 ↔ TechnoFab (Gr. Noida) */}
          <View style={styles.nativeNodeRow}>
            <View style={styles.nativeCard}>
              <View style={styles.nativeAvatar}>
                <Text style={styles.nativeAvatarText}>R</Text>
              </View>
              <View>
                <Text style={styles.nativeCardTitle}>Rajesh V.</Text>
                <Text style={styles.nativeCardSub}>Electrician</Text>
              </View>
            </View>
            <View style={styles.nativeGigCard}>
              <Text style={styles.nativeGigWage}>₹1,400</Text>
            </View>
            <View style={styles.nativeCard}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.nativeCardTitle}>TechnoFab</Text>
                <Text style={styles.nativeCardSub}>Gr. Noida</Text>
              </View>
              <View style={styles.nativeAvatar}>
                <Text style={styles.nativeAvatarText}>T</Text>
              </View>
            </View>
          </View>

          {/* Row 2 (Hero): Ravi K. (Loading) ↔ ₹1,000 Matched ✓ ↔ Bharat Log. (Noida 62) */}
          <View style={styles.nativeNodeRow}>
            <View style={[styles.nativeCard, styles.nativeCardHero]}>
              <View style={styles.nativeAvatar}>
                <Text style={styles.nativeAvatarText}>R</Text>
              </View>
              <View>
                <Text style={styles.nativeCardTitle}>Ravi K.</Text>
                <Text style={styles.nativeCardSub}>Loading</Text>
              </View>
            </View>
            <View style={[styles.nativeGigCard, styles.nativeGigHero]}>
              <Text style={styles.nativeGigHeroWage}>₹1,000</Text>
              <Text style={styles.nativeMatchedTag}>Matched ✓</Text>
            </View>
            <View style={[styles.nativeCard, styles.nativeCardHero]}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.nativeCardTitle}>Bharat Log.</Text>
                <Text style={styles.nativeCardSub}>Noida 62</Text>
              </View>
              <View style={styles.nativeAvatar}>
                <Text style={styles.nativeAvatarText}>B</Text>
              </View>
            </View>
          </View>

          {/* Row 3: Sanjay M. (Delivery) ↔ ₹850 ↔ QuickHaul (Sec 18) */}
          <View style={styles.nativeNodeRow}>
            <View style={styles.nativeCard}>
              <View style={styles.nativeAvatar}>
                <Text style={styles.nativeAvatarText}>S</Text>
              </View>
              <View>
                <Text style={styles.nativeCardTitle}>Sanjay M.</Text>
                <Text style={styles.nativeCardSub}>Delivery</Text>
              </View>
            </View>
            <View style={styles.nativeGigCard}>
              <Text style={styles.nativeGigWage}>₹850</Text>
            </View>
            <View style={styles.nativeCard}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.nativeCardTitle}>QuickHaul</Text>
                <Text style={styles.nativeCardSub}>Sec 18</Text>
              </View>
              <View style={styles.nativeAvatar}>
                <Text style={styles.nativeAvatarText}>Q</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

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
  // Native Mobile Map Styling
  nativeMapRegion: {
    position: 'absolute',
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  nativeHeaderAura: {
    position: 'absolute',
    width: 200,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  nativeLocLabel: {
    position: 'absolute',
    right: 18,
    top: 6,
    fontSize: 7.5,
    fontFamily: 'Inter',
    fontWeight: '600',
    color: 'rgba(132, 120, 108, 0.45)',
    letterSpacing: 0.5,
  },
  nativeSectorBlock: {
    position: 'absolute',
    backgroundColor: 'rgba(242, 237, 228, 0.65)',
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(218, 210, 198, 0.5)',
    borderStyle: 'dashed',
    padding: 5,
  },
  nativeSectorText: {
    fontSize: 7.5,
    fontWeight: '600',
    color: 'rgba(100, 88, 76, 0.45)',
    letterSpacing: 0.4,
  },
  nativePark: {
    position: 'absolute',
    backgroundColor: 'rgba(202, 215, 196, 0.38)',
    borderRadius: 14,
  },
  nativeArterial: {
    position: 'absolute',
    height: 2.2,
    backgroundColor: 'rgba(224, 216, 204, 0.55)',
  },
  nativeArterialVertical: {
    position: 'absolute',
    width: 2.2,
    backgroundColor: 'rgba(224, 216, 204, 0.45)',
  },
  nativeExpressway: {
    position: 'absolute',
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderTopWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: 'rgba(214, 205, 193, 0.55)',
    transform: [{ rotate: '28deg' }],
  },
  nativeRadiusRing: {
    position: 'absolute',
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(201, 111, 74, 0.10)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  nativeRadiusTag: {
    fontSize: 6.5,
    fontWeight: '500',
    color: 'rgba(132, 120, 108, 0.4)',
    letterSpacing: 0.4,
  },
  // Native Mobile Foreground Nodes
  nativeNodesContainer: {
    position: 'absolute',
    left: 14,
    right: 14,
    justifyContent: 'space-around',
    zIndex: 5,
  },
  nativeNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFAF6',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 7,
    borderWidth: 1,
    borderColor: '#DDD6CB',
    shadowColor: 'rgba(30, 28, 26, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    maxWidth: 110,
  },
  nativeCardHero: {
    borderColor: '#C96F4A',
    borderWidth: 1.4,
  },
  nativeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EDE8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeAvatarText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#C96F4A',
  },
  nativeCardTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E1C1A',
  },
  nativeCardSub: {
    fontSize: 7.5,
    fontWeight: '500',
    color: '#5C5147',
  },
  nativeGigCard: {
    backgroundColor: '#FDFAF6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#DDD6CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeGigHero: {
    backgroundColor: '#C96F4A',
    borderColor: '#A94F32',
    paddingVertical: 5,
  },
  nativeGigWage: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E1C1A',
  },
  nativeGigHeroWage: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nativeMatchedTag: {
    fontSize: 6.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
  },
});
