import { useState, useEffect } from 'react';
import SEO from "@/components/SEO";

type Lang = 'en' | 'ru';

type Tier = {
  kind: 'free' | 'paid';
  name: string;
  price: string;
  cadence: string;
  body: string;
  ctaLabel: string | null;
};

type LangContent = {
  docTitle: string;
  title: string;
  subtitle: string;
  intro: string;
  tiers: Tier[];
  provenance: { label: string; text: string };
  ccNote: string;
  ccLink: string;
  perspectivesLink: string;
};

// Public contact / booking CTA reused across the site (ContactNew, Founder,
// ProductsPage, etc.). No payment integration yet (IP map v0), so every
// priced tier routes the visitor into a conversation.
const CONTACT_URL = "https://t.me/integralevolution";

const content: Record<Lang, LangContent> = {
  en: {
    docTitle: "Commercial License | Find Your Top Talent",
    title: "Commercial License",
    subtitle: "How to use the method, free and paid",
    intro: "The corpus is open to read, use for yourself, and share with attribution. If you want to use the method commercially, in your own practice, under your community's brand, or with me, the licenses below set the terms. No payment integration yet. Every paid tier starts with a conversation.",
    tiers: [
      {
        kind: 'free',
        name: "Non-commercial use",
        price: "Free",
        cadence: "",
        body: "The corpus (27 perspectives, holonic seeing, the playbook) is published under CC BY-NC-SA 4.0, (c) Aleksandr Konstantinov. Read it, use it for yourself, adapt it, and share it with attribution, for non-commercial purposes, under the same license.",
        ctaLabel: null,
      },
      {
        kind: 'paid',
        name: "Commercial license for practitioners",
        price: "$555",
        cadence: "/ year",
        body: "Use the method commercially in your own practice.",
        ctaLabel: "Get in touch",
      },
      {
        kind: 'paid',
        name: "Practitioner subscription",
        price: "$111",
        cadence: "/ month",
        body: "Method plus updates plus product access. Personal use, no resale.",
        ctaLabel: "Get in touch",
      },
      {
        kind: 'paid',
        name: "Community white-label",
        price: "$1,500",
        cadence: "setup + $75 / month",
        body: "An instance under your community's brand.",
        ctaLabel: "Get in touch",
      },
      {
        kind: 'paid',
        name: "Co-hosted programs",
        price: "Revenue share",
        cadence: "by agreement",
        body: "Revenue share by agreement. Requires 12 months of traction.",
        ctaLabel: "Talk to Sasha",
      },
    ],
    provenance: {
      label: "Provenance clause",
      text: "Applies to every license. Attribution and the quoted and inferred markings must be kept in derivative works.",
    },
    ccNote: "The corpus is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).",
    ccLink: "CC BY-NC-SA 4.0",
    perspectivesLink: "Read the 27-perspective vision",
  },
  ru: {
    docTitle: "Коммерческая лицензия | Find Your Top Talent",
    title: "Коммерческая лицензия",
    subtitle: "Как использовать метод, бесплатно и платно",
    intro: "Корпус открыт для чтения, личного использования и распространения с указанием авторства. Если вы хотите использовать метод коммерчески, в собственной практике, под брендом вашего сообщества или вместе со мной, условия задают лицензии ниже. Оплата пока не подключена. Каждый платный тариф начинается с разговора.",
    tiers: [
      {
        kind: 'free',
        name: "Некоммерческое использование",
        price: "Бесплатно",
        cadence: "",
        body: "Корпус (27 перспектив, холоническое видение, плейбук) опубликован по лицензии CC BY-NC-SA 4.0, (c) Александр Константинов. Читайте, используйте для себя, адаптируйте и делитесь с указанием авторства, в некоммерческих целях, на условиях той же лицензии.",
        ctaLabel: null,
      },
      {
        kind: 'paid',
        name: "Коммерческая лицензия для практиков",
        price: "$555",
        cadence: "/ год",
        body: "Используйте метод коммерчески в собственной практике.",
        ctaLabel: "Связаться",
      },
      {
        kind: 'paid',
        name: "Подписка практика",
        price: "$111",
        cadence: "/ месяц",
        body: "Метод плюс обновления плюс доступ к продуктам. Личное использование, без перепродажи.",
        ctaLabel: "Связаться",
      },
      {
        kind: 'paid',
        name: "White-label для сообщества",
        price: "$1,500",
        cadence: "установка + $75 / месяц",
        body: "Инстанс под брендом вашего сообщества.",
        ctaLabel: "Связаться",
      },
      {
        kind: 'paid',
        name: "Совместные программы",
        price: "Разделение выручки",
        cadence: "по договорённости",
        body: "Разделение выручки по договорённости. Требуется 12 месяцев устойчивости.",
        ctaLabel: "Поговорить с Сашей",
      },
    ],
    provenance: {
      label: "Пункт о происхождении",
      text: "Применяется к каждой лицензии. Указание авторства и пометки цитирования и вывода должны сохраняться в производных работах.",
    },
    ccNote: "Корпус распространяется по лицензии Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).",
    ccLink: "CC BY-NC-SA 4.0",
    perspectivesLink: "Читать видение из 27 перспектив",
  },
};

