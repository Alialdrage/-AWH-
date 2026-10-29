import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Star,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Award,
  Play,
  Pause,
  CheckCircle2,
  Flame,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  User,
  Medal,
  RefreshCw,
  Compass,
} from 'lucide-react';
import {
  savePhysicsLeaderboardScore,
  subscribePhysicsLeaderboard,
  PhysicsLeaderboardEntry,
  auth,
} from '../services/firestoreService';

// ============================================================================
// Web Audio Synthesizer (Zero-Asset, Mobile-Friendly Sound Effects)
// ============================================================================
class PhysicsSoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('awh_physics_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('awh_physics_sound_enabled', String(this.enabled));
    } catch {}
    return this.enabled;
  }

  playBounce(intensity = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const freq = Math.min(600, 150 + intensity * 80);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

      const vol = Math.min(0.25, 0.05 + intensity * 0.08);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  playLaunch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {}
  }

  playStar() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.18, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.16);
      });
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.26);
      });
    } catch {}
  }
}

const soundFX = new PhysicsSoundFX();

// ============================================================================
// Level Definitions & Physics Types
// ============================================================================
interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'wall' | 'bumper' | 'portal' | 'hazard';
  restitution?: number;
  color?: string;
  label?: string;
}

interface StarItem {
  id: number;
  x: number;
  y: number;
  r: number;
  collected: boolean;
}

interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  concept: string;
  ballStart: { x: number; y: number; r: number };
  goal: { x: number; y: number; r: number };
  obstacles: Obstacle[];
  stars: { x: number; y: number }[];
  threeStarTime: number; // seconds
  twoStarTime: number;   // seconds
}

