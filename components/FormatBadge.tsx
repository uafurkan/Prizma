import { getFormatRenk, getTranslatedFormat } from '@/lib/donusum-data';

interface FormatBadgeProps {
  format: string;
  size?: 'sm' | 'md' | 'lg';
  lang?: string;
}

export default function FormatBadge({ format, size = 'md', lang }: FormatBadgeProps) {
  const renk = getFormatRenk(format);

  const sizes = {
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-lg font-mono ${sizes[size]} transition-all`}
      style={{
        color: renk,
        backgroundColor: `color-mix(in srgb, ${renk} 25%, transparent)`,
        border: `1.5px solid color-mix(in srgb, ${renk} 50%, transparent)`,
      }}
    >
      {lang ? getTranslatedFormat(format, lang) : format}
    </span>
  );
}
