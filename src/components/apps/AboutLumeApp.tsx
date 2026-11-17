/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Cpu,
  Layers,
  HardDrive,
  Volume2,
  ShieldCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  Flame,
  Award,
  Zap,
  Globe,
  Activity,
  Terminal as TerminalIcon,
  RotateCcw,
  Monitor,
  Heart,
  Mail,
  FolderGit2,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';
import { WallpaperTheme } from '../../types/os';
import { LumeLogo } from '../ui/LumeLogo';

interface AboutLumeAppProps {
  onReplayBoot?: () => void;
  currentWallpaper: WallpaperTheme;
  webRamMB: number;
}

export const AboutLumeApp: React.FC<AboutLumeAppProps> = ({
  onReplayBoot,
  currentWallpaper,
  webRamMB,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'creator' | 'specs' | 'features'>('overview');

  const copySpecs = () => {
    const text = `--- LumeOS System Diagnostic & Specification ---
OS: LumeOS Nebula Edition v2.5.0 LTS (Build 26402.1)
Creator & Lead Architect: Chitron Bhattacharjee Adi
Contact: chitronbhattacharjee@gmail.com
Kernel: Chromium Reactive Microkernel & WebKit Sandbox
Frontend: React 19 + TypeScript + Tailwind CSS Glassmorphic Engine
Visual Pipeline: WebGL2 + Three.js Procedural Shaders
Audio Synth: Web Audio Procedural Harmonic Acoustics
Active RAM: ${webRamMB} MB (Chromium Tab Sandbox)
Platform: ${navigator.platform} | Concurrency: ${navigator.hardwareConcurrency || 8} Threads
Resolution: ${window.innerWidth}x${window.innerHeight} @ ${window.devicePixelRatio}x
------------------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    audioEngine.playUiSound('snap');
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 text-neutral-100 select-none overflow-hidden">
      {/* Top Header Banner */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-sky-950/40 via-neutral-900/60 to-indigo-950/40 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Glowing LumeOS Brand Crest */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/30 to-neutral-900/60 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.35)] ring-1 ring-white/10">
              <LumeLogo size="lg" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                LumeOS
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono border border-sky-400/30">
                  v2.5.0 LTS Nebula
                </span>
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Next-Generation Reactive Web Operating System
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onReplayBoot && (
            <button
              onClick={() => {
                audioEngine.playUiSound('open');
                onReplayBoot();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 border border-sky-400/30 text-sky-200 text-xs font-medium transition-all shadow-sm group active:scale-95"
              title="Replay LumeOS Intro Animation"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform" />
              <span>Replay Intro Animation</span>
            </button>
          )}

          <button
            onClick={() => {
              audioEngine.playStartupChime();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200 text-xs font-medium transition-all active:scale-95"
            title="Test Procedural Audio Chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            <span>Play Chime</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/5 bg-neutral-900/30 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-sky-400 text-white font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('creator')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'creator'
              ? 'border-amber-400 text-white font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Creator & Architect</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveTab('specs')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'specs'
              ? 'border-emerald-400 text-white font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hardware & Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === 'features'
              ? 'border-indigo-400 text-white font-semibold'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Architecture & Stack</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Creator Spotlight Hero Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-tr from-sky-950/40 via-neutral-900/50 to-amber-950/20 border border-white/15 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-indigo-600 p-[2px] shadow-lg shadow-amber-500/20">
                    <div className="w-full h-full bg-neutral-950 rounded-2xl flex items-center justify-center">
                      <span className="text-xl font-black text-amber-300">CB</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Chitron Bhattacharjee Adi
                      </h2>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-semibold">
                        <Award className="w-3 h-3 text-amber-400" />
                        Creator & Lead Architect
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1 max-w-xl leading-relaxed">
                      Designed and architected LumeOS — an ultra-responsive, zero-friction WebOS built to eliminate desktop OS bloat through Chromium sandboxing and fluid 3D glass aesthetics.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('creator')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-all flex items-center gap-1.5 self-end md:self-center"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Creator Profile</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                  RAM Footprint
                </div>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-bold font-mono text-sky-300">{webRamMB}</span>
                  <span className="text-xs text-neutral-400 font-mono">MB Active</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1 font-mono font-medium">
                  -89% vs Windows 11
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                  Rendering Engine
                </div>
                <div className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  WebGL2 / 3D
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Three.js Procedural Shaders
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                  Audio Architecture
                </div>
                <div className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  Web Audio Synth
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Procedural Harmonic Chimes
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
                  Deployment
                </div>
                <div className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-violet-400" />
                  Manifest V3
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Zero-Native Installation
                </div>
              </div>
            </div>

            {/* About LumeOS Vision */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h3 className="text-xs uppercase font-semibold text-neutral-300 tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                The LumeOS Mission
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Traditional desktop operating systems require gigabytes of background processes, telemetry services, and heavy native drivers. LumeOS is born out of a radical vision: running a complete, luxurious desktop operating system directly within a single isolated Chromium tab. With near-instant cold boot, clamped drag window physics, and procedural acoustic synthesis, LumeOS is the future of personal computing on the web.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CREATOR & ARCHITECT */}
        {activeTab === 'creator' && (
          <div className="space-y-6">
            {/* Prominent Creator Profile Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-neutral-900/90 via-neutral-900/60 to-amber-950/30 border border-amber-500/25 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Creator Avatar */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-indigo-600 p-[3px] shadow-[0_0_35px_rgba(251,191,36,0.3)]">
                    <div className="w-full h-full bg-neutral-950 rounded-3xl flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-amber-300 tracking-wider">ADI</span>
                      <span className="text-[9px] text-neutral-400 font-mono">ARCHITECT</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow">
                    Author
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      Chitron Bhattacharjee Adi
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold self-center md:self-auto">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      Verified Creator & Systems Architect
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Lead systems designer, visionary computer scientist, and creator of LumeOS. Pioneer of browser-resident operating systems, procedural audio synthesis, and sandboxed reactive computing.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span className="font-mono text-[11px]">chitronbhattacharjee@gmail.com</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-200">
                      <Heart className="w-3.5 h-3.5 text-pink-400" />
                      <span>Dedicated to Next-Gen Web OS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creator Quote */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <blockquote className="text-xs italic text-neutral-300 font-light border-l-2 border-amber-400 pl-4 py-0.5">
                  &ldquo;Computing does not belong chained to gigabytes of proprietary operating system overhead. With modern web primitives, WebGL shaders, and procedural synthesis, we can sculpt an OS experience that is faster, more secure, and infinitely more elegant.&rdquo;
                </blockquote>
                <div className="text-[11px] font-semibold text-amber-300 mt-2 pl-4">
                  — Chitron Bhattacharjee Adi
                </div>
              </div>
            </div>

            {/* Creator Credentials & Contributions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Systems Architecture
                </div>
                <p className="text-[11px] text-neutral-300">
                  Formulated the virtual in-memory file system (VFS) and reactive window management pipeline for LumeOS.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Visual Glass Experience
                </div>
                <p className="text-[11px] text-neutral-300">
                  Engineered the acrylic glassmorphism shader pipeline and responsive Windows 11 style desktop interface.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-white font-semibold text-xs mb-1.5">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  Procedural Acoustics
                </div>
                <p className="text-[11px] text-neutral-300">
                  Programmed real-time Web Audio API frequency chords, harmonic boot chimes, and UI haptic audio.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HARDWARE & SPECS */}
        {activeTab === 'specs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                System Diagnostics & Environment
              </span>
              <button
                onClick={copySpecs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-medium">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Copy Diagnostic Report</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-sky-400" />
                  Host Platform & Display
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Operating Platform:</span>
                    <span className="font-mono text-white">{navigator.platform}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Viewport Resolution:</span>
                    <span className="font-mono text-white">
                      {window.innerWidth} &times; {window.innerHeight} px
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Pixel Ratio:</span>
                    <span className="font-mono text-sky-300">{window.devicePixelRatio}x Retina</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Current Wallpaper:</span>
                    <span className="capitalize text-white font-mono">{currentWallpaper.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  Hardware & Memory Pipeline
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">CPU Concurrency:</span>
                    <span className="font-mono text-white">{navigator.hardwareConcurrency || 8} Logical Cores</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Live Web RAM:</span>
                    <span className="font-mono text-sky-400 font-bold">{webRamMB} MB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Device RAM Estimation:</span>
                    <span className="font-mono text-white">{(navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '8+ GB System RAM'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-neutral-400">Network Telemetry:</span>
                    <span className="font-mono text-emerald-400 font-medium">Online · Ultra-Low Latency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ARCHITECTURE & STACK */}
        {activeTab === 'features' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white text-xs font-semibold">
                  <Globe className="w-4 h-4 text-sky-400" />
                  React 19 & TypeScript Core
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Engineered with strict zero-legacy patterns, type-safe IPC state management, and declarative modular apps.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Three.js 3D Fluid Shaders
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Real-time WebGL2 geometric mesh generators and dynamic organic noise fields for interactive studio wallpapers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white text-xs font-semibold">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Magnetic Window Manager
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Direct absolute coordinate positioning with screen-edge clamping, smooth resizing, and seamless pointer capturing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white text-xs font-semibold">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  Procedural Web Audio Engine
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Synthesizes harmonic chords, clicks, snaps, and boot chimes on the fly using pure mathematical sine wave oscillators.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Status Bar */}
      <div className="px-6 py-3 bg-neutral-900/50 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>LumeOS Kernel Active</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-300">Creator: <strong className="text-white">Chitron Bhattacharjee Adi</strong></span>
        </div>

        <div className="text-[11px] font-mono text-neutral-400">
          Build 26402.1 · Chromium WebOS
        </div>
      </div>
    </div>
  );
};
