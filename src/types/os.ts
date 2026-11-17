/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppId =
  | 'files'
  | 'browser'
  | 'biobench'
  | 'photo'
  | 'audio'
  | 'terminal'
  | 'ram_monitor'
  | 'settings'
  | 'notes'
  | 'extension_hub'
  | 'about'
  | 'games'
  | 'game_snake'
  | 'game_tetris'
  | 'game_flappy'
  | 'game_2048'
  | 'game_minesweeper';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  iconName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  customData?: Record<string, any>;
}

export interface DesktopItem {
  id: string;
  appId: AppId;
  title: string;
  iconName: string;
  col: number; // 0-based column
  row: number; // 0-based row
  badge?: string;
}

export type WallpaperTheme =
  | 'photo-mountain'
  | 'photo-tokyo'
  | 'photo-abstract'
  | 'photo-nebula'
  | '3d-zen-monolith'
  | '3d-dna-lattice'
  | '3d-celestial'
  | 'gradient-nordic'
  | 'gradient-tokyo'
  | 'minimal-slate';

export interface VirtualFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  size?: string;
  updatedAt: string;
  icon?: string;
  category?: 'document' | 'bio' | 'code' | 'image' | 'system';
}

export interface ProcessMetric {
  id: string;
  appId: AppId;
  title: string;
  webRamMB: number;
  nativeEquivalentMB: number;
  cpuPercent: number;
  status: 'active' | 'suspended' | 'hibernated';
}
