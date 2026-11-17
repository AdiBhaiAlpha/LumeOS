/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { WindowState } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';

interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onUpdatePosition: (x: number, y: number) => void;
  onUpdateSize: (w: number, h: number) => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onUpdatePosition,
  onUpdateSize,
  icon,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  // Handle Drag Start
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    // Only primary left button
    if (e.button !== 0) return;
    if (windowState.isMaximized) return;
    // Don't drag if clicking window control buttons
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    onFocus();
    setIsDragging(true);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: windowState.x,
      winY: windowState.y,
    };

    audioEngine.playUiSound('click');
  };

  // Handle Resize Start
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (windowState.isMaximized) return;

    e.preventDefault();
    e.stopPropagation();
    onFocus();
    setIsResizing(true);

    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winW: windowState.width,
      winH: windowState.height,
    };
  };

  // Global mousemove and mouseup listeners when dragging or resizing
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStartRef.current.mouseX;
        const dy = e.clientY - dragStartRef.current.mouseY;

        let newX = dragStartRef.current.winX + dx;
        let newY = dragStartRef.current.winY + dy;

        // Desktop bounds checking (keep at least 80px visible horizontally, titlebar visible vertically)
        const minX = -windowState.width + 80;
        const maxX = window.innerWidth - 80;
        const minY = 0;
        const maxY = window.innerHeight - 70;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        // Magnetic snap near edges
        if (Math.abs(newX) < 12) newX = 0;
        if (Math.abs(newY) < 12) newY = 0;

        onUpdatePosition(Math.round(newX), Math.round(newY));
      } else if (isResizing) {
        const dw = e.clientX - resizeStartRef.current.mouseX;
        const dh = e.clientY - resizeStartRef.current.mouseY;

        const minW = windowState.minWidth || 380;
        const minH = windowState.minHeight || 260;
        const maxW = window.innerWidth - 20;
        const maxH = window.innerHeight - 70;

        const newW = Math.max(minW, Math.min(maxW, resizeStartRef.current.winW + dw));
        const newH = Math.max(minH, Math.min(maxH, resizeStartRef.current.winH + dh));

        onUpdateSize(Math.round(newW), Math.round(newH));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, windowState.width, windowState.height, windowState.minWidth, windowState.minHeight, onUpdatePosition, onUpdateSize]);

  if (windowState.isMinimized) {
    return null;
  }

  const isMax = windowState.isMaximized;

  return (
    <>
      {/* Invisible global capture overlay during drag/resize to prevent losing mouse events over iframes/inputs */}
      {(isDragging || isResizing) && (
        <div
          className={`fixed inset-0 z-[999999] select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-se-resize'
          }`}
          style={{ userSelect: 'none' }}
        />
      )}

      <div
        onMouseDown={onFocus}
        style={{
          position: 'fixed',
          left: isMax ? 0 : `${windowState.x}px`,
          top: isMax ? 0 : `${windowState.y}px`,
          width: isMax ? '100vw' : `${windowState.width}px`,
          height: isMax ? 'calc(100vh - 68px)' : `${windowState.height}px`,
          zIndex: isDragging ? 99999 : windowState.zIndex,
        }}
        className={`lume-glass flex flex-col rounded-2xl overflow-hidden border ${
          isActive
            ? 'border-white/25 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/15'
            : 'border-white/10 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.6)] opacity-95'
        } ${isDragging ? 'opacity-90 transition-none scale-[1.003]' : ''}`}
      >
        {/* Title Bar with Frosted Acrylic and Draggable Handle */}
        <div
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={onMaximize}
          className={`flex items-center justify-between px-4 py-2.5 select-none border-b transition-colors cursor-grab active:cursor-grabbing ${
            isActive
              ? 'bg-neutral-900/50 border-white/12 text-white'
              : 'bg-neutral-900/30 border-white/6 text-neutral-400'
          }`}
        >
          {/* App Icon and Title */}
          <div className="flex items-center gap-2.5 overflow-hidden pointer-events-none">
            <div className="w-4 h-4 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <span className="text-xs font-semibold tracking-wide truncate">
              {windowState.title}
            </span>
          </div>

          {/* Window Controls (Minimize, Maximize, Close) */}
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audioEngine.playUiSound('minimize');
                onMinimize();
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 text-neutral-400 hover:text-white transition-all active:scale-90"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audioEngine.playUiSound('snap');
                onMaximize();
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 text-neutral-400 hover:text-white transition-all active:scale-90"
              title={isMax ? 'Restore' : 'Maximize'}
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                audioEngine.playUiSound('close');
                onClose();
              }}
              className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-all active:scale-90"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Window Content */}
        <div
          className={`flex-1 overflow-hidden relative bg-neutral-950/65 backdrop-blur-xl ${
            isDragging ? 'pointer-events-none' : ''
          }`}
        >
          {children}
        </div>

        {/* Resize Handle */}
        {!isMax && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-50 flex items-center justify-center group"
            title="Resize"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-white/30 group-hover:border-white/80 transition-colors mr-1 mb-1" />
          </div>
        )}
      </div>
    </>
  );
};
