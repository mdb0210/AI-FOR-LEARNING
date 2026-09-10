import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TextAnswer } from '../../components/answers/TextAnswer';
import { VoiceRecorder } from '../../components/answers/VoiceRecorder';
import { ImageUploader } from '../../components/answers/ImageUploader';
import { ScoreGauge } from '../../components/evaluation/ScoreGauge';
import { MistakePill } from '../../components/evaluation/MistakePill';
import { RubricBreakdown } from '../../components/evaluation/RubricBreakdown';
import {
  FileCheck,
  ArrowLeft,
  Calendar,
  Sparkles,
  Type,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AnswerSubmission } from '../../../server/src/types/index';

export const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Record<string, AnswerSubmission>>({});
  const [answerModes, setAnswerModes] = useState<Record<string, 'text' | 'voice' | 'image'>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await fetch(`/api/student/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAssignment(data.assignment);
          setSubmission(data.submission);
        }
      } catch (err) {
        console.error('Failed to load assignment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id, token]);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submissionList = (assignment?.questions || []).map((q: any) => {
        return (
          answers[q.id] || {
            questionId: q.id,
            answerType: 'text',
            textAnswer: 'Answer provided.',
          }
        );
      });

      const res = await fetch(`/api/student/assignments/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: submissionList }),
      });

      if (res.ok) {
        const json = await res.json();
        setSubmission(json.submission);
        success('Assignment evaluated by AI and submitted successfully!');
      } else {
        const errJson = await res.json();
        error(errJson.error || 'Failed to submit assignment.');
      }
    } catch (err) {
      error('Error submitting assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-12 text-center text-slate-400">Assignment not found.</div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <span>{assignment.subjectTitle}</span>
              <span className="text-slate-600">&bull;</span>
              <span>{assignment.topicTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{assignment.title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{assignment.description}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-right shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Marks</span>
            <span className="text-xl font-mono font-black text-indigo-400">{assignment.totalMarks}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5 flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3" /> Due {new Date(assignment.deadline).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* If Already Submitted / Evaluated, show Results */}
      {submission ? (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Evaluation Complete
              </span>
              <h2 className="text-xl font-bold text-white">Your Submission Results</h2>
              <p className="text-xs text-slate-400">
                Submitted on {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>

            <ScoreGauge
              score={submission.totalScore}
              maxScore={submission.maxScore}
              size="lg"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Question Breakdowns</h3>
            {submission.evaluations?.map((ev: any, idx: number) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-sm text-white">Question {idx + 1}</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {ev.score} / {ev.maxScore} Marks
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{ev.overallFeedback}</p>

                {ev.partEvaluations && <RubricBreakdown partEvaluations={ev.partEvaluations} />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Submission Form */
        <form onSubmit={handleSubmitAssignment} className="space-y-8">
          <div className="space-y-6">
            {assignment.questions?.map((q: any, idx: number) => {
              const qMode = answerModes[q.id] || 'text';

              return (
                <div key={q.id} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                        Q{idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white">{q.title || `Question ${idx + 1}`}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">[{q.points} Marks]</span>
                  </div>

                  <p className="text-sm text-slate-100 font-medium leading-relaxed">{q.question}</p>

                  {/* Mode Selector */}
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
                    <span className="text-slate-400 font-medium">Answer Mode:</span>
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setAnswerModes((prev) => ({ ...prev, [q.id]: 'text' }))}
                        className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
                          qMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Type className="w-3.5 h-3.5" /> Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswerModes((prev) => ({ ...prev, [q.id]: 'voice' }))}
                        className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
                          qMode === 'voice' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" /> Voice
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnswerModes((prev) => ({ ...prev, [q.id]: 'image' }))}
                        className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 ${
                          qMode === 'image' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Diagram
                      </button>
                    </div>
                  </div>

                  {/* Input Based on Mode */}
                  {qMode === 'text' && (
                    <TextAnswer
                      questionType={q.questionType}
                      value={answers[q.id]?.textAnswer || ''}
                      onChange={(val) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: { questionId: q.id, answerType: 'text', textAnswer: val },
                        }))
                      }
                      parts={q.parts}
                      partAnswers={answers[q.id]?.multiPartAnswers}
                      onPartAnswerChange={(pId, val) => {
                        setAnswers((prev) => {
                          const existing = prev[q.id] || { questionId: q.id, answerType: 'text', multiPartAnswers: [] };
                          const parts = [...(existing.multiPartAnswers || [])];
                          const pIdx = parts.findIndex((p) => p.partId === pId);
                          if (pIdx >= 0) parts[pIdx] = { ...parts[pIdx], textAnswer: val };
                          else parts.push({ partId: pId, answerType: 'text', textAnswer: val });
                          return { ...prev, [q.id]: { ...existing, multiPartAnswers: parts } };
                        });
                      }}
                      codeTemplate={q.codeTemplate}
                    />
                  )}

                  {qMode === 'voice' && (
                    <VoiceRecorder
                      onAudioRecorded={(dataUrl, dur, trans) => {
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: {
                            questionId: q.id,
                            answerType: 'voice',
                            voiceDataUrl: dataUrl,
                            voiceDuration: dur,
                            voiceTranscript: trans,
                          },
                        }));
                      }}
                    />
                  )}

                  {qMode === 'image' && (
                    <ImageUploader
                      onImageUploaded={(dataUrl, desc) => {
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: {
                            questionId: q.id,
                            answerType: 'image',
                            imageDataUrl: dataUrl,
                            imageDescription: desc,
                          },
                        }));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Submitting & Evaluating...' : 'Submit Assignment for Evaluation'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
