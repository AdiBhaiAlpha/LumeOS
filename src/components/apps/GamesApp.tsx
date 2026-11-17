/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  RotateCcw,
  Trophy,
  Play,
  Pause,
  Bomb,
  Flag,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { audioEngine } from '../../utils/audioSynth';

export type GameId = 'hub' | 'snake' | 'tetris' | 'flappy' | '2048' | 'minesweeper';

interface GamesAppProps {
  initialGame?: GameId;
}

/* ============================================================================
   1. NEON SNAKE
============================================================================ */
const SNAKE_GRID = 18;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Array<{ x: number; y: number }>>([
    { x: 9, y: 9 },
    { x: 8, y: 9 },
    { x: 7, y: 9 },
  ]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 14, y: 9 });
  const [dir, setDir] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const dirRef = useRef(dir);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('lume_snake_best') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const spawnFood = useCallback((occupied: Array<{ x: number; y: number }>) => {
    let pos: { x: number; y: number };
    do {
      pos = {
        x: Math.floor(Math.random() * SNAKE_GRID),
        y: Math.floor(Math.random() * SNAKE_GRID),
      };
    } while (occupied.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const reset = useCallback(() => {
    const init = [
      { x: 9, y: 9 },
      { x: 8, y: 9 },
      { x: 7, y: 9 },
    ];
    setSnake(init);
    setFood(spawnFood(init));
    const initDir = { x: 1, y: 0 };
    setDir(initDir);
    dirRef.current = initDir;
    setScore(0);
    setGameOver(false);
    setPaused(false);
    audioEngine.playUiSound('open');
  }, [spawnFood]);

  const changeDirection = useCallback((nx: number, ny: number) => {
    const cur = dirRef.current;
    if (cur.x + nx === 0 && cur.y + ny === 0) return;
    dirRef.current = { x: nx, y: ny };
    setDir({ x: nx, y: ny });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection(0, -1);
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection(0, 1);
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection(-1, 0);
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection(1, 0);
      else if (e.key === ' ') setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeDirection]);

  useEffect(() => {
    if (gameOver || paused) return;
    const speed = Math.max(65, 135 - Math.floor(score / 40) * 8);
    const timer = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];
        const next = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

        if (
          next.x < 0 ||
          next.x >= SNAKE_GRID ||
          next.y < 0 ||
          next.y >= SNAKE_GRID ||
          prev.some((seg) => seg.x === next.x && seg.y === next.y)
        ) {
          setGameOver(true);
          audioEngine.playUiSound('close');
          return prev;
        }

        const ate = next.x === food.x && next.y === food.y;
        const updated = ate ? [next, ...prev] : [next, ...prev.slice(0, -1)];
        if (ate) {
          audioEngine.playUiSound('snap');
          setScore((s) => {
            const ns = s + 10;
            if (ns > best) {
              setBest(ns);
              localStorage.setItem('lume_snake_best', String(ns));
            }
            return ns;
          });
          setFood(spawnFood(updated));
        }
        return updated;
      });
    }, speed);
    return () => clearInterval(timer);
  }, [food, gameOver, paused, score, best, spawnFood]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <div className="flex items-center justify-between w-full max-w-[360px] text-xs">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-mono">
            Score: <span className="text-emerald-400 font-bold">{score}</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 font-mono flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">{best}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPaused((p) => !p)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
            title="Pause / Resume"
          >
            {paused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-sky-400" />}
          </button>
          <button
            onClick={reset}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4 text-neutral-300" />
          </button>
        </div>
      </div>

      <div
        className="relative grid bg-neutral-900/90 border border-white/15 rounded-2xl p-1.5 shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${SNAKE_GRID}, 16px)`,
          gridTemplateRows: `repeat(${SNAKE_GRID}, 16px)`,
          gap: '2px',
        }}
      >
        {Array.from({ length: SNAKE_GRID * SNAKE_GRID }).map((_, i) => {
          const x = i % SNAKE_GRID;
          const y = Math.floor(i / SNAKE_GRID);
          const idx = snake.findIndex((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div
              key={i}
              className={`rounded-sm transition-colors ${
                idx === 0
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  : idx > 0
                  ? 'bg-emerald-500/75'
                  : isFood
                  ? 'bg-rose-400 rounded-full shadow-[0_0_10px_rgba(251,113,133,0.9)] animate-pulse'
                  : 'bg-white/[0.03]'
              }`}
            />
          );
        })}

        {(gameOver || paused) && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2">
            <div className="text-lg font-bold text-white">
              {gameOver ? 'Game Over!' : 'Paused'}
            </div>
            <div className="text-xs text-neutral-400 font-mono">Score: {score}</div>
            <button
              onClick={gameOver ? reset : () => setPaused(false)}
              className="mt-1 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors"
            >
              {gameOver ? 'Play Again' : 'Resume'}
            </button>
          </div>
        )}
      </div>

      {/* Touch / Mouse D-Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-28">
        <div />
        <button onClick={() => changeDirection(0, -1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/15 flex justify-center border border-white/10">
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <div />
        <button onClick={() => changeDirection(-1, 0)} className="p-2 rounded-xl bg-white/5 hover:bg-white/15 flex justify-center border border-white/10">
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => changeDirection(0, 1)} className="p-2 rounded-xl bg-white/5 hover:bg-white/15 flex justify-center border border-white/10">
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => changeDirection(1, 0)} className="p-2 rounded-xl bg-white/5 hover:bg-white/15 flex justify-center border border-white/10">
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   2. CYBER TETRIS
============================================================================ */
const TETRIS_ROWS = 18;
const TETRIS_COLS = 10;

const TETROMINOES: Array<{ shape: number[][]; color: string }> = [
  { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]' }, // I
  { shape: [[1, 1], [1, 1]], color: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]' }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]' }, // T
  { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' }, // S
  { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.6)]' }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]' }, // J
  { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]' }, // L
];

