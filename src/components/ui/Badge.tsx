import { ReactNode } from "react";

type BadgeVariant = "verified" | "warning" | "demo" | "info" | "success" | "danger" | "default";

const variantStyles: Record<BadgeVariant, string> = {
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  demo: "bg-slate-50 text-slate-600 ring-slate-500/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20",
  default: "bg-slate-50 text-slate-600 ring-slate-500/20",
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
