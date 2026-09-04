// Shared line-style icon set. Stroke-based, currentColor, no emoji —
// keeps every icon on-brand with the prism palette instead of OS emoji fonts.

export type IconProps = React.SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

// --- Category icons (lib/donusum-data.ts KategoriSlug) ---

export function ImageIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.75" />
      <path d="M21 16l-5.5-5.5a1.5 1.5 0 00-2.12 0L4 19" />
    </svg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="M16 10.5l5-3v9l-5-3" />
    </svg>
  );
}

export function AudioIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 18V5l10-2v13" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  );
}

export function ArchiveIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
      <path d="M5 8.5v10a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5v-10" />
      <path d="M10 12.5h4" />
    </svg>
  );
}

export function SubtitleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
      <path d="M6.5 14.5h4M12.5 14.5h5M6.5 11h11" />
    </svg>
  );
}

export function TranscriptionIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0" />
      <path d="M12 17.5V21M9 21h6" />
    </svg>
  );
}

export const CATEGORY_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  goruntu: ImageIcon,
  video: VideoIcon,
  ses: AudioIcon,
  belge: DocumentIcon,
  arsiv: ArchiveIcon,
  altyazi: SubtitleIcon,
  desifre: TranscriptionIcon,
};

// --- Status / decorative icons ---

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12.5 2.5L4 14h6.5l-1 7.5L20 10h-6.5l-1-7.5z" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l7 3v5.5c0 4.6-2.98 8.55-7 9.5-4.02-.95-7-4.9-7-9.5V6l7-3z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.5h.01" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={props.strokeWidth ?? 2.5}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PackageIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7L12 2.5z" strokeLinejoin="round" />
      <path d="M3.5 7L12 11.5 20.5 7M12 11.5V21.5" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12C3.75 7.94 7.54 5 12 5c4.48 0 8.27 2.94 9.5 7-1.23 4.06-5.02 7-9.5 7-4.46 0-8.25-2.94-9.5-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export const PREVIEW_ICONS: Record<'text' | 'document' | 'pdf' | 'audio' | 'video', (props: IconProps) => React.JSX.Element> = {
  text: TranscriptionIcon,
  document: DocumentIcon,
  pdf: DocumentIcon,
  audio: AudioIcon,
  video: VideoIcon,
};
