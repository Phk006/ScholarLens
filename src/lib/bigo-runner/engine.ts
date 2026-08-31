import {
  RUN_TUNING,
  velocityAt,
  readingWindowAt,
  gateSpacingAt,
  computeGateScore,
  type RunResult,
  type AnswerRecord,
  type EndedBy,
} from "./types";
import { ARRAYS_HASHING_PACK, type Question } from "@/data/bigo-runner-questions";

// --- Spawned objects in world-space ---
export interface GateSpawn {
  type: "gate";
  id: string;
  z: number;
  question: Question;
  shuffledOptions: { text: string; correct: boolean; misconception: string }[];
  shuffledCorrectIndex: number;
  boss: boolean;
  spawned: boolean;
  passed: boolean;
  revealed: boolean;
}

export interface ObstacleSpawn {
  type: "obstacle";
  id: string;
  variant: "barrier" | "lowbar" | "train";
  z: number;
  lane: number;
  spawned: boolean;
  hit: boolean;
}

export type SpawnItem = GateSpawn | ObstacleSpawn;

// --- Run Director ---
export class RunDirector {
  // State
  gatesCleared = 0;
  consecutiveCorrect = 0;
  streak = 0;
  score = 0;
  distance = 0;
  pips: number = RUN_TUNING.maxPips;
  ended = false;
  endedBy: EndedBy = "quit";
  answers: AnswerRecord[] = [];
  totalCorrect = 0;
  totalWrong = 0;
  currentVelocity = velocityAt(0);
  currentReadingWindow = readingWindowAt(0);
  currentGateSpacing = gateSpacingAt(0);

  // Timing
  runTime = 0;
  nextGateZ = 0;
  warmupDone = false;

  // Active gate tracking
  activeGate: GateSpawn | null = null;
  questionRevealed = false;
  questionZDistance = 0;

  // Spawn queue
  spawnQueue: SpawnItem[] = [];
  spawnedIds = new Set<string>();

  // Time dilation
  timeDilation = 1.0;
  timeDilationTimer = 0;
  stumbleTimer = 0;
  isStumbling = false;

  // Question queue
  private questionPool: Question[];
  private questionIndex = 0;
  private bossPool: Question[];
  private bossIndex = 0;
  private bossSinceLastBoss = 0;
  private totalGatesPlanned = 0;

  // Client seed for lane shuffling
  private clientSeed: number;

