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
  Calendar as CalendarIcon,
  Volume2,
  VolumeX,
  Zap,
  Image as ImageIcon,
  Wifi,
  Battery,
  BatteryCharging,
  Sparkles,
  Info,
  Gamepad2,
} from 'lucide-react';
import { AppId, WindowState, WallpaperTheme } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';
import { LumeLogo } from '../ui/LumeLogo';

interface TaskbarProps {
  windows: WindowState[];
  activeWindowId: string | null;
  onOpenApp: (appId: AppId) => void;
  onOpenAboutWithAnimation: () => void;
  onToggleWindow: (windowId: string) => void;
  isStartOpen: boolean;
  onToggleStart: () => void;
  alignment: 'center' | 'left';
  webRamMB: number;
  currentWallpaper: WallpaperTheme;
  onCycleWallpaper: () => void;
  isQuickSettingsOpen: boolean;
  onToggleQuickSettings: () => void;
  volume: number;
  isMuted: boolean;
  brightness: number;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onOpenApp,
  onOpenAboutWithAnimation,
  onToggleWindow,
  isStartOpen,
  onToggleStart,
  alignment,
  webRamMB,
  currentWallpaper,
  onCycleWallpaper,
  isQuickSettingsOpen,
  onToggleQuickSettings,
  volume,
  isMuted,
  brightness,
}) => {
  const [time, setTime] = useState(new Date());
  const [showCalendarFlyout, setShowCalendarFlyout] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getAppIcon = (appId: AppId) => {
    switch (appId) {
      case 'files':
        return <Folder className="w-5 h-5 text-amber-400" />;
      case 'browser':
        return <Globe className="w-5 h-5 text-sky-400" />;
      case 'biobench':
        return <Dna className="w-5 h-5 text-emerald-400" />;
      case 'photo':
        return <Paintbrush className="w-5 h-5 text-indigo-400" />;
      case 'audio':
        return <Headphones className="w-5 h-5 text-pink-400" />;
      case 'ram_monitor':
        return <Activity className="w-5 h-5 text-teal-400" />;
      case 'terminal':
        return <Terminal className="w-5 h-5 text-emerald-300" />;
      case 'notes':
        return <FileText className="w-5 h-5 text-slate-300" />;
      case 'settings':
      case 'extension_hub':
        return <Package className="w-5 h-5 text-violet-400" />;
      case 'about':
        return <LumeLogo size="sm" />;
      case 'games':
      case 'game_snake':
      case 'game_tetris':
      case 'game_flappy':
      case 'game_2048':
      case 'game_minesweeper':
        return <Gamepad2 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

  const pinnedAppIds: AppId[] = [
    'files',
    'browser',
    'biobench',
    'photo',
    'audio',
    'ram_monitor',
    'terminal',
    'notes',
    'extension_hub',
    'about',
  ];

  return (
    <div
      className={`fixed bottom-4 z-40 flex items-center transition-all duration-300 ${
        alignment === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-6'
      }`}
    >
      {/* Ultra-transparent Acrylic Glass Dock */}
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-neutral-950/65 backdrop-blur-3xl border border-white/15 shadow-[0_12px_40px_0_rgba(0,0,0,0.65)] ring-1 ring-white/10 select-none">
        {/* Start Button with Custom LumeOS Crest */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            audioEngine.playUiSound('click');
            onToggleStart();
          }}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 relative group active:scale-90 ${
            isStartOpen
              ? 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 scale-95'
              : 'hover:bg-white/10 text-neutral-300 hover:text-white'
          }`}
          title="Start Menu"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="absolute left-0.5 w-2.5 h-2.5 rounded-full border-2 border-sky-400 group-hover:border-sky-300" />
            <div className="absolute right-0.5 w-2.5 h-2.5 rounded-full border-2 border-indigo-400 group-hover:border-indigo-300" />
            <div className="absolute -bottom-0.5 w-4 h-2 border-b-2 border-white/90 rounded-b-full" />
          </div>
        </button>

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {/* Pinned & Active Apps */}
        <div className="flex items-center gap-1">
          {pinnedAppIds.map((appId) => {
            const openWindows = windows.filter((w) => w.appId === appId);
            const isOpen = openWindows.length > 0;
            const isFocused = openWindows.some((w) => w.id === activeWindowId && !w.isMinimized);

            return (
              <button
                key={appId}
                onClick={() => {
                  if (isOpen) {
                    onToggleWindow(openWindows[0].id);
                  } else {
                    if (appId === 'about') {
                      onOpenAboutWithAnimation();
                    } else {
                      onOpenApp(appId);
                    }
                  }
                }}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 group active:scale-95 ${
                  isFocused
                    ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/20'
                    : isOpen
                    ? 'bg-white/5 text-neutral-200 hover:bg-white/10'
                    : 'hover:bg-white/10 text-neutral-400 hover:text-neutral-100'
                }`}
                title={appId === 'about' ? 'About LumeOS (Chitron Bhattacharjee Adi)' : undefined}
              >
                <div className="transition-transform group-hover:scale-110">
                  {getAppIcon(appId)}
                </div>

                {/* Glowing active indicator pill */}
                {isOpen && (
                  <span
                    className={`absolute bottom-1 rounded-full transition-all duration-300 ${
                      isFocused
                        ? 'bg-sky-400 w-3.5 h-1 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                        : 'bg-neutral-400/80 w-1.5 h-1'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        {/* System Tray */}
        <div className="flex items-center gap-1.5 pl-1 pr-1 text-xs">
          {/* Quick Wallpaper Switcher */}
          <button
            onClick={() => {
              audioEngine.playUiSound('snap');
              onCycleWallpaper();
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title={`Current: ${currentWallpaper} · Click to cycle wallpaper`}
          >
            <ImageIcon className="w-4 h-4 text-sky-400" />
          </button>

          {/* RAM Telemetry Pill */}
          <button
            onClick={() => onOpenApp('ram_monitor')}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors"
            title="Chromium Web Apps RAM Footprint"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[11px] font-semibold text-sky-300">{webRamMB}M</span>
          </button>

          {/* Windows 11 Style Control Center / Quick Settings Pill (Wi-Fi, Volume, Battery) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playUiSound('click');
              setShowCalendarFlyout(false);
              onToggleQuickSettings();
            }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
              isQuickSettingsOpen
                ? 'bg-sky-500/25 border-sky-400/50 text-white shadow-md shadow-sky-500/20'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
            }`}
            title="Quick Settings & Control Center (Wi-Fi, Bluetooth, Audio, Brightness)"
          >
            <Wifi className="w-3.5 h-3.5 text-sky-400" />
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            )}
            <div className="flex items-center gap-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono font-medium text-emerald-400">98%</span>
            </div>
          </button>

          {/* Live Clock & Calendar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              audioEngine.playUiSound('click');
              if (isQuickSettingsOpen) onToggleQuickSettings();
              setShowCalendarFlyout(!showCalendarFlyout);
            }}
            className="flex flex-col items-end px-2 py-0.5 rounded-xl hover:bg-white/10 text-neutral-200 transition-colors cursor-pointer"
            title="Date & Time"
          >
            <span className="font-mono text-xs font-semibold text-white leading-none">
              {timeString}
            </span>
            <span className="text-[9px] text-neutral-400 font-medium leading-none mt-1">
              {dateString}
            </span>
          </button>
        </div>
      </div>

      {/* Calendar Flyout Modal */}
      {showCalendarFlyout && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-16 right-0 w-68 bg-neutral-950/80 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl p-4 text-neutral-200 select-none z-50 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="font-semibold text-white text-xs">{dateString}</div>
            <div className="font-mono text-sky-400 font-bold text-xs">{timeString}</div>
          </div>
          <div className="pt-3 text-[11px] text-neutral-300 space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Environment</span>
              <span className="text-white font-mono">Chromium Sandbox</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Current Theme</span>
              <span className="text-sky-300 capitalize">{currentWallpaper.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">RAM Savings</span>
              <span className="text-emerald-400 font-semibold font-mono">-89.2%</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px]">
              <span className="text-neutral-400">Created by</span>
              <span className="text-amber-300 font-semibold">Chitron Bhattacharjee Adi</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
