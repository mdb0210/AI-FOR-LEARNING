import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TextAnswer } from '../../components/answers/TextAnswer';
import { VoiceRecorder } from '../../components/answers/VoiceRecorder';
import { ImageUploader } from '../../components/answers/ImageUploader';
import { Modal } from '../../components/common/Modal';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Type,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { Question, AnswerSubmission, PartAnswer } from '../../../server/src/types/index';

export const PracticeQuiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTopicId = searchParams.get('topicId') || 'topic-dbms-norm';

  const { token } = useAuth();
  const { error, info } = useToast();
  const navigate = useNavigate();

  // Configuration state
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Assessment runtime state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, AnswerSubmission>>({});
  const [answerModes, setAnswerModes] = useState<Record<string, 'text' | 'voice' | 'image'>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Submission & Privacy modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Fetch subjects & initial questions
  useEffect(() => {
    const loadData = async () => {
      try {
        const subjRes = await fetch('/api/student/subjects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subjRes.ok) {
          const sData = await subjRes.json();
          setSubjects(sData.subjects);
        }

        // Fetch questions for selected topic
        await fetchTopicQuestions(selectedTopicId);
      } catch (err) {
        console.error('Failed to load initial practice data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  const fetchTopicQuestions = async (tId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/topics/${tId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // If topic has pre-seeded practice questions from database
        const pRes = await fetch(`/api/ai/generate-quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            topicTitle: data.topic.title,
            subjectTitle: data.subject?.title,
            difficulty: selectedDifficulty,
            count: questionCount,
          }),
        });

        if (pRes.ok) {
          const pData = await pRes.json();
          setQuestions(pData.questions);
          setCurrentIndex(0);
          setAnswers({});
        }
      }
    } catch (err) {
      error('Failed to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfig(false);
    await fetchTopicQuestions(selectedTopicId);
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentMode = currentQuestion ? answerModes[currentQuestion.id] || 'text' : 'text';

  const setAnswerMode = (qId: string, mode: 'text' | 'voice' | 'image') => {
    setAnswerModes((prev) => ({ ...prev, [qId]: mode }));
  };

  const updateTextAnswer = (qId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        answerType: 'text',
        textAnswer: text,
        multiPartAnswers: prev[qId]?.multiPartAnswers,
      },
    }));
  };

  const updatePartAnswer = (qId: string, partId: string, text: string) => {
    setAnswers((prev) => {
      const existing = prev[qId] || {
        questionId: qId,
        answerType: 'text',
        textAnswer: '',
        multiPartAnswers: [],
      };
      const parts = [...(existing.multiPartAnswers || [])];
      const pIdx = parts.findIndex((p) => p.partId === partId);
      if (pIdx >= 0) {
        parts[pIdx] = { ...parts[pIdx], textAnswer: text };
      } else {
        parts.push({ partId, answerType: 'text', textAnswer: text });
      }
      return {
        ...prev,
        [qId]: { ...existing, multiPartAnswers: parts },
      };
    });
  };

  const updateVoiceAnswer = (qId: string, dataUrl: string, duration: number, transcript: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        answerType: 'voice',
        voiceDataUrl: dataUrl,
        voiceDuration: duration,
        voiceTranscript: transcript,
      },
    }));
  };

  const updateImageAnswer = (qId: string, dataUrl: string, description: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        questionId: qId,
        answerType: 'image',
        imageDataUrl: dataUrl,
        imageDescription: description,
      },
    }));
  };

  // Submit confirmation modal trigger
  const handleOpenSubmitConfirm = () => {
    setIsConfirmModalOpen(true);
  };

  // Explicit AI Submission
  const handleFinalSubmitForEvaluation = async () => {
    setIsConfirmModalOpen(false);
    setIsAnalyzing(true);

    try {
      const submissionList = questions.map((q) => {
        return (
          answers[q.id] || {
            questionId: q.id,
            answerType: 'text',
            textAnswer: '',
          }
        );
      });

      const res = await fetch('/api/student/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topicId: selectedTopicId,
          answers: submissionList,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        // Navigate to dedicated feedback results page
        navigate('/student/feedback', {
          state: {
            result,
            topicTitle: questions[0]?.title || 'Practice Assessment',
            questions,
            answers: submissionList,
          },
        });
      } else {
        const errData = await res.json();
        error(errData.error || 'Evaluation failed.');
      }
    } catch (err) {
      error('Error during AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-80 bg-slate-900 rounded-3xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              AI Practice & Assessment
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Multi-Format Assessment Studio</h1>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 self-start"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Configure Quiz</span>
        </button>
      </div>

      {/* Quiz Configuration Drawer */}
      {showConfig && (
        <form
          onSubmit={handleGenerateCustomQuiz}
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-white">Customize Your Practice Session</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Topic</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {subjects.flatMap((s) => s.topics || []).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={2}>2 Questions (Quick)</option>
                <option value={3}>3 Questions (Standard)</option>
                <option value={5}>5 Questions (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md"
            >
              Generate Practice Questions &rarr;
            </button>
          </div>
        </form>
      )}

      {/* Question Progress Dots */}
      <div className="flex items-center gap-2">
        {questions.map((q, idx) => {
          const hasAnswer =
            answers[q.id]?.textAnswer ||
            answers[q.id]?.voiceDataUrl ||
            answers[q.id]?.imageDataUrl ||
            answers[q.id]?.multiPartAnswers?.some((p) => p.textAnswer);

          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-indigo-500'
                  : hasAnswer
                  ? 'bg-emerald-500/80'
                  : 'bg-slate-800'
              }`}
              title={`Question ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          {/* Question Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black text-sm flex items-center justify-center">
                Q{currentIndex + 1}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {currentQuestion.questionType.toUpperCase()}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{currentQuestion.title}</h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-400">
              [{currentQuestion.points} Marks]
            </span>
          </div>

          {/* Question Text */}
          <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
            {currentQuestion.question}
          </div>

          {/* MCQ Option Radio Group (if questionType is MCQ) */}
          {currentQuestion.questionType === 'mcq' && currentQuestion.options && (
            <div className="space-y-2.5 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id]?.textAnswer === option;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateTextAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{option}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Answer Mode Selector Tabs (For open-ended questions) */}
          {currentQuestion.questionType !== 'mcq' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400">Answer Format:</span>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setAnswerMode(currentQuestion.id, 'text')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                      currentMode === 'text'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Type Answer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnswerMode(currentQuestion.id, 'voice')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                      currentMode === 'voice'
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Record Voice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnswerMode(currentQuestion.id, 'image')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                      currentMode === 'image'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload / Diagram</span>
                  </button>
                </div>
              </div>

              {/* Mode 1: Text Input */}
              {currentMode === 'text' && (
                <TextAnswer
                  questionType={currentQuestion.questionType}
                  value={answers[currentQuestion.id]?.textAnswer || ''}
                  onChange={(val) => updateTextAnswer(currentQuestion.id, val)}
                  parts={currentQuestion.parts}
                  partAnswers={answers[currentQuestion.id]?.multiPartAnswers}
                  onPartAnswerChange={(pId, val) => updatePartAnswer(currentQuestion.id, pId, val)}
                  codeTemplate={currentQuestion.codeTemplate}
                />
              )}

              {/* Mode 2: Voice Input */}
              {currentMode === 'voice' && (
                <VoiceRecorder
                  initialAudioUrl={answers[currentQuestion.id]?.voiceDataUrl}
                  initialTranscript={answers[currentQuestion.id]?.voiceTranscript}
                  onAudioRecorded={(dataUrl, duration, transcript) =>
                    updateVoiceAnswer(currentQuestion.id, dataUrl, duration, transcript)
                  }
                />
              )}

              {/* Mode 3: Image / Diagram Upload */}
              {currentMode === 'image' && (
                <ImageUploader
                  initialImageDataUrl={answers[currentQuestion.id]?.imageDataUrl}
                  initialDescription={answers[currentQuestion.id]?.imageDescription}
                  onImageUploaded={(dataUrl, desc) =>
                    updateImageAnswer(currentQuestion.id, dataUrl, desc)
                  }
                />
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Question</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenSubmitConfirm}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit for Evaluation</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal — Enforcing Explicit AI Privacy */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Submission for AI Evaluation"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>
              <strong>Explicit Privacy Rule:</strong> Your answers are only evaluated when you confirm. They will be analyzed against formal rubrics to classify mistakes and generate revision advice.
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Ready to submit your multi-format answers for AI grading? You will receive a detailed score breakdown, mistake classification, and targeted revision recommendations.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Review Answers
            </button>
            <button
              onClick={handleFinalSubmitForEvaluation}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze My Answers</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* AI Analyzing Loading Screen */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 text-center space-y-4 max-w-sm shadow-2xl">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-white">Analyzing your answer...</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluating conceptual correctness, checking multi-part rubrics, scanning code logic, and diagnosing mistake types...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
