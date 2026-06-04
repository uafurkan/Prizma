import Link from 'next/link';
import UniversalConverter from '@/components/UniversalConverter';
import AdSlot from '@/components/AdSlot';
import FormatBadge from '@/components/FormatBadge';
import { KATEGORILER, DONUSUM_DATA } from '@/lib/donusum-data';

export default function Home() {
  // Popüler dönüşümler
  const populerDonusumler = DONUSUM_DATA.filter((d) => d.populer).slice(0, 16);

  // Kategori başına dönüşüm sayısı
  const getCatCount = (slug: string) => {
    return DONUSUM_DATA.filter((d) => d.kategori === slug).length;
  };

  return (
    <div className="flex flex-col gap-16 py-12 px-4 max-w-6xl mx-auto w-full">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center gap-6 animate-fade-in pt-8">
        <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-hidden pointer-events-none">
          <div className="w-[500px] h-[300px] bg-gradient-to-r from-[#ff4d6d]/10 via-[#06d6a0]/10 to-[#b56cff]/10 rounded-full blur-3xl opacity-50 animate-pulse-glow" />
        </div>

        {/* Badge Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#0d0d18] border border-[#1c1c2e] text-[#e8e8f4] flex items-center gap-1.5">
            <span>🔒</span> 100% Tarayıcıda
          </span>
          <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#0d0d18] border border-[#1c1c2e] text-[#e8e8f4] flex items-center gap-1.5">
            <span>⚡</span> Anında
          </span>
          <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-[#0d0d18] border border-[#1c1c2e] text-[#e8e8f4] flex items-center gap-1.5">
            <span>∞</span> Boyut Limiti Yok
          </span>
        </div>

        {/* Animated SVG Prism */}
        <div className="relative w-28 h-28 my-2">
          <svg
            className="w-full h-full animate-spin-slow"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4d6d" />
                <stop offset="20%" stopColor="#ff8c42" />
                <stop offset="40%" stopColor="#ffd166" />
                <stop offset="60%" stopColor="#06d6a0" />
                <stop offset="80%" stopColor="#4d9fff" />
                <stop offset="100%" stopColor="#b56cff" />
              </linearGradient>
            </defs>
            <polygon
              points="50,15 15,80 85,80"
              stroke="url(#rainbow)"
              strokeWidth="4"
              className="animate-prism-rotate"
            />
          </svg>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-br from-[#e8e8f4] to-[#5a5a7a] bg-clip-text text-transparent max-w-4xl">
          Her Dosyayı Dönüştür <br />
          <span className="bg-gradient-to-r from-[#ff4d6d] via-[#ffd166] to-[#4d9fff] bg-clip-text text-transparent">
            Anında, Ücretsiz, Gizli
          </span>
        </h1>

        <p className="text-[#5a5a7a] md:text-lg max-w-2xl font-medium">
          Video, ses, görüntü ve belgelerinizi doğrudan tarayıcınızda dönüştürün.
          Dosyalarınız hiçbir zaman bir sunucuya yüklenmez, gizliliğiniz tamamen korunur.
        </p>

        {/* Universal Converter Island */}
        <div className="w-full mt-8">
          <UniversalConverter />
        </div>
      </section>

      {/* Leaderboard Ad below Hero */}
      <AdSlot format="leaderboard" className="my-4" />

      {/* Categories Grid */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-center md:text-left">
          Kategorilere Göz Atın
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {KATEGORILER.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] p-6 hover:bg-[#12121e] hover:border-[#5a5a7a]/50 transition-all duration-300 flex flex-col justify-between min-h-[160px]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#e8e8f4]/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div>
                <span className="text-3xl mb-3 block">{c.ikon}</span>
                <h3 className="font-bold text-[#e8e8f4] text-lg leading-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#ff4d6d] group-hover:to-[#b56cff] group-hover:bg-clip-text">
                  {c.baslik}
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#5a5a7a] font-mono mt-4 block">
                {getCatCount(c.slug)} dönüşüm çifti
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Conversions */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl md:text-2xl font-bold font-sans text-center md:text-left">
          Popüler Dönüşümler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {populerDonusumler.map((d) => (
            <Link
              key={d.slug}
              href={`/${d.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] p-5 hover:border-[#5a5a7a]/50 hover:bg-[#12121e] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-2">
                <FormatBadge format={d.from} size="sm" />
                <svg className="w-4 h-4 text-[#5a5a7a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <FormatBadge format={d.to} size="sm" />
              </div>
              <p className="text-xs text-[#5a5a7a] line-clamp-2 mt-2 leading-relaxed">
                {d.aciklama}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Rectangle Ad between Popular and How It Works */}
      <AdSlot format="rectangle" className="my-4" />

      {/* How it Works */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-[#1c1c2e] bg-[#0d0d18]/25 rounded-3xl p-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4d9fff]/10 border border-[#4d9fff]/30 flex items-center justify-center text-[#4d9fff] font-bold text-lg">
            1
          </div>
          <h3 className="font-bold text-lg text-[#e8e8f4]">Dosyayı Seç</h3>
          <p className="text-sm text-[#5a5a7a] leading-relaxed">
            Dönüştürmek istediğiniz dosyaları cihazınızdan seçin veya sürükleyip bırakın.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ff4d6d]/10 border border-[#ff4d6d]/30 flex items-center justify-center text-[#ff4d6d] font-bold text-lg">
            2
          </div>
          <h3 className="font-bold text-lg text-[#e8e8f4]">Seçenekleri Ayarla</h3>
          <p className="text-sm text-[#5a5a7a] leading-relaxed">
            Gerekirse dönüştürme kalitesi, bit hızı gibi detayları belirleyin ve Dönüştür&apos;e tıklayın.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#06d6a0]/10 border border-[#06d6a0]/30 flex items-center justify-center text-[#06d6a0] font-bold text-lg">
            3
          </div>
          <h3 className="font-bold text-lg text-[#e8e8f4]">Hemen İndir</h3>
          <p className="text-sm text-[#5a5a7a] leading-relaxed">
            Saniyeler içinde tamamlanan dönüşüm sonrası dosyanızı anında indirin.
          </p>
        </div>
      </section>

      {/* Security explanation */}
      <section className="flex flex-col md:flex-row items-center gap-8 bg-gradient-to-r from-[#0d0d18] to-[#12121e] rounded-3xl p-8 border border-[#1c1c2e]">
        <div className="flex-1 flex flex-col gap-4">
          <span className="text-xs font-bold font-mono text-[#06d6a0] tracking-wider uppercase">Güvenli ve Gizli</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#e8e8f4]">Dosyalarınız Neden Güvende?</h2>
          <p className="text-[#5a5a7a] text-sm md:text-base leading-relaxed">
            Geleneksel dönüştürücüler dosyalarınızı uzak bir sunucuya yükler ve orada işler. PRİZMA ise dönüştürme motorlarını doğrudan tarayıcınıza getirir.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <li className="flex items-center gap-2 text-sm text-[#e8e8f4]">
              <span className="text-[#06d6a0] font-bold">✓</span> Dosyalar asla cihazınızı terk etmez
            </li>
            <li className="flex items-center gap-2 text-sm text-[#e8e8f4]">
              <span className="text-[#06d6a0] font-bold">✓</span> Sunucu maliyeti olmadığı için 100% ücretsizdir
            </li>
            <li className="flex items-center gap-2 text-sm text-[#e8e8f4]">
              <span className="text-[#06d6a0] font-bold">✓</span> Sayfayı kapattığınızda tüm veriler silinir
            </li>
            <li className="flex items-center gap-2 text-sm text-[#e8e8f4]">
              <span className="text-[#06d6a0] font-bold">✓</span> Üyelik, kayıt veya kısıtlamalar yoktur
            </li>
          </ul>
        </div>
        <div className="w-full md:w-64 h-48 bg-[#06060c] border border-[#1c1c2e] rounded-2xl flex flex-col items-center justify-center p-6 text-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff4d6d] to-[#b56cff]" />
          <span className="text-4xl">🛡️</span>
          <p className="text-xs text-[#5a5a7a] font-mono leading-relaxed">
            Görseller, videolar, ses dosyaları ve belgeler tamamen yerel bellekte işlenir.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <h2 className="text-xl md:text-2xl font-bold text-center">Sıkça Sorulan Sorular</h2>
        <div className="flex flex-col gap-4">
          <div className="p-6 rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col gap-2">
            <h3 className="font-bold text-[#e8e8f4]">PRİZMA tamamen ücretsiz mi?</h3>
            <p className="text-sm text-[#5a5a7a] leading-relaxed">
              Evet. Dönüştürme işlemleri uzak sunucularda değil tamamen sizin tarayıcınızda ve kendi bilgisayarınızın gücüyle yapıldığı için sunucu maliyetimiz yoktur. Bu sayede platformumuz sınırsız ve ücretsiz kalabilmektedir.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col gap-2">
            <h3 className="font-bold text-[#e8e8f4]">Dosya boyutu sınırı var mı?</h3>
            <p className="text-sm text-[#5a5a7a] leading-relaxed">
              Herhangi bir yapay sınırımız bulunmamaktadır. Ancak işlemler tarayıcınızın belleğinde (RAM) yapıldığından, bilgisayarınızın veya telefonunuzun tarayıcıya ayırdığı bellek miktarı dönüştürebileceğiniz maksimum boyutu belirler. Genellikle görüntüler ve belgeler için sınırsız, video ve ses dosyalarında ise yüzlerce megabaytlık dosyalar rahatlıkla dönüştürülebilir.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col gap-2">
            <h3 className="font-bold text-[#e8e8f4]">Dönüştürme işlemi ne kadar sürüyor?</h3>
            <p className="text-sm text-[#5a5a7a] leading-relaxed">
              Görüntüler ve küçük belgeler saniyeler içinde dönüştürülür. Video ve ses gibi karmaşık formatlar için ilk kullanımda yaklaşık 25MB boyutunda bir dönüştürme motoru (FFmpeg) indirilir. İndirme tamamlandıktan sonra dönüştürme işlemi donanım gücünüze bağlı olarak yerel hızda tamamlanır. Sonraki dönüşümler motor önbelleğe alındığı için anında başlar.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-[#1c1c2e] bg-[#0d0d18] flex flex-col gap-2">
            <h3 className="font-bold text-[#e8e8f4]">Dosyalarım çalınabilir veya kopyalanabilir mi?</h3>
            <p className="text-sm text-[#5a5a7a] leading-relaxed">
              İnternet bağlantınızı keserek bile sitemizi kullanabilirsiniz! İşlemler tamamen yerel yapıldığından dosyalarınızın bir sunucuya gitmesi ve dolayısıyla çalınması teknik olarak imkansızdır.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
