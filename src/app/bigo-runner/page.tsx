"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameController, type GameState } from "@/lib/bigo-runner/controller";
import { RUN_TUNING } from "@/lib/bigo-runner/types";
import { MISCONCEPTION_LABELS } from "@/data/bigo-runner-questions";

export default function BigORunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<GameController | null>(null);
  const [state, setState] = useState<GameState>({
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
  });

  // Brief state
  const [briefCard, setBriefCard] = useState(0);
  const [briefTimer, setBriefTimer] = useState(8);
  const briefTimerRef = useRef<NodeJS.Timeout | null>(null);

  const briefCards = [
    { title: "Array Access", desc: "Reading any element is O(1) — direct address math, no scan needed.", icon: "📍" },
    { title: "Insert at Front", desc: "Inserting at index 0 is O(n) — every later element must shift right.", icon: "🔄" },
    { title: "0-Indexed", desc: "Arrays start at 0. a[0] is the first element, a[length-1] is the last.", icon: "🔢" },
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const controller = new GameController(canvasRef.current);
    controllerRef.current = controller;

    const unsub = controller.subscribe((s) => {
      setState(s);
    });

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      controller.resize(parent.clientWidth, parent.clientHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      unsub();
      window.removeEventListener("resize", handleResize);
      controller.dispose();
    };
  }, []);

  // Brief timer
  useEffect(() => {
    if (state.screen === "brief") {
      setBriefCard(0);
      setBriefTimer(8);
      briefTimerRef.current = setInterval(() => {
        setBriefTimer((t) => {
          if (t <= 1) {
            // Auto-advance card or start run
            setBriefCard((c) => {
              if (c >= briefCards.length - 1) {
                controllerRef.current?.startFromBrief();
                return c;
              }
              return c + 1;
            });
            return 8;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (briefTimerRef.current) {
        clearInterval(briefTimerRef.current);
        briefTimerRef.current = null;
      }
    }
    return () => {
      if (briefTimerRef.current) clearInterval(briefTimerRef.current);
    };
  }, [state.screen]);

  const handleStartRun = useCallback(() => {
    controllerRef.current?.showConceptBrief();
  }, []);

  const handleSkipBrief = useCallback(() => {
    if (briefTimerRef.current) clearInterval(briefTimerRef.current);
    controllerRef.current?.startFromBrief();
  }, []);

  const handleGoHome = useCallback(() => {
    controllerRef.current?.goHome();
  }, []);

  const handleRetry = useCallback(() => {
    controllerRef.current?.showConceptBrief();
  }, []);

  // Group answers by misconception
  const groupedMisconceptions = useCallback(() => {
    if (!state.runResult) return [];
    const groups: Record<string, { correct: number; wrong: number; questionIds: string[] }> = {};
    for (const ans of state.runResult.answers) {
      if (ans.correct) continue;
      const label = MISCONCEPTION_LABELS[ans.misconception] || ans.misconception;
      if (!groups[label]) groups[label] = { correct: 0, wrong: 0, questionIds: [] };
      groups[label].wrong++;
      groups[label].questionIds.push(ans.questionId);
    }
    // Also count corrects that had the same tags
    for (const ans of state.runResult.answers) {
      if (!ans.correct) continue;
      // For now, just show wrongs grouped
    }
    return Object.entries(groups);
  }, [state.runResult]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: "none" }}
      />

      {/* ===== HOME SCREEN ===== */}
      {state.screen === "home" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-b from-[#0a0a2e] via-[#1a1a4e] to-[#0a0a2e]">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-6">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
                O(1)
              </span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              Big-O Runner
            </h1>
            <p className="text-cyan-300/70 text-sm mb-12 max-w-xs mx-auto">
              Swipe to the right answer. Learn time complexity on the bus.
            </p>

            {/* Play Button */}
            <button
              onClick={handleStartRun}
              className="group relative px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-bold text-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">▶ PLAY</span>
              <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Level info */}
            <div className="mt-8 text-xs text-white/40">
              <div className="bg-white/5 rounded-xl px-6 py-3 inline-block">
                <span className="text-cyan-400 font-semibold">Arrays & Hashing</span>
                <span className="mx-2">·</span>
                <span>18 questions</span>
                <span className="mx-2">·</span>
                <span className="text-yellow-400">Free</span>
              </div>
            </div>

            {/* Controls hint */}
            <div className="mt-8 text-[10px] text-white/25 space-y-1">
              <p>← → or swipe: switch lanes</p>
              <p>↑ or swipe up: jump &nbsp;·&nbsp; ↓ or swipe down: roll</p>
              <p>Keyboard: WASD / Arrow keys</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONCEPT BRIEF ===== */}
      {state.screen === "brief" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#0a0a2e]/95 backdrop-blur-sm">
          <div className="text-center w-full max-w-sm px-6">
            <p className="text-cyan-400 text-xs uppercase tracking-widest mb-6 font-semibold">
              Concept Brief
            </p>

            {/* Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6 min-h-[200px] flex flex-col items-center justify-center transition-all duration-300">
              <span className="text-4xl mb-4">{briefCards[briefCard].icon}</span>
              <h2 className="text-xl font-bold text-white mb-3">
                {briefCards[briefCard].title}
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                {briefCards[briefCard].desc}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {briefCards.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === briefCard ? "bg-cyan-400 scale-125" : "bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Timer bar */}
            <div className="w-full bg-white/10 rounded-full h-1 mb-6">
              <div
                className="bg-cyan-400 h-1 rounded-full transition-all duration-1000"
                style={{ width: `${(briefTimer / 8) * 100}%` }}
              />
            </div>

            <div className="flex gap-3">
              {briefCard < briefCards.length - 1 ? (
                <button
                  onClick={() => {
                    setBriefCard((c) => c + 1);
                    setBriefTimer(8);
                  }}
                  className="flex-1 py-3 bg-white/10 rounded-xl text-white/60 text-sm font-semibold hover:bg-white/15 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSkipBrief}
                  className="flex-1 py-3 bg-cyan-500 rounded-xl text-white text-sm font-bold hover:bg-cyan-400 transition-colors"
                >
                  Start Run ▶
                </button>
              )}
              <button
                onClick={handleSkipBrief}
                className="px-6 py-3 bg-white/5 rounded-xl text-white/30 text-sm hover:text-white/50 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HUD OVERLAY ===== */}
      {state.screen === "running" && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
            {/* Pips */}
            <div className="flex gap-1.5 items-center">
              {Array.from({ length: state.maxPips }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    i < state.pips
                      ? state.pips === 1
                        ? "bg-red-500 border-red-400 animate-pulse shadow-lg shadow-red-500/50"
                        : "bg-cyan-400 border-cyan-300"
                      : "bg-white/10 border-white/20"
                  }`}
                />
              ))}
              {state.pips <= 1 && (
                <span className="text-red-400 text-[10px] ml-1 animate-pulse font-mono">
                  ⚠ COP CLOSE
                </span>
              )}
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-white font-black text-2xl font-mono tabular-nums">
                {state.score.toLocaleString()}
              </div>
              {state.streak > 0 && (
                <div className="text-cyan-400 text-xs font-semibold">
                  ×{Math.min(1.0 + Math.floor(state.streak / 3) * 0.25, 3.0).toFixed(2)} streak {state.streak}
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex justify-between items-end">
              <div className="text-white/30 text-xs font-mono">
                {state.distance}m
              </div>
              <div className="text-white/20 text-[10px]">
                {state.readingWindow.toFixed(1)}s window
              </div>
            </div>
          </div>

          {/* Question Banner */}
          {state.question && (
            <div
              className="absolute left-0 right-0 top-[18%] pointer-events-none"
              style={{ opacity: 1 }}
            >
              <div className="mx-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl">
                {state.boss && (
                  <div className="text-center mb-2">
                    <span className="text-orange-400 text-[10px] font-bold tracking-widest uppercase">
                      ⚡ Boss Gate ⚡
                    </span>
                  </div>
                )}
                <p className="text-white text-center font-bold text-base leading-snug mb-1">
                  {state.question.prompt}
                </p>
                {state.question.promptCode && (
                  <p className="text-cyan-300/80 text-center text-xs font-mono mb-3">
                    {state.question.promptCode}
                  </p>
                )}

                {/* Options as lane indicators */}
                {state.options && (
                  <div className="flex justify-center gap-3 mt-3">
                    {state.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          i === 1
                            ? "bg-white/15 border border-white/30 text-white scale-105"
                            : "bg-white/5 border border-white/10 text-white/60"
                        }`}
                      >
                        <span className="text-[10px] text-white/30 block mb-0.5">
                          {i === 0 ? "← L" : i === 1 ? "● C" : "R →"}
                        </span>
                        {opt.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Timer bar */}
                <div className="mt-3 w-full bg-white/10 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-100 ${
                      state.timeLeftFraction > 0.5
                        ? "bg-cyan-400"
                        : state.timeLeftFraction > 0.25
                          ? "bg-yellow-400"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${state.timeLeftFraction * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== STUMBLE / FLASHCARD OVERLAY ===== */}
      {state.screen === "stumble" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {/* Dimming backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-none" />

          {/* Flashcard */}
          <div className="relative z-10 mx-6 max-w-md w-full">
            <div className="bg-gradient-to-b from-red-900/90 to-[#1a0a0a]/95 border border-red-500/30 rounded-2xl p-6 shadow-2xl shadow-red-900/50">
              {/* Wrong indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl">💥</span>
                <span className="text-red-400 font-black text-lg">WRONG!</span>
              </div>

              {/* Explanation */}
              <div className="bg-black/40 rounded-xl p-4 mb-4">
                <p className="text-white text-center font-bold text-lg leading-relaxed">
                  {state.flashcardExplain}
                </p>
                {state.flashcardMisconception && (
                  <p className="text-red-300/70 text-center text-xs mt-2 font-mono">
                    {MISCONCEPTION_LABELS[state.flashcardMisconception] ||
                      state.flashcardMisconception}
                  </p>
                )}
              </div>

              {/* Pip status */}
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: state.maxPips }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i < state.pips
                        ? "bg-red-500"
                        : "bg-white/10"
                    }`}
                  />
                ))}
                <span className="text-white/40 text-xs ml-2">
                  {state.pips} pips left
                </span>
              </div>

              {/* Recovery hint */}
              {state.consecutiveCorrect === 0 && state.pips > 0 && (
                <p className="text-cyan-300/50 text-[10px] text-center mt-2">
                  Answer 4 correct in a row to recover a pip!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== RUN REPORT ===== */}
      {state.screen === "report" && state.runResult && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-b from-[#0a0a2e] via-[#1a1a4e] to-[#0a0a2e] overflow-y-auto">
          <div className="w-full max-w-md px-6 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white mb-1">Run Complete</h2>
              <p className="text-white/40 text-sm">
                {state.runResult.endedBy === "caught"
                  ? "The cop caught you!"
                  : state.runResult.endedBy === "clean"
                    ? "All questions answered!"
                    : "Run ended"}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-white">
                  {state.runResult.score.toLocaleString()}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Score</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-cyan-400">
                  {state.runResult.correct}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Correct</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-red-400">
                  {state.runResult.wrong}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Wrong</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-white">
                  {state.runResult.distance}m
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Distance</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-white">
                  {(state.runResult.durationMs / 1000).toFixed(1)}s
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Duration</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-black text-yellow-400">
                  {state.runResult.pipsRemaining}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Pips left</div>
              </div>
            </div>

            {/* Misconception breakdown */}
            {groupedMisconceptions().length > 0 && (
              <div className="mb-8">
                <h3 className="text-white/60 text-xs uppercase tracking-widest mb-3 font-semibold">
                  Misconceptions to review
                </h3>
                <div className="space-y-2">
                  {groupedMisconceptions().map(([label, data]) => (
                    <div
                      key={label}
                      className="bg-red-900/20 border border-red-500/20 rounded-xl px-4 py-3"
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-white/80 text-sm font-medium">{label}</p>
                        <span className="text-red-400 text-xs font-mono">
                          {data.wrong}×
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/20 text-[10px] mt-2">
                  These questions are now in your review deck and will reappear in your next runs.
                </p>
              </div>
            )}

            {/* Per-question breakdown */}
            <div className="mb-8">
              <h3 className="text-white/60 text-xs uppercase tracking-widest mb-3 font-semibold">
                Question details
              </h3>
              <div className="space-y-1.5">
                {state.runResult.answers.map((ans, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                      ans.correct
                        ? "bg-green-900/20 border border-green-500/10"
                        : "bg-red-900/20 border border-red-500/10"
                    }`}
                  >
                    <span className={ans.correct ? "text-green-400" : "text-red-400"}>
                      {ans.correct ? "✓" : "✗"}
                    </span>
                    <span className="text-white/60 font-mono flex-1 truncate">
                      {ans.questionId}
                    </span>
                    <span className="text-white/30 font-mono">
                      {Math.round(ans.latencyMs)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRetry}
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-sm shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                ▶ Retry
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
