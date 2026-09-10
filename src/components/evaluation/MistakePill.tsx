import React from 'react';
import { MistakeType } from '../../../server/src/types/index';
import { AlertTriangle, Code, Brain, Calculator, HelpCircle } from 'lucide-react';

interface MistakePillProps {
  type: MistakeType;
  count?: number;
}

export const MistakePill: React.FC<MistakePillProps> = ({ type, count }) => {
  const config = {
    Conceptual: {
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      icon: Brain,
      label: 'Conceptual Mistake',
    },
    Syntax: {
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      icon: Code,
      label: 'Syntax Error',
    },
    Logic: {
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      label: 'Logic Bug',
    },
    Calculation: {
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: Calculator,
      label: 'Calculation Error',
    },
    Incomplete: {
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
      icon: HelpCircle,
      label: 'Incomplete Work',
    },
  }[type] || {
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: AlertTriangle,
    label: type,
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {count !== undefined && (
        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px] font-mono">
          {count}
        </span>
      )}
    </span>
  );
};
