/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  Dna,
  HardDrive,
  Trash2,
  Plus,
  FolderPlus,
  ArrowLeft,
  ChevronRight,
  Search,
  Save,
  Download,
} from 'lucide-react';
import { VirtualFile } from '../../types/os';
import { audioEngine } from '../../utils/audioSynth';

interface FileExplorerProps {
  files: VirtualFile[];
  onUpdateFiles: (files: VirtualFile[]) => void;
  onOpenFileInApp?: (file: VirtualFile) => void;
}

export const FileExplorerApp: React.FC<FileExplorerProps> = ({
  files,
  onUpdateFiles,
  onOpenFileInApp,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>('folder-desktop');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingFile, setViewingFile] = useState<VirtualFile | null>(null);
  const [editorContent, setEditorContent] = useState('');

  // Sidebar navigation destinations
  const sideNav = [
    { id: 'folder-desktop', label: 'Desktop', icon: HardDrive },
    { id: 'folder-documents', label: 'Documents', icon: FileText },
    { id: 'folder-bioscience', label: 'Bio-Research', icon: Dna },
    { id: 'folder-extension', label: 'Extension_Manifest', icon: FileCode },
  ];

  // Current folder items
  const currentItems = files.filter((f) => {
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return f.parentId === currentFolderId;
  });

  const currentFolder = files.find((f) => f.id === currentFolderId);

  const handleOpenItem = (item: VirtualFile) => {
    audioEngine.playUiSound('open');
    if (item.type === 'folder') {
      setCurrentFolderId(item.id);
      setSelectedFileId(null);
    } else {
      setViewingFile(item);
      setEditorContent(item.content || '');
    }
  };

  const handleCreateNewFile = () => {
    audioEngine.playUiSound('click');
    const newFileName = `New_Document_${Date.now().toString().slice(-4)}.md`;
    const newFile: VirtualFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      type: 'file',
      parentId: currentFolderId,
      size: '0 B',
      updatedAt: 'Just now',
      category: 'document',
      content: '# New Document\n\nWrite your notes or code here...',
    };
    onUpdateFiles([...files, newFile]);
    setSelectedFileId(newFile.id);
  };

  const handleCreateNewFolder = () => {
    audioEngine.playUiSound('click');
    const newFolder: VirtualFile = {
      id: `folder-${Date.now()}`,
      name: `Folder_${Date.now().toString().slice(-4)}`,
      type: 'folder',
      parentId: currentFolderId,
      updatedAt: 'Just now',
      category: 'system',
    };
    onUpdateFiles([...files, newFolder]);
  };

  const handleDeleteItem = (id: string) => {
    audioEngine.playUiSound('close');
    onUpdateFiles(files.filter((f) => f.id !== id && f.parentId !== id));
    if (selectedFileId === id) setSelectedFileId(null);
    if (viewingFile?.id === id) setViewingFile(null);
  };

  const handleSaveFile = () => {
    if (!viewingFile) return;
    audioEngine.playUiSound('ding');
    const updated = files.map((f) =>
      f.id === viewingFile.id
        ? {
            ...f,
            content: editorContent,
            size: `${(editorContent.length / 1024).toFixed(1)} KB`,
            updatedAt: 'Just now',
          }
        : f
    );
    onUpdateFiles(updated);
    setViewingFile({ ...viewingFile, content: editorContent });
  };

  const handleDownloadFile = () => {
    if (!viewingFile) return;
    const blob = new Blob([editorContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = viewingFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (file: VirtualFile) => {
    if (file.type === 'folder') return <Folder className="w-5 h-5 text-amber-400" />;
    if (file.category === 'bio') return <Dna className="w-5 h-5 text-emerald-400" />;
    if (file.category === 'code') return <FileCode className="w-5 h-5 text-sky-400" />;
    return <FileText className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 backdrop-blur-2xl text-neutral-200 text-xs select-none">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-900/40 border-b border-white/10 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (viewingFile) {
                setViewingFile(null);
              } else if (currentFolder?.parentId !== undefined) {
                setCurrentFolderId(currentFolder.parentId);
              }
            }}
            disabled={!viewingFile && currentFolderId === 'folder-desktop'}
            className="p-1 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 px-1">
            <span>LumeOS</span>
            <ChevronRight className="w-3 h-3 text-neutral-600" />
            <span className="text-white font-medium">
              {viewingFile ? viewingFile.name : currentFolder?.name || 'Search Results'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!viewingFile ? (
            <>
              <button
                onClick={handleCreateNewFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-100 border border-white/10 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New File</span>
              </button>
              <button
                onClick={handleCreateNewFolder}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-100 border border-white/10 font-medium transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New Folder</span>
              </button>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-sky-400 w-36"
                />
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-100 border border-white/10 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={() => setViewingFile(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-300"
              >
                Close Editor
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-48 bg-neutral-900/30 border-r border-white/10 p-2 flex flex-col gap-1 shrink-0">
          <span className="text-[10px] uppercase font-semibold text-neutral-400 px-2 py-1">Favorites</span>
          {sideNav.map((nav) => {
            const Icon = nav.icon;
            const isSelected = currentFolderId === nav.id && !viewingFile;
            return (
              <button
                key={nav.id}
                onClick={() => {
                  audioEngine.playUiSound('click');
                  setCurrentFolderId(nav.id);
                  setViewingFile(null);
                  setSelectedFileId(null);
                }}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] transition-colors text-left ${
                  isSelected
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-sky-400" />
                <span>{nav.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content View */}
        <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
          {!viewingFile ? (
            <div className="flex-1 p-3 overflow-y-auto">
              {currentItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-center">
                  <Folder className="w-10 h-10 mb-2 stroke-1 opacity-40" />
                  <p>This folder is empty.</p>
                  <p className="text-[10px] mt-1 text-neutral-600">Create a file or folder above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {currentItems.map((item) => {
                    const isSelected = selectedFileId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFileId(item.id)}
                        onDoubleClick={() => handleOpenItem(item)}
                        className={`group flex flex-col items-center p-2.5 rounded-lg cursor-pointer transition-all border text-center relative ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500/40'
                            : 'border-transparent hover:bg-neutral-900/80 hover:border-neutral-800'
                        }`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center mb-1.5">
                          {getFileIcon(item)}
                        </div>
                        <span className="text-[11px] text-neutral-200 max-w-full truncate px-1 font-medium">
                          {item.name}
                        </span>
                        <span className="text-[9px] text-neutral-500 mt-0.5">
                          {item.type === 'folder' ? 'Folder' : item.size || 'File'}
                        </span>

                        {/* Quick Delete affordance on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* File Editor View */
            <div className="flex-1 flex flex-col p-4 bg-neutral-950 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
                <span>File: {viewingFile.name}</span>
                <span>Type: {viewingFile.category || 'text'}</span>
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="flex-1 w-full bg-neutral-900 border border-neutral-800 rounded p-3 font-mono text-xs text-neutral-200 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {/* Footer Bar */}
          <div className="px-3 py-1.5 bg-neutral-900/90 border-t border-neutral-800 text-[10px] text-neutral-500 flex justify-between shrink-0">
            <span>{currentItems.length} items</span>
            <span>Virtual File System (Chromium Sandbox)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
