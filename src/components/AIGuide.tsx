"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { scholarships } from "@/data/scholarships";
import { useProfile } from "@/lib/profile-context";
import { computeEligibility } from "@/lib/eligibility";
import { BookOpen, X, Send, HelpCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Simple deterministic responses based on keywords
function generateResponse(
  input: string,
  pathname: string,
  profile: ReturnType<typeof useProfile>["profile"]
): string {
  const lower = input.toLowerCase();

  // Context-aware: if on a scholarship page
  const scholarshipMatch = pathname.match(/\/scholarships\/([^/]+)/);
  const activeScholarship = scholarshipMatch
    ? scholarships.find((s) => s.id === scholarshipMatch[1])
    : null;

  if (lower.includes("how") && lower.includes("work")) {
    return "ScholarLens works in 5 steps: 1) You build your Student DNA profile, 2) We scan verified scholarship sources, 3) We run deterministic eligibility checks against your profile, 4) We show you results with clear explanations, 5) We monitor for changes via Scholarship Radar.";
  }

  if (lower.includes("not eligible") || lower.includes("not a match")) {
    if (activeScholarship) {
      return `For "${activeScholarship.name}", check the eligibility section below — each rule shows whether you passed or failed. If you'd like better matches, check your Discover page for scholarships where you're a stronger fit.`;
    }
    return "When a scholarship shows 'Not a match', look at the eligibility breakdown to see exactly which criteria you don't meet. Then check Discover for scholarships with higher match scores — ScholarLens ranks them by relevance to your profile.";
  }

  if (lower.includes("document")) {
    if (activeScholarship) {
      const docs = activeScholarship.documentsRequired.join(", ");
      return `Documents required for "${activeScholarship.name}": ${docs}. You'll need to upload these on the official application portal.`;
    }
    return "Each scholarship has specific document requirements. Open a scholarship detail page to see the full list of required documents.";
  }

  if (lower.includes("alternative") || lower.includes("better match")) {
    if (activeScholarship && profile) {
      return "On this scholarship's detail page, scroll down to 'Better matches for you' — ScholarLens will show scholarships where you have a higher match score. You can also visit the Discover page and sort by match score.";
    }
    return "Visit the Discover page to see all scholarships sorted by match score. ScholarLens ranks them so the best-fitting opportunities appear first.";
  }

  if (lower.includes("what changed") || lower.includes("change")) {
    return "Check the Radar page — it shows recently changed scholarships. When a scholarship's criteria, deadline, or requirements change, ScholarLens detects the change and explains what's different.";
  }

  if (lower.includes("requirement") || lower.includes("criteria")) {
    if (activeScholarship) {
      const rules = activeScholarship.eligibilityRules
        .map((r) => `${r.label}: ${r.explanation}`)
        .join("\n");
      return `Eligibility requirements for "${activeScholarship.name}":\n\n${rules}`;
    }
    return "Each scholarship has specific eligibility criteria. Open a scholarship detail page to see all requirements and check which ones you meet.";
  }

  if (lower.includes("privacy") || lower.includes("data")) {
    return "ScholarLens collects only what's needed for eligibility matching — course, year, state, income range, etc. We never collect Aadhaar, PAN, bank details, or government portal credentials. Read our Privacy Policy for full details.";
  }

  if (lower.includes("apply") || lower.includes("application")) {
    if (activeScholarship) {
      return `To apply for "${activeScholarship.name}", click 'Continue to official portal' at the bottom of this page. ScholarLens does not submit applications — you'll be directed to ${activeScholarship.sourceAuthority}.`;
    }
    return "When you find a scholarship you're eligible for, click into its detail page and use 'Continue to official portal' to apply. ScholarLens always redirects you to the real official portal.";
  }

  // Default
  return "I can help you understand scholarships, eligibility, documents, changes, and application processes. Ask me something specific — like 'Why am I not eligible?' or 'What documents do I need?'";
}

export default function AIGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const pathname = usePathname();
  const { profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    const response = generateResponse(input.trim(), pathname, profile);
    const assistantMsg: Message = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: response,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 hover:shadow-emerald-600/40 md:bottom-6"
        aria-label="Ask ScholarLens"
        title="Ask ScholarLens"
      >
        {isOpen ? <X className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 flex w-[340px] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl md:bottom-20 md:right-4">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-100 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <HelpCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Ask ScholarLens</h3>
              <p className="text-[10px] text-slate-400">Contextual help based on your current page</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "320px" }}>
            {messages.length === 0 ? (
              <div className="py-8 text-center">
                <HelpCircle className="mx-auto h-8 w-8 text-slate-200" />
                <p className="mt-2 text-xs text-slate-400">
                  Ask about scholarships, eligibility, documents, or changes.
                </p>
                <div className="mt-4 space-y-2">
                  {["Why am I not eligible?", "What documents do I need?", "Show alternatives"].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        // Auto-send
                        const userMsg: Message = { id: `msg-${Date.now()}`, role: "user", content: q };
                        const response = generateResponse(q, pathname, profile);
                        const assistantMsg: Message = { id: `msg-${Date.now() + 1}`, role: "assistant", content: response };
                        setMessages((prev) => [...prev, userMsg, assistantMsg]);
                        setInput("");
                      }}
                      className="block w-full rounded-lg border border-slate-100 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-1" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-lg bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
