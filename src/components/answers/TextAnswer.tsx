import React from 'react';
import { QuestionType, QuestionPart, PartAnswer } from '../../../server/src/types/index';
import { Code2, Type, ListOrdered } from 'lucide-react';

interface TextAnswerProps {
  questionType: QuestionType;
  value: string;
  onChange: (val: string) => void;
  parts?: QuestionPart[];
  partAnswers?: PartAnswer[];
  onPartAnswerChange?: (partId: string, val: string) => void;
  codeTemplate?: string;
}

export const TextAnswer: React.FC<TextAnswerProps> = ({
  questionType,
  value,
  onChange,
  parts,
  partAnswers,
  onPartAnswerChange,
  codeTemplate,
}) => {
  // If multi-part question, render dedicated inputs per part!
  if (questionType === 'multi-part' && parts && parts.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
          <ListOrdered className="w-4 h-4" />
          <span>Multi-Part Response: Type your answer for each individual section</span>
        </div>

        {parts.map((part) => {
          const currentVal = partAnswers?.find((p) => p.partId === part.id)?.textAnswer || '';
          return (
            <div key={part.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Part {part.partLetter}: {part.question}</span>
                <span className="text-slate-400 font-mono">[{part.points} marks]</span>
              </div>
              <textarea
                value={currentVal}
                onChange={(e) => onPartAnswerChange?.(part.id, e.target.value)}
                placeholder={`Type your answer for Part ${part.partLetter}...`}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              />
            </div>
          );
        })}
      </div>
    );
  }

  // If coding question, render code-editor style interface
  if (questionType === 'coding') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <Code2 className="w-4 h-4" /> Python Code Editor
          </span>
          <span>Indentation: 4 spaces</span>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
            <span>solution.py</span>
            <span className="text-[11px] text-slate-500">{value.length} characters</span>
          </div>
          <textarea
            value={value || codeTemplate || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="# Write your Python solution here..."
            rows={10}
            spellCheck={false}
            className="w-full bg-transparent p-4 text-sm text-emerald-300 placeholder-slate-600 focus:outline-none font-mono leading-relaxed resize-y"
          />
        </div>
      </div>
    );
  }

  // If one-line question, render clean single line input
  if (questionType === 'one-line') {
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-400" /> One-Line Concise Answer
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a 1-2 sentence precise technical answer..."
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>
    );
  }

  // Default short/long/conceptual textarea
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Detailed Technical Explanation</span>
        <span>{value.length} characters</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your explanation, steps, reasoning, or breakdown..."
        rows={6}
        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans leading-relaxed"
      />
    </div>
  );
};
