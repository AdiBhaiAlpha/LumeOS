/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  FolderCode,
  Palette,
  CheckCircle2,
  Copy,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { WallpaperTheme } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';
import { WALLPAPER_IMAGES } from '../wallpaper/ThreeWallpaper';

interface ExtensionHubProps {
  currentWallpaper: WallpaperTheme;
  onSetWallpaper: (theme: WallpaperTheme) => void;
  taskbarAlignment: 'center' | 'left';
  onSetTaskbarAlignment: (alignment: 'center' | 'left') => void;
  is3dPaused: boolean;
  onToggle3dPaused: () => void;
  onReplayBoot?: () => void;
}

export const ExtensionHubApp: React.FC<ExtensionHubProps> = ({
  currentWallpaper,
  onSetWallpaper,
  taskbarAlignment,
  onSetTaskbarAlignment,
  is3dPaused,
  onToggle3dPaused,
  onReplayBoot,
}) => {
  const [activeTab, setActiveTab] = useState<'extension' | 'wallpapers' | 'appearance'>('wallpapers');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const manifestV3Json = JSON.stringify(
    {
      manifest_version: 3,
      name: 'LumeOS New Tab Environment',
      version: '1.0.0',
      description: 'A minimalist Chromium desktop operating system and new tab replacement.',
      chrome_url_overrides: {
        newtab: 'index.html',
      },
      permissions: ['storage', 'unlimitedStorage'],
      action: {
        default_title: 'LumeOS Desktop',
      },
      icons: {
        '16': 'icons/icon16.png',
        '48': 'icons/icon48.png',
        '128': 'icons/icon128.png',
      },
    },
    null,
    2
  );

  const newtabHtmlCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LumeOS</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;overflow:hidden;background:#09090b">
  <!-- Redirects to local LumeOS build -->
  <iframe src="${window.location.origin}" style="width:100vw;height:100vh;border:none;"></iframe>
</body>
</html>`;

  const handleExportZip = async () => {
    audioEngine.playUiSound('ding');
    setIsExporting(true);

    try {
      const zip = new JSZip();
      zip.file('manifest.json', manifestV3Json);
      zip.file('newtab.html', newtabHtmlCode);
      zip.file(
        'README_INSTALL.txt',
        `======================================================
LumeOS - Chromium Unpacked Extension Setup Guide
======================================================

Follow these 3 quick steps to turn your Helium, Chrome, Edge, or Brave into LumeOS:

1. Unzip this downloaded archive into a folder on your computer (e.g. ~/LumeOS-Extension).
2. Open your browser and navigate to:
   - In Chromium / Helium: helium://extensions (or chrome://extensions)
   - In Google Chrome:     chrome://extensions
   - In Brave:             brave://extensions
3. Enable "Developer mode" toggle in the top-right corner.
4. Click "Load unpacked" in the top-left and select this unzipped folder!

Now every new tab you open will launch your high-efficiency LumeOS desktop!
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'LumeOS_Chromium_Extension_v1.0.zip';
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to create extension zip', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = (code: string, fileName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(fileName);
    audioEngine.playUiSound('click');
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const wallpapers: Array<{ id: WallpaperTheme; name: string; tag: string; is3d: boolean; img?: string }> = [
    {
      id: 'photo-mountain',
      name: 'Scandinavian Aurora Peak',
      tag: 'Glacial Obsidian Mountain & Aurora Borealis',
      is3d: false,
      img: WALLPAPER_IMAGES['photo-mountain'],
    },
    {
      id: 'photo-tokyo',
      name: 'Tokyo Dusk Skyline',
      tag: 'Architectural City Skyline at Twilight',
      is3d: false,
      img: WALLPAPER_IMAGES['photo-tokyo'],
    },
    {
      id: 'photo-abstract',
      name: 'Titanium Ribbon Flow',
      tag: 'Minimalist 3D Fluid Organic Sculpture',
      is3d: false,
      img: WALLPAPER_IMAGES['photo-abstract'],
    },
    {
      id: 'photo-nebula',
      name: 'Cosmic Deep Space',
      tag: 'Starlight Dust & Teal-Violet Nebula',
      is3d: false,
      img: WALLPAPER_IMAGES['photo-nebula'],
    },
    {
      id: '3d-zen-monolith',
      name: '3D Zen Monolith',
      tag: 'Interactive Three.js Studio PBR Scene',
      is3d: true,
    },
    {
      id: '3d-dna-lattice',
      name: '3D Bio-Kinetic DNA',
      tag: 'Biochemical Double Helix with Atomic PBR',
      is3d: true,
    },
    {
      id: '3d-celestial',
      name: '3D Celestial Orbitals',
      tag: 'Gyroscopic Quartz Core & Planar Rings',
      is3d: true,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 text-neutral-200 text-xs select-none">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('wallpapers')}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'wallpapers' ? 'bg-white/15 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Wallpapers & Themes
          </button>
          <button
            onClick={() => setActiveTab('extension')}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'extension' ? 'bg-white/15 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Extension Manifest (v3)
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'appearance' ? 'bg-white/15 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Taskbar & System
          </button>
        </div>

        {activeTab === 'extension' && (
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Packaging...' : 'Download Unpacked Extension (.zip)'}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Wallpapers */}
      {activeTab === 'wallpapers' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <h4 className="text-sm font-semibold text-white">Select Desktop Wallpaper</h4>
              <p className="text-neutral-400 text-[11px]">Choose between photographic cinematic wallpapers or interactive 3D WebGL scenes.</p>
            </div>
            {currentWallpaper.startsWith('3d-') && (
              <button
                onClick={() => {
                  audioEngine.playUiSound('click');
                  onToggle3dPaused();
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-colors ${
                  is3dPaused
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-white/5 text-neutral-300 border-white/10 hover:text-white'
                }`}
              >
                {is3dPaused ? '3D Render Paused' : '3D 60fps Active'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
            {wallpapers.map((wp) => {
              const isSelected = currentWallpaper === wp.id;
              return (
                <div
                  key={wp.id}
                  onClick={() => {
                    audioEngine.playUiSound('snap');
                    onSetWallpaper(wp.id);
                  }}
                  className={`group rounded-2xl border cursor-pointer transition-all overflow-hidden flex flex-col ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 ring-2 ring-sky-400/40 shadow-lg'
                      : 'bg-neutral-900/60 border-white/10 hover:border-white/20 hover:bg-neutral-900/80'
                  }`}
                >
                  <div className="h-28 w-full overflow-hidden relative bg-neutral-900">
                    {wp.img ? (
                      <img
                        src={wp.img}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-neutral-950 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-sky-400 opacity-60 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    {wp.is3d && (
                      <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-sky-300 font-mono border border-white/10">
                        Three.js 3D
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-sky-500/15 flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-sky-600 text-white font-semibold text-[10px] shadow-md">
                          Active Wallpaper
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <span className="font-semibold text-xs text-white block mb-0.5">{wp.name}</span>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">{wp.tag}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Extension Packaging */}
      {activeTab === 'extension' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 to-neutral-900/60 border border-sky-500/20">
            <h3 className="text-sm font-bold text-white mb-1">Manifest-Driven Browser Extension</h3>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              Just like BrowOS in Helium, LumeOS is structured around Chromium Manifest V3. By overriding <code className="text-sky-400 font-mono">chrome_url_overrides.newtab</code>, every new tab becomes your full-blown desktop OS!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block mb-0.5">1. Export Archive</span>
              <p className="text-neutral-400 text-[11px]">Click "Download Unpacked Extension (.zip)" above to package files.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block mb-0.5">2. Open Extensions</span>
              <p className="text-neutral-400 text-[11px]">Navigate to <code className="text-sky-400 font-mono">chrome://extensions</code> in your browser.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block mb-0.5">3. Load Unpacked</span>
              <p className="text-neutral-400 text-[11px]">Enable Developer Mode &rarr; Select the unzipped folder. Done!</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <FolderCode className="w-4 h-4 text-sky-400" />
                <span>manifest.json (Manifest V3)</span>
              </span>
              <button
                onClick={() => handleCopyCode(manifestV3Json, 'manifest')}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white"
              >
                {copiedFile === 'manifest' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-neutral-900/90 border border-white/10 font-mono text-[11px] text-sky-300 overflow-x-auto leading-relaxed">
              {manifestV3Json}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Appearance */}
      {activeTab === 'appearance' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <h4 className="text-sm font-semibold text-white">Desktop & Taskbar Layout</h4>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <span className="font-semibold text-neutral-200 block">Taskbar Dock Alignment</span>
            <div className="flex gap-2">
              <button
                onClick={() => onSetTaskbarAlignment('center')}
                className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  taskbarAlignment === 'center'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-medium shadow-sm'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                Floating Centered (BrowOS Style)
              </button>
              <button
                onClick={() => onSetTaskbarAlignment('left')}
                className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  taskbarAlignment === 'left'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-medium shadow-sm'
                    : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                }`}
              >
                Left Aligned (Classic)
              </button>
            </div>
          </div>

          {/* Startup & Boot Experience */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-200 block">Startup Boot Animation</span>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Plays animated glowing "LumeOS" entrance & harmonic chime on browser or new tab startup.
                </p>
              </div>
              {onReplayBoot && (
                <button
                  onClick={() => {
                    audioEngine.playUiSound('open');
                    onReplayBoot();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-medium text-xs transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Play Intro Now</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
