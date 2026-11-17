/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NativeSystemInfo {
  isNativeISO: boolean;
  platform: string;
  arch?: string;
  hostname?: string;
  uptimeSeconds?: number;
}

export interface LumeNativeAPI {
  platform?: string;
  arch?: string;
  isISO?: boolean;
  reboot?: () => void;
  shutdown?: () => void;
  toggleFullscreen?: () => void;
  getSystemInfo?: () => Promise<NativeSystemInfo>;
}

declare global {
  interface Window {
    lumeNative?: LumeNativeAPI;
  }
}

export const nativeBridge = {
  isNativeEnvironment(): boolean {
    return Boolean(typeof window !== 'undefined' && window.lumeNative);
  },

  getRuntimeLabel(): string {
    if (typeof window !== 'undefined' && window.lumeNative?.isISO) {
      return 'LumeOS Bare-Metal ISO';
    }
    if (typeof window !== 'undefined' && window.lumeNative) {
      return 'LumeOS Native Desktop Shell';
    }
    return 'LumeOS Standalone Runtime';
  },

  reboot(fallbackReplay: () => void): void {
    if (typeof window !== 'undefined' && window.lumeNative?.reboot) {
      window.lumeNative.reboot();
      return;
    }
    fallbackReplay();
  },

  shutdown(fallbackPowerOff: () => void): void {
    if (typeof window !== 'undefined' && window.lumeNative?.shutdown) {
      window.lumeNative.shutdown();
      return;
    }
    fallbackPowerOff();
  },

  toggleFullscreen(): void {
    if (typeof window !== 'undefined' && window.lumeNative?.toggleFullscreen) {
      window.lumeNative.toggleFullscreen();
      return;
    }
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  },
};
