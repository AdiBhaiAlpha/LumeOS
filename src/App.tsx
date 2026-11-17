/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder,
  Globe,
  Dna,
  Paintbrush,
  Headphones,
  Terminal as TerminalIcon,
  Activity,
  FileText,
  Package,
  Sparkles,
  Gamepad2,
  Power,
} from 'lucide-react';
import { AppId, WindowState, WallpaperTheme, VirtualFile, ProcessMetric } from './types/os';
import { INITIAL_FILES } from './data/initialFiles';
import { audioEngine } from './utils/audioSynth';
import { nativeBridge } from './utils/nativeBridge';

// Components
import { ThreeWallpaper } from './components/wallpaper/ThreeWallpaper';
import { DesktopGrid } from './components/desktop/DesktopGrid';
import { WindowFrame } from './components/desktop/WindowFrame';
import { Taskbar } from './components/taskbar/Taskbar';
import { StartMenu } from './components/taskbar/StartMenu';
import { ContextMenu } from './components/desktop/ContextMenu';
import { BootScreen } from './components/desktop/BootScreen';
import { QuickSettingsPanel } from './components/taskbar/QuickSettingsPanel';
import { LumeLogo } from './components/ui/LumeLogo';

// Apps
import { FileExplorerApp } from './components/apps/FileExplorerApp';
import { BrowserApp } from './components/apps/BrowserApp';
import { BioBenchApp } from './components/apps/BioBenchApp';
import { PhotoStudioApp } from './components/apps/PhotoStudioApp';
import { AudioApp } from './components/apps/AudioApp';
import { RAMMonitorApp } from './components/apps/RAMMonitorApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { ExtensionHubApp } from './components/apps/ExtensionHubApp';
import { NotesApp } from './components/apps/NotesApp';
import { AboutLumeApp } from './components/apps/AboutLumeApp';
import { GamesApp } from './components/apps/GamesApp';

