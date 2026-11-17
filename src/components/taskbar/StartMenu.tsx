/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Search,
  Maximize,
  RotateCcw,
  Download,
  ChevronRight,
  ChevronLeft,
  Power,
  Settings,
  Moon,
  User,
  ExternalLink,
  Sparkles,
  Gamepad2,
  Bomb,
  Grid3x3,
  Feather,
  Blocks,
} from 'lucide-react';
import { AppId, VirtualFile, WallpaperTheme } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';
import { LumeLogo } from '../ui/LumeLogo';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId) => void;
  onOpenFile: (file: VirtualFile) => void;
  files: VirtualFile[];
  onRestart: () => void;
  onToggleFullscreen: () => void;
  onExportExtension: () => void;
  currentWallpaper: WallpaperTheme;
  onSetWallpaper: (theme: WallpaperTheme) => void;
  onReplayBoot?: () => void;
  onOpenAboutWithAnimation?: () => void;
  onShutdown?: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onOpenFile,
  files,
  onRestart,
  onToggleFullscreen,
  onExportExtension,
  onReplayBoot,
  onOpenAboutWithAnimation,
  onShutdown,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'pinned' | 'all'>('pinned');
  const [showPowerMenu, setShowPowerMenu] = useState(false);

  if (!isOpen) return null;

  const handleLaunchApp = (appId: AppId) => {
    if (appId === 'about' && onOpenAboutWithAnimation) {
      onOpenAboutWithAnimation();
    } else {
      onOpenApp(appId);
    }
    onClose();
  };

  // Complete PC / LumeOS App Registry
  const allApps: Array<{
    id: AppId;
    title: string;
    desc: string;
    letter: string;
    icon: any;
    color: string;
    bgGradient: string;
  }> = [
    {
      id: 'about',
      title: 'About LumeOS',
      desc: 'Creator: Chitron Bhattacharjee Adi · System Specs',
      letter: 'A',
      icon: Sparkles,
      color: 'text-amber-300',
      bgGradient: 'from-amber-500/30 to-orange-600/20',
    },
    {
      id: 'biobench',
      title: 'BioBench Lab',
      desc: '3D Molecular Structures & AlphaFold',
      letter: 'B',
      icon: Dna,
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-500/30 to-teal-600/20',
    },
    {
      id: 'browser',
      title: 'Lume Browser',
      desc: 'Chromium Multi-Tab Web Sandbox',
      letter: 'B',
      icon: Globe,
      color: 'text-sky-300',
      bgGradient: 'from-sky-500/30 to-blue-600/20',
    },
    {
      id: 'extension_hub',
      title: 'Extension Hub',
      desc: 'Manifest V3 Unpacked Extension',
      letter: 'E',
      icon: Package,
      color: 'text-violet-300',
      bgGradient: 'from-violet-500/30 to-purple-600/20',
    },
    {
      id: 'files',
      title: 'File Explorer',
      desc: 'Virtual File System & Documents',
      letter: 'F',
      icon: Folder,
      color: 'text-amber-300',
      bgGradient: 'from-amber-500/30 to-orange-600/20',
    },
    {
      id: 'notes',
      title: 'Notes & Scratchpad',
      desc: 'Lightweight Autosaved Scratchpad',
      letter: 'N',
      icon: FileText,
      color: 'text-slate-200',
      bgGradient: 'from-slate-400/30 to-slate-600/20',
    },
    {
      id: 'photo',
      title: 'Photo Studio',
      desc: 'Creative Paint, Photopea & Polotno',
      letter: 'P',
      icon: Paintbrush,
      color: 'text-indigo-300',
      bgGradient: 'from-indigo-500/30 to-purple-600/20',
    },
    {
      id: 'ram_monitor',
      title: 'RAM Benchmark',
      desc: 'Chromium Memory Isolation Monitor',
      letter: 'R',
      icon: Activity,
      color: 'text-teal-300',
      bgGradient: 'from-teal-500/30 to-cyan-600/20',
    },
    {
      id: 'settings',
      title: 'Settings',
      desc: 'Wallpapers, Appearance & Dock Layout',
      letter: 'S',
      icon: Settings,
      color: 'text-sky-300',
      bgGradient: 'from-sky-500/30 to-indigo-600/20',
    },
    {
      id: 'audio',
      title: 'Sound & Audio',
      desc: 'Procedural Ambient Synth & Spotify',
      letter: 'S',
      icon: Headphones,
      color: 'text-pink-300',
      bgGradient: 'from-pink-500/30 to-rose-600/20',
    },
    {
      id: 'terminal',
      title: 'Terminal',
      desc: 'LumeOS CLI Kernel Shell',
      letter: 'T',
      icon: Terminal,
      color: 'text-emerald-400',
      bgGradient: 'from-emerald-600/30 to-neutral-800/20',
    },
    {
      id: 'games',
      title: 'Lume Arcade',
      desc: 'Offline Game Center & Classics',
      letter: 'G',
      icon: Gamepad2,
      color: 'text-sky-300',
      bgGradient: 'from-sky-500/30 to-indigo-600/20',
    },
    {
      id: 'game_snake',
      title: 'Neon Snake',
      desc: 'Classic Arcade Grid Snake',
      letter: 'S',
      icon: Gamepad2,
      color: 'text-emerald-300',
      bgGradient: 'from-emerald-500/30 to-teal-600/20',
    },
    {
      id: 'game_tetris',
      title: 'Cyber Tetris',
      desc: 'Falling Blocks & Line Clears',
      letter: 'T',
      icon: Blocks,
      color: 'text-cyan-300',
      bgGradient: 'from-cyan-500/30 to-blue-600/20',
    },
    {
      id: 'game_flappy',
      title: 'Flappy Bird',
      desc: '60fps Offline Pipe Runner',
      letter: 'F',
      icon: Feather,
      color: 'text-amber-300',
      bgGradient: 'from-sky-500/30 to-cyan-600/20',
    },
    {
      id: 'game_2048',
      title: '2048 Fusion',
      desc: 'Sliding Number Merge Puzzle',
      letter: '2',
      icon: Grid3x3,
      color: 'text-orange-300',
      bgGradient: 'from-amber-500/30 to-orange-600/20',
    },
    {
      id: 'game_minesweeper',
      title: 'Minesweeper',
      desc: 'Classic Minefield Logic Grid',
      letter: 'M',
      icon: Bomb,
      color: 'text-rose-300',
      bgGradient: 'from-rose-500/30 to-pink-600/20',
    },
  ];

  // Search filter
  const filteredApps = allApps.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group apps by letter for Windows 11 "All apps" view
  const groupedApps: Record<string, typeof allApps> = {};
  filteredApps.forEach((app) => {
    if (!groupedApps[app.letter]) {
      groupedApps[app.letter] = [];
    }
    groupedApps[app.letter].push(app);
  });
  const sortedLetters = Object.keys(groupedApps).sort();

  const recentDocs = files
    .filter((f) => f.type === 'file')
    .slice(0, 4);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (showPowerMenu) setShowPowerMenu(false);
      }}
      className="lume-glass fixed bottom-18 left-1/2 -translate-x-1/2 w-[580px] max-w-[94vw] h-[640px] max-h-[86vh] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.85)] flex flex-col z-50 select-none overflow-hidden ring-1 ring-white/15"
    >
      {/* 1. Windows 11 Search Bar */}
      <div className="p-5 pb-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() && viewMode !== 'all') {
                setViewMode('all');
              }
            }}
            placeholder="Type here to search apps, files, or settings..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-sky-400/60 focus:bg-white/10 transition-all shadow-inner"
            autoFocus
          />
        </div>
      </div>

      {/* 2. Body: Pinned View vs All Apps View */}
      <div className="flex-1 overflow-y-auto px-6 py-1">
        {viewMode === 'pinned' && !searchQuery ? (
          <div className="space-y-5">
            {/* Pinned Section Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white tracking-wide">
                Pinned
              </span>
              <button
                onClick={() => {
                  audioEngine.playUiSound('click');
                  setViewMode('all');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium text-neutral-300 hover:text-white transition-colors"
              >
                <span>All apps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pinned Apps Grid (Windows 11 Fluent Tiles) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {allApps.slice(0, 12).map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      audioEngine.playUiSound('open');
                      handleLaunchApp(app.id);
                    }}
                    className="flex flex-col items-center p-3 rounded-2xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all text-center group active:scale-95"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${app.bgGradient} border border-white/10 flex items-center justify-center mb-2 shadow-sm transition-transform group-hover:scale-105`}
                    >
                      {app.id === 'about' ? (
                        <LumeLogo size="md" />
                      ) : (
                        <Icon className={`w-5 h-5 ${app.color}`} />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-white truncate max-w-full">
                      {app.title}
                    </span>
                    <span className="text-[9px] text-neutral-400 truncate max-w-full mt-0.5">
                      {app.desc.split('&')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Recommended Section (Recent Documents & Tasks) */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white tracking-wide">
                  Recommended
                </span>
                <button
                  onClick={() => {
                    onOpenApp('files');
                    onClose();
                  }}
                  className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
                >
                  <span>More files</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {recentDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      audioEngine.playUiSound('open');
                      onOpenFile(doc);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 text-left transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 text-neutral-300 shrink-0">
                      <FileText className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium text-white truncate">
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {doc.updatedAt}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* All Apps Alphabetical View (Windows 11 Style) */
          <div className="space-y-4 pb-2">
            <div className="flex items-center justify-between sticky top-0 bg-transparent backdrop-blur-md py-1 z-10 border-b border-white/5">
              <button
                onClick={() => {
                  audioEngine.playUiSound('click');
                  setViewMode('pinned');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <span className="text-xs text-neutral-400 font-medium">
                {filteredApps.length} apps installed
              </span>
            </div>

            {sortedLetters.map((letter) => (
              <div key={letter} className="space-y-1">
                <div className="text-[11px] font-bold text-sky-400 px-2 py-0.5 uppercase">
                  {letter}
                </div>
                <div className="space-y-1">
                  {groupedApps[letter].map((app) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        onClick={() => {
                          audioEngine.playUiSound('open');
                          handleLaunchApp(app.id);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors text-left group"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${app.bgGradient} border border-white/10 flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {app.id === 'about' ? (
                            <LumeLogo size="sm" />
                          ) : (
                            <Icon className={`w-4 h-4 ${app.color}`} />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                            {app.title}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            {app.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Windows 11 Bottom User & Power Footer */}
      <div className="p-4 px-6 bg-neutral-900/40 border-t border-white/10 flex items-center justify-between shrink-0 relative">
        {/* User Profile / Creator Link */}
        <div
          onClick={() => {
            audioEngine.playUiSound('click');
            handleLaunchApp('about');
          }}
          className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-1.5 rounded-2xl transition-colors"
          title="About LumeOS · Creator: Chitron Bhattacharjee Adi"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20 group-hover:scale-105 transition-transform">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
              <span>Administrator</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-mono">
                Adi
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 leading-tight mt-0.5 group-hover:text-amber-300 transition-colors">
              About LumeOS & Creator &rarr;
            </div>
          </div>
        </div>

        {/* Action & Power Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              audioEngine.playUiSound('click');
              onOpenApp('settings');
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              audioEngine.playUiSound('snap');
              onToggleFullscreen();
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => {
                audioEngine.playUiSound('click');
                setShowPowerMenu(!showPowerMenu);
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Power & System"
            >
              <Power className="w-4 h-4 text-sky-400" />
            </button>

            {/* Power Flyout Menu */}
            {showPowerMenu && (
              <div className="lume-glass absolute bottom-12 right-0 w-64 rounded-2xl p-1.5 shadow-2xl z-50 text-xs space-y-0.5">
                <button
                  onClick={() => {
                    setShowPowerMenu(false);
                    handleLaunchApp('about');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-amber-500/15 text-left transition-colors text-amber-300 hover:text-amber-200"
                >
                  <LumeLogo size="xs" />
                  <div className="truncate">
                    <div className="font-semibold leading-tight">About LumeOS</div>
                    <div className="text-[10px] text-neutral-400">Creator: Chitron Bhattacharjee Adi</div>
                  </div>
                </button>

                <div className="w-full h-[1px] bg-white/10 my-1" />

                {onReplayBoot && (
                  <button
                    onClick={() => {
                      audioEngine.playUiSound('open');
                      onReplayBoot();
                      setShowPowerMenu(false);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cyan-500/15 text-left transition-colors text-cyan-300 hover:text-cyan-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Play Startup Intro</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    audioEngine.playUiSound('close');
                    onRestart();
                    setShowPowerMenu(false);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors text-neutral-200 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restart LumeOS</span>
                </button>

                {onShutdown && (
                  <button
                    onClick={() => {
                      audioEngine.playUiSound('close');
                      onShutdown();
                      setShowPowerMenu(false);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-left transition-colors text-rose-300 hover:text-rose-200"
                  >
                    <Power className="w-3.5 h-3.5 text-rose-400" />
                    <span>Shut Down</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    audioEngine.playUiSound('ding');
                    onExportExtension();
                    setShowPowerMenu(false);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors text-sky-300 hover:text-sky-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Chromium ZIP</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