const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: 'المستوى 1: الجاذبية والانحدار',
    subtitle: 'قانون نيوتن الأول ومسار الحركة الحر',
    concept: 'توجيه الكرة مع قوة الجاذبية الأرضية g = 9.8 م/ث²',
    ballStart: { x: 90, y: 150, r: 16 },
    goal: { x: 700, y: 460, r: 26 },
    threeStarTime: 12,
    twoStarTime: 20,
    stars: [
      { x: 300, y: 220 },
      { x: 500, y: 320 },
      { x: 630, y: 420 },
    ],
    obstacles: [
      // Top platform
      { x: 50, y: 200, w: 180, h: 20, type: 'wall', color: '#38bdf8' },
      // First slope
      { x: 260, y: 270, w: 180, h: 20, type: 'wall', color: '#0284c7' },
      // Second slope
      { x: 460, y: 370, w: 180, h: 20, type: 'wall', color: '#0369a1' },
      // Bottom catch
      { x: 620, y: 510, w: 160, h: 20, type: 'wall', color: '#075985' },
      // Soft Bumper
      { x: 400, y: 450, w: 80, h: 24, type: 'bumper', restitution: 1.4, color: '#f59e0b', label: 'مصد مرن' },
    ],
  },
  {
    id: 2,
    title: 'المستوى 2: الارتداد والمصدات المرنة',
    subtitle: 'حفظ الطاقة والتصادمات عالية المرونة',
    concept: 'معامل الارتداد e > 1 يقذف الكرة بارتفاع متزايد',
    ballStart: { x: 100, y: 420, r: 16 },
    goal: { x: 710, y: 140, r: 26 },
    threeStarTime: 15,
    twoStarTime: 25,
    stars: [
      { x: 250, y: 240 },
      { x: 430, y: 120 },
      { x: 600, y: 260 },
    ],
    obstacles: [
      // Floor
      { x: 50, y: 480, w: 180, h: 20, type: 'wall', color: '#38bdf8' },
      // Bumper 1 (High bounce)
      { x: 280, y: 460, w: 90, h: 30, type: 'bumper', restitution: 1.85, color: '#f59e0b', label: 'نابض × 1.8' },
      // Middle barrier
      { x: 380, y: 260, w: 25, h: 220, type: 'wall', color: '#475569' },
      // Bumper 2
      { x: 480, y: 440, w: 90, h: 30, type: 'bumper', restitution: 1.75, color: '#f59e0b', label: 'نابض × 1.7' },
      // Top platform for goal
      { x: 640, y: 200, w: 140, h: 20, type: 'wall', color: '#10b981' },
    ],
  },
  {
    id: 3,
    title: 'المستوى 3: الروافع وتوازن العزوم',
    subtitle: 'عزم القوة والتسارع الزاوي τ = F × d',
    concept: 'توجيه الكرة فوق المنصات المتدرجة لتجاوز الفجوة',
    ballStart: { x: 80, y: 120, r: 16 },
    goal: { x: 700, y: 470, r: 26 },
    threeStarTime: 18,
    twoStarTime: 30,
    stars: [
      { x: 280, y: 180 },
      { x: 420, y: 300 },
      { x: 580, y: 400 },
    ],
    obstacles: [
      { x: 40, y: 170, w: 160, h: 20, type: 'wall', color: '#38bdf8' },
      { x: 220, y: 230, w: 140, h: 20, type: 'wall', color: '#0284c7' },
      // High Bumper
      { x: 360, y: 280, w: 80, h: 25, type: 'bumper', restitution: 1.6, color: '#f59e0b', label: 'عزم مرن' },
      // Hazard Pit
      { x: 450, y: 520, w: 120, h: 15, type: 'hazard', color: '#ef4444', label: 'حفرة احتكاك' },
      // Landing ramp
      { x: 520, y: 390, w: 150, h: 20, type: 'wall', color: '#0369a1' },
      { x: 640, y: 530, w: 130, h: 20, type: 'wall', color: '#10b981' },
    ],
  },
  {
    id: 4,
    title: 'المستوى 4: المقذوفات والسرعة الابتدائية',
    subtitle: 'حساب زاوية الإطلاق وحركة القذيفة',
    concept: 'أقصى مدى أفقي يتحقق بزاوية تقارب 45 درجة',
    ballStart: { x: 90, y: 460, r: 16 },
    goal: { x: 710, y: 460, r: 26 },
    threeStarTime: 16,
    twoStarTime: 28,
    stars: [
      { x: 320, y: 160 },
      { x: 420, y: 120 },
      { x: 520, y: 200 },
    ],
    obstacles: [
      // Left launchpad
      { x: 40, y: 510, w: 150, h: 20, type: 'wall', color: '#38bdf8' },
      // Tall central wall
      { x: 380, y: 240, w: 30, h: 280, type: 'wall', color: '#64748b' },
      // Top guidance bumper
      { x: 340, y: 70, w: 120, h: 24, type: 'bumper', restitution: 1.5, color: '#f59e0b', label: 'عاكس علوي' },
      // Right landing
      { x: 630, y: 510, w: 150, h: 20, type: 'wall', color: '#10b981' },
    ],
  },
  {
    id: 5,
    title: 'المستوى 5: الدوامة وحفظ كمية الحركة',
    subtitle: 'القوى المركزية والاندفاع النهائي',
    concept: 'تجاوز حقول الجاذبية العكسية والوصول لمركز الهدف',
    ballStart: { x: 80, y: 200, r: 16 },
    goal: { x: 400, y: 460, r: 28 },
    threeStarTime: 20,
    twoStarTime: 35,
    stars: [
      { x: 220, y: 120 },
      { x: 600, y: 120 },
      { x: 660, y: 340 },
    ],
    obstacles: [
      // Upper ring walls
      { x: 50, y: 250, w: 140, h: 20, type: 'wall', color: '#38bdf8' },
      { x: 230, y: 170, w: 160, h: 20, type: 'wall', color: '#0284c7' },
      { x: 460, y: 170, w: 160, h: 20, type: 'wall', color: '#0369a1' },
      { x: 630, y: 250, w: 140, h: 20, type: 'wall', color: '#38bdf8' },
      // Bounce pads
      { x: 660, y: 400, w: 80, h: 25, type: 'bumper', restitution: 1.8, color: '#f59e0b', label: 'اندفاع' },
      { x: 100, y: 400, w: 80, h: 25, type: 'bumper', restitution: 1.8, color: '#f59e0b', label: 'اندفاع' },
      // Center pedestal
      { x: 340, y: 510, w: 120, h: 20, type: 'wall', color: '#10b981' },
    ],
  },
];

// Virtual physics canvas coordinate system (scaled dynamically for any device)
const VIRTUAL_WIDTH = 800;
const VIRTUAL_HEIGHT = 580;

