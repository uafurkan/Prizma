import type { Dictionary } from '@/dictionaries';
import { ShieldIcon } from '@/components/icons';

interface TrustPanelProps {
  dict: Dictionary;
}

export default function TrustPanel({ dict }: TrustPanelProps) {
  return (
    <div className="w-full rounded-2xl border border-prism-g/20 bg-gradient-to-br from-prism-g/5 via-surface to-prism-b/5 p-5 flex items-start gap-4 animate-fade-in">
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 rounded-full bg-prism-g/20 blur-md animate-pulse" />
        <div className="relative w-11 h-11 rounded-full bg-surface border border-prism-g/30 flex items-center justify-center text-prism-g">
          <ShieldIcon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 text-left">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2 flex-wrap">
          {dict.security.processingTitle}
          <span className="text-[10px] font-mono text-prism-g bg-prism-g/10 border border-prism-g/20 rounded-full px-2 py-0.5 whitespace-nowrap">
            {dict.security.processingBadge}
          </span>
        </h4>
        <p className="text-xs text-muted leading-relaxed">
          {dict.security.processingDesc}
        </p>
      </div>
    </div>
  );
}
