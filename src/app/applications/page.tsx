"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { scholarships } from "@/data/scholarships";
import AuthLayout from "@/components/layout/AuthLayout";
import Badge from "@/components/ui/Badge";
import { ApplicationStatus } from "@/lib/types";
import {
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";

interface TrackedApplication {
  id: string;
  scholarshipId: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "scholarlens-applications";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: "saved", label: "Saved", color: "bg-slate-100 text-slate-600" },
  { value: "preparing", label: "Preparing", color: "bg-blue-100 text-blue-600" },
  { value: "documents-pending", label: "Documents pending", color: "bg-amber-100 text-amber-600" },
  { value: "applied", label: "Applied", color: "bg-purple-100 text-purple-600" },
  { value: "submitted", label: "Submitted", color: "bg-emerald-100 text-emerald-600" },
  { value: "closed", label: "Closed", color: "bg-red-100 text-red-500" },
];

function getStoredApplications(): TrackedApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: TrackedApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export default function ApplicationsPage() {
  return (
    <AuthLayout>
      <ApplicationsContent />
    </AuthLayout>
  );
}

function ApplicationsContent() {
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setApplications(getStoredApplications());
  }, []);

  const updateStatus = (id: string, status: ApplicationStatus) => {
    const updated = applications.map((app) =>
      app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
    );
    setApplications(updated);
    saveApplications(updated);
  };

  const deleteApp = (id: string) => {
    const updated = applications.filter((app) => app.id !== id);
    setApplications(updated);
    saveApplications(updated);
  };

  const addApplication = (scholarshipId: string) => {
    const newApp: TrackedApplication = {
      id: `app-${Date.now()}`,
      scholarshipId,
      status: "saved",
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...applications, newApp];
    setApplications(updated);
    saveApplications(updated);
    setShowAddModal(false);
  };

  // Filter out already tracked scholarships for add modal
  const trackedIds = new Set(applications.map((a) => a.scholarshipId));
  const available = scholarships.filter(
    (s) => s.isActive && !trackedIds.has(s.id)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            <FileText className="h-7 w-7 text-emerald-600" />
            Applications
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track your scholarship application progress.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Status Legend */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <span
            key={opt.value}
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${opt.color}`}
          >
            {opt.label}
          </span>
        ))}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-200" />
          <p className="mt-4 text-lg font-medium text-slate-500">
            No applications tracked yet
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Save scholarships from Discover to start tracking.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add scholarship to track
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const scholarship = scholarships.find((s) => s.id === app.scholarshipId);
            if (!scholarship) return null;

            return (
              <div
                key={app.id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/scholarships/${scholarship.id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-emerald-700"
                  >
                    {scholarship.name}
                  </Link>
                  <p className="text-xs text-slate-500">{scholarship.provider}</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <a
                    href={scholarship.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    title="Open official portal"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    onClick={() => deleteApp(app.id)}
                    className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[70vh] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-900">
              Add scholarship to track
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Select a scholarship to add to your application tracker.
            </p>
            <div className="mt-4 flex-1 overflow-y-auto space-y-2">
              {available.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  All available scholarships are already being tracked.
                </p>
              ) : (
                available.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => addApplication(s.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.provider}</p>
                    </div>
                    <Plus className="h-4 w-4 text-slate-300" />
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
