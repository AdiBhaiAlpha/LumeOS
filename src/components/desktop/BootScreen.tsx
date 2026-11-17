/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { audioEngine } from '../../utils/audioSynth';
import { nativeBridge } from '../../utils/nativeBridge';
import { LumeLogo } from '../ui/LumeLogo';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing virtual environment...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Play startup chime
    audioEngine.playStartupChime();

    const startTime = performance.now();
    const duration = 1800; // 1.8 seconds smooth intro

    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 30) {
        setStatusText('Initializing virtual runtime & VFS...');
      } else if (pct < 65) {
        setStatusText('Mounting Chromium workspace & system apps...');
      } else if (pct < 90) {
        setStatusText('Calibrating 3D graphics & memory benchmark...');
      } else {
        setStatusText('LumeOS ready');
      }

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        // Trigger fade out
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 450); // Matches transition duration
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    // Allow user to click or press any key to skip instantly
    const handleSkip = () => {
      setIsFadingOut(true);
      setTimeout(onComplete, 200);
    };

    window.addEventListener('keydown', handleSkip, { once: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleSkip);
    };
  }, [onComplete]);

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        setTimeout(onComplete, 200);
      }}
      className={`fixed inset-0 z-[1000000] flex flex-col items-center justify-center bg-[#07090e] cursor-pointer transition-all duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow orbs */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/20 via-indigo-600/15 to-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[90px] pointer-events-none -top-10" />

      {/* Center Intro Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Official LumeOS Brand Crest Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/25 to-neutral-900/60 border border-white/20 backdrop-blur-2xl flex items-center justify-center shadow-[0_0_55px_rgba(56,189,248,0.3)] ring-1 ring-white/10 group animate-pulse">
            <LumeLogo size="xl" />
          </div>
        </div>

        {/* Brand Text Animation with shimmering letters */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {['L', 'u', 'm', 'e', 'O', 'S'].map((char, index) => (
            <span
              key={index}
              style={{
                animationDelay: `${index * 80}ms`,
              }}
              className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 drop-shadow-[0_4px_16px_rgba(255,255,255,0.2)] animate-pulse"
            >
              {char}
            </span>
          ))}
        </div>

        {/* Subtitle */}
        <p className="text-xs md:text-sm font-medium tracking-[0.25em] uppercase text-cyan-300/80 mb-8 flex items-center gap-2">
          <span>{nativeBridge.getRuntimeLabel()}</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400/60" />
          <span>Desktop OS</span>
        </p>

        {/* Progress bar container */}
        <div className="w-64 md:w-80 flex flex-col gap-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/10 backdrop-blur-md p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono tracking-tight pt-1">
            <span className="truncate max-w-[200px]">{statusText}</span>
            <span className="text-cyan-400 font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Skip hint */}
        <div className="mt-8 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors">
          Click anywhere or press any key to skip
        </div>
      </div>
    </div>
  );
};
