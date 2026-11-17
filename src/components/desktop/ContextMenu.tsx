/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Palette,
  FilePlus,
  Terminal,
  Zap,
  Package,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';
import { WallpaperTheme } from '../../types/os';
import { LumeLogo } from '../ui/LumeLogo';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onOpenApp: (appId: any) => void;
  onToggle3D: () => void;
  is3dPaused: boolean;
  onPurgeRAM: () => void;
  onSetWallpaper: (theme: WallpaperTheme) => void;
  onReplayBoot?: () => void;
  onOpenAboutWithAnimation?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onOpenApp,
  onToggle3D,
  is3dPaused,
  onPurgeRAM,
  onSetWallpaper,
  onReplayBoot,
  onOpenAboutWithAnimation,
}) => {
  const menuX = Math.min(x, window.innerWidth - 240);
  const menuY = Math.min(y, window.innerHeight - 380);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ left: `${menuX}px`, top: `${menuY}px` }}
      className="fixed z-50 w-60 bg-neutral-950/75 backdrop-blur-3xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 text-xs text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10"
    >
      <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
        Desktop Actions
      </div>

      <button
        onClick={() => {
          audioEngine.playUiSound('click');
          onOpenApp('extension_hub');
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Palette className="w-4 h-4 text-sky-400" />
        <span>Wallpapers & Themes</span>
      </button>

      <button
        onClick={() => {
          audioEngine.playUiSound('click');
          onOpenApp('notes');
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <FilePlus className="w-4 h-4 text-emerald-400" />
        <span>New Scratch Note</span>
      </button>

      <button
        onClick={() => {
          audioEngine.playUiSound('click');
          onOpenApp('terminal');
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Terminal className="w-4 h-4 text-slate-300" />
        <span>Open Terminal Shell</span>
      </button>

      <div className="w-full h-[1px] bg-white/10 my-1.5" />

      <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
        Quick Wallpaper
      </div>

      <button
        onClick={() => {
          audioEngine.playUiSound('snap');
          onSetWallpaper('photo-mountain');
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors text-[11px]"
      >
        <span>Aurora Mountain Peak</span>
        <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
      </button>

      <button
        onClick={() => {
          audioEngine.playUiSound('snap');
          onSetWallpaper('photo-tokyo');
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors text-[11px]"
      >
        <span>Tokyo Dusk Skyline</span>
        <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
      </button>

      <button
        onClick={() => {
          audioEngine.playUiSound('snap');
          onSetWallpaper('photo-nebula');
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors text-[11px]"
      >
        <span>Cosmic Deep Space</span>
        <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
      </button>

      <button
        onClick={() => {
          audioEngine.playUiSound('snap');
          onSetWallpaper('3d-zen-monolith');
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-white/10 text-left transition-colors text-[11px]"
      >
        <span>Interactive 3D Monolith</span>
        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
      </button>

      <div className="w-full h-[1px] bg-white/10 my-1.5" />

      <button
        onClick={() => {
          audioEngine.playUiSound('open');
          if (onOpenAboutWithAnimation) onOpenAboutWithAnimation();
          else onOpenApp('about');
          onClose();
        }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-500/20 text-left transition-colors text-amber-300 font-medium"
      >
        <div className="flex items-center gap-2.5">
          <LumeLogo size="xs" />
          <span>About LumeOS</span>
        </div>
        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono">
          Adi
        </span>
      </button>

      {onReplayBoot && (
        <button
          onClick={() => {
            audioEngine.playUiSound('open');
            onReplayBoot();
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cyan-500/20 text-left transition-colors text-cyan-300 font-medium"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Play Startup Intro</span>
        </button>
      )}

      <button
        onClick={() => {
          onPurgeRAM();
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors"
      >
        <Zap className="w-4 h-4 text-amber-400" />
        <span>Purge Browser RAM (GC)</span>
      </button>

      <button
        onClick={() => {
          audioEngine.playUiSound('ding');
          onOpenApp('extension_hub');
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sky-500/20 text-left transition-colors text-sky-300 font-medium"
      >
        <Package className="w-4 h-4" />
        <span>Download Extension (.zip)</span>
      </button>
    </div>
  );
};