interface GameViewProps {
  onExit: () => void;
}

export const GameView: React.FC<GameViewProps> = ({ onExit }) => {
  // Level & state
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = LEVELS[currentLevelIdx];
  const [gameState, setGameState] = useState<'title' | 'playing' | 'cleared' | 'failed'>('title');

  // Timer & Metrics
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(soundFX.enabled);

  // Leaderboard Modal & State
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardFilterLevel, setLeaderboardFilterLevel] = useState<number | undefined>(undefined);
  const [leaderboardEntries, setLeaderboardEntries] = useState<PhysicsLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [savingScore, setSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [playerNameInput, setPlayerNameInput] = useState('');

  // Canvas & Physics Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Ball physics state
  const ballRef = useRef({
    x: currentLevel.ballStart.x,
    y: currentLevel.ballStart.y,
    vx: 0,
    vy: 0,
    r: currentLevel.ballStart.r,
    isLaunched: false,
    trail: [] as { x: number; y: number; alpha: number }[],
  });

  // Active stars state ref
  const starsRef = useRef<StarItem[]>([]);

  // Drag & Slingshot Aiming state
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  // Particles on goal/star
  const particlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; color: string; life: number }[]
  >([]);

  // Initialize stars when level changes
  const initLevel = useCallback(
    (lvlIdx: number) => {
      const lvl = LEVELS[lvlIdx];
      ballRef.current = {
        x: lvl.ballStart.x,
        y: lvl.ballStart.y,
        vx: 0,
        vy: 0,
        r: lvl.ballStart.r,
        isLaunched: false,
        trail: [],
      };
      starsRef.current = lvl.stars.map((s, idx) => ({
        id: idx,
        x: s.x,
        y: s.y,
        r: 12,
        collected: false,
      }));
      particlesRef.current = [];
      setElapsedTime(0);
      setIsRunning(false);
      setMovesCount(0);
      setStarsCollected(0);
      setScoreSaved(false);
      setGameState('playing');
    },
    []
  );

  // Live timer tick
  useEffect(() => {
    let timer: any;
    if (isRunning && gameState === 'playing') {
      const startMs = Date.now() - elapsedTime * 1000;
      timer = setInterval(() => {
        setElapsedTime((Date.now() - startMs) / 1000);
      }, 35);
    }
    return () => clearInterval(timer);
  }, [isRunning, gameState, elapsedTime]);

  // Subscribe to Firestore Leaderboard
  useEffect(() => {
    setLeaderboardLoading(true);
    const unsubscribe = subscribePhysicsLeaderboard(leaderboardFilterLevel, (entries) => {
      setLeaderboardEntries(entries);
      setLeaderboardLoading(false);
    });
    return () => unsubscribe();
  }, [leaderboardFilterLevel]);

  // Pre-fill user name from auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user?.displayName) {
      setPlayerNameInput(user.displayName);
    } else if (user?.email) {
      setPlayerNameInput(user.email.split('@')[0]);
    } else if (!playerNameInput) {
      setPlayerNameInput('بطل الفيزياء العراقي');
    }
  }, []);

  // Compute stars on finish
  const computeEarnedStars = (timeSec: number) => {
    if (timeSec <= currentLevel.threeStarTime) return 3;
    if (timeSec <= currentLevel.twoStarTime) return 2;
    return 1;
  };

  // Trigger celebratory particles
  const spawnGoalParticles = (gx: number, gy: number) => {
    const colors = ['#22d3ee', '#38bdf8', '#fbbf24', '#f43f5e', '#34d399'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        x: gx,
        y: gy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
      });
    }
  };

  // Convert Client Screen coords to Virtual Canvas coords
  const screenToVirtual = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Launch impulse
  const launchBall = (impulseX: number, impulseY: number) => {
    const ball = ballRef.current;
    ball.vx = impulseX;
    ball.vy = impulseY;
    ball.isLaunched = true;
    if (!isRunning) {
      setIsRunning(true);
    }
    setMovesCount((prev) => prev + 1);
    soundFX.playLaunch();
  };

  // Mobile Nudge Controls (Left, Right, Jet Boost)
  const applyMobileNudge = (dir: 'left' | 'right' | 'boost') => {
    const ball = ballRef.current;
    if (!ball.isLaunched) {
      ball.isLaunched = true;
      if (!isRunning) setIsRunning(true);
    }
    if (dir === 'left') {
      ball.vx -= 3.5;
    } else if (dir === 'right') {
      ball.vx += 3.5;
    } else if (dir === 'boost') {
      ball.vy -= 6.0;
    }
    soundFX.playBounce(0.8);
  };

  // Reset current attempt
  const handleResetLevel = () => {
    initLevel(currentLevelIdx);
  };

  // Next level
  const handleNextLevel = () => {
    const nextIdx = (currentLevelIdx + 1) % LEVELS.length;
    setCurrentLevelIdx(nextIdx);
    initLevel(nextIdx);
  };

  // Save to Firestore Leaderboard
  const handleSaveScore = async () => {
    if (savingScore || scoreSaved) return;
    setSavingScore(true);
    try {
      const finalStars = computeEarnedStars(elapsedTime);
      await savePhysicsLeaderboardScore({
        userId: auth.currentUser?.uid || 'guest_solver',
        userName: playerNameInput.trim() || 'متحدي الفيزياء',
        levelId: currentLevel.id,
        levelName: currentLevel.title,
        timeSeconds: elapsedTime,
        movesCount,
        stars: finalStars,
        solvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
      setScoreSaved(true);
      setIsLeaderboardOpen(true);
    } catch (err) {
      console.error('Failed to save physics score:', err);
    } finally {
      setSavingScore(false);
    }
  };

  // ==========================================================================
  // Main Physics & Render Loop (HTML5 Canvas 60-120 FPS Engine)
  // ==========================================================================
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const ball = ballRef.current;
      const { goal, obstacles } = currentLevel;

      // 1. Physics Step
      if (ball.isLaunched) {
        // Gravity
        const gravity = 480; // pixels / s^2
        ball.vy += gravity * dt;

        // Air drag
        ball.vx *= Math.pow(0.992, dt * 60);
        ball.vy *= Math.pow(0.998, dt * 60);

        // Position update
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        // Trail recording
        ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.8 });
        if (ball.trail.length > 18) {
          ball.trail.shift();
        }

        // Boundary checks (World box: 0 to VIRTUAL_WIDTH, 0 to VIRTUAL_HEIGHT)
        if (ball.x - ball.r < 0) {
          ball.x = ball.r;
          ball.vx = -ball.vx * 0.75;
          soundFX.playBounce(Math.abs(ball.vx) / 5);
        } else if (ball.x + ball.r > VIRTUAL_WIDTH) {
          ball.x = VIRTUAL_WIDTH - ball.r;
          ball.vx = -ball.vx * 0.75;
          soundFX.playBounce(Math.abs(ball.vx) / 5);
        }

        // Top ceiling bounce
        if (ball.y - ball.r < 0) {
          ball.y = ball.r;
          ball.vy = -ball.vy * 0.7;
          soundFX.playBounce(Math.abs(ball.vy) / 5);
        }

        // Bottom floor (Pit / Fail Check)
        if (ball.y - ball.r > VIRTUAL_HEIGHT + 20) {
          // Ball fell down out of screen -> Reset to start
          ball.x = currentLevel.ballStart.x;
          ball.y = currentLevel.ballStart.y;
          ball.vx = 0;
          ball.vy = 0;
          ball.isLaunched = false;
          ball.trail = [];
        }

        // Obstacle Collisions
        for (const obs of obstacles) {
          // AABB vs Circle
          const nearestX = Math.max(obs.x, Math.min(ball.x, obs.x + obs.w));
          const nearestY = Math.max(obs.y, Math.min(ball.y, obs.y + obs.h));
          const dx = ball.x - nearestX;
          const dy = ball.y - nearestY;
          const distSq = dx * dx + dy * dy;

          if (distSq < ball.r * ball.r) {
            const dist = Math.sqrt(distSq) || 0.001;
            const nx = dx / dist;
            const ny = dy / dist;

            // Push out of obstacle
            const overlap = ball.r - dist;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Restitution bounce
            const rest = obs.restitution || 0.65;
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
              ball.vx = (ball.vx - (1 + rest) * dot * nx);
              ball.vy = (ball.vy - (1 + rest) * dot * ny);
              soundFX.playBounce(Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy) / 50);
            }
          }
        }

        // Star Collect Collision
        starsRef.current.forEach((star) => {
          if (!star.collected) {
            const sdx = ball.x - star.x;
            const sdy = ball.y - star.y;
            if (sdx * sdx + sdy * sdy < (ball.r + star.r) * (ball.r + star.r)) {
              star.collected = true;
              setStarsCollected((prev) => prev + 1);
              soundFX.playStar();
              // Spawn star sparkle particles
              for (let p = 0; p < 12; p++) {
                particlesRef.current.push({
                  x: star.x,
                  y: star.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: '#fbbf24',
                  life: 0.8,
                });
              }
            }
          }
        });

        // Goal Vortex Collision
        const gdx = ball.x - goal.x;
        const gdy = ball.y - goal.y;
        const gDistSq = gdx * gdx + gdy * gdy;
        if (gDistSq < (ball.r + goal.r) * (ball.r + goal.r)) {
          // CLEARED LEVEL!
          setIsRunning(false);
          setGameState('cleared');
          soundFX.playVictory();
          spawnGoalParticles(goal.x, goal.y);
        }
      }

      // Update particle lives
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // 2. Render Canvas
      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Subtle Cyber Grid Background
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let gx = 0; gx < VIRTUAL_WIDTH; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, VIRTUAL_HEIGHT);
        ctx.stroke();
      }
      for (let gy = 0; gy < VIRTUAL_HEIGHT; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(VIRTUAL_WIDTH, gy);
        ctx.stroke();
      }

      // Draw Obstacles
      obstacles.forEach((obs) => {
        ctx.save();
        if (obs.type === 'bumper') {
          // Glowing Neon Bumper
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.strokeStyle = obs.color || '#f59e0b';
          ctx.lineWidth = 3;
          ctx.shadowColor = obs.color || '#f59e0b';
          ctx.shadowBlur = 10;
        } else if (obs.type === 'hazard') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
        } else {
          // Standard Wall
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = obs.color || '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = obs.color || '#38bdf8';
          ctx.shadowBlur = 4;
        }

        // Rounded Rect
        const r = 8;
        ctx.beginPath();
        ctx.moveTo(obs.x + r, obs.y);
        ctx.lineTo(obs.x + obs.w - r, obs.y);
        ctx.quadraticCurveTo(obs.x + obs.w, obs.y, obs.x + obs.w, obs.y + r);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h - r);
        ctx.quadraticCurveTo(obs.x + obs.w, obs.y + obs.h, obs.x + obs.w - r, obs.y + obs.h);
        ctx.lineTo(obs.x + r, obs.y + obs.h);
        ctx.quadraticCurveTo(obs.x, obs.y + obs.h, obs.x, obs.y + obs.h - r);
        ctx.lineTo(obs.x, obs.y + r);
        ctx.quadraticCurveTo(obs.x, obs.y, obs.x + r, obs.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label inside obstacle
        if (obs.label) {
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obs.label, obs.x + obs.w / 2, obs.y + obs.h / 2);
        }
        ctx.restore();
      });

      // Draw Collectible Stars
      starsRef.current.forEach((star) => {
        if (!star.collected) {
          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;

          // Draw 5-pointed star
          ctx.beginPath();
          const spikes = 5;
          const outerR = star.r;
          const innerR = star.r * 0.48;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;

          ctx.moveTo(0, -outerR);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
            rot += step;
          }
          ctx.lineTo(0, -outerR);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // Draw Goal Vortex (Pulsing concentric circles)
      ctx.save();
      const pulseTime = currentTime * 0.003;
      const pulseR = goal.r + Math.sin(pulseTime) * 3;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(goal.x, goal.y, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.arc(goal.x, goal.y, goal.r * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Goal Icon text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('الهدف 🏁', goal.x, goal.y);
      ctx.restore();

      // Draw Ball Motion Trail
      ball.trail.forEach((t, i) => {
        ctx.save();
        ctx.beginPath();
        const tr = ball.r * (i / ball.trail.length) * 0.7;
        ctx.arc(t.x, t.y, tr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.1 + (i / ball.trail.length) * 0.4})`;
        ctx.fill();
        ctx.restore();
      });

      // Draw Physics Ball (Glowing cyan sphere)
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner shiny highlight
      ctx.beginPath();
      ctx.arc(ball.x - ball.r * 0.35, ball.y - ball.r * 0.35, ball.r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
      ctx.restore();

      // Draw Drag & Slingshot Trajectory line when user is dragging
      if (dragRef.current.isDragging) {
        const { currentX, currentY } = dragRef.current;
        // Direction vector from current touch point back to ball
        const pullDx = ball.x - currentX;
        const pullDy = ball.y - currentY;
        const power = Math.min(Math.sqrt(pullDx * pullDx + pullDy * pullDy), 180);
        const angle = Math.atan2(pullDy, pullDx);
        const impulseX = Math.cos(angle) * power * 4.2;
        const impulseY = Math.sin(angle) * power * 4.2;

        ctx.save();
        // Slingshot elastic band
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Projected Trajectory Parabola Dots
        ctx.setLineDash([]);
        let simX = ball.x;
        let simY = ball.y;
        let simVx = impulseX;
        let simVy = impulseY;
        const simDt = 0.035;

        for (let step = 0; step < 26; step++) {
          simVy += 480 * simDt;
          simX += simVx * simDt;
          simY += simVy * simDt;

          if (simX < 0 || simX > VIRTUAL_WIDTH || simY > VIRTUAL_HEIGHT) break;

          ctx.beginPath();
          ctx.arc(simX, simY, 3.5 - (step / 26) * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 211, 238, ${0.9 - (step / 26) * 0.6})`;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw Active Celebration Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fill();
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gameState, currentLevel]);

  // Touch / Mouse Aiming Handlers (Slingshot Drag)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== 'playing') return;
    const { x, y } = screenToVirtual(e.clientX, e.clientY);
    const ball = ballRef.current;
    // Check if clicked anywhere or near ball
    dragRef.current = {
      isDragging: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const { x, y } = screenToVirtual(e.clientX, e.clientY);
    dragRef.current.currentX = x;
    dragRef.current.currentY = y;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const { currentX, currentY } = dragRef.current;
    const ball = ballRef.current;
    const pullDx = ball.x - currentX;
    const pullDy = ball.y - currentY;
    const power = Math.min(Math.sqrt(pullDx * pullDx + pullDy * pullDy), 180);

    dragRef.current.isDragging = false;

    // Only launch if pulled with minimum force (>= 15px)
    if (power >= 15) {
      const angle = Math.atan2(pullDy, pullDx);
      const impulseX = Math.cos(angle) * power * 4.2;
      const impulseY = Math.sin(angle) * power * 4.2;
      launchBall(impulseX, impulseY);
    }
  };

  // Keyboard navigation support for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        applyMobileNudge('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        applyMobileNudge('right');
      } else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') {
        applyMobileNudge('boost');
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetLevel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentLevelIdx]);

  // Format stopwatch time (e.g. 00:12.35)
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none"
      dir="rtl"
      style={{ touchAction: 'none' }}
    >
      {/* ==================================================================== */}
      {/* Mobile-Optimized Game Header HUD */}
      {/* ==================================================================== */}
      <header className="flex-shrink-0 bg-slate-900/90 border-b border-slate-800 px-3 py-2.5 backdrop-blur-md flex items-center justify-between gap-2 z-20">
        {/* Left: Exit & Sound */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition active:scale-95"
            title="خروج من اللعبة"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">خروج</span>
          </button>

          <button
            onClick={() => setSoundEnabled(soundFX.toggle())}
            className={`p-2 rounded-xl border text-xs transition active:scale-95 ${
              soundEnabled
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Live Timer & Level Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Level selector chip */}
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">المرحلة:</span>
            <span className="text-cyan-400 font-bold font-mono">
              {currentLevel.id}/{LEVELS.length}
            </span>
          </div>

          {/* Stopwatch Time Display */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 px-3 py-1 rounded-xl border border-cyan-500/40 text-xs sm:text-sm font-mono font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Timer className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{formatTime(elapsedTime)}</span>
          </div>

          {/* Stars Collected Indicator */}
          <div className="hidden xs:flex items-center gap-0.5">
            {[0, 1, 2].map((idx) => (
              <Star
                key={idx}
                className={`w-4 h-4 ${
                  idx < starsCollected
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: Leaderboard & Restart */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleResetLevel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition active:scale-95"
            title="إعادة المحاولة"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">إعادة</span>
          </button>

          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition active:scale-95 shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>المتصدرين</span>
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* Subheader Level Concept & Instruction (Mobile-Compact) */}
      {/* ==================================================================== */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 z-10 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">{currentLevel.title}:</span>
          <span className="text-cyan-300 font-medium">{currentLevel.concept}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="hidden sm:inline">🎯 اسحب للخلف للإطلاق، أو استخدم أزرار الدفع أدناه</span>
          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
            المحاولات: {movesCount}
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Interactive Physics Canvas Area (Responsive Fullscreen Layout) */}
      {/* ==================================================================== */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center p-1 sm:p-3 overflow-hidden">
        <div className="relative w-full h-full max-w-[1000px] max-h-[720px] aspect-[800/580] bg-slate-950 border border-slate-800/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <canvas
            ref={canvasRef}
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Aiming Hint Overlay when ball has not launched yet */}
          {gameState === 'playing' && !ballRef.current.isLaunched && movesCount === 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-cyan-200 px-4 py-1.5 rounded-full text-xs font-semibold animate-pulse shadow-lg flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>المس الكرة واسحب للخلف لضبط زاوية وقوة المقذوف!</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Mobile-Friendly Bottom Controls Bar (Touch Joypad / Controls) */}
      {/* ==================================================================== */}
      <footer className="flex-shrink-0 bg-slate-900/95 border-t border-slate-800 px-4 py-2.5 backdrop-blur-md flex items-center justify-between gap-3 z-20">
        {/* Level Paging Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const prevIdx = (currentLevelIdx - 1 + LEVELS.length) % LEVELS.length;
              setCurrentLevelIdx(prevIdx);
              initLevel(prevIdx);
            }}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition active:scale-95"
            title="المرحلة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-300 px-1">
            {currentLevel.id}
          </span>
          <button
            onClick={() => {
              const nextIdx = (currentLevelIdx + 1) % LEVELS.length;
              setCurrentLevelIdx(nextIdx);
              initLevel(nextIdx);
            }}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs transition active:scale-95"
            title="المرحلة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Virtual D-pad / Impulse Buttons */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => applyMobileNudge('right')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition active:scale-90 flex items-center gap-1 shadow-md"
            title="دفع لليمين"
          >
            <span>يمين</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onPointerDown={() => applyMobileNudge('boost')}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/40 text-xs font-bold transition active:scale-90 flex items-center gap-1.5 shadow-lg shadow-cyan-950/50"
            title="دفعة نفاثة للأعلى"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            <span>قفز نفاث</span>
          </button>

          <button
            onPointerDown={() => applyMobileNudge('left')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition active:scale-90 flex items-center gap-1 shadow-md"
            title="دفع لليسار"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>يسار</span>
          </button>
        </div>

        {/* Quick Restart */}
        <button
          onClick={handleResetLevel}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition active:scale-95 flex items-center gap-1"
          title="إعادة ضبط الكرة"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">إعادة</span>
        </button>
      </footer>

      {/* ==================================================================== */}
      {/* Level Completion Modal (Success & Score Submission) */}
      {/* ==================================================================== */}
      {gameState === 'cleared' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-[0_0_35px_rgba(6,182,212,0.35)] p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                اكتمل حل اللغز الفيزيائي بنجاح!
              </h2>
              <p className="text-xs text-slate-400 mt-1">{currentLevel.title}</p>
            </div>

            {/* Stars Rating */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3].map((starNum) => {
                const earned = starNum <= computeEarnedStars(elapsedTime);
                return (
                  <Star
                    key={starNum}
                    className={`w-7 h-7 transition-all duration-300 ${
                      earned
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.7)] scale-110'
                        : 'text-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">الوقت المستغرق:</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">عدد المحاولات:</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {movesCount} ضربات
                </span>
              </div>
            </div>

            {/* Save to Firestore Leaderboard Section */}
            {!scoreSaved ? (
              <div className="space-y-2 pt-1 text-right">
                <label className="text-xs font-semibold text-slate-300 block">
                  اسمك في لوحة المتصدرين السحابية:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    maxLength={50}
                    placeholder="اكتب اسمك أو لقبك..."
                    className="flex-1 py-2 px-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                  <button
                    onClick={handleSaveScore}
                    disabled={savingScore}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 flex-shrink-0"
                  >
                    {savingScore ? 'جاري الحفظ...' : 'حفظ الرقم 🏆'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم تسجيل رقمك القياسي في لوحة المتصدرين بنجاح!</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleResetLevel}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition active:scale-95"
              >
                إعادة المحاولة 🔄
              </button>
              <button
                onClick={handleNextLevel}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                المرحلة التالية 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Firestore Leaderboard Drawer / Modal (لوحة المتصدرين المباشرة) */}
      {/* ==================================================================== */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Trophy className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    لوحة متصدري تحدي الفيزياء
                  </h3>
                  <p className="text-xs text-slate-400">
                    أسرع المتسابقين في حل الألغاز الفيزيائية (Cloud Firestore)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs by Level */}
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setLeaderboardFilterLevel(undefined)}
                className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition font-semibold ${
                  leaderboardFilterLevel === undefined
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                جميع المراحل (الكل)
              </button>

              {LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLeaderboardFilterLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition font-semibold ${
                    leaderboardFilterLevel === lvl.id
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  المرحلة {lvl.id}
                </button>
              ))}
            </div>

            {/* Leaderboard List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
              {leaderboardLoading ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <span>جاري تحميل أحدث الأرقام القياسية من Firestore...</span>
                </div>
              ) : leaderboardEntries.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <Trophy className="w-8 h-8 text-slate-700 mx-auto" />
                  <p>لا توجد أرقام مسجلة حتى الآن لهذه المرحلة.</p>
                  <p className="text-[11px] text-cyan-400">كن أول من يحل اللغز ويسجل اسمه في الصدارة!</p>
                </div>
              ) : (
                leaderboardEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                        rank === 1
                          ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border-amber-500/40 shadow-sm'
                          : rank === 2
                          ? 'bg-gradient-to-r from-slate-800/50 to-slate-900 border-slate-600 shadow-sm'
                          : rank === 3
                          ? 'bg-gradient-to-r from-amber-950/20 to-slate-900 border-amber-700/40 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Rank & User Info */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            rank === 1
                              ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/30'
                              : rank === 2
                              ? 'bg-slate-300 text-slate-950 font-black'
                              : rank === 3
                              ? 'bg-amber-700 text-white font-black'
                              : 'bg-slate-800 text-slate-400 font-mono'
                          }`}
                        >
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-200">
                              {entry.userName}
                            </span>
                            {entry.stars && (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: entry.stars }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {entry.levelName} • {entry.movesCount || 1} ضربات
                          </span>
                        </div>
                      </div>

                      {/* Time Score */}
                      <div className="text-left font-mono">
                        <span className="text-sm font-bold text-cyan-300">
                          {entry.timeSeconds.toFixed(2)} ثانية
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {entry.solvedAt ? new Date(entry.solvedAt).toLocaleDateString('ar-EG') : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>قاعدة البيانات: Cloud Firestore متصلة</span>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Target className="w-10 h-10 animate-pulse text-cyan-400" />
          </div>

          <div className="space-y-2 max-w-md">
            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
              تحدي الفيزياء AWH
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              محاكاة فيزيائية وألغاز ميكانيكية تفاعلية متوافقة مع شاشات الجوال والحاسوب. حل الألغاز بأسرع وقت وسجل رقمك في لوحة المتصدرين!
            </p>
          </div>

          {/* Level Preview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-xl w-full text-xs">
            {LEVELS.map((lvl, idx) => (
              <button
                key={lvl.id}
                onClick={() => {
                  setCurrentLevelIdx(idx);
                  initLevel(idx);
                }}
                className={`p-3 rounded-2xl border text-center transition active:scale-95 ${
                  currentLevelIdx === idx
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block font-bold text-sm mb-0.5">مرحلة {lvl.id}</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">{lvl.title.split(':')[1] || lvl.title}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-xs">
            <button
              onClick={() => initLevel(currentLevelIdx)}
              className="w-full py-3.5 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-cyan-950/60 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>بدء التحدي الآن</span>
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-2xl transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>لوحة المتصدرين 🏆</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