export default function App() {
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [isPoweredOff, setIsPoweredOff] = useState<boolean>(false);
  const [pendingAppToOpenAfterBoot, setPendingAppToOpenAfterBoot] = useState<AppId | null>(null);
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(15);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [volume, setVolume] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isNightLight, setIsNightLight] = useState<boolean>(false);
  const [wallpaper, setWallpaper] = useState<WallpaperTheme>('photo-mountain');
  const [is3dPaused, setIs3dPaused] = useState(false);
  const [taskbarAlignment, setTaskbarAlignment] = useState<'center' | 'left'>('center');
  const [files, setFiles] = useState<VirtualFile[]>(INITIAL_FILES);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const handleReplayBoot = useCallback(() => {
    setIsBooting(true);
  }, []);

  const handleOpenAboutWithAnimation = useCallback(() => {
    setIsStartOpen(false);
    setIsQuickSettingsOpen(false);
    setPendingAppToOpenAfterBoot('about');
    setIsBooting(true);
  }, []);

  const handleToggleQuickSettings = useCallback(() => {
    setIsQuickSettingsOpen((prev) => !prev);
    setIsStartOpen(false);
    setContextMenuPos(null);
  }, []);

  const wallpaperSequence: WallpaperTheme[] = [
    'photo-mountain',
    'photo-tokyo',
    'photo-abstract',
    'photo-nebula',
    '3d-zen-monolith',
  ];

  const handleCycleWallpaper = useCallback(() => {
    setWallpaper((prev) => {
      const idx = wallpaperSequence.indexOf(prev);
      const nextIdx = idx === -1 ? 0 : (idx + 1) % wallpaperSequence.length;
      return wallpaperSequence[nextIdx];
    });
  }, [wallpaperSequence]);

  // Simulated process metrics for RAM monitoring
  const [processes, setProcesses] = useState<ProcessMetric[]>([
    { id: 'proc-1', appId: 'biobench', title: 'BioBench 3D Mol Viewer', webRamMB: 94, nativeEquivalentMB: 840, cpuPercent: 1.8, status: 'active' },
    { id: 'proc-2', appId: 'ram_monitor', title: 'RAM & Process Monitor', webRamMB: 28, nativeEquivalentMB: 120, cpuPercent: 0.4, status: 'active' },
    { id: 'proc-3', appId: 'audio', title: 'Procedural Audio Synth', webRamMB: 18, nativeEquivalentMB: 485, cpuPercent: 0.2, status: 'active' },
    { id: 'proc-4', appId: 'photo', title: 'Photo Studio (Photopea)', webRamMB: 112, nativeEquivalentMB: 1920, cpuPercent: 1.2, status: 'active' },
    { id: 'proc-5', appId: 'browser', title: 'Lume Web Sandbox', webRamMB: 82, nativeEquivalentMB: 390, cpuPercent: 0.8, status: 'active' },
  ]);

  const totalWebRam = processes.reduce(
    (acc, p) => acc + (p.status === 'hibernated' ? 4 : p.webRamMB),
    0
  );

  // Focus Window
  const focusWindow = useCallback(
    (winId: string) => {
      setActiveWindowId(winId);
      setWindows((prev) =>
        prev.map((w) => (w.id === winId ? { ...w, zIndex: nextZIndex, isMinimized: false } : w))
      );
      setNextZIndex((z) => z + 1);
    },
    [nextZIndex]
  );

  // Open App
  const openApp = useCallback(
    (appId: AppId, customProps?: Record<string, any>) => {
      setIsStartOpen(false);
      audioEngine.playUiSound('open');

      // Check if window already exists
      const existing = windows.find((w) => w.appId === appId);
      if (existing) {
        if (existing.isMinimized) {
          setWindows((prev) =>
            prev.map((w) => (w.id === existing.id ? { ...w, isMinimized: false } : w))
          );
        }
        focusWindow(existing.id);
        return;
      }

      // Create new window with responsive defaults
      const titles: Record<AppId, string> = {
        files: 'File Explorer',
        browser: 'Lume Browser',
        biobench: 'BioBench Lab · 3D Molecular PDB Viewer',
        photo: 'Photo Studio · Canvas & Photopea',
        audio: 'Sound & Audio · Ambient & Spotify',
        ram_monitor: 'RAM & Process Benchmark',
        terminal: 'Terminal · LumeOS Shell',
        notes: 'Scratchpad · Quick Notes',
        extension_hub: 'Extension Hub · Manifest V3',
        settings: 'Extension Hub & System Settings',
        about: 'About LumeOS · Creator: Chitron Bhattacharjee Adi',
        games: 'Lume Arcade · Offline Games',
        game_snake: 'Neon Snake · Lume Arcade',
        game_tetris: 'Cyber Tetris · Lume Arcade',
        game_flappy: 'Flappy Bird · Lume Arcade',
        game_2048: '2048 Fusion · Lume Arcade',
        game_minesweeper: 'Minesweeper · Lume Arcade',
      };

      const icons: Record<AppId, string> = {
        files: 'Folder',
        browser: 'Globe',
        biobench: 'Dna',
        photo: 'Paintbrush',
        audio: 'Headphones',
        ram_monitor: 'Activity',
        terminal: 'Terminal',
        notes: 'FileText',
        extension_hub: 'Package',
        settings: 'Package',
        about: 'Sparkles',
        games: 'Gamepad2',
        game_snake: 'Gamepad2',
        game_tetris: 'Gamepad2',
        game_flappy: 'Gamepad2',
        game_2048: 'Gamepad2',
        game_minesweeper: 'Gamepad2',
      };

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const defaultW = Math.min(screenW * 0.72, 820);
      const defaultH = Math.min(screenH * 0.72, 540);
      const defaultX = Math.max(20, Math.floor((screenW - defaultW) / 2) + (windows.length % 5) * 24);
      const defaultY = Math.max(20, Math.floor((screenH - defaultH) / 3) + (windows.length % 5) * 24);

      const newWin: WindowState = {
        id: `win-${appId}-${Date.now()}`,
        appId,
        title: titles[appId] || 'Application',
        iconName: icons[appId] || 'Folder',
        x: defaultX,
        y: defaultY,
        width: defaultW,
        height: defaultH,
        minWidth: 420,
        minHeight: 300,
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZIndex,
        customData: customProps,
      };

      setWindows((prev) => [...prev, newWin]);
      setActiveWindowId(newWin.id);
      setNextZIndex((z) => z + 1);
    },
    [windows, nextZIndex, focusWindow]
  );

  // Close Window
  const closeWindow = useCallback((winId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== winId));
  }, []);

  // Minimize Window
  const minimizeWindow = useCallback((winId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId(null);
  }, []);

  // Maximize Window
  const maximizeWindow = useCallback((winId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  }, []);

  // Toggle Window from taskbar
  const toggleWindowFromTaskbar = useCallback(
    (winId: string) => {
      const win = windows.find((w) => w.id === winId);
      if (!win) return;

      if (win.isMinimized) {
        focusWindow(winId);
      } else if (activeWindowId === winId) {
        minimizeWindow(winId);
      } else {
        focusWindow(winId);
      }
    },
    [windows, activeWindowId, focusWindow, minimizeWindow]
  );

  // Update window position
  const updateWindowPosition = useCallback((winId: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, x, y } : w))
    );
  }, []);

  // Update window size
  const updateWindowSize = useCallback((winId: string, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, width, height } : w))
    );
  }, []);

  // Context menu on right click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handlePurgeMemory = () => {
    setProcesses((prev) =>
      prev.map((p) => ({
        ...p,
        webRamMB: Math.max(12, Math.floor(p.webRamMB * 0.7)),
      }))
    );
  };

  const handleSuspendProcess = (procId: string) => {
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === procId
          ? {
              ...p,
              status: p.status === 'hibernated' ? 'active' : 'hibernated',
            }
          : p
      )
    );
  };

  const handleRestart = () => {
    nativeBridge.reboot(() => {
      setWindows([]);
      setIsBooting(true);
    });
  };

  const handleShutdown = () => {
    nativeBridge.shutdown(() => {
      setWindows([]);
      setIsStartOpen(false);
      setIsQuickSettingsOpen(false);
      setIsPoweredOff(true);
    });
  };

  const handleToggleFullscreen = () => {
    nativeBridge.toggleFullscreen();
  };

  // Close start menu / quick settings / context menu on outside click
  const handleDesktopClick = () => {
    if (isStartOpen) setIsStartOpen(false);
    if (isQuickSettingsOpen) setIsQuickSettingsOpen(false);
    if (contextMenuPos) setContextMenuPos(null);
  };

  // Render App Contents inside Window
  const renderAppContent = (win: WindowState) => {
    switch (win.appId) {
      case 'files':
        return (
          <FileExplorerApp
            files={files}
            onUpdateFiles={setFiles}
            onOpenFileInApp={(file) => {
              if (file.category === 'bio') {
                openApp('biobench');
              } else {
                openApp('notes');
              }
            }}
          />
        );
      case 'browser':
        return <BrowserApp />;
      case 'biobench':
        return <BioBenchApp />;
      case 'photo':
        return <PhotoStudioApp />;
      case 'audio':
        return <AudioApp />;
      case 'ram_monitor':
        return (
          <RAMMonitorApp
            runningProcesses={processes}
            onSuspendProcess={handleSuspendProcess}
            onPurgeMemory={handlePurgeMemory}
          />
        );
      case 'terminal':
        return (
          <TerminalApp
            files={files}
            onSetWallpaper={setWallpaper}
            onOpenApp={openApp}
          />
        );
      case 'notes':
        return <NotesApp />;
      case 'settings':
      case 'extension_hub':
        return (
          <ExtensionHubApp
            currentWallpaper={wallpaper}
            onSetWallpaper={setWallpaper}
            taskbarAlignment={taskbarAlignment}
            onSetTaskbarAlignment={setTaskbarAlignment}
            is3dPaused={is3dPaused}
            onToggle3dPaused={() => setIs3dPaused(!is3dPaused)}
            onReplayBoot={handleReplayBoot}
          />
        );
      case 'about':
        return (
          <AboutLumeApp
            onReplayBoot={handleOpenAboutWithAnimation}
            currentWallpaper={wallpaper}
            webRamMB={totalWebRam}
          />
        );
      case 'games':
        return <GamesApp initialGame="hub" />;
      case 'game_snake':
        return <GamesApp initialGame="snake" />;
      case 'game_tetris':
        return <GamesApp initialGame="tetris" />;
      case 'game_flappy':
        return <GamesApp initialGame="flappy" />;
      case 'game_2048':
        return <GamesApp initialGame="2048" />;
      case 'game_minesweeper':
        return <GamesApp initialGame="minesweeper" />;
      default:
        return <div className="p-4 text-neutral-400">Application not found</div>;
    }
  };

  const getWindowIcon = (appId: AppId) => {
    switch (appId) {
      case 'files':
        return <Folder className="w-4 h-4 text-amber-400" />;
      case 'browser':
        return <Globe className="w-4 h-4 text-sky-400" />;
      case 'biobench':
        return <Dna className="w-4 h-4 text-emerald-400" />;
      case 'photo':
        return <Paintbrush className="w-4 h-4 text-indigo-400" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-pink-400" />;
      case 'ram_monitor':
        return <Activity className="w-4 h-4 text-teal-400" />;
      case 'terminal':
        return <TerminalIcon className="w-4 h-4 text-emerald-300" />;
      case 'notes':
        return <FileText className="w-4 h-4 text-slate-300" />;
      case 'settings':
      case 'extension_hub':
        return <Package className="w-4 h-4 text-violet-400" />;
      case 'about':
        return <LumeLogo size="xs" />;
      case 'games':
      case 'game_snake':
      case 'game_tetris':
      case 'game_flappy':
      case 'game_2048':
      case 'game_minesweeper':
        return <Gamepad2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  if (isPoweredOff) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-5 text-neutral-300 select-none">
        <LumeLogo size="xl" />
        <div className="text-sm font-mono text-neutral-400">LumeOS System Halted</div>
        <button
          onClick={() => {
            setIsPoweredOff(false);
            setIsBooting(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <Power className="w-4 h-4 text-sky-400" />
          <span>Power On LumeOS</span>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      className="relative w-screen h-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans select-none"
    >
      {/* 0. LumeOS Startup Intro Animation (Plays on browser / new tab load or clicking About LumeOS) */}
      {isBooting && (
        <BootScreen
          onComplete={() => {
            setIsBooting(false);
            if (pendingAppToOpenAfterBoot) {
              openApp(pendingAppToOpenAfterBoot);
              setPendingAppToOpenAfterBoot(null);
            }
          }}
        />
      )}

      {/* Screen Brightness Overlay */}
      {brightness < 100 && (
        <div
          className="fixed inset-0 pointer-events-none z-[99999] transition-opacity duration-150 bg-black"
          style={{ opacity: ((100 - brightness) / 100) * 0.85 }}
        />
      )}

      {/* Screen Night Light Warm Amber Filter Overlay */}
      {isNightLight && (
        <div className="fixed inset-0 pointer-events-none z-[99998] transition-opacity duration-300 bg-amber-500/15 mix-blend-color" />
      )}

      {/* 1. Three.js 3D Procedural Studio Wallpaper Engine */}
      <ThreeWallpaper theme={wallpaper} isPaused={is3dPaused} />

      {/* 2. Desktop Grid & System Widgets */}
      <DesktopGrid
        onOpenApp={openApp}
        onOpenAboutWithAnimation={handleOpenAboutWithAnimation}
        webRamMB={totalWebRam}
        currentWallpaper={wallpaper}
        onSetWallpaper={setWallpaper}
      />

      {/* 3. Window Manager (Active Windows) */}
      {windows.map((win) => (
        <WindowFrame
          key={win.id}
          windowState={win}
          isActive={activeWindowId === win.id}
          onFocus={() => focusWindow(win.id)}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximizeWindow(win.id)}
          onUpdatePosition={(x, y) => updateWindowPosition(win.id, x, y)}
          onUpdateSize={(w, h) => updateWindowSize(win.id, w, h)}
          icon={getWindowIcon(win.appId)}
        >
          {renderAppContent(win)}
        </WindowFrame>
      ))}

      {/* 4. Desktop Context Menu */}
      {contextMenuPos && (
        <ContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          onClose={() => setContextMenuPos(null)}
          onOpenApp={openApp}
          onOpenAboutWithAnimation={handleOpenAboutWithAnimation}
          onToggle3D={() => setIs3dPaused(!is3dPaused)}
          is3dPaused={is3dPaused}
          onPurgeRAM={handlePurgeMemory}
          onSetWallpaper={setWallpaper}
          onReplayBoot={handleReplayBoot}
        />
      )}

      {/* 5. Start Menu */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onOpenApp={openApp}
        onOpenAboutWithAnimation={handleOpenAboutWithAnimation}
        onOpenFile={(file) => {
          if (file.category === 'bio') openApp('biobench');
          else openApp('files');
        }}
        files={files}
        onRestart={handleRestart}
        onShutdown={handleShutdown}
        onToggleFullscreen={handleToggleFullscreen}
        onExportExtension={() => openApp('extension_hub')}
        currentWallpaper={wallpaper}
        onSetWallpaper={setWallpaper}
        onReplayBoot={handleReplayBoot}
      />

      {/* 6. Quick Settings Control Panel Flyout (Wi-Fi, Bluetooth, Audio, Brightness) */}
      <QuickSettingsPanel
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
        onOpenApp={openApp}
        onOpenAboutWithAnimation={handleOpenAboutWithAnimation}
        onToggleFullscreen={handleToggleFullscreen}
        brightness={brightness}
        onSetBrightness={setBrightness}
        volume={volume}
        onSetVolume={(val) => {
          setVolume(val);
          audioEngine.setVolume(val / 100);
          if (val === 0) {
            audioEngine.setMuted(true);
            setIsMuted(true);
          } else if (isMuted) {
            audioEngine.setMuted(false);
            setIsMuted(false);
          }
        }}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          audioEngine.setMuted(next);
        }}
        isNightLight={isNightLight}
        onToggleNightLight={() => setIsNightLight(!isNightLight)}
      />

      {/* 7. Centered Floating Taskbar Dock */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={openApp}
        onOpenAboutWithAnimation={handleOpenAboutWithAnimation}
        onToggleWindow={toggleWindowFromTaskbar}
        isStartOpen={isStartOpen}
        onToggleStart={() => {
          setIsStartOpen(!isStartOpen);
          setIsQuickSettingsOpen(false);
        }}
        alignment={taskbarAlignment}
        webRamMB={totalWebRam}
        currentWallpaper={wallpaper}
        onCycleWallpaper={handleCycleWallpaper}
        isQuickSettingsOpen={isQuickSettingsOpen}
        onToggleQuickSettings={handleToggleQuickSettings}
        volume={volume}
        isMuted={isMuted}
        brightness={brightness}
      />
    </div>
  );
}
