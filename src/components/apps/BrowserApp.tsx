/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Plus,
  X,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

const DEFAULT_BOOKMARKS = [
  { name: 'Photopea', url: 'https://www.photopea.com', category: 'Creative' },
  { name: 'Spotify Web', url: 'https://open.spotify.com', category: 'Media' },
  { name: 'PubMed NCBI', url: 'https://pubmed.ncbi.nlm.nih.gov', category: 'Science' },
  { name: 'Polotno Studio', url: 'https://studio.polotno.com', category: 'Creative' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org', category: 'Reference' },
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com', category: 'Search' },
];

export const BrowserApp: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'DuckDuckGo Search',
      url: 'https://duckduckgo.com',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState<string>('https://duckduckgo.com');
  const [iframeBlocked, setIframeBlocked] = useState<boolean>(false);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleNavigate = (targetUrl: string) => {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
        cleanUrl = `https://${cleanUrl}`;
      } else {
        // Query via DuckDuckGo
        cleanUrl = `https://duckduckgo.com/?q=${encodeURIComponent(cleanUrl)}`;
      }
    }

    setUrlInput(cleanUrl);
    setIframeBlocked(false);

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              url: cleanUrl,
              title: cleanUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Browser Tab',
            }
          : t
      )
    );
  };

  const handleNewTab = () => {
    audioEngine.playUiSound('click');
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title: 'New Tab',
      url: 'https://duckduckgo.com',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setUrlInput('https://duckduckgo.com');
    setIframeBlocked(false);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playUiSound('close');
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining[0].id);
      setUrlInput(remaining[0].url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-200 text-xs select-none">
      {/* Tab strip */}
      <div className="flex items-center px-2 pt-1.5 bg-neutral-900 border-b border-neutral-800 gap-1 overflow-x-auto no-scrollbar shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setUrlInput(tab.url);
                setIframeBlocked(false);
              }}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[11px] max-w-44 cursor-pointer transition-colors border-t border-x ${
                isActive
                  ? 'bg-neutral-950 text-white border-neutral-800 font-medium'
                  : 'bg-neutral-900/60 text-neutral-400 border-transparent hover:bg-neutral-800/80 hover:text-neutral-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate flex-1">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={handleNewTab}
          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation bar & Omnibox */}
      <div className="flex items-center px-3 py-2 bg-neutral-950 border-b border-neutral-800 gap-2 shrink-0">
        <button
          onClick={() => handleNavigate(activeTab.url)}
          className="p-1 rounded hover:bg-neutral-900 text-neutral-400 hover:text-white"
          title="Reload"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate(urlInput);
          }}
          className="flex-1 flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 focus-within:border-sky-500 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 bg-transparent text-white font-mono text-[11px] focus:outline-none"
            placeholder="Search or enter web address..."
          />
          <button type="submit" className="text-neutral-500 hover:text-sky-400 ml-1">
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        <a
          href={activeTab.url}
          target="_blank"
          rel="noreferrer"
          className="p-1.5 rounded hover:bg-neutral-900 text-neutral-400 hover:text-sky-400 transition-colors"
          title="Open in native browser tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center px-3 py-1 bg-neutral-900/60 border-b border-neutral-800 gap-2 overflow-x-auto no-scrollbar shrink-0 text-[10px]">
        <span className="text-neutral-500 font-medium shrink-0">Bookmarks:</span>
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => handleNavigate(bm.url)}
            className="px-2 py-0.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Main Web Viewport */}
      <div className="flex-1 relative bg-neutral-950 overflow-hidden flex flex-col items-center justify-center">
        {iframeBlocked ? (
          <div className="max-w-md p-6 bg-neutral-900/90 rounded-xl border border-neutral-800 text-center space-y-3">
            <Globe className="w-12 h-12 text-sky-400 mx-auto opacity-70" />
            <h3 className="text-sm font-semibold text-white">Browser Security Sandbox Notice</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              This website (<span className="text-sky-400 font-mono">{activeTab.url}</span>) restricts direct iframe embedding via Chromium headers (<code className="text-amber-400">X-Frame-Options: SAMEORIGIN</code>).
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <a
                href={activeTab.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => handleNavigate('https://en.wikipedia.org')}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              >
                Try Wikipedia
              </button>
            </div>
          </div>
        ) : (
          <iframe
            key={activeTab.url}
            src={activeTab.url}
            title={activeTab.title}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onError={() => setIframeBlocked(true)}
          />
        )}
      </div>
    </div>
  );
};
