import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ConfidenceBadge({ score }) {
  const percentage = Math.round(score * 100);

  if (score >= 0.8) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
        <CheckCircle2 size={12} className="text-emerald-500" />
        <span>{percentage}% High</span>
      </span>
    );
  } else if (score >= 0.6) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/50">
        <AlertTriangle size={12} className="text-amber-500 animate-pulse-slow" />
        <span>{percentage}% Medium</span>
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/50">
        <ShieldAlert size={12} className="text-rose-500 animate-pulse-slow" />
        <span>{percentage}% Low</span>
      </span>
    );
  }
}
