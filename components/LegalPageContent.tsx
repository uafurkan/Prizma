import { getDictionary } from '@/dictionaries';

interface LegalPageContentProps {
  lang: string;
  page: 'privacyPage' | 'termsPage';
}

export default function LegalPageContent({ lang, page }: LegalPageContentProps) {
  const dict = getDictionary(lang);
  const { title, updated, intro, sections } = dict[page];

  return (
    <div className="flex flex-col gap-8 py-12 px-4 max-w-3xl mx-auto w-full animate-fade-in">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
        <p className="text-xs text-muted font-mono">{updated}</p>
      </header>

      <p className="text-muted leading-relaxed">{intro}</p>

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <section key={section.heading} className="p-5 rounded-2xl border border-border bg-surface flex flex-col gap-2">
            <h2 className="font-bold text-foreground text-sm md:text-base">{section.heading}</h2>
            <p className="text-sm text-muted leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
