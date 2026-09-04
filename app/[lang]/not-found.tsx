import Link from 'next/link';
import { KATEGORILER, getCategoryPath } from '@/lib/donusum-data';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-20 px-4 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="text-7xl font-black tracking-tight bg-gradient-to-r from-prism-r via-prism-o via-prism-y via-prism-g via-prism-b to-prism-p bg-clip-text text-transparent">
        404
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Page Not Found
        </h1>
        <p className="text-muted leading-relaxed">
          The page you are looking for may have been moved or removed.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/en" className="btn-primary px-6 py-2.5">
          Home
        </Link>
      </div>

      <div className="flex flex-col gap-3 w-full pt-6 border-t border-border">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">
          Popular Categories
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {KATEGORILER.map((cat) => (
            <Link
              key={cat.slug}
              href={getCategoryPath(cat.slug)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface border border-border text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {cat.baslik.en}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
