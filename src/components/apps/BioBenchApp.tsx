/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Dna, Atom, Search, ExternalLink, Activity, Sparkles, BookOpen } from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';

interface MoleculePreset {
  id: string;
  name: string;
  formula: string;
  cid?: number;
  pdbId?: string;
  category: 'drug' | 'metabolite' | 'neuro' | 'protein';
  mw: number;
  logP: number;
  hbd: number;
  hba: number;
  rotBonds: number;
  description: string;
  alphafoldScore?: number; // pLDDT score
  atoms: Array<{ elem: 'C' | 'O' | 'N' | 'H' | 'P' | 'S'; x: number; y: number; z: number; plddt?: number }>;
  bonds: Array<[number, number]>;
}

const PRESET_MOLECULES: MoleculePreset[] = [
  {
    id: 'caffeine',
    name: 'Caffeine',
    formula: 'C8H10N4O2',
    cid: 2519,
    category: 'neuro',
    mw: 194.19,
    logP: -0.07,
    hbd: 0,
    hba: 6,
    rotBonds: 0,
    description: 'Central nervous system stimulant; non-selective adenosine A1 & A2A receptor antagonist.',
    alphafoldScore: 94.2,
    atoms: [
      { elem: 'N', x: 0.0, y: 1.1, z: 0.0, plddt: 95 },
      { elem: 'C', x: -1.1, y: 0.4, z: 0.0, plddt: 94 },
      { elem: 'N', x: -0.8, y: -0.9, z: 0.0, plddt: 93 },
      { elem: 'C', x: 0.6, y: -1.0, z: 0.0, plddt: 96 },
      { elem: 'C', x: 1.1, y: 0.3, z: 0.0, plddt: 94 },
      { elem: 'O', x: -2.2, y: 0.9, z: 0.0, plddt: 92 },
      { elem: 'O', x: 1.2, y: -2.1, z: 0.0, plddt: 91 },
      { elem: 'N', x: 2.4, y: 0.7, z: 0.0, plddt: 95 },
      { elem: 'C', x: 2.7, y: -0.6, z: 0.0, plddt: 93 },
      { elem: 'N', x: 1.6, y: -1.7, z: 0.0, plddt: 94 },
      { elem: 'C', x: -0.2, y: 2.5, z: 0.0, plddt: 91 },
      { elem: 'C', x: -1.8, y: -1.9, z: 0.0, plddt: 90 },
      { elem: 'C', x: 3.5, y: 1.8, z: 0.0, plddt: 92 },
    ],
    bonds: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 0],
      [1, 5], [3, 6], [4, 7], [7, 8], [8, 9],
      [9, 3], [0, 10], [2, 11], [7, 12]
    ],
  },
  {
    id: 'aspirin',
    name: 'Acetylsalicylic Acid (Aspirin)',
    formula: 'C9H8O4',
    cid: 2244,
    category: 'drug',
    mw: 180.16,
    logP: 1.19,
    hbd: 1,
    hba: 4,
    rotBonds: 3,
    description: 'Prototypical NSAID; irreversible cyclooxygenase (COX-1/COX-2) inhibitor acetylating Ser530.',
    alphafoldScore: 91.5,
    atoms: [
      { elem: 'C', x: 0.0, y: 0.0, z: 0.0, plddt: 93 },
      { elem: 'C', x: 1.3, y: 0.5, z: 0.0, plddt: 94 },
      { elem: 'C', x: 1.6, y: 1.9, z: 0.0, plddt: 92 },
      { elem: 'C', x: 0.6, y: 2.8, z: 0.0, plddt: 91 },
      { elem: 'C', x: -0.7, y: 2.3, z: 0.0, plddt: 90 },
      { elem: 'C', x: -1.0, y: 0.9, z: 0.0, plddt: 92 },
      { elem: 'C', x: 2.4, y: -0.5, z: 0.0, plddt: 95 },
      { elem: 'O', x: 3.6, y: -0.2, z: 0.0, plddt: 89 },
      { elem: 'O', x: 2.0, y: -1.8, z: 0.0, plddt: 88 },
      { elem: 'O', x: -0.2, y: -1.3, z: 0.0, plddt: 92 },
      { elem: 'C', x: -1.5, y: -1.8, z: 0.0, plddt: 94 },
      { elem: 'O', x: -2.5, y: -1.2, z: 0.0, plddt: 89 },
      { elem: 'C', x: -1.6, y: -3.3, z: 0.0, plddt: 90 },
    ],
    bonds: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [1, 6], [6, 7], [6, 8], [0, 9], [9, 10], [10, 11], [10, 12]
    ],
  },
  {
    id: 'atp',
    name: 'Adenosine Triphosphate (ATP)',
    formula: 'C10H16N5O13P3',
    cid: 5957,
    category: 'metabolite',
    mw: 507.18,
    logP: -4.2,
    hbd: 6,
    hba: 16,
    rotBonds: 6,
    description: 'Universal molecular energy carrier across all cellular cellular respiration and metabolic processes.',
    alphafoldScore: 88.0,
    atoms: [
      { elem: 'N', x: -2.5, y: 1.5, z: 0.0, plddt: 89 },
      { elem: 'C', x: -1.8, y: 0.3, z: 0.0, plddt: 88 },
      { elem: 'N', x: -2.5, y: -0.8, z: 0.0, plddt: 87 },
      { elem: 'C', x: -1.3, y: -1.3, z: 0.0, plddt: 89 },
      { elem: 'C', x: -0.5, y: -0.3, z: 0.0, plddt: 90 },
      { elem: 'C', x: -0.8, y: 1.1, z: 0.0, plddt: 89 },
      { elem: 'C', x: 0.9, y: -0.5, z: 0.0, plddt: 88 },
      { elem: 'O', x: 1.5, y: 0.7, z: 0.0, plddt: 85 },
      { elem: 'P', x: 2.8, y: 0.8, z: 0.0, plddt: 87 },
      { elem: 'O', x: 3.2, y: 2.2, z: 0.0, plddt: 82 },
      { elem: 'O', x: 3.8, y: -0.2, z: 0.0, plddt: 84 },
      { elem: 'P', x: 5.2, y: -0.3, z: 0.0, plddt: 86 },
      { elem: 'O', x: 6.2, y: -1.4, z: 0.0, plddt: 81 },
      { elem: 'P', x: 7.5, y: -1.5, z: 0.0, plddt: 85 },
      { elem: 'O', x: 8.5, y: -0.5, z: 0.0, plddt: 79 },
    ],
    bonds: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [4, 6], [6, 7], [7, 8], [8, 9], [8, 10], [10, 11], [11, 12], [12, 13], [13, 14]
    ],
  },
  {
    id: 'spike-rbd',
    name: 'SARS-CoV-2 Spike RBD Loop',
    formula: 'Polypeptide Chain',
    pdbId: '7KRR',
    category: 'protein',
    mw: 25140,
    logP: -0.85,
    hbd: 184,
    hba: 290,
    rotBonds: 142,
    description: 'Human ACE2 receptor binding domain with structural disulfide knots and core beta sheets.',
    alphafoldScore: 92.4,
    atoms: [
      { elem: 'N', x: -1.8, y: 2.2, z: -0.5, plddt: 95 },
      { elem: 'C', x: -1.2, y: 1.4, z: 0.2, plddt: 94 },
      { elem: 'C', x: -0.2, y: 1.8, z: 1.2, plddt: 93 },
      { elem: 'N', x: 0.8, y: 0.9, z: 1.4, plddt: 91 },
      { elem: 'C', x: 1.6, y: 1.2, z: 0.3, plddt: 93 },
      { elem: 'C', x: 2.8, y: 0.2, z: 0.1, plddt: 89 },
      { elem: 'S', x: 2.4, y: -1.2, z: 1.1, plddt: 94 },
      { elem: 'S', x: 0.7, y: -1.8, z: 0.5, plddt: 92 },
      { elem: 'C', x: -0.3, y: -0.7, z: -0.4, plddt: 91 },
      { elem: 'O', x: -1.5, y: -0.9, z: -0.2, plddt: 93 },
      { elem: 'C', x: -0.2, y: 0.5, z: -1.1, plddt: 90 },
      { elem: 'N', x: 1.0, y: 0.6, z: -1.8, plddt: 74 },
      { elem: 'C', x: 1.8, y: -0.4, z: -1.9, plddt: 68 },
    ],
    bonds: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
      [6, 7], [7, 8], [8, 9], [8, 10], [10, 1], [10, 11], [11, 12]
    ],
  },
];