const createEmptyBoard = (): (string | null)[][] =>
  Array.from({ length: TETRIS_ROWS }, () => Array(TETRIS_COLS).fill(null));

const rotateMatrix = (matrix: number[][]): number[][] =>
  matrix[0].map((_, idx) => matrix.map((row) => row[idx]).reverse());

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<(string | null)[][]>(createEmptyBoard);
  const [piece, setPiece] = useState(() => {
    const t = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    return { shape: t.shape, color: t.color, x: 3, y: 0 };
  });
  const [nextPiece, setNextPiece] = useState(
    () => TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]
  );
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('lume_tetris_best') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const collides = useCallback(
    (shape: number[][], px: number, py: number, b: (string | null)[][]) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (!shape[r][c]) continue;
          const nx = px + c;
          const ny = py + r;
          if (nx < 0 || nx >= TETRIS_COLS || ny >= TETRIS_ROWS) return true;
          if (ny >= 0 && b[ny][nx] !== null) return true;
        }
      }
      return false;
    },
    []
  );

  const spawnNext = useCallback(
    (updatedBoard: (string | null)[][]) => {
      const upcoming = nextPiece;
      const startX = Math.floor((TETRIS_COLS - upcoming.shape[0].length) / 2);
      if (collides(upcoming.shape, startX, 0, updatedBoard)) {
        setGameOver(true);
        audioEngine.playUiSound('close');
        return;
      }
      setPiece({ shape: upcoming.shape, color: upcoming.color, x: startX, y: 0 });
      setNextPiece(TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)]);
    },
    [nextPiece, collides]
  );

  const lockAndClear = useCallback(
    (p: typeof piece) => {
      const nextBoard = board.map((row) => [...row]);
      for (let r = 0; r < p.shape.length; r++) {
        for (let c = 0; c < p.shape[r].length; c++) {
          if (p.shape[r][c] && p.y + r >= 0) {
            nextBoard[p.y + r][p.x + c] = p.color;
          }
        }
      }

      const remaining = nextBoard.filter((row) => row.some((cell) => cell === null));
      const clearedCount = TETRIS_ROWS - remaining.length;
      if (clearedCount > 0) {
        audioEngine.playUiSound('ding');
        const points = [0, 100, 300, 500, 800][clearedCount] || 800;
        setLines((l) => l + clearedCount);
        setScore((s) => {
          const ns = s + points;
          if (ns > best) {
            setBest(ns);
            localStorage.setItem('lume_tetris_best', String(ns));
          }
          return ns;
        });
      } else {
        audioEngine.playUiSound('click');
      }

      const filledBoard = [
        ...Array.from({ length: clearedCount }, () => Array(TETRIS_COLS).fill(null)),
        ...remaining,
      ];
      setBoard(filledBoard);
      spawnNext(filledBoard);
    },
    [board, best, spawnNext]
  );

  const stepDown = useCallback(() => {
    if (gameOver || paused) return;
    if (!collides(piece.shape, piece.x, piece.y + 1, board)) {
      setPiece((p) => ({ ...p, y: p.y + 1 }));
    } else {
      lockAndClear(piece);
    }
  }, [piece, board, gameOver, paused, collides, lockAndClear]);

  const hardDrop = useCallback(() => {
    if (gameOver || paused) return;
    let dy = piece.y;
    while (!collides(piece.shape, piece.x, dy + 1, board)) dy++;
    lockAndClear({ ...piece, y: dy });
  }, [piece, board, gameOver, paused, collides, lockAndClear]);

  const moveHorizontal = useCallback(
    (dx: number) => {
      if (gameOver || paused) return;
      if (!collides(piece.shape, piece.x + dx, piece.y, board)) {
        setPiece((p) => ({ ...p, x: p.x + dx }));
      }
    },
    [piece, board, gameOver, paused, collides]
  );

  const rotate = useCallback(() => {
    if (gameOver || paused) return;
    const rotated = rotateMatrix(piece.shape);
    for (const offset of [0, -1, 1, -2, 2]) {
      if (!collides(rotated, piece.x + offset, piece.y, board)) {
        setPiece((p) => ({ ...p, shape: rotated, x: p.x + offset }));
        audioEngine.playUiSound('click');
        return;
      }
    }
  }, [piece, board, gameOver, paused, collides]);

  const reset = () => {
    setBoard(createEmptyBoard());
    const t = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
    setPiece({ shape: t.shape, color: t.color, x: 3, y: 0 });
    setScore(0);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    audioEngine.playUiSound('open');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') moveHorizontal(-1);
      else if (e.key === 'ArrowRight' || e.key === 'd') moveHorizontal(1);
      else if (e.key === 'ArrowDown' || e.key === 's') stepDown();
      else if (e.key === 'ArrowUp' || e.key === 'w') rotate();
      else if (e.key === ' ') hardDrop();
      else if (e.key === 'p') setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveHorizontal, stepDown, rotate, hardDrop]);

  useEffect(() => {
    if (gameOver || paused) return;
    const levelDelay = Math.max(150, 520 - Math.floor(lines / 5) * 40);
    const id = setInterval(stepDown, levelDelay);
    return () => clearInterval(id);
  }, [stepDown, gameOver, paused, lines]);

  return (
    <div className="flex items-center justify-center h-full gap-6 p-4">
      {/* Board */}
      <div className="relative bg-neutral-900/90 border border-white/15 rounded-2xl p-2 shadow-2xl">
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${TETRIS_COLS}, 18px)`,
            gridTemplateRows: `repeat(${TETRIS_ROWS}, 18px)`,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              let color = cell;
              if (!color) {
                const pr = r - piece.y;
                const pc = c - piece.x;
                if (
                  pr >= 0 &&
                  pr < piece.shape.length &&
                  pc >= 0 &&
                  pc < piece.shape[0].length &&
                  piece.shape[pr][pc]
                ) {
                  color = piece.color;
                }
              }
              return (
                <div
                  key={`${r}-${c}`}
                  className={`rounded-[3px] ${color || 'bg-white/[0.03]'}`}
                />
              );
            })
          )}
        </div>

        {(gameOver || paused) && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2">
            <div className="text-base font-bold text-white">
              {gameOver ? 'Stack Overflow!' : 'Paused'}
            </div>
            <button
              onClick={gameOver ? reset : () => setPaused(false)}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs"
            >
              {gameOver ? 'Play Again' : 'Resume'}
            </button>
          </div>
        )}
      </div>

      {/* Side HUD */}
      <div className="flex flex-col gap-3 w-40 text-xs">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
          <div className="text-[10px] uppercase text-neutral-400 font-semibold">Next Piece</div>
          <div className="flex items-center justify-center h-14">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 14px)` }}
            >
              {nextPiece.shape.flatMap((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`w-3.5 h-3.5 rounded-sm ${cell ? nextPiece.color : 'bg-transparent'}`}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-neutral-400">Score</span>
            <span className="text-sky-300 font-bold">{score}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Lines</span>
            <span className="text-emerald-300 font-bold">{lines}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Best</span>
            <span className="text-amber-300 font-bold">{best}</span>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setPaused((p) => !p)}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex justify-center"
          >
            {paused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-sky-400" />}
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex justify-center"
          >
            <RotateCcw className="w-4 h-4 text-neutral-300" />
          </button>
        </div>

        <div className="text-[10px] text-neutral-400 leading-relaxed bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
          <div>&larr; &rarr; Move · &uarr; Rotate</div>
          <div>&darr; Soft Drop · Space Hard Drop</div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   3. FLAPPY LUME (Canvas 60fps)
============================================================================ */
const FlappyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('lume_flappy_best') || 0));
  const [status, setStatus] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const stateRef = useRef({
    birdY: 160,
    vel: 0,
    pipes: [] as Array<{ x: number; gapY: number; passed: boolean }>,
    frame: 0,
    score: 0,
    status: 'ready' as 'ready' | 'playing' | 'gameover',
  });

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'ready') {
      s.status = 'playing';
      s.pipes = [{ x: 360, gapY: 140, passed: false }];
      s.score = 0;
      setScore(0);
      setStatus('playing');
    } else if (s.status === 'gameover') {
      s.birdY = 160;
      s.vel = 0;
      s.pipes = [{ x: 360, gapY: 140, passed: false }];
      s.score = 0;
      s.status = 'playing';
      setScore(0);
      setStatus('playing');
    }
    s.vel = -5.8;
    audioEngine.playUiSound('click');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const W = 380;
    const H = 320;
    const GAP = 104;

    const loop = () => {
      const s = stateRef.current;
      s.frame++;

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#070b14');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (let i = 0; i < 18; i++) {
        const sx = ((i * 73 - s.frame * 0.4) % W + W) % W;
        const sy = (i * 41) % (H - 40);
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      if (s.status === 'playing') {
        s.vel += 0.28;
        s.birdY += s.vel;

        if (s.pipes.length === 0 || s.pipes[s.pipes.length - 1].x < W - 165) {
          s.pipes.push({
            x: W + 20,
            gapY: 60 + Math.random() * (H - 160),
            passed: false,
          });
        }

        s.pipes.forEach((p) => {
          p.x -= 2.4;
          if (!p.passed && p.x + 42 < 78) {
            p.passed = true;
            s.score += 1;
            setScore(s.score);
            audioEngine.playUiSound('snap');
            if (s.score > best) {
              setBest(s.score);
              localStorage.setItem('lume_flappy_best', String(s.score));
            }
          }

          // Collision
          const birdX = 78;
          const r = 11;
          if (birdX + r > p.x && birdX - r < p.x + 42) {
            if (s.birdY - r < p.gapY || s.birdY + r > p.gapY + GAP) {
              s.status = 'gameover';
              setStatus('gameover');
              audioEngine.playUiSound('close');
            }
          }
        });

        s.pipes = s.pipes.filter((p) => p.x > -60);

        if (s.birdY + 11 >= H || s.birdY - 11 <= 0) {
          s.status = 'gameover';
          setStatus('gameover');
          audioEngine.playUiSound('close');
        }
      } else if (s.status === 'ready') {
        s.birdY = 155 + Math.sin(s.frame * 0.08) * 8;
      }

      // Draw pipes
      s.pipes.forEach((p) => {
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(p.x, 0, 42, p.gapY);
        ctx.fillRect(p.x, p.gapY + GAP, 42, H - (p.gapY + GAP));
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, 42, p.gapY);
        ctx.strokeRect(p.x, p.gapY + GAP, 42, H - (p.gapY + GAP));
      });

      // Draw Lume Bird orb
      ctx.save();
      ctx.translate(78, s.birdY);
      ctx.rotate(Math.min(Math.max(s.vel * 0.07, -0.45), 0.6));
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4, -3, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [best]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <div className="flex items-center justify-between w-full max-w-[380px] text-xs font-mono">
        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
          Score: <span className="text-sky-400 font-bold">{score}</span>
        </div>
        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-amber-300 font-bold">{best}</span>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl cursor-pointer" onClick={flap}>
        <canvas ref={canvasRef} width={380} height={320} className="block" />
        {status !== 'playing' && (
          <div className="absolute inset-0 bg-neutral-950/55 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
            <div className="text-lg font-bold text-white">
              {status === 'ready' ? 'Flappy Lume' : 'Crashed!'}
            </div>
            <div className="text-xs text-sky-300">Click or press Space / Up to fly</div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   4. 2048 FUSION
============================================================================ */
const spawn2048Tile = (grid: number[][]): number[][] => {
  const empty: Array<[number, number]> = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const copy = grid.map((row) => [...row]);
  copy[r][c] = Math.random() < 0.9 ? 2 : 4;
  return copy;
};

const init2048 = () => spawn2048Tile(spawn2048Tile(Array.from({ length: 4 }, () => [0, 0, 0, 0])));

const Game2048: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(init2048);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('lume_2048_best') || 0));

  const slideRow = (row: number[]): { row: number[]; gained: number } => {
    const nonZero = row.filter((v) => v !== 0);
    let gained = 0;
    const merged: number[] = [];
    for (let i = 0; i < nonZero.length; i++) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const val = nonZero[i] * 2;
        merged.push(val);
        gained += val;
        i++;
      } else {
        merged.push(nonZero[i]);
      }
    }
    while (merged.length < 4) merged.push(0);
    return { row: merged, gained };
  };

  const move = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      let working = grid.map((r) => [...r]);
      let totalGained = 0;

      const transpose = (m: number[][]) => m[0].map((_, c) => m.map((r) => r[c]));

      if (dir === 'up' || dir === 'down') working = transpose(working);
      if (dir === 'right' || dir === 'down') working = working.map((r) => [...r].reverse());

      working = working.map((r) => {
        const res = slideRow(r);
        totalGained += res.gained;
        return res.row;
      });

      if (dir === 'right' || dir === 'down') working = working.map((r) => [...r].reverse());
      if (dir === 'up' || dir === 'down') working = transpose(working);

      const changed = JSON.stringify(working) !== JSON.stringify(grid);
      if (!changed) return;

      audioEngine.playUiSound(totalGained > 0 ? 'snap' : 'click');
      setGrid(spawn2048Tile(working));
      if (totalGained > 0) {
        setScore((s) => {
          const ns = s + totalGained;
          if (ns > best) {
            setBest(ns);
            localStorage.setItem('lume_2048_best', String(ns));
          }
          return ns;
        });
      }
    },
    [grid, best]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') move('left');
      else if (e.key === 'ArrowRight' || e.key === 'd') move('right');
      else if (e.key === 'ArrowUp' || e.key === 'w') move('up');
      else if (e.key === 'ArrowDown' || e.key === 's') move('down');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move]);

  const tileColor = (v: number) => {
    const map: Record<number, string> = {
      0: 'bg-white/[0.04] text-transparent',
      2: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
      4: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/30',
      8: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
      16: 'bg-teal-500/35 text-teal-100 border-teal-400/40',
      32: 'bg-amber-500/40 text-amber-100 border-amber-400/50',
      64: 'bg-orange-500/45 text-white border-orange-400/60',
      128: 'bg-rose-500/50 text-white border-rose-400/60',
      256: 'bg-purple-500/55 text-white border-purple-400/60',
      512: 'bg-pink-500/60 text-white border-pink-400/70',
      1024: 'bg-cyan-500/70 text-neutral-950 border-cyan-300',
      2048: 'bg-amber-400 text-neutral-950 border-white shadow-[0_0_20px_rgba(251,191,36,0.7)]',
    };
    return map[v] || 'bg-fuchsia-500 text-white border-white/50';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <div className="flex items-center justify-between w-full max-w-[300px] text-xs font-mono">
        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
          Score: <span className="text-sky-300 font-bold">{score}</span>
        </div>
        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
          Best: <span className="text-amber-300 font-bold">{best}</span>
        </div>
        <button
          onClick={() => {
            setGrid(init2048());
            setScore(0);
            audioEngine.playUiSound('open');
          }}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          title="New Game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-neutral-900/90 border border-white/15 shadow-2xl">
        {grid.flat().map((val, i) => (
          <div
            key={i}
            className={`w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center font-mono font-bold text-lg transition-all ${tileColor(
              val
            )}`}
          >
            {val > 0 ? val : ''}
          </div>
        ))}
      </div>

      <div className="text-[11px] text-neutral-400">Use Arrow Keys or WASD to merge tiles</div>
    </div>
  );
};