  constructor(seed?: number) {
    this.clientSeed = seed ?? Math.floor(Math.random() * 1000000);

    const questions = ARRAYS_HASHING_PACK.questions;
    this.bossPool = questions.filter((q) => q.isBoss);
    this.questionPool = questions
      .filter((q) => !q.isBoss)
      .sort((a, b) => a.difficulty - b.difficulty);
    this.questionIndex = 0;
    this.bossIndex = 0;

    this.currentVelocity = velocityAt(0);
    this.currentReadingWindow = readingWindowAt(0);
    this.currentGateSpacing = gateSpacingAt(0);
    this.nextGateZ = this.currentGateSpacing;
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  private shuffleWithSeed<T extends Record<string, unknown>>(
    arr: T[],
    seed: number,
  ): T[] {
    const result = [...arr];
    const rng = this.seededRandom(seed);
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private getNextQuestion(): Question | null {
    if (this.questionIndex < this.questionPool.length) {
      return this.questionPool[this.questionIndex++];
    }
    return null;
  }

  private getNextBoss(): Question | null {
    if (this.bossPool.length === 0) return null;
    const q = this.bossPool[this.bossIndex % this.bossPool.length];
    this.bossIndex++;
    return q;
  }

  update(dt: number, playerZ: number): { events: GameEvent[] } {
    const events: GameEvent[] = [];

    if (this.ended) return { events };

    // Apply time dilation
    const effectiveDt = dt * this.timeDilation;
    this.runTime += effectiveDt;
    this.distance = playerZ;
    this.currentVelocity = velocityAt(this.totalGatesPlanned);
    this.currentReadingWindow = readingWindowAt(this.totalGatesPlanned);
    this.currentGateSpacing = gateSpacingAt(this.totalGatesPlanned);

    // Stumble timer
    if (this.isStumbling) {
      this.stumbleTimer -= dt;
      if (this.stumbleTimer <= 0) {
        this.isStumbling = false;
        this.timeDilation = 1.0;
        events.push({ type: "stumble_end" });
      }
    }

    // Time dilation timer
    if (this.timeDilationTimer > 0) {
      this.timeDilationTimer -= dt;
      if (this.timeDilationTimer <= 0) {
        this.timeDilation = 1.0;
      }
    }

    // Warmup check
    if (!this.warmupDone && this.runTime >= RUN_TUNING.warmupDuration) {
      this.warmupDone = true;
    }

    // Spawn upcoming objects
    this.spawnUpcoming(playerZ, events);

    // Check for question reveal
    this.checkQuestionReveal(playerZ, events);

    return { events };
  }

  private spawnUpcoming(playerZ: number, events: GameEvent[]) {
    const spawnAhead = 120;

    // Plan gates that are within spawn range
    while (this.nextGateZ < playerZ + spawnAhead) {
      const gateIdx = this.totalGatesPlanned;
      this.bossSinceLastBoss++;
      const isBoss =
        this.bossSinceLastBoss >= RUN_TUNING.bossGateInterval ||
        (gateIdx === 0 && this.warmupDone);

      let question: Question | null = null;
      if (isBoss) {
        question = this.getNextBoss();
        this.bossSinceLastBoss = 0;
      }
      if (!question) {
        question = this.getNextQuestion();
      }
      if (!question) {
        question = this.getNextBoss();
        if (!question) break;
      }

      // Shuffle options with seeded random
      const seed = this.clientSeed + gateIdx;
      const shuffled = this.shuffleWithSeed(
        question.options.map((o) => ({ ...o })),
        seed,
      );
      const correctIdx = shuffled.findIndex((o) => o.correct);

      const gate: GateSpawn = {
        type: "gate",
        id: `gate_${gateIdx}`,
        z: this.nextGateZ,
        question,
        shuffledOptions: shuffled.map(({ text, correct, misconception }) => ({
          text,
          correct,
          misconception,
        })),
        shuffledCorrectIndex: correctIdx,
        boss: question.isBoss,
        spawned: false,
        passed: false,
        revealed: false,
      };
      this.spawnQueue.push(gate);

      // Spawn obstacles in the zone between this gate and the previous one
      const corridorStart = this.nextGateZ - this.currentGateSpacing;
      const cleanEnd =
        this.nextGateZ - RUN_TUNING.cleanCorridorFactor * this.currentVelocity;

      if (corridorStart < cleanEnd) {
        const obstacleZoneLength = cleanEnd - corridorStart;
        const numObstacles = Math.random() < 0.5 ? 1 : Math.random() < 0.3 ? 2 : 0;
        for (let i = 0; i < numObstacles; i++) {
          const oz =
            corridorStart +
            Math.random() * obstacleZoneLength * 0.8;

          if (oz > playerZ && oz < cleanEnd) {
            const variants: ObstacleSpawn["variant"][] = [
              "barrier",
              "lowbar",
              "train",
            ];
            const obs: ObstacleSpawn = {
              type: "obstacle",
              id: `obs_${gateIdx}_${i}`,
              variant: variants[Math.floor(Math.random() * variants.length)],
              z: oz,
              lane: Math.floor(Math.random() * 3),
              spawned: false,
              hit: false,
            };
            this.spawnQueue.push(obs);
          }
        }
      }

      this.nextGateZ += this.currentGateSpacing;
      this.totalGatesPlanned++;
    }

    // Trigger spawn events for items within visual range
    for (const item of this.spawnQueue) {
      if (item.spawned) continue;
      const itemId =
        item.type === "gate" ? item.id : item.id;
      if (
        item.z < playerZ + spawnAhead &&
        !this.spawnedIds.has(itemId)
      ) {
        item.spawned = true;
        this.spawnedIds.add(itemId);
        if (item.type === "gate") {
          events.push({ type: "gate_spawn", gate: item });
        } else {
          events.push({ type: "obstacle_spawn", obstacle: item });
        }
      }
    }
  }

  private checkQuestionReveal(playerZ: number, events: GameEvent[]) {
    if (this.activeGate) return;

    // Find the next unpassed, unrevealed gate ahead of the player
    const nextGate = this.spawnQueue.find(
      (g): g is GateSpawn =>
        g.type === "gate" &&
        !g.passed &&
        !g.revealed &&
        g.z > playerZ,
    );

    if (!nextGate) return;

    // Reveal question when gate is S(n) distance ahead
    const dist = nextGate.z - playerZ;
    if (dist <= this.currentGateSpacing && dist > 0) {
      this.activeGate = nextGate;
      nextGate.revealed = true;
      this.questionRevealed = true;
      this.questionZDistance = nextGate.z;
      events.push({
        type: "question_reveal",
        question: nextGate.question,
        options: nextGate.shuffledOptions,
        boss: nextGate.boss,
        window: this.currentReadingWindow,
        gateId: nextGate.id,
      });
    }
  }

  resolveAnswer(
    chosenLane: number,
    playerZ: number,
  ): { correct: boolean; event: GameEvent } {
    if (!this.activeGate) {
      return {
        correct: false,
        event: {
          type: "answer_result",
          correct: false,
          misconception: "",
          explain: "",
          score: 0,
          finalScore: this.score,
          streak: 0,
          pips: this.pips,
          gateId: "",
        },
      };
    }

    const gate = this.activeGate;

    // Clamp chosen lane to valid range (timeout = -1 → auto-wrong)
    const clampedLane = chosenLane >= 0 && chosenLane < 3 ? chosenLane : -1;
    const correct = clampedLane >= 0 && gate.shuffledOptions[clampedLane].correct;
    const misconception =
      clampedLane >= 0 ? gate.shuffledOptions[clampedLane].misconception : "TIMEOUT";

    // Latency: how much of the reading window was used
    const timeSinceReveal =
      (this.questionZDistance - playerZ) / this.currentVelocity;
    const latencyMs = Math.max(
      0,
      Math.min(this.currentReadingWindow, timeSinceReveal) * 1000,
    );

    this.answers.push({
      questionId: gate.question.id,
      chosenIndex: clampedLane,
      correct,
      latencyMs,
      misconception: correct ? "" : misconception,
    });

    if (correct) {
      this.totalCorrect++;
      this.streak++;
      this.consecutiveCorrect++;

      const answeredInFirstHalf =
        latencyMs < this.currentReadingWindow * 500;
      const gateScore = computeGateScore(this.streak, answeredInFirstHalf);
      const finalScore = gate.boss
        ? gateScore * RUN_TUNING.bossScoreMultiplier
        : gateScore;
      this.score += finalScore;

      // Pip recovery
      if (
        this.consecutiveCorrect >= RUN_TUNING.correctForRecovery &&
        this.pips < RUN_TUNING.recoveryCap
      ) {
        this.pips = Math.min(this.pips + 1, RUN_TUNING.recoveryCap);
        this.consecutiveCorrect = 0;
      }
    } else {
      this.totalWrong++;
      this.streak = 0;
      this.consecutiveCorrect = 0;
      this.pips--;

      // Trigger stumble
      this.isStumbling = true;
      this.stumbleTimer = RUN_TUNING.timeDilationDuration;
      this.timeDilation = RUN_TUNING.timeDilationScale;

      if (this.pips <= 0) {
        this.ended = true;
        this.endedBy = "caught";
      }
    }

    const event: GameEvent = {
      type: "answer_result",
      correct,
      misconception,
      explain: gate.question.explain,
      score: correct
        ? gate.boss
          ? computeGateScore(
              this.streak,
              latencyMs < this.currentReadingWindow * 500,
            ) * RUN_TUNING.bossScoreMultiplier
          : computeGateScore(
              this.streak,
              latencyMs < this.currentReadingWindow * 500,
            )
        : 0,
      finalScore: this.score,
      streak: this.streak,
      pips: this.pips,
      gateId: gate.id,
    };

    // Clear active gate
    this.activeGate = null;
    this.questionRevealed = false;

    return { correct, event };
  }

  hitObstacle(): GameEvent {
    this.pips--;
    this.totalWrong++;

    this.isStumbling = true;
    this.stumbleTimer = RUN_TUNING.timeDilationDuration;
    this.timeDilation = RUN_TUNING.timeDilationScale;

    if (this.pips <= 0) {
      this.ended = true;
      this.endedBy = "caught";
    }

    return {
      type: "obstacle_hit",
      pips: this.pips,
      ended: this.ended,
    };
  }

  endRun(): RunResult {
    this.ended = true;
    const cleanFinish = this.endedBy !== "caught" && this.endedBy !== "quit";
    if (cleanFinish) {
      this.score +=
        RUN_TUNING.cleanFinishBase +
        RUN_TUNING.cleanFinishPerPip * this.pips;
    }

    return {
      score: this.score,
      distance: Math.floor(this.distance),
      correct: this.totalCorrect,
      wrong: this.totalWrong,
      durationMs: Math.floor(this.runTime * 1000),
      endedBy: this.endedBy,
      answers: this.answers,
      streak: this.streak,
      pipsRemaining: this.pips,
      gatesCleared: this.totalGatesPlanned,
    };
  }

  getSpeedFraction(): number {
    return (
      (this.currentVelocity - RUN_TUNING.velocityBase) /
      (RUN_TUNING.velocityCap - RUN_TUNING.velocityBase)
    );
  }
}

// --- Game Events ---
export type GameEvent =
  | { type: "gate_spawn"; gate: GateSpawn }
  | { type: "obstacle_spawn"; obstacle: ObstacleSpawn }
  | {
      type: "question_reveal";
      question: Question;
      options: { text: string; correct: boolean; misconception: string }[];
      boss: boolean;
      window: number;
      gateId: string;
    }
  | {
      type: "answer_result";
      correct: boolean;
      misconception: string;
      explain: string;
      score: number;
      finalScore: number;
      streak: number;
      pips: number;
      gateId: string;
    }
  | { type: "stumble_end" }
  | { type: "obstacle_hit"; pips: number; ended: boolean };
