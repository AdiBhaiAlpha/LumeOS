/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send } from 'lucide-react';
import { VirtualFile, WallpaperTheme } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';

interface TerminalProps {
  files: VirtualFile[];
  onSetWallpaper: (theme: WallpaperTheme) => void;
  onOpenApp: (appId: any) => void;
}

export const TerminalApp: React.FC<TerminalProps> = ({ files, onSetWallpaper, onOpenApp }) => {
  const [history, setHistory] = useState<Array<{ command?: string; output: React.ReactNode }>>([
    {
      output: (
        <div className="space-y-1 text-neutral-400">
          <div>LumeOS Kernel v1.0.4-chromium (x86_64-helium-sandbox)</div>
          <div>Type <span className="text-sky-400 font-semibold">help</span> to view available system commands.</div>
        </div>
      ),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    audioEngine.playUiSound('click');
    const args = cmd.split(' ');
    const primary = args[0].toLowerCase();

    let outputNode: React.ReactNode = null;

    switch (primary) {
      case 'help':
        outputNode = (
          <div className="space-y-1 text-neutral-300">
            <div className="text-sky-400 font-semibold mb-1">Available System Commands:</div>
            <div><span className="text-emerald-400 w-28 inline-block">help</span> Display this manual</div>
            <div><span className="text-emerald-400 w-28 inline-block">ram</span> Benchmark browser memory vs native Windows</div>
            <div><span className="text-emerald-400 w-28 inline-block">ls</span> List virtual file system items</div>
            <div><span className="text-emerald-400 w-28 inline-block">cat &lt;file&gt;</span> Read file contents</div>
            <div><span className="text-emerald-400 w-28 inline-block">wallpaper &lt;id&gt;</span> Change 3D wallpaper (monolith, dna, celestial, nordic)</div>
            <div><span className="text-emerald-400 w-28 inline-block">science &lt;name&gt;</span> Inspect chemical formula (caffeine, aspirin, atp)</div>
            <div><span className="text-emerald-400 w-28 inline-block">manifest</span> View Chromium Manifest V3 config</div>
            <div><span className="text-emerald-400 w-28 inline-block">clear</span> Clear terminal output</div>
            <div><span className="text-emerald-400 w-28 inline-block">uname -a</span> Show system info</div>
          </div>
        );
        break;

      case 'ram':
        outputNode = (
          <div className="space-y-1 text-neutral-300">
            <div className="text-sky-400 font-semibold">LumeOS RAM Benchmark (Chromium Sandbox):</div>
            <div>Total Web Apps Footprint: <span className="text-sky-400 font-semibold">374 MB</span></div>
            <div>Native Win32 Apps Footprint: <span className="text-neutral-400">3,470 MB</span></div>
            <div>Memory Efficiency: <span className="text-emerald-400 font-semibold">89.2% Memory Preserved</span></div>
          </div>
        );
        break;

      case 'ls':
        outputNode = (
          <div className="grid grid-cols-3 gap-2 text-neutral-300">
            {files.map((f) => (
              <span key={f.id} className={f.type === 'folder' ? 'text-amber-400 font-semibold' : 'text-sky-300'}>
                {f.name} {f.type === 'folder' ? '/' : ''}
              </span>
            ))}
          </div>
        );
        break;

      case 'cat':
        if (!args[1]) {
          outputNode = <span className="text-red-400">Usage: cat &lt;filename&gt;</span>;
        } else {
          const found = files.find((f) => f.name.toLowerCase() === args[1].toLowerCase());
          if (!found) {
            outputNode = <span className="text-red-400">File not found: {args[1]}</span>;
          } else {
            outputNode = (
              <pre className="whitespace-pre-wrap text-neutral-300 bg-neutral-900/60 p-2 rounded border border-neutral-800 text-[11px]">
                {found.content || '(empty file)'}
              </pre>
            );
          }
        }
        break;

      case 'wallpaper':
        const themeArg = args[1]?.toLowerCase();
        if (themeArg === 'monolith') {
          onSetWallpaper('3d-zen-monolith');
          outputNode = <span className="text-emerald-400">Wallpaper set to 3D Zen Monolith</span>;
        } else if (themeArg === 'dna') {
          onSetWallpaper('3d-dna-lattice');
          outputNode = <span className="text-emerald-400">Wallpaper set to 3D DNA Lattice</span>;
        } else if (themeArg === 'celestial') {
          onSetWallpaper('3d-celestial');
          outputNode = <span className="text-emerald-400">Wallpaper set to 3D Celestial Orbitals</span>;
        } else if (themeArg === 'nordic') {
          onSetWallpaper('gradient-nordic');
          outputNode = <span className="text-emerald-400">Wallpaper set to Nordic Gradient</span>;
        } else {
          outputNode = <span className="text-neutral-400">Themes: monolith, dna, celestial, nordic</span>;
        }
        break;

      case 'science':
        const mol = args[1]?.toLowerCase();
        if (mol === 'aspirin') {
          outputNode = <span className="text-sky-300">Aspirin: C9H8O4 · MW 180.16 g/mol · Lipinski: PASS · PubChem CID: 2244</span>;
        } else if (mol === 'caffeine') {
          outputNode = <span className="text-sky-300">Caffeine: C8H10N4O2 · MW 194.19 g/mol · Adenosine Antagonist · PubChem CID: 2519</span>;
        } else if (mol === 'atp') {
          outputNode = <span className="text-sky-300">ATP: C10H16N5O13P3 · Universal Energy Carrier · PubChem CID: 5957</span>;
        } else {
          outputNode = <span className="text-neutral-400">Try: science aspirin, science caffeine, science atp</span>;
        }
        break;

      case 'manifest':
        outputNode = (
          <pre className="text-sky-300 text-[10px] bg-neutral-900 p-2 rounded">
{`{
  "manifest_version": 3,
  "name": "LumeOS New Tab Environment",
  "chrome_url_overrides": { "newtab": "index.html" },
  "permissions": ["storage", "unlimitedStorage"]
}`}
          </pre>
        );
        break;

      case 'uname':
        outputNode = <span className="text-neutral-300">LumeOS 1.0.4-chromium #1 SMP Oct 15 2026 Helium/Blink</span>;
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        outputNode = (
          <span className="text-red-400">
            command not found: {primary}. Type 'help' for available commands.
          </span>
        );
    }

    setHistory((prev) => [...prev, { command: cmd, output: outputNode }]);
    setInputVal('');
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 backdrop-blur-2xl font-mono text-xs text-neutral-200 p-4 select-text overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="text-sky-400">lume@desktop:~$</span>
                <span className="text-white font-medium">{item.command}</span>
              </div>
            )}
            <div className="pl-0">{item.output}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand(inputVal);
        }}
        className="flex items-center gap-2 pt-3 border-t border-white/10 shrink-0"
      >
        <span className="text-sky-400 select-none font-semibold">lume@desktop:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 bg-transparent text-white focus:outline-none"
          autoFocus
          spellCheck={false}
          placeholder="Type a command (try 'help')..."
        />
        <button type="submit" className="text-neutral-400 hover:text-sky-400">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