/* ============================================================================
   5. MINESWEEPER CLASSIC
============================================================================ */
interface MineCell {
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

const MS_SIZE = 9;
const MS_MINES = 10;

const createMineBoard = (): MineCell[][] => {
  const b: MineCell[][] = Array.from({ length: MS_SIZE }, () =>
    Array.from({ length: MS_SIZE }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
  let placed = 0;
  while (placed < MS_MINES) {
    const r = Math.floor(Math.random() * MS_SIZE);
    const c = Math.floor(Math.random() * MS_SIZE);
    if (!b[r][c].isMine) {
      b[r][c].isMine = true;
      placed++;
    }
  }
  for (let r = 0; r < MS_SIZE; r++) {
    for (let c = 0; c < MS_SIZE; c++) {
      if (b[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < MS_SIZE && nc >= 0 && nc < MS_SIZE && b[nr][nc].isMine) {
            count++;
          }
        }
      }
      b[r][c].adjacent = count;
    }
  }
  return b;
};

const MinesweeperGame: React.FC = () => {
  const [board, setBoard] = useState<MineCell[][]>(createMineBoard);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const reveal = (r: number, c: number) => {
    if (status !== 'playing') return;
    const next = board.map((row) => row.map((cell) => ({ ...cell })));
    const target = next[r][c];
    if (target.revealed || target.flagged) return;

    if (target.isMine) {
      next.forEach((row) => row.forEach((cell) => cell.isMine && (cell.revealed = true)));
      setBoard(next);
      setStatus('lost');
      audioEngine.playUiSound('close');
      return;
    }

    const flood = (rr: number, cc: number) => {
      if (rr < 0 || rr >= MS_SIZE || cc < 0 || cc >= MS_SIZE) return;
      const cell = next[rr][cc];
      if (cell.revealed || cell.flagged || cell.isMine) return;
      cell.revealed = true;
      if (cell.adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) flood(rr + dr, cc + dc);
        }
      }
    };
    flood(r, c);
    audioEngine.playUiSound('click');

    const unrevealedSafe = next.flat().filter((cell) => !cell.isMine && !cell.revealed).length;
    if (unrevealedSafe === 0) {
      setStatus('won');
      audioEngine.playUiSound('ding');
    }
    setBoard(next);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status !== 'playing') return;
    const next = board.map((row) => row.map((cell) => ({ ...cell })));
    if (next[r][c].revealed) return;
    next[r][c].flagged = !next[r][c].flagged;
    audioEngine.playUiSound('snap');
    setBoard(next);
  };

  const reset = () => {
    setBoard(createMineBoard());
    setStatus('playing');
    audioEngine.playUiSound('open');
  };

  const flagsUsed = board.flat().filter((c) => c.flagged).length;

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
      <div className="flex items-center justify-between w-full max-w-[310px] text-xs font-mono">
        <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5">
          <Bomb className="w-3.5 h-3.5 text-rose-400" />
          <span>{MS_MINES - flagsUsed}</span>
        </div>
        <div className="font-semibold text-white">
          {status === 'won' ? 'Cleared!' : status === 'lost' ? 'Boom!' : 'Minesweeper'}
        </div>
        <button
          onClick={reset}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-9 gap-1 p-2.5 rounded-2xl bg-neutral-900/90 border border-white/15 shadow-2xl">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => reveal(r, c)}
              onContextMenu={(e) => toggleFlag(e, r, c)}
              className={`w-7 h-7 rounded-md text-xs font-mono font-bold flex items-center justify-center transition-all ${
                cell.revealed
                  ? cell.isMine
                    ? 'bg-rose-500/80 text-white'
                    : 'bg-white/5 text-sky-300 border border-white/5'
                  : 'bg-white/15 hover:bg-white/25 border border-white/15 shadow-sm'
              }`}
            >
              {cell.revealed ? (
                cell.isMine ? (
                  <Bomb className="w-3.5 h-3.5" />
                ) : cell.adjacent > 0 ? (
                  cell.adjacent
                ) : (
                  ''
                )
              ) : cell.flagged ? (
                <Flag className="w-3 h-3 text-amber-400" />
              ) : (
                ''
              )}
            </button>
          ))
        )}
      </div>
      <div className="text-[11px] text-neutral-400">Left click reveal · Right click flag</div>
    </div>
  );
};

