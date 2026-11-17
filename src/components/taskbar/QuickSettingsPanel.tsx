/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Battery,
  BatteryCharging,
  Plane,
  Bell,
  BellOff,
  Sparkles,
  Settings,
  Maximize,
  ChevronRight,
  ShieldCheck,
  Check,
  Lock,
  Zap,
  Info,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';
import { AppId } from '../../types/os';
import { LumeLogo } from '../ui/LumeLogo';

interface QuickSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: AppId) => void;
  onOpenAboutWithAnimation: () => void;
  onToggleFullscreen: () => void;
  brightness: number;
  onSetBrightness: (val: number) => void;
  volume: number;
  onSetVolume: (val: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isNightLight: boolean;
  onToggleNightLight: () => void;
}

export const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onOpenAboutWithAnimation,
  onToggleFullscreen,
  brightness,
  onSetBrightness,
  volume,
  onSetVolume,
  isMuted,
  onToggleMute,
  isNightLight,
  onToggleNightLight,
}) => {
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [showWifiList, setShowWifiList] = useState(false);
  const [selectedWifi, setSelectedWifi] = useState('Lume-Fiber-5G');

  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [showBtList, setShowBtList] = useState(false);
  const [selectedBt, setSelectedBt] = useState('AeroPods Max (Spatial Audio)');

  const [airplaneMode, setAirplaneMode] = useState(false);
  const [focusAssist, setFocusAssist] = useState(false);
  const [batteryMode, setBatteryMode] = useState<'performance' | 'balanced' | 'saver'>('performance');

  if (!isOpen) return null;

  const wifiNetworks = [
    { name: 'Lume-Fiber-5G', signal: 4, secured: true, active: true },
    { name: 'Nebula-Mesh-6E', signal: 4, secured: true, active: false },
    { name: 'Orbit-Starlink-Lab', signal: 3, secured: true, active: false },
    { name: 'Public-Cloud-Node', signal: 2, secured: false, active: false },
  ];

  const btDevices = [
    { name: 'AeroPods Max (Spatial Audio)', type: 'Audio', connected: true },
    { name: 'DualSense Wireless Controller', type: 'Gamepad', connected: false },
    { name: 'MX Master 3S Mouse', type: 'Peripheral', connected: true },
  ];

  const handleWifiToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playUiSound('click');
    setWifiEnabled(!wifiEnabled);
    if (!wifiEnabled && airplaneMode) setAirplaneMode(false);
  };

  const handleBtToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playUiSound('click');
    setBluetoothEnabled(!bluetoothEnabled);
    if (!bluetoothEnabled && airplaneMode) setAirplaneMode(false);
  };

  const handleAirplaneToggle = () => {
    audioEngine.playUiSound('snap');
    const next = !airplaneMode;
    setAirplaneMode(next);
    if (next) {
      setWifiEnabled(false);
      setBluetoothEnabled(false);
    } else {
      setWifiEnabled(true);
      setBluetoothEnabled(true);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed bottom-20 right-6 w-84 md:w-96 rounded-3xl bg-neutral-950/75 backdrop-blur-3xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10 select-none z-50 animate-in fade-in zoom-in-95 duration-200 text-neutral-100 p-5 space-y-4"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          <span className="text-xs font-bold tracking-wider uppercase text-neutral-300">
            Control Center & Quick Settings
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
          <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          <span>98% AC Connected</span>
        </div>
      </div>

      {/* Main 2x3 Quick Action Tiles Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Tile 1: Wi-Fi */}
        <div className="relative group">
          <div
            className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
              wifiEnabled
                ? 'bg-sky-500/25 border-sky-400/40 text-white shadow-sm ring-1 ring-sky-400/20'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
            }`}
          >
            <button
              onClick={handleWifiToggle}
              className="flex items-center gap-2.5 flex-1 text-left min-w-0"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  wifiEnabled ? 'bg-sky-400 text-neutral-950 font-bold' : 'bg-white/10 text-neutral-400'
                }`}
              >
                {wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white leading-tight">Wi-Fi</div>
                <div className="text-[10px] text-neutral-300 truncate">
                  {wifiEnabled ? selectedWifi : 'Disconnected'}
                </div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowWifiList(!showWifiList);
                setShowBtList(false);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-300"
              title="View Networks"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showWifiList ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tile 2: Bluetooth */}
        <div className="relative group">
          <div
            className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
              bluetoothEnabled
                ? 'bg-indigo-500/25 border-indigo-400/40 text-white shadow-sm ring-1 ring-indigo-400/20'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'
            }`}
          >
            <button
              onClick={handleBtToggle}
              className="flex items-center gap-2.5 flex-1 text-left min-w-0"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  bluetoothEnabled ? 'bg-indigo-400 text-neutral-950 font-bold' : 'bg-white/10 text-neutral-400'
                }`}
              >
                {bluetoothEnabled ? <Bluetooth className="w-4 h-4" /> : <BluetoothOff className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white leading-tight">Bluetooth</div>
                <div className="text-[10px] text-neutral-300 truncate">
                  {bluetoothEnabled ? 'AeroPods Max' : 'Off'}
                </div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBtList(!showBtList);
                setShowWifiList(false);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-neutral-300"
              title="View Devices"
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showBtList ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tile 3: Airplane Mode */}
        <button
          onClick={handleAirplaneToggle}
          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
            airplaneMode
              ? 'bg-amber-500/25 border-amber-400/40 text-white shadow-sm ring-1 ring-amber-400/20'
              : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              airplaneMode ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-white/10 text-neutral-400'
            }`}
          >
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white leading-tight">Airplane</div>
            <div className="text-[10px] text-neutral-400">{airplaneMode ? 'On' : 'Off'}</div>
          </div>
        </button>

        {/* Tile 4: Night Light (Amber Blue-light filter) */}
        <button
          onClick={() => {
            audioEngine.playUiSound('snap');
            onToggleNightLight();
          }}
          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
            isNightLight
              ? 'bg-orange-500/25 border-orange-400/40 text-white shadow-sm ring-1 ring-orange-400/20'
              : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              isNightLight ? 'bg-orange-400 text-neutral-950 font-bold' : 'bg-white/10 text-neutral-400'
            }`}
          >
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white leading-tight">Night Light</div>
            <div className="text-[10px] text-neutral-400">{isNightLight ? 'Warm Tint' : 'Off'}</div>
          </div>
        </button>

        {/* Tile 5: Focus Assist (Do Not Disturb) */}
        <button
          onClick={() => {
            audioEngine.playUiSound('click');
            setFocusAssist(!focusAssist);
          }}
          className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
            focusAssist
              ? 'bg-purple-500/25 border-purple-400/40 text-white shadow-sm ring-1 ring-purple-400/20'
              : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              focusAssist ? 'bg-purple-400 text-neutral-950 font-bold' : 'bg-white/10 text-neutral-400'
            }`}
          >
            {focusAssist ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-semibold text-white leading-tight">Focus Assist</div>
            <div className="text-[10px] text-neutral-400">{focusAssist ? 'Priority Only' : 'Off'}</div>
          </div>
        </button>

        {/* Tile 6: Power Mode */}
        <button
          onClick={() => {
            audioEngine.playUiSound('snap');
            setBatteryMode((prev) =>
              prev === 'performance' ? 'balanced' : prev === 'balanced' ? 'saver' : 'performance'
            );
          }}
          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-left transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white leading-tight capitalize">
              {batteryMode}
            </div>
            <div className="text-[10px] text-emerald-400">Power Profile</div>
          </div>
        </button>
      </div>

      {/* Expandable Wi-Fi Network Drawer */}
      {showWifiList && (
        <div className="p-3 bg-neutral-900/80 rounded-2xl border border-white/10 space-y-1.5 animate-in fade-in duration-150">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Available Wi-Fi Networks
          </div>
          {wifiNetworks.map((net) => {
            const isConn = selectedWifi === net.name;
            return (
              <button
                key={net.name}
                onClick={() => {
                  setSelectedWifi(net.name);
                  audioEngine.playUiSound('snap');
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                  isConn ? 'bg-sky-500/20 text-sky-200 border border-sky-400/30' : 'hover:bg-white/5 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-sky-400" />
                  <span>{net.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {net.secured && <Lock className="w-3 h-3 text-neutral-400" />}
                  {isConn && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Expandable Bluetooth Drawer */}
      {showBtList && (
        <div className="p-3 bg-neutral-900/80 rounded-2xl border border-white/10 space-y-1.5 animate-in fade-in duration-150">
          <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
            Paired Bluetooth Devices
          </div>
          {btDevices.map((dev) => (
            <button
              key={dev.name}
              onClick={() => {
                setSelectedBt(dev.name);
                audioEngine.playUiSound('snap');
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-white/5 text-neutral-300 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate">{dev.name}</span>
              </div>
              <span className={`text-[10px] font-mono ${dev.connected ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {dev.connected ? 'Connected' : 'Paired'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Sliders Area */}
      <div className="space-y-3 pt-1">
        {/* Brightness Slider */}
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <Sun className="w-4 h-4 text-amber-300 shrink-0" />
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-medium text-neutral-300">
              <span>Display Brightness</span>
              <span className="font-mono text-amber-300">{brightness}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={brightness}
              onChange={(e) => onSetBrightness(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Master Volume Slider */}
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              onToggleMute();
              audioEngine.playUiSound('click');
            }}
            className="text-pink-400 hover:text-pink-300 transition-colors shrink-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-medium text-neutral-300">
              <span>Master Audio</span>
              <span className="font-mono text-pink-300">{isMuted ? 'Muted' : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onSetVolume(val);
                if (isMuted && val > 0) onToggleMute();
              }}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Prominent About LumeOS & Creator Banner */}
      <div
        onClick={() => {
          onClose();
          onOpenAboutWithAnimation();
        }}
        className="p-3 rounded-2xl bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-amber-950/40 border border-sky-400/30 hover:border-amber-400/50 shadow-md cursor-pointer transition-all group flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/25 to-indigo-500/25 border border-white/20 flex items-center justify-center shadow-sm">
            <LumeLogo size="sm" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>About LumeOS</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
                Creator Info
              </span>
            </div>
            <div className="text-[10px] text-neutral-300">
              By <strong className="text-amber-300">Chitron Bhattacharjee Adi</strong>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-sky-400 group-hover:text-amber-300 font-medium">
          <span>Explore</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
        <button
          onClick={() => {
            onClose();
            onOpenApp('extension_hub');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-sky-400" />
          <span>All Settings</span>
        </button>

        <button
          onClick={() => {
            onToggleFullscreen();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
        >
          <Maximize className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fullscreen</span>
        </button>
      </div>
    </div>
  );
};