// Helper to determine AlphaFold pLDDT color
function getPlddtColor(score: number): { hex: number; label: string; textClass: string; bgClass: string } {
  if (score >= 90) {
    return { hex: 0x0053d6, label: 'Very High (>90)', textClass: 'text-blue-500', bgClass: 'bg-blue-500/20' };
  }
  if (score >= 70) {
    return { hex: 0x65cbf3, label: 'Confident (70-90)', textClass: 'text-sky-400', bgClass: 'bg-sky-400/20' };
  }
  if (score >= 50) {
    return { hex: 0xffdb13, label: 'Low (50-70)', textClass: 'text-amber-400', bgClass: 'bg-amber-400/20' };
  }
  return { hex: 0xff7d45, label: 'Very Low (<50)', textClass: 'text-orange-500', bgClass: 'bg-orange-500/20' };
}

// Element CPK colors
const ELEMENT_COLORS: Record<string, number> = {
  C: 0x334155, // Slate / Charcoal Carbon
  O: 0xef4444, // Red Oxygen
  N: 0x3b82f6, // Blue Nitrogen
  H: 0xf1f5f9, // White/Light Hydrogen
  P: 0xf97316, // Orange Phosphorus
  S: 0xeab308, // Yellow Sulfur
};

export const BioBenchApp: React.FC = () => {
  const [activePreset, setActivePreset] = useState<MoleculePreset>(PRESET_MOLECULES[0]);
  const [colorMode, setColorMode] = useState<'cpk' | 'plddt'>('cpk');
  const [activeTab, setActiveTab] = useState<'3d' | 'sequence' | 'lipinski'>('3d');
  const [dnaInput, setDnaInput] = useState('ATGGCTAGCTTCGAGCAGCAGATCGACATGCTGAAGTAA');
  const [searchQuery, setSearchQuery] = useState('');

  const [hasWebGLError, setHasWebGLError] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  // Initialize 3D molecular viewer
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    let renderer: THREE.WebGLRenderer | null = null;
    let animId: number;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0c10);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, failIfMajorPerformanceCaveat: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      rendererRef.current = renderer;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

    // Studio lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff0dd, 2.2);
    dirLight1.position.set(4, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x88ccff, 1.4);
    dirLight2.position.set(-4, -3, -3);
    scene.add(dirLight2);

    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    groupRef.current = moleculeGroup;

    // Render loop
    let animId: number;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging && moleculeGroup) {
        moleculeGroup.rotation.y += 0.008;
      }
      renderer?.render(scene, camera);
    };
    animate();

    // Mouse drag interaction
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !moleculeGroup) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      moleculeGroup.rotation.y += dx * 0.01;
      moleculeGroup.rotation.x += dy * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer?.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

      return () => {
        resizeObserver.disconnect();
        cancelAnimationFrame(animId);
        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        renderer?.dispose();
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.warn('BioBench WebGL initialization failed, switching to 2D view', err);
      setHasWebGLError(true);
    }
  }, []);

  // Update molecule meshes when preset or colorMode changes
  useEffect(() => {
    if (hasWebGLError) return;
    const group = groupRef.current;
    if (!group) return;

    // Clear old meshes
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    const { atoms, bonds } = activePreset;

    // Center geometry calculation
    let cx = 0, cy = 0, cz = 0;
    atoms.forEach((a) => {
      cx += a.x;
      cy += a.y;
      cz += a.z;
    });
    cx /= atoms.length;
    cy /= atoms.length;
    cz /= atoms.length;

    // Render Atoms (spheres)
    atoms.forEach((a) => {
      const radius = a.elem === 'H' ? 0.2 : a.elem === 'C' ? 0.38 : a.elem === 'N' ? 0.36 : a.elem === 'O' ? 0.35 : 0.44;
      const sphereGeo = new THREE.SphereGeometry(radius, 24, 24);

      let colorHex = ELEMENT_COLORS[a.elem] || 0xcccccc;
      if (colorMode === 'plddt') {
        const plddtScore = a.plddt ?? activePreset.alphafoldScore ?? 90;
        colorHex = getPlddtColor(plddtScore).hex;
      }

      const sphereMat = new THREE.MeshPhysicalMaterial({
        color: colorHex,
        roughness: 0.25,
        metalness: 0.15,
        clearcoat: 0.5,
      });

      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(a.x - cx, a.y - cy, a.z - cz);
      group.add(sphereMesh);
    });

    // Render Bonds (cylinders)
    bonds.forEach(([i, j]) => {
      if (!atoms[i] || !atoms[j]) return;
      const p1 = new THREE.Vector3(atoms[i].x - cx, atoms[i].y - cy, atoms[i].z - cz);
      const p2 = new THREE.Vector3(atoms[j].x - cx, atoms[j].y - cy, atoms[j].z - cz);

      const distance = p1.distanceTo(p2);
      const cylGeo = new THREE.CylinderGeometry(0.08, 0.08, distance, 12);
      const cylMat = new THREE.MeshPhysicalMaterial({
        color: 0x64748b,
        metalness: 0.4,
        roughness: 0.4,
      });

      const cylMesh = new THREE.Mesh(cylGeo, cylMat);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      cylMesh.position.copy(mid);

      const dir = p2.clone().sub(p1).normalize();
      cylMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      group.add(cylMesh);
    });
  }, [activePreset, colorMode]);

  // DNA sequence analyzer calculations
  const calculateSeqStats = (seq: string) => {
    const clean = seq.toUpperCase().replace(/[^ATCGU]/g, '');
    const length = clean.length;
    if (length === 0) return { length: 0, gc: 0, rna: '', aminoAcids: '' };

    const gCount = (clean.match(/G/g) || []).length;
    const cCount = (clean.match(/C/g) || []).length;
    const gc = Math.round(((gCount + cCount) / length) * 100);
    const rna = clean.replace(/T/g, 'U');

    // Simple codon translation
    const codonMap: Record<string, string> = {
      AUG: 'Met (Start)', UUU: 'Phe', UUC: 'Phe', UUA: 'Leu', UUG: 'Leu',
      UCU: 'Ser', UCC: 'Ser', UCA: 'Ser', UCG: 'Ser', UAU: 'Tyr', UAC: 'Tyr',
      UAA: 'Stop', UAG: 'Stop', UGA: 'Stop', UGU: 'Cys', UGC: 'Cys', UGG: 'Trp',
      CCU: 'Pro', CCC: 'Pro', CCA: 'Pro', CCG: 'Pro', CAU: 'His', CAC: 'His',
      CAA: 'Gln', CAG: 'Gln', CGU: 'Arg', CGC: 'Arg', CGA: 'Arg', CGG: 'Arg',
      AUU: 'Ile', AUC: 'Ile', AUA: 'Ile', ACU: 'Thr', ACC: 'Thr', ACA: 'Thr',
      ACG: 'Thr', AAU: 'Asn', AAC: 'Asn', AAA: 'Lys', AAG: 'Lys', AGU: 'Ser',
      AGC: 'Ser', AGA: 'Arg', AGG: 'Arg', GUU: 'Val', GUC: 'Val', GUA: 'Val',
      GUG: 'Val', GCU: 'Ala', GCC: 'Ala', GCA: 'Ala', GCG: 'Ala', GAU: 'Asp',
      GAC: 'Asp', GAA: 'Glu', GAG: 'Glu', GGU: 'Gly', GGC: 'Gly', GGA: 'Gly',
      GGG: 'Gly',
    };

    const codons: string[] = [];
    for (let i = 0; i < rna.length - 2; i += 3) {
      const triplet = rna.slice(i, i + 3);
      codons.push(codonMap[triplet] || '?');
    }

    return { length, gc, rna, aminoAcids: codons.join(' - ') };
  };

  const seqStats = calculateSeqStats(dnaInput);
  const filteredPresets = PRESET_MOLECULES.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.formula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-neutral-950/70 backdrop-blur-2xl text-neutral-200 text-xs overflow-hidden">
      {/* Top Bar with quick presets */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-neutral-900/40 border-b border-white/10 shrink-0 gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-medium text-neutral-400 whitespace-nowrap">Presets:</span>
          {filteredPresets.map((preset) => {
            const isSelected = activePreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  audioEngine.playUiSound('click');
                  setActivePreset(preset);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-500/25 text-sky-200 border border-sky-400/50 shadow-sm'
                    : 'bg-white/5 text-neutral-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-neutral-800/80 p-0.5 rounded border border-neutral-700/60 shrink-0">
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeTab === '3d' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            3D Structure
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'sequence' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            DNA / Codons
          </button>
          <button
            onClick={() => setActiveTab('lipinski')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              activeTab === 'lipinski' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Physicochemical
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: 3D Canvas / Content */}
        <div className="flex-1 flex flex-col relative border-r border-neutral-800">
          {activeTab === '3d' && (
            <>
              {/* 3D WebGL mount container or 2D Vector Fallback */}
              {hasWebGLError ? (
                <div className="flex-1 w-full h-full relative flex items-center justify-center bg-[#0a0c10] p-4 select-none">
                  <svg className="w-full h-full max-w-[480px] max-h-[320px]" viewBox="-5 -5 10 10">
                    {/* Bonds */}
                    {activePreset.bonds.map(([i, j], bIdx) => {
                      const a1 = activePreset.atoms[i];
                      const a2 = activePreset.atoms[j];
                      if (!a1 || !a2) return null;
                      return (
                        <line
                          key={`b-${bIdx}`}
                          x1={a1.x}
                          y1={-a1.y}
                          x2={a2.x}
                          y2={-a2.y}
                          stroke="#64748b"
                          strokeWidth="0.14"
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {/* Atoms */}
                    {activePreset.atoms.map((a, aIdx) => {
                      let fill = ELEMENT_COLORS[a.elem] ? `#${ELEMENT_COLORS[a.elem].toString(16).padStart(6, '0')}` : '#94a3b8';
                      if (colorMode === 'plddt') {
                        const score = a.plddt ?? activePreset.alphafoldScore ?? 90;
                        fill = score >= 90 ? '#0053D6' : score >= 70 ? '#65CBF3' : score >= 50 ? '#FFDB13' : '#FF7D45';
                      }
                      return (
                        <g key={`a-${aIdx}`} transform={`translate(${a.x}, ${-a.y})`}>
                          <circle r={a.elem === 'H' ? 0.24 : 0.42} fill={fill} stroke="#ffffff40" strokeWidth="0.04" />
                          <text
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="0.32"
                            fontWeight="bold"
                            fill={a.elem === 'H' ? '#0f172a' : '#ffffff'}
                          >
                            {a.elem}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="absolute top-3 right-3 text-[10px] text-sky-400 bg-neutral-900/80 px-2.5 py-1 rounded-full border border-sky-500/30">
                    2D Molecular Diagram (Sandbox Safe)
                  </div>
                </div>
              ) : (
                <div ref={canvasRef} className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing" />
              )}

              {/* Overlay controls */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-neutral-900/80 backdrop-blur px-2.5 py-1.5 rounded-lg border border-neutral-800 text-[11px]">
                <span className="text-neutral-400">Color Palette:</span>
                <button
                  onClick={() => setColorMode('cpk')}
                  className={`px-2 py-0.5 rounded ${colorMode === 'cpk' ? 'bg-neutral-700 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  Element CPK
                </button>
                <button
                  onClick={() => setColorMode('plddt')}
                  className={`px-2 py-0.5 rounded ${colorMode === 'plddt' ? 'bg-sky-500/20 text-sky-300 font-medium' : 'text-neutral-400 hover:text-neutral-200'}`}
                >
                  AlphaFold pLDDT
                </button>
              </div>

              {/* pLDDT Legend */}
              {colorMode === 'plddt' && (
                <div className="absolute bottom-3 left-3 bg-neutral-900/90 backdrop-blur p-2.5 rounded-lg border border-neutral-800 text-[10px] space-y-1">
                  <div className="font-semibold text-neutral-300 mb-1">AlphaFold Confidence (pLDDT)</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#0053D6]" />
                    <span>Very High (&gt;90)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#65CBF3]" />
                    <span>Confident (70-90)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FFDB13]" />
                    <span>Low (50-70)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#FF7D45]" />
                    <span>Very Low (&lt;50)</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 right-3 text-[10px] text-neutral-500 bg-neutral-900/70 px-2 py-1 rounded border border-neutral-800 pointer-events-none">
                Drag to rotate · Three.js PBR Studio
              </div>
            </>
          )}

          {activeTab === 'sequence' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">DNA Coding Strand (5' &rarr; 3'):</label>
                <textarea
                  value={dnaInput}
                  onChange={(e) => setDnaInput(e.target.value)}
                  className="w-full h-24 bg-neutral-900 border border-neutral-800 rounded p-2.5 font-mono text-xs text-emerald-400 focus:outline-none focus:border-sky-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">Sequence Length</span>
                  <span className="text-lg font-mono font-semibold text-white">{seqStats.length} bp</span>
                </div>
                <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">GC Content</span>
                  <span className="text-lg font-mono font-semibold text-sky-400">{seqStats.gc}%</span>
                </div>
                <div className="bg-neutral-900/80 p-3 rounded border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">Codon Triplet Count</span>
                  <span className="text-lg font-mono font-semibold text-emerald-400">
                    {Math.floor(seqStats.length / 3)}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-neutral-400 mb-1">mRNA Transcript:</span>
                <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800 font-mono text-[11px] text-sky-300 break-all select-all">
                  {seqStats.rna}
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-neutral-400 mb-1">Translated Peptide / Amino Acids:</span>
                <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800 font-mono text-[11px] text-amber-300 break-words">
                  {seqStats.aminoAcids || 'None'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lipinski' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <h4 className="text-sm font-semibold text-neutral-200">Lipinski Rule of 5 (Oral Drug-Likeness)</h4>
              <p className="text-neutral-400 text-[11px]">
                Determines whether a chemical compound has chemical properties and physical properties that would make it likely to be an active drug in humans.
              </p>

              <div className="space-y-2.5">
                <div className="p-3 bg-neutral-900/80 rounded border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white block">Molecular Weight &le; 500 Da</span>
                    <span className="text-[10px] text-neutral-400">Target Value: {activePreset.mw} Da</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${activePreset.mw <= 500 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {activePreset.mw <= 500 ? 'PASS' : 'EXCEEDS'}
                  </span>
                </div>

                <div className="p-3 bg-neutral-900/80 rounded border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white block">LogP (Lipophilicity) &le; 5</span>
                    <span className="text-[10px] text-neutral-400">Target Value: {activePreset.logP}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${activePreset.logP <= 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {activePreset.logP <= 5 ? 'PASS' : 'EXCEEDS'}
                  </span>
                </div>

                <div className="p-3 bg-neutral-900/80 rounded border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white block">Hydrogen Bond Donors &le; 5</span>
                    <span className="text-[10px] text-neutral-400">Target Value: {activePreset.hbd}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${activePreset.hbd <= 5 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {activePreset.hbd <= 5 ? 'PASS' : 'EXCEEDS'}
                  </span>
                </div>

                <div className="p-3 bg-neutral-900/80 rounded border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-white block">Hydrogen Bond Acceptors &le; 10</span>
                    <span className="text-[10px] text-neutral-400">Target Value: {activePreset.hba}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${activePreset.hba <= 10 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {activePreset.hba <= 10 ? 'PASS' : 'EXCEEDS'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Molecule Inspector & Provenance */}
        <div className="w-72 bg-neutral-900/60 p-4 flex flex-col gap-3 overflow-y-auto shrink-0 border-l border-neutral-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Active Compound</span>
            <h3 className="text-base font-bold text-white mt-0.5">{activePreset.name}</h3>
            <span className="font-mono text-sky-400 text-xs">{activePreset.formula}</span>
          </div>

          <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800 text-[11px] text-neutral-300 leading-relaxed">
            {activePreset.description}
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between py-1 border-b border-neutral-800/80">
              <span className="text-neutral-400">Molecular Mass</span>
              <span className="font-mono text-neutral-200">{activePreset.mw} g/mol</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/80">
              <span className="text-neutral-400">Partition (LogP)</span>
              <span className="font-mono text-neutral-200">{activePreset.logP}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-neutral-800/80">
              <span className="text-neutral-400">H-Bond Donors/Acc</span>
              <span className="font-mono text-neutral-200">{activePreset.hbd} / {activePreset.hba}</span>
            </div>
            {activePreset.alphafoldScore && (
              <div className="flex justify-between py-1 border-b border-neutral-800/80">
                <span className="text-neutral-400">AlphaFold Score</span>
                <span className="font-mono font-semibold text-blue-400">{activePreset.alphafoldScore} pLDDT</span>
              </div>
            )}
          </div>

          {/* Direct DB Outbound Links */}
          <div className="mt-auto pt-3 border-t border-neutral-800 space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold block">Authoritative Databases</span>
            {activePreset.cid && (
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${activePreset.cid}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded bg-neutral-800/70 hover:bg-neutral-800 text-sky-400 transition-colors"
              >
                <span>PubChem CID: {activePreset.cid}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {activePreset.pdbId && (
              <a
                href={`https://www.rcsb.org/structure/${activePreset.pdbId}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded bg-neutral-800/70 hover:bg-neutral-800 text-emerald-400 transition-colors"
              >
                <span>RCSB PDB: {activePreset.pdbId}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <a
              href="https://alphafold.ebi.ac.uk/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2 rounded bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              <span>AlphaFold Protein Structure DB</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
