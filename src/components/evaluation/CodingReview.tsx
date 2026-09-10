import React from 'react';
import { CodingEvaluationDetails } from '../../../server/src/types/index';
import { CheckCircle2, Bug, HelpCircle, Lightbulb, Code2 } from 'lucide-react';

interface CodingReviewProps {
  details: CodingEvaluationDetails;
  maxScore?: number;
}

export const CodingReview: React.FC<CodingReviewProps> = ({ details, maxScore = 10 }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Automated Code Analysis</h4>
            <p className="text-xs text-slate-400">Static AST and logic evaluation</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-medium">Code Score</span>
          <span className="text-lg font-mono font-black text-emerald-400">
            {details.codeScore} / {maxScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What Works */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>What Works</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {details.whatWorks.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bugs Found */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Bug className="w-4 h-4" />
            <span>Bugs & Deficiencies</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {details.bugsFound.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">&bull;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Why It Is Wrong & Fix */}
      <div className="space-y-3 pt-2">
        {details.whyItIsWrong && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" /> Why This Fails Test Cases:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{details.whyItIsWrong}</p>
          </div>
        )}

        {details.suggestedImprovement && (
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-indigo-400" /> Suggested Refactoring:
            </span>
            <p className="text-xs text-indigo-200 leading-relaxed font-mono">
              {details.suggestedImprovement}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
