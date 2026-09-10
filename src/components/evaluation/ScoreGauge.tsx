import React from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  maxScore,
  size = 'md',
}) => {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const colorClass =
    percentage >= 80
      ? 'text-emerald-400 stroke-emerald-500'
      : percentage >= 60
      ? 'text-amber-400 stroke-amber-500'
      : 'text-rose-400 stroke-rose-500';

  const bgRingClass =
    percentage >= 80
      ? 'stroke-emerald-950/60'
      : percentage >= 60
      ? 'stroke-amber-950/60'
      : 'stroke-rose-950/60';

  const dimensions = {
    sm: { size: 64, stroke: 6, text: 'text-sm', label: 'text-[9px]' },
    md: { size: 96, stroke: 8, text: 'text-xl', label: 'text-xs' },
    lg: { size: 128, stroke: 10, text: 'text-3xl', label: 'text-sm' },
  }[size];

  const radius = (dimensions.size - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dimensions.size} height={dimensions.size} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={dimensions.stroke}
          className={bgRingClass}
        />
        {/* Progress stroke */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={dimensions.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${colorClass}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`font-black font-mono tracking-tight leading-none ${dimensions.text} text-white`}>
          {percentage}%
        </span>
        <span className={`font-semibold text-slate-400 mt-0.5 leading-none ${dimensions.label}`}>
          {score}/{maxScore}
        </span>
      </div>
    </div>
  );
};
