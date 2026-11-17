/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Folder,
  Globe,
  Dna,
  Paintbrush,
  Headphones,
  Terminal,
  Activity,
  FileText,
  Package,
  Sparkles,
} from 'lucide-react';
import { AppId, DesktopItem, WallpaperTheme } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';
import { LumeLogo } from '../ui/LumeLogo';

interface DesktopGridProps {
  onOpenApp: (appId: AppId) => void;
  onOpenAboutWithAnimation?: () => void;
  webRamMB: number;
  currentWallpaper: WallpaperTheme;
  onSetWallpaper: (theme: WallpaperTheme) => void;
}

export const DESKTOP_ITEMS: DesktopItem[] = [
  { id: 'app-files', appId: 'files', title: 'File Explorer', iconName: 'Folder', col: 0, row: 0 },
  { id: 'app-browser', appId: 'browser', title: 'Lume Browser', iconName: 'Globe', col: 0, row: 1 },
  { id: 'app-biobench', appId: 'biobench', title: 'BioBench Lab', iconName: 'Dna', col: 0, row: 2, badge: 'PDB 3D' },
  { id: 'app-photo', appId: 'photo', title: 'Photo Studio', iconName: 'Paintbrush', col: 0, row: 3 },
  { id: 'app-audio', appId: 'audio', title: 'Sound & Audio', iconName: 'Headphones', col: 0, row: 4 },
  { id: 'app-ram', appId: 'ram_monitor', title: 'RAM Monitor', iconName: 'Activity', col: 1, row: 0 },
  { id: 'app-terminal', appId: 'terminal', title: 'Terminal', iconName: 'Terminal', col: 1, row: 1 },
  { id: 'app-notes', appId: 'notes', title: 'Scratchpad', iconName: 'FileText', col: 1, row: 2 },
  { id: 'app-ext', appId: 'extension_hub', title: 'Extension Hub', iconName: 'Package', col: 1, row: 3 },
  { id: 'app-about', appId: 'about', title: 'About LumeOS', iconName: 'Sparkles', col: 1, row: 4 },
];

export const DesktopGrid: React.FC<DesktopGridProps> = ({
  onOpenApp,
  onOpenAboutWithAnimation,
  webRamMB,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Folder':
        return <Folder className="w-8 h-8 text-amber-400 drop-shadow-md" />;
      case 'Globe':
        return <Globe className="w-8 h-8 text-sky-400 drop-shadow-md" />;
      case 'Dna':
        return <Dna className="w-8 h-8 text-emerald-400 drop-shadow-md" />;
      case 'Paintbrush':
        return <Paintbrush className="w-8 h-8 text-indigo-400 drop-shadow-md" />;
      case 'Headphones':
        return <Headphones className="w-8 h-8 text-pink-400 drop-shadow-md" />;
      case 'Activity':
        return <Activity className="w-8 h-8 text-teal-400 drop-shadow-md" />;
      case 'Terminal':
        return <Terminal className="w-8 h-8 text-emerald-300 drop-shadow-md" />;
      case 'FileText':
        return <FileText className="w-8 h-8 text-slate-300 drop-shadow-md" />;
      case 'Package':
        return <Package className="w-8 h-8 text-violet-400 drop-shadow-md" />;
      case 'Sparkles':
        return <LumeLogo size="lg" />;
      default:
        return <Folder className="w-8 h-8 text-sky-400 drop-shadow-md" />;
    }
  };

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleLaunchApp = (appId: AppId) => {
    if (appId === 'about' && onOpenAboutWithAnimation) {
      onOpenAboutWithAnimation();
    } else {
      onOpenApp(appId);
    }
  };

  return (
    <div
      onClick={() => setSelectedId(null)}
      className="absolute inset-0 pointer-events-auto p-6 flex justify-between select-none"
    >
      {/* Desktop App Icons Grid */}
      <div className="grid grid-flow-col grid-rows-6 gap-3.5 w-max h-max">
        {DESKTOP_ITEMS.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(item.id);
                audioEngine.playUiSound('click');
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                audioEngine.playUiSound('open');
                handleLaunchApp(item.appId);
              }}
              className={`group flex flex-col items-center justify-center w-24 p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-sky-500/25 border-sky-400/50 backdrop-blur-md shadow-lg ring-1 ring-sky-400/40'
                  : 'border-transparent hover:bg-neutral-900/35 hover:backdrop-blur-md hover:border-white/10'
              }`}
            >
              <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
                {getIcon(item.iconName)}
              </div>
              <span className="text-[11px] font-medium text-white mt-1 drop-shadow-md max-w-full truncate px-1 text-shadow">
                {item.title}
              </span>

              {item.badge && (
                <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-900/80 backdrop-blur text-sky-300 font-mono border border-white/10 scale-90">
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Top-Right Transparent Glass Desktop Widgets */}
      <div className="hidden lg:flex flex-col gap-3.5 w-80 pointer-events-auto">
        {/* Widget 1: Minimalist Clock & Date */}
        <div className="p-4 rounded-3xl bg-neutral-950/45 backdrop-blur-3xl border border-white/15 shadow-[0_16px_32px_rgba(0,0,0,0.5)] text-neutral-100">
          <div className="text-3xl font-light tracking-tight font-mono text-white drop-shadow">
            {timeString}
          </div>
          <div className="text-xs text-neutral-300 mt-0.5 font-medium">
            {dateString}
          </div>
        </div>

        {/* Widget 2: BrowOS RAM Telemetry Widget */}
        <div
          onClick={() => onOpenApp('ram_monitor')}
          className="p-4 rounded-3xl bg-neutral-950/45 backdrop-blur-3xl border border-white/15 shadow-[0_16px_32px_rgba(0,0,0,0.5)] text-neutral-100 cursor-pointer hover:border-sky-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Memory Efficiency
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold font-mono text-sky-300 drop-shadow">{webRamMB}</span>
            <span className="text-xs text-neutral-400 font-mono">MB in RAM</span>
          </div>

          <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="w-[12%] h-full bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          </div>

          <div className="mt-2 text-[10px] text-emerald-400 flex justify-between font-mono">
            <span>Purge Memory &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};
