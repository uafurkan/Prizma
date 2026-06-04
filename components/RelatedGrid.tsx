import Link from 'next/link';
import FormatBadge from '@/components/FormatBadge';
import type { DonusumCift } from '@/lib/donusum-data';

export interface RelatedGridProps {
  items: DonusumCift[];
  title?: string;
  lang: string;
}

export default function RelatedGrid({ items, title = "Diğer Dönüşümler", lang }: RelatedGridProps) {
  if (!items.length) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl md:text-2xl font-bold font-sans text-center md:text-left">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => {
          const aciklama = d.aciklama[lang as 'en'|'tr'] || d.aciklama['en'];
          return (
            <Link
              key={d.slug}
              href={`/${lang}/${d.slug}`}
              className="group flex flex-col p-4 rounded-xl border border-border bg-surface2 hover:border-muted/50 hover:bg-[#1a1a2e] transition-colors gap-3"
            >
            <div className="flex items-center gap-3 mb-3">
              <FormatBadge format={d.from} size="sm" />
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <FormatBadge format={d.to} size="sm" />
            </div>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              {aciklama}
            </p>
          </Link>
        );
        })}
      </div>
    </section>
  );
}