/* ============================================================================
   MAIN ARCADE HUB WRAPPER
============================================================================ */
export const GamesApp: React.FC<GamesAppProps> = ({ initialGame = 'hub' }) => {
  const [activeGame, setActiveGame] = useState<GameId>(initialGame);

  const gamesList: Array<{ id: Exclude<GameId, 'hub'>; title: string; desc: string; color: string }> = [
    { id: 'snake', title: 'Neon Snake', desc: 'Classic cyber grid snake', color: 'from-emerald-500/25 to-teal-600/20 border-emerald-400/30 text-emerald-300' },
    { id: 'tetris', title: 'Cyber Tetris', desc: 'Falling blocks & line clears', color: 'from-sky-500/25 to-indigo-600/20 border-sky-400/30 text-sky-300' },
    { id: 'flappy', title: 'Flappy Lume', desc: '60fps arcade pipe runner', color: 'from-cyan-500/25 to-blue-600/20 border-cyan-400/30 text-cyan-300' },
    { id: '2048', title: '2048 Fusion', desc: 'Sliding power-of-2 puzzle', color: 'from-amber-500/25 to-orange-600/20 border-amber-400/30 text-amber-300' },
    { id: 'minesweeper', title: 'Minesweeper', desc: 'Classic logic grid', color: 'from-rose-500/25 to-pink-600/20 border-rose-400/30 text-rose-300' },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-950/75 text-neutral-100 select-none overflow-hidden">
      {/* Top Game Switcher Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Gamepad2 className="w-4 h-4 text-sky-400" />
          <span>LumeOS Offline Arcade</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveGame('hub')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              activeGame === 'hub' ? 'bg-white/15 text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Games
          </button>
          {gamesList.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                audioEngine.playUiSound('click');
                setActiveGame(g.id);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeGame === g.id ? 'bg-sky-500/25 text-sky-300 font-semibold border border-sky-400/30' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {g.title.split(' ')[1] || g.title}
            </button>
          ))}
        </div>
      </div>

      {/* Game Stage */}
      <div className="flex-1 overflow-y-auto">
        {activeGame === 'hub' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Built-in Offline Games
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Zero-dependency native canvas & logic games — ready for offline ISO boot.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {gamesList.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    audioEngine.playUiSound('open');
                    setActiveGame(g.id);
                  }}
                  className={`p-4 rounded-2xl bg-gradient-to-tr ${g.color} border text-left hover:scale-[1.02] transition-all shadow-lg flex flex-col justify-between gap-3`}
                >
                  <div className="flex items-center justify-between">
                    <Gamepad2 className="w-6 h-6" />
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 font-mono text-white/80">
                      Offline
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{g.title}</div>
                    <div className="text-[11px] text-neutral-300 mt-0.5">{g.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {activeGame === 'snake' && <SnakeGame />}
        {activeGame === 'tetris' && <TetrisGame />}
        {activeGame === 'flappy' && <FlappyGame />}
        {activeGame === '2048' && <Game2048 />}
        {activeGame === 'minesweeper' && <MinesweeperGame />}
      </div>
    </div>
  );
};
