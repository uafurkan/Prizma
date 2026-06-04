import Link from 'next/link';
import FormatBadge from '@/components/FormatBadge';
import type { DonusumCift } from '@/lib/donusum-data';

interface RelatedGridProps {
  items: DonusumCift[];
  title?: string;
}

export default function RelatedGrid({ items, title = 'İlgili Dönüşümler' }: RelatedGridProps) {
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold font-[family-name:var(--font-syne)] text-[#e8e8f4] mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((d) => (
          <Link
            key={d.slug}
            href={`/${d.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] p-5 hover:border-[#5a5a7a]/50 hover:bg-[#12121e] transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <FormatBadge format={d.from} size="sm" />
              <svg className="w-4 h-4 text-[#5a5a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <FormatBadge format={d.to} size="sm" />
            </div>
            <p className="text-sm text-[#5a5a7a] group-hover:text-[#e8e8f4]/70 transition-colors line-clamp-2">
              {d.aciklama}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
