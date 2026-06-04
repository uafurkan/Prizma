import { getFormatRenk } from '@/lib/donusum-data';

interface FormatBadgeProps {
  format: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FormatBadge({ format, size = 'md' }: FormatBadgeProps) {
  const renk = getFormatRenk(format);

  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg font-[family-name:var(--font-jetbrains)] ${sizes[size]} transition-all`}
      style={{
        color: renk,
        backgroundColor: `${renk}15`,
        border: `1px solid ${renk}30`,
      }}
    >
      {format}
    </span>
  );
}
