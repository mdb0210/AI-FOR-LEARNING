import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ScoreGauge } from '../../components/evaluation/ScoreGauge';
import { MistakePill } from '../../components/evaluation/MistakePill';
import { RubricBreakdown } from '../../components/evaluation/RubricBreakdown';
import { CodingReview } from '../../components/evaluation/CodingReview';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Brain,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Lock,
  Flame,
  Award,
  Lightbulb,
} from 'lucide-react';
import { Evaluation, Question } from '../../../server/src/types/index';

export const EvaluationFeedback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { success, error } = useToast();

  const state = location.state as {
    result?: {
      evaluations: Evaluation[];
      score: number;
      maxScore: number;
      percentage: number;
    };
    topicTitle?: string;
    questions?: Question[];
  };

  const [savingToVault, setSavingToVault] = useState<boolean>(false);
  const [savedVaultSuccess, setSavedVaultSuccess] = useState<boolean>(false);

  // If accessed directly without state, show realistic sample feedback for Normalization!
  const evaluations: Evaluation[] = state?.result?.evaluations || [
    {
      id: 'eval-demo-1',
      submissionId: 'sub-demo-1',
      studentId: 'STU1001',
      assessmentId: 'practice-dbms-norm',
      score: 7.5,
      maxScore: 10,
      percentage: 75,
      overallFeedback: 'Good conceptual grasp of database normalization, but you struggled with transitive dependencies.',
      strengths: [
        'You correctly explained the core purpose of normalization is reducing data redundancy.',
        'Accurately defined First Normal Form (1NF) atomic values rule.',
      ],
      missingPoints: [
        'You did not clearly explain transitive dependency in Third Normal Form.',
        'Did not state why 2NF is automatically satisfied if the primary key is single-column.',
      ],
      mistakes: [
        'Stated that transitive dependencies occur between candidate keys instead of non-prime attributes.',
      ],
      mistakeTypes: ['Conceptual'],
      improvementSuggestions: [
        'Revise 2NF and 3NF with functional dependency examples.',
        'Always verify if a determinant is a superkey when checking for BCNF.',
      ],
      revisionRecommendation: {
        topic: 'Normalization',
        topicId: 'topic-dbms-norm',
        reason: 'You scored 75% and made 1 conceptual mistake on transitive dependencies.',
        priority: 'high',
      },
      submittedAt: new Date().toISOString(),
    },
  ];

  const totalScore = state?.result?.score !== undefined ? state.result.score : 7.5;
  const maxScore = state?.result?.maxScore !== undefined ? state.result.maxScore : 10;
  const percentage = state?.result?.percentage !== undefined ? state.result.percentage : 75;
  const topicTitle = state?.topicTitle || 'Normalization (1NF, 2NF, 3NF, BCNF)';

  // "Save a copy to My Revision" -> Directly saves to Memory Vault!
  const handleSaveToRevision = async () => {
    setSavingToVault(true);
    try {
      const notesContent = `AI FEEDBACK SUMMARY FOR ${topicTitle}:\n\n` +
        `Score: ${totalScore}/${maxScore} (${percentage}%)\n\n` +
        `Strengths:\n${evaluations.flatMap((e) => e.strengths).map((s) => `• ${s}`).join('\n')}\n\n` +
        `Concepts to Review:\n${evaluations.flatMap((e) => e.missingPoints).map((m) => `• ${m}`).join('\n')}\n\n` +
        `Improvement Action:\n${evaluations.flatMap((e) => e.improvementSuggestions).map((i) => `• ${i}`).join('\n')}`;

      const res = await fetch('/api/student/memory-vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: 'topic-dbms-norm',
          topicTitle,
          title: `Revision Copy: ${topicTitle} Feedback`,
          contentType: 'text',
          textContent: notesContent,
          notes: 'Saved automatically from AI evaluation for targeted spaced revision.',
        }),
      });

      if (res.ok) {
        success('Saved privately to your Memory Vault.');
        setSavedVaultSuccess(true);
      } else {
        error('Could not save revision copy.');
      }
    } catch (err) {
      error('Failed to save to Memory Vault.');
    } finally {
      setSavingToVault(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Evaluation Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{topicTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Evaluation generated against formal rubrics. Strengths, mistakes, and revision advice below.
          </p>
        </div>

        {/* Score Gauge */}
        <div className="shrink-0 flex flex-col items-center">
          <ScoreGauge score={totalScore} maxScore={maxScore} size="lg" />
          <span className="text-xs font-semibold text-slate-400 mt-2">
            {percentage >= 80 ? 'Mastery Level' : percentage >= 60 ? 'Passing - Revision Advised' : 'Needs Practice'}
          </span>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <Link
            to="/student/quiz/practice"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Again</span>
          </Link>

          <Link
            to="/student/learn"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Revise Topic</span>
          </Link>
        </div>

        {/* The Crucial "Save to My Revision" Action */}
        <button
          onClick={handleSaveToRevision}
          disabled={savingToVault || savedVaultSuccess}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            savedVaultSuccess
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{savedVaultSuccess ? '✓ Saved to Memory Vault' : 'Save a copy to My Revision'}</span>
        </button>
      </div>

      {/* Detailed Question Evaluations */}
      <div className="space-y-6">
        {evaluations.map((ev, idx) => (
          <div
            key={ev.id || idx}
            className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <h3 className="text-base font-bold text-white">Question Evaluation</h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {ev.mistakeTypes?.map((mt, mIdx) => (
                    <MistakePill key={mIdx} type={mt} />
                  ))}
                </div>
                <span className="text-sm font-mono font-bold text-indigo-400">
                  {ev.score} / {ev.maxScore}
                </span>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {ev.overallFeedback}
            </div>

            {/* Strengths & Missing Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* What you did well */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> What You Did Well
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {ev.strengths?.map((str, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What you missed */}
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> What You Missed
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {ev.missingPoints?.map((mis, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">&bull;</span>
                      <span>{mis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Multi-Part Breakdown if present */}
            {ev.partEvaluations && <RubricBreakdown partEvaluations={ev.partEvaluations} />}

            {/* Coding Review Details if present */}
            {ev.codingDetails && <CodingReview details={ev.codingDetails} maxScore={ev.maxScore} />}

            {/* How to Improve & Revision Recommendation */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" /> How To Improve
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {ev.improvementSuggestions?.map((sug, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>

              {ev.revisionRecommendation && (
                <div className="pt-2 border-t border-slate-800/80 text-xs flex items-center justify-between text-slate-400">
                  <span>
                    <strong>Suggested Spaced Revision:</strong> {ev.revisionRecommendation.reason}
                  </span>
                  <Link
                    to="/student/memory-vault"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Open Vault &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
