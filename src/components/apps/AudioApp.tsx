/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  CloudRain,
  Radio,
  Wind,
  Disc3,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';

export const AudioApp: React.FC = () => {
  const [activeAmbient, setActiveAmbient] = useState<'rain' | 'drone' | 'whitenoise' | 'lofi' | null>(null);
  const [volume, setVolume] = useState<number>(0.6);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ambient' | 'spotify'>('ambient');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ambientTracks = [
    { id: 'rain' as const, name: 'Binaural Rain', icon: CloudRain, desc: 'Filtered brownian noise simulating gentle precipitation' },
    { id: 'drone' as const, name: 'Cosmic Drone', icon: Disc3, desc: 'Deep harmonic multi-oscillator chords with low-frequency detuning' },
    { id: 'whitenoise' as const, name: 'Focus Static', icon: Radio, desc: 'Bandpass-shaped white noise masking environmental chatter' },
    { id: 'lofi' as const, name: 'Lo-Fi Chill', icon: Wind, desc: 'Soft warm acoustic resonances with subtle warmth' },
  ];

  const handleToggleAmbient = (trackId: 'rain' | 'drone' | 'whitenoise' | 'lofi') => {
    if (activeAmbient === trackId) {
      audioEngine.stopAmbient();
      setActiveAmbient(null);
    } else {
      audioEngine.startAmbient(trackId);
      setActiveAmbient(trackId);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    audioEngine.setVolume(v);
  };

  const handleMuteToggle = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  // Waveform visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      phase += 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeAmbient && !isMuted) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const numPoints = 80;
        const w = canvas.width;
        const h = canvas.height;
        const midY = h / 2;

        for (let i = 0; i <= numPoints; i++) {
          const x = (i / numPoints) * w;
          const amp = activeAmbient === 'rain' ? 8 : activeAmbient === 'drone' ? 14 : 6;
          const y = midY + Math.sin(i * 0.2 + phase) * amp * volume + Math.cos(i * 0.4 - phase) * (amp * 0.5);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Flat line when paused
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeAmbient, isMuted, volume]);

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 backdrop-blur-2xl text-neutral-200 text-xs p-5 select-none overflow-y-auto space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('ambient')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'ambient' ? 'bg-white/15 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Procedural Ambient Focus
          </button>
          <button
            onClick={() => setActiveTab('spotify')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              activeTab === 'spotify' ? 'bg-white/15 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Spotify Web Hub
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMuteToggle}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-20 accent-sky-400"
          />
        </div>
      </div>

      {activeTab === 'ambient' ? (
        <>
          {/* Waveform Visualizer */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
            <span className="text-[10px] text-neutral-400 font-mono self-start mb-2">
              REALTIME WEB AUDIO SYNTHESIZER OSCILLOSCOPE
            </span>
            <canvas ref={canvasRef} width={420} height={70} className="w-full h-16 rounded-xl bg-neutral-950/40" />
            <div className="mt-2 text-[11px] text-neutral-300">
              {activeAmbient ? `Now Playing: ${activeAmbient.toUpperCase()} (Synthesized in RAM)` : 'Select a sound below to start'}
            </div>
          </div>

          {/* Sound Choices */}
          <div className="grid grid-cols-2 gap-3">
            {ambientTracks.map((track) => {
              const isPlaying = activeAmbient === track.id;
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  onClick={() => handleToggleAmbient(track.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isPlaying
                      ? 'bg-sky-500/10 border-sky-500/40 text-white'
                      : 'bg-neutral-900/70 border-neutral-800 hover:bg-neutral-900 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isPlaying ? 'bg-sky-500/20 text-sky-400' : 'bg-neutral-800 text-neutral-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs text-white">{track.name}</span>
                    </div>
                    <div className={`p-1.5 rounded-full ${isPlaying ? 'bg-sky-500 text-neutral-950' : 'bg-neutral-800 text-neutral-400'}`}>
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">{track.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-neutral-900/40 border border-neutral-800/80 text-[11px] text-neutral-500 flex justify-between">
            <span>RAM Overhead: &le; 8 MB</span>
            <span>Zero External MP3 Network Calls</span>
          </div>
        </>
      ) : (
        /* Spotify Web Hub */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <h4 className="text-sm font-semibold text-white">Spotify Web Player (BrowOS Integration)</h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              In BrowOS, launching Spotify in a browser tab saved up to 80% RAM compared to the native Windows desktop client.
            </p>
            <div className="pt-2">
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
              >
                <span>Launch Spotify Web Player</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <a
              href="https://open.spotify.com/genre/focus-page"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 block transition-all"
            >
              <span className="font-semibold text-white block">Deep Focus Playlists</span>
              <span className="text-neutral-500 text-[10px] mt-0.5 block">Instrumental study & programming beats</span>
            </a>
            <a
              href="https://open.spotify.com/genre/lofi-page"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 block transition-all"
            >
              <span className="font-semibold text-white block">Chill Lofi Chillhop</span>
              <span className="text-neutral-500 text-[10px] mt-0.5 block">Gentle retro tape textures</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
