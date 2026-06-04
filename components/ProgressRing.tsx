'use client';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ progress, size = 120, strokeWidth = 6 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1c1c2e"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#prismGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="prismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="20%" stopColor="#ff8c42" />
            <stop offset="40%" stopColor="#ffd166" />
            <stop offset="60%" stopColor="#06d6a0" />
            <stop offset="80%" stopColor="#4d9fff" />
            <stop offset="100%" stopColor="#b56cff" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold font-[family-name:var(--font-jetbrains)] text-[#e8e8f4]">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}
