import * as THREE from "three";
import { RunDirector, type GameEvent, type GateSpawn } from "./engine";
import { GameRenderer } from "./renderer";
import { InputHandler, type SwipeDirection } from "./input";
import { RUN_TUNING } from "./types";
import type { Question } from "@/data/bigo-runner-questions";

export interface GameState {
  screen: "home" | "brief" | "running" | "stumble" | "report";
  score: number;
  streak: number;
  pips: number;
  maxPips: number;
  distance: number;
  question: Question | null;
  options: { text: string; correct: boolean; misconception: string }[] | null;
  boss: boolean;
  showFlashcard: boolean;
  flashcardExplain: string;
  flashcardMisconception: string;
  flashcardCorrect: boolean;
  timeLeftFraction: number;
  runResult: import("./types").RunResult | null;
  readingWindow: number;
  gameSpeed: number;
  consecutiveCorrect: number;
}

export type StateListener = (state: GameState) => void;

export class GameController {
  private director: RunDirector;
  private renderer: GameRenderer;
  private input: InputHandler;
  private canvas: HTMLCanvasElement;

  // Player state
  private playerZ = 0;
  private playerLane = 1;
  private targetLane = 1;
  private switchTween = 0;
  private isSwitching = false;
  private switchFrom = 0;
  private switchTo = 0;
  private queuedSwitch: SwipeDirection = null;
  private switchCount = 0;

  // Jump
  private isJumping = false;
  private jumpProgress = 0;
  private isRolling = false;
  private rollTimer = 0;

  // Timing
  private lastTime = 0;
  private animFrame = 0;
  private running = false;

  // Question timer
  private questionTimeRemaining = 0;
  private questionTotalTime = 0;

  // Listeners
  private listeners: StateListener[] = [];
  private currentState: GameState;

