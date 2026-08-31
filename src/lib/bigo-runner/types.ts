// Section 3: Timing, speed, and spacing — the equations
export const RUN_TUNING = {
  // Velocity: v(n) = min(9.0 + 0.35 * n, 18.0) u/s
  velocityBase: 9.0,
  velocityGrowth: 0.35,
  velocityCap: 18.0,

  // Reading window: T(n) = max(4.2 - 0.040 * n, 2.6) s
  readingWindowBase: 4.2,
  readingWindowShrink: 0.04,
  readingWindowFloor: 2.6,

  // Lane geometry
  laneWidth: 2.0,
  trackWidth: 6.0,
  laneCenters: [-2.0, 0.0, 2.0] as const,

  // Input
  laneSwitchDuration: 0.18, // seconds
  graceWindow: 0.15, // seconds after commit plane

  // Stumble
  stumbleAnimTime: 0.45, // seconds
  timeDilationScale: 0.35,
  timeDilationDuration: 1.5, // seconds

  // Cop
  maxPips: 3,
  correctForRecovery: 4, // consecutive correct to restore one pip
  recoveryCap: 3,

  // Warmup
  warmupDuration: 4.0, // seconds before first gate

  // Scoring
  baseGateScore: 100,
  speedBonusThreshold: 0.5, // fraction of window
  speedBonusMultiplier: 1.25,
  streakMultiplierStep: 0.25,
  streakStepSize: 3,
  maxMultiplier: 3.0,
  bossScoreMultiplier: 3.0,
  cleanFinishBase: 500,
  cleanFinishPerPip: 50,

  // Clean corridor
  cleanCorridorFactor: 1.2,
  obstacleZoneFraction: 0.5, // obstacles only in first 50% of corridor

  // XP
  xpFirstTimeCorrect: 10,
  xpReviewCorrect: 4,
  xpFillerCorrect: 1,

  // Boss gates
  bossGateInterval: 15,

  // Leitner SR
  box1RunsUntilDue: 0,
  box2RunsUntilDue: 2,
  box3RunsUntilDue: 6,
  masteryThreshold: 0.7, // 70% box 3 to unlock next level

  // Question queue
  maxReviewFraction: 0.4,
} as const;

// Compute velocity at gate n
export function velocityAt(n: number): number {
  const v = RUN_TUNING.velocityBase + RUN_TUNING.velocityGrowth * n;
  return Math.min(v, RUN_TUNING.velocityCap);
}

// Compute reading window at gate n
export function readingWindowAt(n: number): number {
  const t = RUN_TUNING.readingWindowBase - RUN_TUNING.readingWindowShrink * n;
  return Math.max(t, RUN_TUNING.readingWindowFloor);
}

// Compute gate spacing at gate n
export function gateSpacingAt(n: number): number {
  return velocityAt(n) * readingWindowAt(n);
}

// Scoring
export function computeGateScore(
  streak: number,
  answeredInFirstHalf: boolean,
): number {
  const mult = Math.min(
    1.0 + Math.floor(streak / RUN_TUNING.streakStepSize) * RUN_TUNING.streakMultiplierStep,
    RUN_TUNING.maxMultiplier,
  );
  let score = RUN_TUNING.baseGateScore * mult;
  if (answeredInFirstHalf) {
    score *= RUN_TUNING.speedBonusMultiplier;
  }
  return score;
}

// --- Run State Types ---
export type EndedBy = "caught" | "clean" | "quit";

export interface AnswerRecord {
  questionId: string;
  chosenIndex: number;
  correct: boolean;
  latencyMs: number;
  misconception: string;
}

export interface RunResult {
  score: number;
  distance: number;
  correct: number;
  wrong: number;
  durationMs: number;
  endedBy: EndedBy;
  answers: AnswerRecord[];
  streak: number;
  pipsRemaining: number;
  gatesCleared: number;
}

export interface SRState {
  questionId: string;
  box: 1 | 2 | 3;
  runsUntilDue: number;
  seenCount: number;
  wrongCount: number;
  lastSeenAt: number | null;
}

export type GameScreen =
  | "home"
  | "brief"
  | "running"
  | "stumble"
  | "report";
