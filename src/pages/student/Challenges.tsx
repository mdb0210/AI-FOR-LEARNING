import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TextAnswer } from '../../components/answers/TextAnswer';
import { VoiceRecorder } from '../../components/answers/VoiceRecorder';
import { Zap, Clock, Flame, Award, CheckCircle2, Sparkles, Mic, Type } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Challenges: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [answerMode, setAnswerMode] = useState<'text' | 'voice'>('text');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [voiceUrl, setVoiceUrl] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch('/api/student/challenges/today', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChallenge(data.challenge);
        }
      } catch (err) {
        console.error('Failed to load challenge:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [token]);

  const handleCompleteChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/student/challenges/${challenge.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answer: {
            questionId: challenge.question.id,
            answerType: answerMode,
            textAnswer: answerMode === 'text' ? textAnswer : undefined,
            voiceDataUrl: answerMode === 'voice' ? voiceUrl : undefined,
            voiceTranscript: answerMode === 'voice' ? voiceTranscript : undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluationResult(data.evalResult);
        setChallenge((prev: any) => ({ ...prev, isCompleted: true }));
        success(data.message || 'Challenge completed!');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        error('Failed to submit challenge answer.');
      }
    } catch (err) {
      error('Error completing challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="h-64 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Zap className="w-4 h-4" /> Gamified Habit Building
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Daily Learning Challenge</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Solve a quick 60-second problem daily to keep your streak ablaze and earn leaderboard points
        </p>
      </div>

      {challenge && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-indigo-400">
                  {challenge.subject} &bull; {challenge.topic}
                </span>
                <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-400 block">+{challenge.points} Points</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3 h-3" /> {challenge.timeLimitSeconds}s Limit
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Prompt</span>
            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              {challenge.question.question}
            </p>
          </div>

          {challenge.isCompleted ? (
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Challenge Completed for Today!</h4>
              <p className="text-xs text-slate-300">
                You scored and added +{challenge.points} points to your total. Come back tomorrow for the next challenge!
              </p>
              {evaluationResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs text-slate-200">
                  <strong>AI Evaluation:</strong> {evaluationResult.overallFeedback}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCompleteChallenge} className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Choose Submission Mode:</span>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAnswerMode('text')}
                    className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
                      answerMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" /> Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswerMode('voice')}
                    className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
                      answerMode === 'voice' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> Voice (60s)
                  </button>
                </div>
              </div>

              {answerMode === 'text' ? (
                <textarea
                  required
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Explain the solution concisely..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              ) : (
                <VoiceRecorder
                  onAudioRecorded={(dataUrl, dur, trans) => {
                    setVoiceUrl(dataUrl);
                    setVoiceTranscript(trans);
                  }}
                />
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submitting ? 'Analyzing & Scoring...' : 'Submit 60s Challenge'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