  // Question reveal gate id
  private revealedGateId: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.director = new RunDirector();
    this.renderer = new GameRenderer(canvas);
    this.input = new InputHandler(canvas, {
      onSwipe: (dir) => this.handleSwipe(dir),
    });
    this.currentState = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      screen: "home",
      score: 0,
      streak: 0,
      pips: RUN_TUNING.maxPips,
      maxPips: RUN_TUNING.maxPips,
      distance: 0,
      question: null,
      options: null,
      boss: false,
      showFlashcard: false,
      flashcardExplain: "",
      flashcardMisconception: "",
      flashcardCorrect: false,
      timeLeftFraction: 1.0,
      runResult: null,
      readingWindow: RUN_TUNING.readingWindowBase,
      gameSpeed: 0,
      consecutiveCorrect: 0,
    };
  }

  subscribe(listener: StateListener) {
    this.listeners.push(listener);
    listener(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emitState() {
    for (const listener of this.listeners) {
      listener({ ...this.currentState });
    }
  }

  private clearWorld() {
    // Remove old gates
    for (const rg of [...this.renderer.renderedGates]) {
      for (const panel of rg.panels) {
        this.renderer.worldRoot.remove(panel);
        panel.geometry.dispose();
        (panel.material as unknown as THREE.Material).dispose();
      }
      for (const sprite of rg.textSprites) {
        this.renderer.worldRoot.remove(sprite);
        const sm = sprite.material as unknown as THREE.SpriteMaterial;
        sm.map?.dispose();
        sm.dispose();
      }
    }
    this.renderer.renderedGates = [];

    // Remove old obstacles
    for (const ro of [...this.renderer.renderedObstacles]) {
      this.renderer.worldRoot.remove(ro.mesh);
      ro.mesh.geometry.dispose();
      (ro.mesh.material as unknown as THREE.Material).dispose();
    }
    this.renderer.renderedObstacles = [];
  }

  startRun() {
    this.clearWorld();
    this.director = new RunDirector();
    this.playerZ = 0;
    this.playerLane = 1;
    this.targetLane = 1;
    this.switchTween = 0;
    this.isSwitching = false;
    this.isJumping = false;
    this.jumpProgress = 0;
    this.isRolling = false;
    this.switchCount = 0;
    this.queuedSwitch = null;
    this.revealedGateId = null;
    this.questionTimeRemaining = 0;

    this.currentState = {
      ...this.getInitialState(),
      screen: "running",
    };
    this.emitState();

    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  showConceptBrief() {
    this.currentState = { ...this.currentState, screen: "brief" };
    this.emitState();
  }

  startFromBrief() {
    this.startRun();
  }

  goHome() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.clearWorld();
    this.currentState = { ...this.getInitialState(), screen: "home" };
    this.emitState();
  }

  private handleSwipe(direction: SwipeDirection) {
    if (!this.running) return;
    if (this.currentState.screen === "stumble") return;

    if (direction === "left" && this.targetLane > 0) {
      if (this.isSwitching) {
        if (this.switchCount < 1) this.queuedSwitch = "left";
      } else {
        this.startSwitch(this.targetLane - 1);
      }
    } else if (direction === "right" && this.targetLane < 2) {
      if (this.isSwitching) {
        if (this.switchCount < 1) this.queuedSwitch = "right";
      } else {
        this.startSwitch(this.targetLane + 1);
      }
    } else if (direction === "up" && !this.isJumping) {
      this.isJumping = true;
      this.jumpProgress = 0;
    } else if (direction === "down" && !this.isRolling) {
      this.isRolling = true;
      this.rollTimer = 0.5;
    }
  }

  private startSwitch(target: number) {
    this.switchFrom = RUN_TUNING.laneCenters[this.playerLane];
    this.switchTo = RUN_TUNING.laneCenters[target];
    this.playerLane = target;
    this.targetLane = target;
    this.switchTween = 0;
    this.isSwitching = true;
    this.switchCount++;
  }

  private gameLoop = () => {
    if (!this.running) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    // Update director
    const { events } = this.director.update(dt, this.playerZ);

    // Process events
    for (const event of events) {
      this.processEvent(event);
    }

    // Advance player
    this.playerZ +=
      this.director.currentVelocity * dt * this.director.timeDilation;

    // Update switch tween
    if (this.isSwitching) {
      this.switchTween += dt / RUN_TUNING.laneSwitchDuration;
      if (this.switchTween >= 1.0) {
        this.isSwitching = false;
        this.switchTween = 0;
        this.switchCount = 0;

        if (this.queuedSwitch) {
          const q = this.queuedSwitch;
          this.queuedSwitch = null;
          if (q === "left" && this.targetLane > 0) {
            this.startSwitch(this.targetLane - 1);
          } else if (q === "right" && this.targetLane < 2) {
            this.startSwitch(this.targetLane + 1);
          }
        }
      }
    }

    // Update jump
    if (this.isJumping) {
      this.jumpProgress += dt * 2.0;
      if (this.jumpProgress >= 1.0) {
        this.isJumping = false;
        this.jumpProgress = 0;
      }
    }

    // Update roll
    if (this.isRolling) {
      this.rollTimer -= dt;
      if (this.rollTimer <= 0) this.isRolling = false;
    }

    // Question timer countdown
    if (this.questionTimeRemaining > 0) {
      this.questionTimeRemaining -= dt;
      const fraction = Math.max(
        0,
        this.questionTimeRemaining / this.questionTotalTime,
      );
      this.currentState.timeLeftFraction = fraction;

      if (this.questionTimeRemaining <= 0 && this.revealedGateId) {
        // Timeout → auto wrong
        const { event } = this.director.resolveAnswer(-1, this.playerZ);
        this.processEvent(event);
        this.revealedGateId = null;
      }
    }

    // Check gate passage (player z crosses gate z)
    this.checkGatePassage();

    // Check obstacle collisions
    this.checkObstacleCollisions();

    // Update renderer
    this.renderer.updatePlayer(
      this.playerLane,
      this.isSwitching ? this.switchTween : 1.0,
      this.playerZ,
    );
    this.renderer.updateCop(this.playerZ, this.director.pips);

    // Update state
    this.currentState.score = this.director.score;
    this.currentState.streak = this.director.streak;
    this.currentState.pips = this.director.pips;
    this.currentState.distance = Math.floor(this.playerZ);
    this.currentState.readingWindow = this.director.currentReadingWindow;
    this.currentState.gameSpeed = this.director.getSpeedFraction();
    this.currentState.consecutiveCorrect = this.director.consecutiveCorrect;

    // Render
    this.renderer.render(this.playerZ);
    this.emitState();

    this.animFrame = requestAnimationFrame(this.gameLoop);
  };

  private processEvent(event: GameEvent) {
    switch (event.type) {
      case "gate_spawn":
        this.renderer.spawnGate(event.gate);
        break;

      case "obstacle_spawn":
        this.renderer.spawnObstacle(event.obstacle);
        break;

      case "question_reveal":
        this.revealedGateId = event.gateId;
        this.currentState.question = event.question;
        this.currentState.options = event.options;
        this.currentState.boss = event.boss;
        this.questionTimeRemaining = event.window;
        this.questionTotalTime = event.window;
        this.currentState.showFlashcard = false;
        this.emitState();
        break;

      case "answer_result":
        this.currentState.question = null;
        this.currentState.options = null;
        this.revealedGateId = null;

        if (!event.correct) {
          // Show flashcard
          this.currentState.showFlashcard = true;
          this.currentState.flashcardExplain = event.explain;
          this.currentState.flashcardMisconception = event.misconception;
          this.currentState.flashcardCorrect = false;
          this.renderer.triggerShake(0.3);
          this.currentState.screen = "stumble";

          // Auto-dismiss after dilation duration
          setTimeout(() => {
            if (this.currentState.screen === "stumble") {
              this.currentState.showFlashcard = false;
              this.currentState.screen = "running";
              this.emitState();
            }
          }, RUN_TUNING.timeDilationDuration * 1000);
        } else {
          this.renderer.triggerShake(0.05);
        }

        this.currentState.pips = event.pips;
        this.currentState.streak = event.streak;
        this.currentState.score = event.finalScore;
        this.emitState();
        break;

      case "stumble_end":
        if (this.currentState.screen === "stumble") {
          this.currentState.showFlashcard = false;
          this.currentState.screen = "running";
        }
        this.emitState();
        break;

      case "obstacle_hit":
        this.renderer.triggerShake(0.4);
        this.currentState.pips = event.pips;
        if (event.ended) {
          this.endRun();
        }
        this.emitState();
        break;
    }

    if (this.director.ended && this.currentState.screen !== "report") {
      this.endRun();
    }
  }

  private checkGatePassage() {
    for (const rg of this.renderer.renderedGates) {
      const gate = rg.gate;
      if (!gate.passed && gate.z < this.playerZ) {
        gate.passed = true;

        // If this gate was revealed and hasn't been answered, resolve now
        if (this.revealedGateId === gate.id) {
          const { event } = this.director.resolveAnswer(
            this.playerLane,
            this.playerZ,
          );
          this.renderer.resolveGate(
            gate.id,
            gate.shuffledCorrectIndex,
            this.playerLane,
          );
          this.processEvent(event);
        }
      }
    }
  }

  private checkObstacleCollisions() {
    for (const ro of this.renderer.renderedObstacles) {
      const obs = ro.obstacle;
      if (obs.hit) continue;

      // Obstacle is in player's z-range (just passed)
      if (obs.z < this.playerZ && obs.z > this.playerZ - 3) {
        // Same lane check
        if (obs.lane === this.playerLane) {
          // Jump avoids barrier and lowbar
          if (obs.variant === "lowbar" && this.isJumping) continue;
          if (obs.variant === "barrier" && this.isJumping) continue;
          // Roll avoids train
          if (obs.variant === "train" && this.isRolling) continue;

          obs.hit = true;
          const event = this.director.hitObstacle();
          this.processEvent(event);

          // Remove visually
          this.renderer.worldRoot.remove(ro.mesh);
          ro.mesh.geometry.dispose();
          (ro.mesh.material as unknown as THREE.Material).dispose();
        }
      }
    }
  }

  private endRun() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);

    const result = this.director.endRun();
    this.currentState.runResult = result;
    this.currentState.screen = "report";
    this.emitState();
  }

  resize(w: number, h: number) {
    this.renderer.resize(w, h);
  }

  dispose() {
    this.running = false;
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    this.input.destroy();
    this.renderer.dispose();
  }
}
