import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Brain,
  Mic,
  Image as ImageIcon,
  CheckCircle2,
  Lock,
  Flame,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Trophy,
  BarChart3,
  Lightbulb,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoStudent = async () => {
    await loginAsDemo('student1');
    navigate('/student/dashboard');
  };

  const handleDemoTeacher = async () => {
    await loginAsDemo('teacher');
    navigate('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-violet-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top Tag / Hackathon Theme */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Hackathon Theme: AI For Learning &bull; LearnVault AI</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          LEARN IT YOUR WAY.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
            ANSWER IT YOUR WAY.
          </span>{' '}
          REMEMBER IT YOUR WAY.
        </h1>

        {/* Supporting Text */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
          An AI-powered learning platform that helps students understand concepts, practice through
          different types of assessments, learn from mistakes, track their progress, and preserve
          their own understanding for future revision.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            to="/student-login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/teacher-login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base transition-all hover:border-slate-600 flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span>Teacher Portal</span>
          </Link>
        </div>

        {/* Quick Demo Instant Access Buttons */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 max-w-2xl mx-auto backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" /> 1-Click Hackathon Demo Access:
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDemoStudent}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-semibold transition-all"
            >
              Demo Student (STU1001)
            </button>
            <button
              onClick={handleDemoTeacher}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold transition-all"
            >
              Demo Teacher (TCH1001)
            </button>
          </div>
        </div>

        {/* VISUAL LEARNING CYCLE */}
        <div className="mt-20 pt-10 border-t border-slate-900">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6">
            The Complete LearnVault Learning Cycle
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'LEARN', desc: 'AI explains & grounds concepts' },
              { step: '2', title: 'PRACTICE', desc: 'Text, voice & image questions' },
              { step: '3', title: 'AI FEEDBACK', desc: 'Rubric & mistake classification' },
              { step: '4', title: 'TRACK', desc: 'Weak areas & streaks analytics' },
              { step: '5', title: 'REMEMBER', desc: 'Private Personal Memory Vault', highlight: true },
              { step: '6', title: 'REVISE', desc: 'Smart targeted spaced reviews' },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  item.highlight
                    ? 'bg-gradient-to-b from-indigo-950 to-violet-950 border-indigo-500/50 shadow-lg shadow-indigo-950/50 scale-105'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full text-xs font-bold mx-auto mb-2 flex items-center justify-center ${
                    item.highlight
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.step}
                </div>
                <h4 className={`text-sm font-black tracking-wide ${
                  item.highlight ? 'text-indigo-200' : 'text-white'
                }`}>
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1. Problem & 2. Solution Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem */}
          <div className="p-8 rounded-3xl bg-rose-950/10 border border-rose-500/20 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
              !
            </div>
            <h3 className="text-xl font-bold text-white">The Real Problem with Learning</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              “Students often learn concepts, complete assessments, forget what they understood, and
              repeatedly start from the beginning. Traditional learning platforms measure answers, but
              rarely preserve how a student personally understood a concept.”
            </p>
            <div className="text-xs text-rose-400 font-mono font-medium">
              Traditional Platforms: LEARN &rarr; TEST &rarr; SCORE (Forget)
            </div>
          </div>

          {/* Solution */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl shadow-indigo-950/20">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">The LearnVault Solution</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              “LearnVault AI combines AI-powered learning and assessment with a private personal
              knowledge vault where students can preserve their own understanding and revisit it
              whenever needed.”
            </p>
            <div className="text-xs text-indigo-300 font-mono font-medium">
              LearnVault: LEARN &rarr; PRACTICE &rarr; AI FEEDBACK &rarr; TRACK &rarr; REMEMBER &rarr; REVISE
            </div>
          </div>
        </div>
      </section>

      {/* 4. AI-Powered Learning & 5. Multi-Format Assessment */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Engineered For True Conceptual Mastery
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Structured AI Explanations & Multi-Format Assessments
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Not just another chatbot. A structured pedagogical flow that measures how you think,
            diagnoses why you make mistakes, and guides you forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Multi-Format Submission */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Mic className="w-5 h-5 text-violet-400" />
              <ImageIcon className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Multi-Format Input</span>
            </div>
            <h3 className="text-lg font-bold text-white">Type, Speak, or Sketch</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Never be forced to summarize everything into a tiny textbox. Type code in a dedicated
              editor, record your verbal reasoning with speech analysis, or upload photos of
              handwritten math and ER diagrams.
            </p>
          </div>

          {/* Card 2: Meaningful AI Evaluation */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Beyond Keywords</span>
            </div>
            <h3 className="text-lg font-bold text-white">Rubric & Mistake Classification</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI evaluates conceptual understanding and isolates mistake types: Conceptual,
              Syntax, Logic, Calculation, or Incomplete. Multi-part questions are scored
              per-part, highlighting your weakest sub-section.
            </p>
          </div>

          {/* Card 3: Memory Vault Differentiator */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/40 space-y-4 shadow-xl shadow-indigo-950/30">
            <div className="flex items-center gap-2 text-amber-300">
              <Lock className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Core Differentiator</span>
            </div>
            <h3 className="text-lg font-bold text-white">Personal Memory Vault</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your personal explanation belongs to you. Save text, voice recordings, or diagram photos
              to your private vault. Strictly hidden from teachers, peers, and automatic AI harvesting.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Memory Vault Feature Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-900">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/30 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>🔒 PRIVATE — ONLY YOU CAN SEE THIS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            “AI can explain a topic to you, but only you know how you understood it.”
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            When you finally understand normalization, recursion, or deadlocks, capture that exact
            spark of understanding. Save your mental model as a voice memo, diagram snapshot, or
            personal note. Revisit it months later before your exams.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Not automatically sent to AI</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Never visible to teachers</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Never visible to other students</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final Hackathon Statement & CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center border-t border-slate-900 space-y-8">
        <div className="space-y-4">
          <p className="text-lg sm:text-xl text-slate-300 italic max-w-2xl mx-auto leading-relaxed">
            “AI can teach you. AI can test you. AI can tell you where you went wrong.<br />
            <strong className="text-white font-bold not-italic">
              But your understanding is yours.
            </strong><br />
            LearnVault helps you capture that understanding and keep it for the day you need it again.”
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/student-login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Launch Student Portal
          </Link>
          <Link
            to="/teacher-login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-base transition-all"
          >
            Launch Teacher Portal
          </Link>
        </div>
      </section>
    </div>
  );
};
