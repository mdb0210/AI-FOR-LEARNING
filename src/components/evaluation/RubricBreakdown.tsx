import React from 'react';
import { PartEvaluation } from '../../../server/src/types/index';
import { CheckCircle2, AlertCircle, ArrowDownRight } from 'lucide-react';

interface RubricBreakdownProps {
  partEvaluations: PartEvaluation[];
}

export const RubricBreakdown: React.FC<RubricBreakdownProps> = ({ partEvaluations }) => {
  if (!partEvaluations || partEvaluations.length === 0) return null;

  // Identify weakest part
  const weakest = [...partEvaluations].sort(
    (a, b) => a.score / a.maxScore - b.score / b.maxScore
  )[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Multi-Part Score Breakdown</h4>
        {weakest && (
          <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            Weakest: Part {weakest.partLetter} ({weakest.score}/{weakest.maxScore})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {partEvaluations.map((part) => {
          const isWeak = part.partId === weakest?.partId;
          const percentage = Math.round((part.score / part.maxScore) * 100);

          return (
            <div
              key={part.partId}
              className={`p-4 rounded-xl border transition-all ${
                isWeak
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">Part {part.partLetter}</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                    percentage >= 80
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : percentage >= 50
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {part.score} / {part.maxScore} ({percentage}%)
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-2 leading-relaxed">{part.feedback}</p>

              {part.strengths.length > 0 && (
                <div className="flex items-start gap-1.5 text-[11px] text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{part.strengths[0]}</span>
                </div>
              )}

              {part.missingPoints.length > 0 && (
                <div className="flex items-start gap-1.5 text-[11px] text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{part.missingPoints[0]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
