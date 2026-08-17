/**
 * HeroCanvas — GigEasy Signature "Gig Network" Experience
 *
 * Sequence:
 *   0.0s - 1.7s: Network forms & pulses (Worker ↔ Gig ↔ Employer)
 *   1.7s - 2.4s: Hero Match & Hired pulse
 *   2.4s - 2.8s: Network convergence flow (EMERGE)
 *   2.8s - 3.4s: Title lifts upward while network continues living in background (LIFT)
 *   3.4s+: Continuous living idle loop (INTERACTIVE)
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

// ─── Editorial Brand Palette ──────────────────────────────────────────────────
const C = {
  bg: '#F8F7F4',             // Warm Ivory primary canvas
  bgVignette: '#EDE9E1',     // Soft natural vignette
  cardBg: '#FFFFFF',         // Pure White floating surface
  cardBorder: '#E5E2D9',     // Tactile warm border
  cardShadow: 'rgba(9, 13, 20, 0.06)',
  ink: '#090D14',            // Deep Ink typography
  textMuted: '#5A6578',      // Editorial secondary text
  textLight: '#8E99A8',
  teal: '#0D3B3F',           // Deep Teal brand anchor
  tealLight: '#EAF3F4',      // Soft teal tint
  tealLine: 'rgba(13, 59, 63, 0.20)',
  lime: '#C8F135',           // Electric Lime (state-only)
  matchedCardBg: '#090D14',  // Deep Ink hero matched card
  avatarBg: '#EBF4F4',
  employerIconBg: '#F3F1EC',
};

// ─── Easing Functions ─────────────────────────────────────────────────────────
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

// ─── Entity Definitions (Clean 3-Pair Hierarchy) ──────────────────────────────
interface WorkerEntity {
  id: string;
  name: string;
  role: string;
  rating: string;
  initialY: number;
  spawnDelay: number;
}

interface EmployerEntity {
  id: string;
  company: string;
  location: string;
  initialY: number;
  spawnDelay: number;
}

interface GigEntity {
  id: string;
  workerId: string;
  employerId: string;
  wage: string;
  title: string;
  distance: string;
  initialY: number;
  spawnDelay: number;
  isHeroMatch?: boolean;
}

const WORKERS: WorkerEntity[] = [
  { id: 'w1', name: 'Amit K.', role: 'Warehouse Helper', rating: '★ 4.9', initialY: 0.50, spawnDelay: 0.05 },
  { id: 'w2', name: 'Rajesh V.', role: 'Electrician', rating: '★ 4.8', initialY: 0.22, spawnDelay: 0.15 },
  { id: 'w3', name: 'Sanjay M.', role: 'Delivery Partner', rating: '★ 5.0', initialY: 0.78, spawnDelay: 0.22 },
];

const EMPLOYERS: EmployerEntity[] = [
  { id: 'e1', company: 'Bharat Logistics', location: 'Noida Sec 62', initialY: 0.50, spawnDelay: 0.10 },
  { id: 'e2', company: 'TechnoFab Ind.', location: 'Greater Noida', initialY: 0.22, spawnDelay: 0.20 },
  { id: 'e3', company: 'QuickHaul Express', location: 'Sector 18', initialY: 0.78, spawnDelay: 0.26 },
];

const GIGS: GigEntity[] = [
  { id: 'g1', workerId: 'w1', employerId: 'e1', wage: '₹1,000', title: 'Warehouse Helper', distance: '2.1 km', initialY: 0.50, spawnDelay: 0.38, isHeroMatch: true },
  { id: 'g2', workerId: 'w2', employerId: 'e2', wage: '₹1,400', title: 'Industrial Electrician', distance: '3.4 km', initialY: 0.22, spawnDelay: 0.52 },
  { id: 'g3', workerId: 'w3', employerId: 'e3', wage: '₹850', title: 'Fleet Delivery', distance: '1.8 km', initialY: 0.78, spawnDelay: 0.62 },
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
      const t = setTimeout(() => cbRef.current?.('INTERACTIVE'), 200);
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

      // ── Choreographed State Machine ─────────────────────────────────────────
      let phase: HeroPhase = 'SPAWN';
      let globalTime = 0;
      let lastTs = 0;

      let mouseX = 0, mouseY = 0;
      let targetMouseX = 0, targetMouseY = 0;

      let settleProgress = 0;
      let transProgress = 0;

      function updatePhase(time: number) {
        let nextPhase: HeroPhase = phase;

        if (time < 0.36) {
          nextPhase = 'SPAWN';
        } else if (time < 0.88) {
          nextPhase = 'GIGS';
        } else if (time < 1.65) {
          nextPhase = 'CONNECT';
        } else if (time < 2.35) {
          nextPhase = 'HIRED';
        } else if (time < 2.65) {
          nextPhase = 'ACCELERATE';
        } else if (time < 2.95) {
          nextPhase = 'EMERGE';
        } else if (time < 3.45) {
          nextPhase = 'LIFT';
        } else {
          nextPhase = 'INTERACTIVE';
        }

        if (nextPhase !== phase) {
          phase = nextPhase;
          cbRef.current?.(phase);
        }
      }

      // ── Main Render Loop ────────────────────────────────────────────────────
      function render(ts: number) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min((ts - lastTs) / 1000, 0.05);
        lastTs = ts;
        globalTime += dt;

        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        updatePhase(globalTime);

        // Background gentle settling (2.95s - 3.45s) into subtle living background
        if (globalTime > 2.95) {
          const st = (globalTime - 2.95) / 0.50;
          settleProgress = Math.min(easeOutCubic(st), 1);
        }

        if (transRef.current) {
          transProgress = Math.min(transProgress + dt * 2.4, 1);
        }

        draw(ctx, W, H, globalTime, mouseX, mouseY, settleProgress, transProgress);
        rafHandle = requestAnimationFrame(render);
      }

      // ── Scene Rendering ─────────────────────────────────────────────────────
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

        // 1. Warm Ivory Canvas Base
        c.fillStyle = C.bg;
        c.fillRect(0, 0, width, height);

        // 2. Soft Ambient Radial Vignette
        const isMobile = width < 480;
        const marketCenterY = height * (isMobile ? 0.52 : 0.50);
        const marketCenterX = width * 0.5 + px * 0.15;

        const radGrad = c.createRadialGradient(
          marketCenterX,
          marketCenterY,
          30,
          marketCenterX,
          marketCenterY,
          width * 0.65
        );
        radGrad.addColorStop(0, '#FFFFFF');
        radGrad.addColorStop(0.60, C.bg);
        radGrad.addColorStop(1, C.bgVignette);
        c.fillStyle = radGrad;
        c.fillRect(0, 0, width, height);

        // Responsive Dimensions & Layout
        const xSpan = isMobile ? width * 0.82 : Math.min(width * 0.78, 520);
        const yTop = height * (isMobile ? 0.35 : 0.33);
        const ySpan = height * (isMobile ? 0.32 : 0.30);

        // Hero Pull during HIRED phase (1.65s - 2.35s)
        const isHiredActive = time >= 1.65;
        const hireAge = Math.max(0, time - 1.65);
        const heroPull = isHiredActive ? Math.sin(Math.min(hireAge * 4.0, Math.PI)) * 0.055 : 0;

        // Background subtle opacity adjustment when settled
        const livingBackgroundAlpha = 1 - settle * 0.12;

        // Position Lookup Maps
        const workerPosMap: Record<string, { x: number; y: number; alpha: number; scale: number }> = {};
        const employerPosMap: Record<string, { x: number; y: number; alpha: number; scale: number }> = {};
        const gigPosMap: Record<string, { x: number; y: number; alpha: number; scale: number }> = {};

        // ── Calculate Worker Positions ──
        WORKERS.forEach((w) => {
          const spawnT = Math.max(0, time - w.spawnDelay);
          const alpha = Math.min(spawnT / 0.35, 1);
          const scale = easeOutBack(Math.min(spawnT / 0.38, 1));

          let curX = width * 0.5 - xSpan * 0.5 + px * 0.25;
          let curY = yTop + (w.initialY - 0.22) * (ySpan / 0.56) + py * 0.15;

          if (w.id === 'w1' && isHiredActive) {
            curX += xSpan * heroPull;
          }

          workerPosMap[w.id] = { x: curX, y: curY, alpha, scale };
        });

        // ── Calculate Employer Positions ──
        EMPLOYERS.forEach((e) => {
          const spawnT = Math.max(0, time - e.spawnDelay);
          const alpha = Math.min(spawnT / 0.35, 1);
          const scale = easeOutBack(Math.min(spawnT / 0.38, 1));

          let curX = width * 0.5 + xSpan * 0.5 + px * 0.25;
          let curY = yTop + (e.initialY - 0.22) * (ySpan / 0.56) + py * 0.15;

          if (e.id === 'e1' && isHiredActive) {
            curX -= xSpan * heroPull;
          }

          employerPosMap[e.id] = { x: curX, y: curY, alpha, scale };
        });

        // ── Calculate Gig Positions ──
        GIGS.forEach((g) => {
          const spawnT = Math.max(0, time - g.spawnDelay);
          const alpha = Math.min(spawnT / 0.35, 1);
          const scale = easeOutBack(Math.min(spawnT / 0.38, 1));

          let curX = width * 0.5 + px * 0.12;
          let curY = yTop + (g.initialY - 0.22) * (ySpan / 0.56) + py * 0.12;

          // Continuous living breathing float (never freezes)
          curY += Math.sin(time * 2.2 + g.initialY * 6) * 3;

          gigPosMap[g.id] = { x: curX, y: curY, alpha, scale };
        });

        // ── 3. Draw Connecting Deep Teal Lines (Always living) ─────────────────
        if (time >= 0.85) {
          GIGS.forEach((g, i) => {
            const wPos = workerPosMap[g.workerId];
            const ePos = employerPosMap[g.employerId];
            const gPos = gigPosMap[g.id];

            if (!wPos || !ePos || !gPos || gPos.alpha < 0.2) return;

            const connectStart = 0.88 + i * 0.18;
            const connProg = easeInOutQuad(Math.max(0, time - connectStart) / 0.42);
            if (connProg <= 0) return;

            const isHero = g.isHeroMatch;
            const isHiredNow = isHero && time >= 1.78;

            c.save();
            c.globalAlpha = (isHero ? 1 : Math.min(connProg, 0.70)) * livingBackgroundAlpha;

            // Worker to Gig Curve
            const midX1 = (wPos.x + gPos.x) * 0.5;
            const midY1 = (wPos.y + gPos.y) * 0.5 - 5;

            c.beginPath();
            c.moveTo(wPos.x + 34, wPos.y);
            const curTargetX1 = wPos.x + 34 + (gPos.x - (wPos.x + 34)) * connProg;
            const curTargetY1 = wPos.y + (gPos.y - wPos.y) * connProg;
            c.quadraticCurveTo(midX1, midY1, curTargetX1, curTargetY1);

            c.lineWidth = isHero ? (isHiredNow ? 2.4 : 1.6) : 1.1;
            c.strokeStyle = isHero ? (isHiredNow ? C.teal : C.tealLine) : C.tealLine;
            c.stroke();

            // Gig to Employer Curve
            const midX2 = (gPos.x + ePos.x) * 0.5;
            const midY2 = (gPos.y + ePos.y) * 0.5 - 5;

            c.beginPath();
            c.moveTo(gPos.x + 32, gPos.y);
            const curTargetX2 = gPos.x + 32 + (ePos.x - 34 - (gPos.x + 32)) * connProg;
            const curTargetY2 = gPos.y + (ePos.y - gPos.y) * connProg;
            c.quadraticCurveTo(midX2, midY2, curTargetX2, curTargetY2);

            c.lineWidth = isHero ? (isHiredNow ? 2.4 : 1.6) : 1.1;
            c.strokeStyle = isHero ? (isHiredNow ? C.teal : C.tealLine) : C.tealLine;
            c.stroke();
            c.restore();

            // Continuous Traveling Pulse Dot
            if (connProg >= 0.95) {
              const pulsePhase = (time * 1.8 + i * 0.32) % 1;
              const pulseX = wPos.x + 34 + (ePos.x - 34 - (wPos.x + 34)) * pulsePhase;
              const pulseY = wPos.y + (ePos.y - wPos.y) * pulsePhase;

              c.save();
              c.globalAlpha = livingBackgroundAlpha;
              c.fillStyle = isHero ? C.teal : 'rgba(13, 59, 63, 0.55)';
              c.beginPath();
              c.arc(pulseX, pulseY, isHero ? 2.8 : 1.8, 0, Math.PI * 2);
              c.fill();
              c.restore();
            }
          });
        }

        // ── 4. Draw Workers (Tactile White Cards) ─────────────────────────────
        WORKERS.forEach((w) => {
          const pos = workerPosMap[w.id];
          if (!pos || pos.alpha <= 0.01) return;

          c.save();
          c.translate(pos.x, pos.y);
          c.scale(pos.scale, pos.scale);
          c.globalAlpha = pos.alpha * livingBackgroundAlpha;

          const cardW = isMobile ? 90 : 110;
          const cardH = 36;

          c.shadowColor = C.cardShadow;
          c.shadowBlur = 8;
          c.shadowOffsetY = 2;

          drawRoundedRect(c, -cardW, -cardH * 0.5, cardW, cardH, 18);
          c.fillStyle = C.cardBg;
          c.fill();

          c.shadowColor = 'transparent';
          c.strokeStyle = w.id === 'w1' && isHiredActive ? C.teal : C.cardBorder;
          c.lineWidth = w.id === 'w1' && isHiredActive ? 1.5 : 1;
          c.stroke();

          // Avatar Circle
          c.beginPath();
          c.arc(-cardW + 18, 0, 12, 0, Math.PI * 2);
          c.fillStyle = C.avatarBg;
          c.fill();
          c.strokeStyle = C.teal;
          c.lineWidth = 1;
          c.stroke();

          c.fillStyle = C.teal;
          c.font = 'bold 9px Inter, system-ui, sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(w.name[0], -cardW + 18, 0);

          // Name & Role
          c.fillStyle = C.ink;
          c.font = `600 ${isMobile ? '8.5px' : '9.5px'} Inter, system-ui, sans-serif`;
          c.textAlign = 'left';
          c.fillText(w.name, -cardW + 35, -4);

          c.fillStyle = C.teal;
          c.font = '500 7.5px Inter, system-ui, sans-serif';
          c.fillText(w.role.split(' ')[0] + ' · ' + w.rating, -cardW + 35, 6);

          c.restore();
        });

        // ── 5. Draw Employers (Tactile White Cards) ────────────────────────────
        EMPLOYERS.forEach((e) => {
          const pos = employerPosMap[e.id];
          if (!pos || pos.alpha <= 0.01) return;

          c.save();
          c.translate(pos.x, pos.y);
          c.scale(pos.scale, pos.scale);
          c.globalAlpha = pos.alpha * livingBackgroundAlpha;

          const cardW = isMobile ? 90 : 110;
          const cardH = 36;

          c.shadowColor = C.cardShadow;
          c.shadowBlur = 8;
          c.shadowOffsetY = 2;

          drawRoundedRect(c, 0, -cardH * 0.5, cardW, cardH, 18);
          c.fillStyle = C.cardBg;
          c.fill();

          c.shadowColor = 'transparent';
          c.strokeStyle = e.id === 'e1' && isHiredActive ? C.teal : C.cardBorder;
          c.lineWidth = e.id === 'e1' && isHiredActive ? 1.5 : 1;
          c.stroke();

          // Icon Circle
          c.beginPath();
          c.arc(cardW - 18, 0, 12, 0, Math.PI * 2);
          c.fillStyle = C.employerIconBg;
          c.fill();
          c.strokeStyle = C.cardBorder;
          c.lineWidth = 1;
          c.stroke();

          c.fillStyle = C.ink;
          c.font = 'bold 9.5px Inter, system-ui, sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText('🏢', cardW - 18, 0);

          // Company Name & Location
          c.fillStyle = C.ink;
          c.font = `600 ${isMobile ? '8.5px' : '9.5px'} Inter, system-ui, sans-serif`;
          c.textAlign = 'left';
          c.fillText(e.company.split(' ')[0], 12, -4);

          c.fillStyle = C.textMuted;
          c.font = '400 7.5px Inter, system-ui, sans-serif';
          c.fillText(e.location.split(' ')[0] + ' · GST ✓', 12, 6);

          c.restore();
        });

        // ── 6. Draw Opportunity / Gig Cards ──────────────────────────────────
        GIGS.forEach((g) => {
          const pos = gigPosMap[g.id];
          if (!pos || pos.alpha <= 0.01) return;

          c.save();
          c.translate(pos.x, pos.y);
          c.scale(pos.scale, pos.scale);
          c.globalAlpha = pos.alpha * livingBackgroundAlpha;

          const isHero = g.isHeroMatch;
          const isHired = isHero && isHiredActive;

          const cardW = isMobile ? 80 : 98;
          const cardH = 32;

          c.shadowColor = C.cardShadow;
          c.shadowBlur = 10;
          c.shadowOffsetY = 2;

          drawRoundedRect(c, -cardW * 0.5, -cardH * 0.5, cardW, cardH, 16);
          c.fillStyle = isHired ? C.matchedCardBg : C.cardBg;
          c.fill();

          c.shadowColor = 'transparent';
          c.strokeStyle = isHired ? C.ink : C.cardBorder;
          c.lineWidth = isHired ? 1.6 : 1;
          c.stroke();

          // Wage Text
          c.fillStyle = isHired ? C.lime : C.ink;
          c.font = `bold ${isMobile ? '10.5px' : '12px'} Inter, system-ui, sans-serif`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText(g.wage, 0, isHired ? -5 : 0);

          // Hired Status on Hero
          if (isHired) {
            c.fillStyle = C.lime;
            c.font = 'bold 7px Inter, system-ui, sans-serif';
            c.fillText('HIRED ✓', 0, 6);
          }

          c.restore();
        });

        // ── 7. Hero Match Confirmation Pop (1.65s - 2.55s) ────────────────────
        if (isHiredActive && time < 2.55 && gigPosMap['g1']) {
          const hg = gigPosMap['g1'];
          const burstAge = (time - 1.65) / 0.75;

          const burstRadius = burstAge * 45;
          const burstAlpha = Math.max(0, 1 - burstAge);

          c.save();
          c.translate(hg.x, hg.y);
          c.beginPath();
          c.arc(0, 0, burstRadius, 0, Math.PI * 2);
          c.strokeStyle = `rgba(13, 59, 63, ${burstAlpha * 0.35})`;
          c.lineWidth = 1.4;
          c.stroke();

          // Confirmation Chip Floating above match
          const badgeY = -28 - burstAge * 6;
          c.shadowColor = 'rgba(9, 13, 20, 0.10)';
          c.shadowBlur = 6;
          c.shadowOffsetY = 2;

          drawRoundedRect(c, -35, badgeY - 9, 70, 18, 9);
          c.fillStyle = C.lime;
          c.fill();

          c.shadowColor = 'transparent';
          c.fillStyle = C.ink;
          c.font = 'bold 8px Inter, system-ui, sans-serif';
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.fillText('MATCHED ✓', 0, badgeY);
          c.restore();
        }

        // ── 8. Outro Transition on CTA Tap ───────────────────────────────────
        if (trans > 0) {
          c.fillStyle = `rgba(248, 247, 244, ${trans})`;
          c.fillRect(0, 0, width, height);
        }
      }

      // ── Rounded Rectangle Helper ────────────────────────────────────────────
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

      // ── Parallax Handlers ───────────────────────────────────────────────────
      const handleMouseMove = (e: MouseEvent) => {
        targetMouseX = ((e.clientX / W) - 0.5) * 20;
        targetMouseY = ((e.clientY / H) - 0.5) * 12;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          targetMouseX = ((t.clientX / W) - 0.5) * 14;
          targetMouseY = ((t.clientY / H) - 0.5) * 10;
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
  fill: { ...StyleSheet.absoluteFill },
});
