/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Paintbrush,
  Eraser,
  Download,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';

export const PhotoStudioApp: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'canvas' | 'photopea' | 'polotno'>('canvas');
  const [color, setColor] = useState('#38bdf8');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  // Initialize canvas
  useEffect(() => {
    if (activeMode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // Initial fill background
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [activeMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#111318';
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleClear = () => {
    audioEngine.playUiSound('close');
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const handleDownload = () => {
    audioEngine.playUiSound('ding');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `lumeos_artwork_${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const palette = ['#ffffff', '#38bdf8', '#34d399', '#facc15', '#f87171', '#a855f7', '#fb923c'];

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 text-xs select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800 shrink-0 gap-2">
        <div className="flex items-center gap-1 bg-neutral-800/80 p-0.5 rounded border border-neutral-700/60">
          <button
            onClick={() => setActiveMode('canvas')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeMode === 'canvas' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Lume Canvas
          </button>
          <button
            onClick={() => setActiveMode('photopea')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeMode === 'photopea' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Photopea Web
          </button>
          <button
            onClick={() => setActiveMode('polotno')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeMode === 'polotno' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Polotno Design
          </button>
        </div>

        {activeMode === 'canvas' && (
          <div className="flex items-center gap-2">
            {/* Color swatches */}
            <div className="flex items-center gap-1 bg-neutral-800/60 p-1 rounded-lg border border-neutral-700/40">
              {palette.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    setTool('brush');
                  }}
                  style={{ backgroundColor: c }}
                  className={`w-4 h-4 rounded-full transition-transform ${color === c && tool === 'brush' ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  setTool('brush');
                }}
                className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 ml-0.5"
              />
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-1.5 bg-neutral-800/60 px-2 py-1 rounded-lg border border-neutral-700/40 text-[10px]">
              <span className="text-neutral-400">Size:</span>
              <input
                type="range"
                min="1"
                max="30"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-16 accent-sky-400"
              />
              <span className="font-mono text-neutral-300 w-3">{brushSize}</span>
            </div>

            {/* Tool toggles */}
            <button
              onClick={() => setTool('brush')}
              className={`p-1.5 rounded ${tool === 'brush' ? 'bg-sky-500/20 text-sky-400' : 'text-neutral-400 hover:text-white'}`}
              title="Brush"
            >
              <Paintbrush className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-sky-500/20 text-sky-400' : 'text-neutral-400 hover:text-white'}`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        )}

        {activeMode !== 'canvas' && (
          <a
            href={activeMode === 'photopea' ? 'https://www.photopea.com' : 'https://studio.polotno.com'}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Main viewport */}
      <div className="flex-1 relative overflow-hidden bg-neutral-950 flex items-center justify-center">
        {activeMode === 'canvas' && (
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseMove={draw}
            className="w-full h-full cursor-crosshair"
          />
        )}

        {activeMode === 'photopea' && (
          <iframe
            src="https://www.photopea.com"
            title="Photopea Web Studio"
            className="w-full h-full border-none bg-neutral-900"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
          />
        )}

        {activeMode === 'polotno' && (
          <iframe
            src="https://studio.polotno.com"
            title="Polotno Design Studio"
            className="w-full h-full border-none bg-neutral-900"
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-popups"
          />
        )}
      </div>
    </div>
  );
};
