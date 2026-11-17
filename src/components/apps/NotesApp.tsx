/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Save, Copy, Check, Trash2, FileText } from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';

export const NotesApp: React.FC = () => {
  const [content, setContent] = useState<string>(() => {
    return (
      localStorage.getItem('lumeos_notes') ||
      `# LumeOS Focus Notes\n\n- Low-RAM browser OS concept tested in Helium / Chromium\n- Web apps (Photopea, Polotno, Spotify) run with 88% less memory than native Win32\n- Next steps: analyze spike protein RBD structure in BioBench\n`
    );
  });
  const [isCopied, setIsCopied] = useState(false);
  const [lastSaved, setLastSaved] = useState('All changes saved');

  useEffect(() => {
    localStorage.setItem('lumeos_notes', content);
    setLastSaved('Saved just now');
  }, [content]);

  const handleCopy = () => {
    audioEngine.playUiSound('click');
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 backdrop-blur-2xl text-neutral-200 text-xs select-none">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-900/40 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white text-[11px]">Quick Scratchpad</span>
          <span className="text-[10px] text-neutral-400 font-mono">({lastSaved})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => {
              audioEngine.playUiSound('close');
              setContent('');
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-red-400 transition-colors"
            title="Clear note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 w-full bg-transparent p-4 font-mono text-xs text-neutral-100 focus:outline-none resize-none leading-relaxed select-text"
        placeholder="Type quick thoughts, code snippets, or task items..."
        spellCheck={false}
      />

      {/* Footer bar */}
      <div className="px-3.5 py-2 bg-neutral-900/40 border-t border-white/10 text-[10px] text-neutral-400 flex justify-between font-mono shrink-0">
        <span>{wordCount} words · {charCount} characters</span>
        <span>Autosaved to Local Chromium Storage</span>
      </div>
    </div>
  );
};
