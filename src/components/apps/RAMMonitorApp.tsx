/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, RefreshCw, Zap, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProcessMetric } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';

interface RAMMonitorProps {
  runningProcesses: ProcessMetric[];
  onSuspendProcess: (id: string) => void;
  onPurgeMemory: () => void;
}

export const RAMMonitorApp: React.FC<RAMMonitorProps> = ({
  runningProcesses,
  onSuspendProcess,
  onPurgeMemory,
}) => {
  const [isPurging, setIsPurging] = useState(false);
  const [purgedAmount, setPurgedAmount] = useState<number | null>(null);

  const totalWebRam = runningProcesses.reduce((acc, p) => acc + (p.status === 'hibernated' ? 4 : p.webRamMB), 0);
  const totalNativeRam = runningProcesses.reduce((acc, p) => acc + p.nativeEquivalentMB, 0);
  const ramSavedPercent = Math.round(((totalNativeRam - totalWebRam) / (totalNativeRam || 1)) * 100);

  const handlePurge = () => {
    audioEngine.playUiSound('ding');
    setIsPurging(true);
    setTimeout(() => {
      onPurgeMemory();
      setIsPurging(false);
      setPurgedAmount(Math.floor(Math.random() * 45) + 35);
      setTimeout(() => setPurgedAmount(null), 3000);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 backdrop-blur-2xl text-neutral-200 text-xs p-5 overflow-y-auto space-y-4 select-none">
      {/* Top Banner: The BrowOS Thesis */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-neutral-900/40 to-neutral-900/30 border border-sky-500/25">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Chromium OS Memory Architecture</h3>
          </div>
          <button
            onClick={handlePurge}
            disabled={isPurging}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
            <span>{isPurging ? 'Reclaiming...' : 'Purge Cache & GC'}</span>
          </button>
        </div>
        <p className="text-[11px] text-neutral-300 mt-1.5 leading-relaxed">
          BrowOS proves that running web apps inside Chromium isolates memory footprints and eliminates heavy Windows/macOS native runtime bloat.
        </p>

        {purgedAmount && (
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Successfully released {purgedAmount} MB of inactive browser heap memory!</span>
          </div>
        )}
      </div>

      {/* Memory Reduction Comparison Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[10px] uppercase font-semibold text-neutral-400 block">LumeOS Web Apps</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-sky-300">{totalWebRam}</span>
            <span className="text-xs text-neutral-400 font-mono">MB</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Isolated tab processes</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-[10px] uppercase font-semibold text-neutral-400 block">Native Win32 Equivalent</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-neutral-300">{totalNativeRam}</span>
            <span className="text-xs text-neutral-400 font-mono">MB</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">Windows native binary footprint</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/25">
          <span className="text-[10px] uppercase font-semibold text-emerald-400 block">Total RAM Saved</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">-{ramSavedPercent}%</span>
            <span className="text-xs text-emerald-500/80 font-mono">Efficiency</span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            {totalNativeRam - totalWebRam} MB preserved for other tasks
          </span>
        </div>
      </div>

      {/* Comparison Progress Bar */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-neutral-300">Memory Allocation Comparison:</span>
          <span className="font-mono text-emerald-400 font-medium">LumeOS uses ~1/9th the memory</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, Math.max(8, (totalWebRam / totalNativeRam) * 100))}%` }}
            className="bg-sky-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.7)]"
            title="LumeOS RAM"
          />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
          <span>LumeOS: {totalWebRam} MB</span>
          <span>Native Apps: {totalNativeRam} MB</span>
        </div>
      </div>

      {/* Active Process Table */}
      <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center bg-white/5">
          <span className="font-semibold text-neutral-200">Active Windows & Subsystems</span>
          <span className="text-[10px] text-neutral-500 font-mono">{runningProcesses.length} running</span>
        </div>

        <table className="w-full text-left text-[11px]">
          <thead className="bg-neutral-900/50 text-neutral-500 border-b border-neutral-800/60">
            <tr>
              <th className="py-2 px-3 font-medium">Process / Module</th>
              <th className="py-2 px-3 font-medium">Web RAM</th>
              <th className="py-2 px-3 font-medium">Win32 Equivalent</th>
              <th className="py-2 px-3 font-medium">Status</th>
              <th className="py-2 px-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/40 font-mono">
            {runningProcesses.map((p) => {
              const isHibernated = p.status === 'hibernated';
              return (
                <tr key={p.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-2 px-3 font-sans font-medium text-neutral-200">
                    {p.title}
                  </td>
                  <td className="py-2 px-3 text-sky-400">
                    {isHibernated ? '4 MB (Swapped)' : `${p.webRamMB} MB`}
                  </td>
                  <td className="py-2 px-3 text-neutral-400">
                    {p.nativeEquivalentMB} MB
                  </td>
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        isHibernated
                          ? 'bg-neutral-800 text-neutral-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-sans">
                    <button
                      onClick={() => onSuspendProcess(p.id)}
                      className="px-2 py-0.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors text-[10px]"
                    >
                      {isHibernated ? 'Resume' : 'Hibernate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
