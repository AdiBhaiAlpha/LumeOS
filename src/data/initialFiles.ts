/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VirtualFile } from '../types/os';

export const INITIAL_FILES: VirtualFile[] = [
  // Root Folders
  {
    id: 'folder-desktop',
    name: 'Desktop',
    type: 'folder',
    parentId: null,
    updatedAt: 'Today, 10:45 AM',
    category: 'system',
  },
  {
    id: 'folder-documents',
    name: 'Documents',
    type: 'folder',
    parentId: null,
    updatedAt: 'Yesterday, 4:20 PM',
    category: 'document',
  },
  {
    id: 'folder-bioscience',
    name: 'Bio-Research',
    type: 'folder',
    parentId: null,
    updatedAt: 'Oct 15, 2026',
    category: 'bio',
  },
  {
    id: 'folder-extension',
    name: 'Extension_Manifest',
    type: 'folder',
    parentId: null,
    updatedAt: 'Oct 15, 2026',
    category: 'code',
  },

  // Files in Desktop
  {
    id: 'file-welcome',
    name: 'Welcome_to_LumeOS.md',
    type: 'file',
    parentId: 'folder-desktop',
    size: '1.8 KB',
    updatedAt: 'Oct 15, 2026',
    category: 'document',
    content: `# Welcome to LumeOS 🌌

LumeOS is a minimalist, browser-based desktop environment and Chromium new tab extension inspired by BrowOS.

### Key Innovations:
1. **Dramatically Lower RAM Footprint**:
   Running web apps (Spotify Web, Photopea, BioBench) inside LumeOS consumes ~350 MB compared to 3.4+ GB of native desktop apps.

2. **Full Chromium Extension Compatible**:
   Download the unpacked extension archive from the **Extension Hub** and load it into Chromium/Helium/Chrome via \`chrome://extensions\`!

3. **Interactive 3D Procedural Wallpapers**:
   Engineered with Three.js studio PBR lighting, procedural geometries, and real-time cursor parallax.

4. **Deep Bio-Research Lab**:
   Inspect real molecular structures (PDB / PubChem), view AlphaFold pLDDT confidence scores, and analyze genetic sequences.

Enjoy your minimalist workspace!
`,
  },
  {
    id: 'file-manifest',
    name: 'manifest.json',
    type: 'file',
    parentId: 'folder-extension',
    size: '1.2 KB',
    updatedAt: 'Oct 15, 2026',
    category: 'code',
    content: JSON.stringify(
      {
        manifest_version: 3,
        name: 'LumeOS New Tab Environment',
        version: '1.0.0',
        description: 'Transform your browser new tab into a minimalist, low-RAM desktop operating system.',
        chrome_url_overrides: {
          newtab: 'index.html',
        },
        permissions: ['storage', 'unlimitedStorage'],
        action: {
          default_title: 'Open LumeOS',
        },
        icons: {
          '16': 'icons/icon16.png',
          '48': 'icons/icon48.png',
          '128': 'icons/icon128.png',
        },
      },
      null,
      2
    ),
  },

  // Files in Bio-Research
  {
    id: 'file-pdb-target',
    name: '7KRR_Spike_Receptor.pdb',
    type: 'file',
    parentId: 'folder-bioscience',
    size: '4.6 KB',
    updatedAt: 'Oct 14, 2026',
    category: 'bio',
    content: `HEADER    VIRAL PROTEIN / IMMUNE COMPLEX         15-OCT-26   7KRR
TITLE     CRYO-EM STRUCTURE OF SARS-COV-2 SPIKE RECEPTOR BINDING DOMAIN
REMARK 800 EXPERIMENT TYPE: ELECTRON MICROSCOPY (2.42 A)
REMARK 800 ORGANISM: SARS-COV-2 / HOMO SAPIENS
REMARK 800 ALPHAFOLD CONFIDENCE: VERY HIGH (>90 PLDDT ON CORE RESIDUES)
ATOM      1  N   THR A  14      12.441  24.120  18.992  1.00 92.15           N
ATOM      2  CA  THR A  14      13.204  25.352  19.245  1.00 94.20           C
ATOM      3  C   THR A  14      14.685  25.042  19.112  1.00 93.80           C
ATOM      4  O   THR A  14      15.520  25.922  19.290  1.00 91.40           O
ATOM      5  CB  THR A  14      12.822  26.468  18.239  1.00 92.50           C
ATOM      6  OG1 THR A  14      13.518  27.674  18.528  1.00 89.10           O
TER       7      THR A  14
END`,
  },
  {
    id: 'file-aspirin',
    name: 'aspirin_pubchem_2244.json',
    type: 'file',
    parentId: 'folder-bioscience',
    size: '890 B',
    updatedAt: 'Oct 12, 2026',
    category: 'bio',
    content: JSON.stringify(
      {
        cid: 2244,
        name: 'Acetylsalicylic Acid (Aspirin)',
        formula: 'C9H8O4',
        smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
        molecularWeight: 180.16,
        logP: 1.19,
        hBondDonors: 1,
        hBondAcceptors: 4,
        rotatableBonds: 3,
        lipinskiCompliant: true,
      },
      null,
      2
    ),
  },

  // Files in Documents
  {
    id: 'file-benchmark',
    name: 'ram_benchmark_results.json',
    type: 'file',
    parentId: 'folder-documents',
    size: '1.1 KB',
    updatedAt: 'Today, 11:15 AM',
    category: 'document',
    content: JSON.stringify(
      {
        test: 'LumeOS vs Windows 11 Native Apps RAM Comparison',
        date: '2026-10-15',
        hardware: 'Intel Core i7 / 16GB RAM / Chromium Engine',
        metrics: [
          { app: 'Spotify', nativeWinMB: 485, lumeOSWebMB: 78, deltaSavedPercent: 83.9 },
          { app: 'Photo Editor (Photoshop vs Photopea)', nativeWinMB: 1920, lumeOSWebMB: 142, deltaSavedPercent: 92.6 },
          { app: 'File Manager & Explorer', nativeWinMB: 130, lumeOSWebMB: 28, deltaSavedPercent: 78.4 },
          { app: 'Terminal & CLI', nativeWinMB: 95, lumeOSWebMB: 16, deltaSavedPercent: 83.1 },
          { app: 'Science / Molecular Viewer', nativeWinMB: 840, lumeOSWebMB: 110, deltaSavedPercent: 86.9 },
        ],
        totalNativeMB: 3470,
        totalLumeOSMB: 374,
        overallMemoryReduction: '89.2% Memory Saved',
      },
      null,
      2
    ),
  },
];