export default function License() {
  const [lang, setLang] = useState<Lang>('en');
  const c = content[lang];

  useEffect(() => {
    document.title = c.docTitle;
  }, [c.docTitle]);

  return (
    <>
      <SEO
        title="Commercial License | Find Your Top Talent"
        description="How to use the method, free and paid. The corpus is CC BY-NC-SA 4.0. Commercial, practitioner, white-label, and co-hosted licenses by Aleksandr Konstantinov."
        path="/license"
        ogType="article"
      />
      <div className="min-h-screen relative" style={{ background: 'linear-gradient(180deg, #080818 0%, #0c1025 30%, #0f0f2a 60%, #0a0a1a 100%)' }}>
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, rgba(132,96,234,0.6) 0%, transparent 70%)' }} />
          <div className="absolute top-[50%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{ background: 'radial-gradient(circle, rgba(104,148,208,0.6) 0%, transparent 70%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-5 md:px-8">
          {/* Hero */}
          <header className="pt-10 md:pt-14 pb-12 md:pb-16 text-center flex flex-col items-center gap-6 md:gap-8">
            {/* Language toggle */}
            <div className="flex justify-center">
              <div className="inline-flex gap-0.5 rounded-full ring-1 ring-white/10 bg-white/[0.03] p-0.5">
                <button
                  onClick={() => setLang('en')}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all duration-300 ${
                    lang === 'en' ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/50'
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  English
                </button>
                <button
                  onClick={() => setLang('ru')}
                  className={`px-3.5 py-1.5 rounded-full text-[10px] tracking-widest uppercase transition-all duration-300 ${
                    lang === 'ru' ? 'bg-white/10 text-white/80' : 'text-white/30 hover:text-white/50'
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Русский
                </button>
              </div>
            </div>

            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight"
              style={{
                fontFamily: "'Playfair Display', serif",
                textShadow: '0 0 60px rgba(255,255,255,0.08)',
              }}
            >
              {c.title}
            </h1>
            <p className="text-white/40 text-base md:text-lg font-light" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {c.subtitle}
            </p>
          </header>

          {/* Intro */}
          <section className="mb-12 md:mb-16">
            <div className="liquid-glass-strong rounded-2xl p-8 md:p-10 ring-1 ring-white/10">
              <p className="text-white/70 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {c.intro}
              </p>
            </div>
          </section>

          {/* Tiers */}
          <section className="space-y-4 mb-12 md:mb-16">
            {c.tiers.map((tier, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 md:p-8 ${tier.kind === 'free' ? 'liquid-glass-strong ring-1 ring-white/10' : 'liquid-glass'}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-4">
                  <h2 className="text-white text-lg md:text-xl font-medium tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {tier.name}
                  </h2>
                  <div className="shrink-0 flex items-baseline gap-2">
                    <span className="text-white/90 text-xl md:text-2xl font-light tabular-nums" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {tier.price}
                    </span>
                    {tier.cadence && (
                      <span className="text-white/40 text-xs md:text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {tier.cadence}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-white/60 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
                  {tier.body}
                </p>
                {tier.ctaLabel && (
                  <div className="mt-5">
                    <a
                      href={CONTACT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-5 py-3 rounded-full text-[10px] md:text-[11px] uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ring-1 bg-white/10 text-white/90 ring-white/15 hover:bg-white/15"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {tier.ctaLabel}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </section>

          {/* Provenance clause */}
          <section className="mb-12 md:mb-16">
            <div className="liquid-glass rounded-2xl p-6 md:p-8">
              <div className="text-white/30 text-xs uppercase tracking-[0.2em] mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {c.provenance.label}
              </div>
              <p className="text-white/80 text-base md:text-lg leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
                {c.provenance.text}
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 md:py-20 border-t border-white/5 text-center space-y-5">
            <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
              {c.ccNote}
            </p>
            <div className="flex flex-col items-center gap-3">
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-white/30 text-xs underline underline-offset-2 hover:text-white/50 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {c.ccLink}
              </a>
              <a
                href="/27"
                className="inline-block text-white/30 text-xs underline underline-offset-2 hover:text-white/50 transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {c.perspectivesLink}
              </a>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
