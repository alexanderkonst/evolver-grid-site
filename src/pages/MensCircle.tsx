import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Clock, Users, Shield, Heart, Sparkles, MessageCircle, Award, GraduationCap, ChevronDown, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// CSS for animations
const animationStyles = `
  @keyframes logoGlow {
    0%, 100% { filter: drop-shadow(0 0 20px rgba(100, 200, 255, 0.3)); }
    50% { filter: drop-shadow(0 0 40px rgba(100, 200, 255, 0.6)); }
  }
  
  @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(212, 175, 55, 0.1); }
    50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.5), inset 0 0 30px rgba(212, 175, 55, 0.2); }
  }
  
  .logo-glow {
    animation: logoGlow 6s ease-in-out infinite;
  }
  
  .btn-premium {
    transition: all 0.3s ease;
    min-height: 44px;
    min-width: 44px;
  }
  
  .btn-premium:hover {
    transform: scale(1.03);
    box-shadow: 0 0 30px rgba(224, 228, 234, 0.4);
  }
  
  .star {
    position: absolute;
    width: 3px;
    height: 3px;
    background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(100,200,255,0.3) 100%);
    border-radius: 50%;
    animation: twinkle var(--twinkle-duration, 4s) ease-in-out infinite;
    animation-delay: var(--twinkle-delay, 0s);
  }
  
  .recommended-card {
    animation: pulse-glow 3s ease-in-out infinite;
    border-color: rgba(212, 175, 55, 0.6) !important;
    transform: scale(1.02);
  }
  
  .sticky-cta-enter {
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .anchor-nav::-webkit-scrollbar {
    display: none;
  }
  
  .anchor-nav {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Floating Stars Overlay Component
const FloatingStars = () => {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 5,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            '--twinkle-duration': `${star.duration}s`,
            '--twinkle-delay': `${star.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const PASSWORD = "растениесилы";

// Anchor navigation sections
const SECTIONS = [
  { id: "for-whom", label: "Для кого" },
  { id: "what-is", label: "Что это" },
  { id: "how-it-works", label: "Формат" },
  { id: "who-leads", label: "Ведущий" },
  { id: "safety", label: "Правила" },
  { id: "join-section", label: "Оплата" },
];

const BionicText = ({ children, className = "" }: { children: string; className?: string }) => {
  const words = children.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => {
        const midpoint = Math.ceil(word.length * 0.5);
        const firstHalf = word.slice(0, midpoint);
        const secondHalf = word.slice(midpoint);
        return (
          <span key={i}>
            <span className="font-bold">{firstHalf}</span>
            <span className="font-normal">{secondHalf}</span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
};

// Section Header Component
const SectionHeader = ({ children }: { children: string }) => (
  <h3 className="text-2xl md:text-3xl text-center mb-8 uppercase tracking-wide">
    <BionicText>{children}</BionicText>
  </h3>
);

// CTA Button Component
const CTAButton = ({ onClick, className = "" }: { onClick: () => void; className?: string }) => (
  <Button
    onClick={onClick}
    className={`px-8 py-6 text-lg font-serif rounded-full btn-premium min-h-[48px] ${className}`}
    style={{
      backgroundColor: "#E0E4EA",
      color: "#041a2f"
    }}
  >
    <BionicText>Записаться на ближайший круг</BionicText>
  </Button>
);

// Info Card Component
const InfoCard = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 text-base md:text-lg leading-relaxed opacity-90">
        {children}
      </div>
    </div>
  </div>
);

// Meeting Step Component
const MeetingStep = ({ title, duration, description }: { title: string; duration: string; description: string }) => (
  <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-lg md:text-xl font-semibold">
          <BionicText>{title}</BionicText>
        </h4>
        <span className="text-sm opacity-70 bg-white/10 px-2 py-1 rounded-full">{duration}</span>
      </div>
      <p className="text-base md:text-lg opacity-90 leading-relaxed">
        <BionicText>{description}</BionicText>
      </p>
    </div>
  </div>
);

// Bullet Item Component
const BulletItem = ({ children }: { children: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-2 h-2 rounded-full bg-white/60 mt-2.5 flex-shrink-0" />
    <p className="text-base md:text-lg leading-relaxed opacity-90">
      <BionicText>{children}</BionicText>
    </p>
  </div>
);

// Anchor Navigation Component
const AnchorNav = ({ activeSection }: { activeSection: string }) => (
  <nav className="fixed top-20 left-0 right-0 z-40 bg-[#041a2f]/95 backdrop-blur-sm border-b border-white/10 md:hidden">
    <div className="anchor-nav flex overflow-x-auto gap-1 px-3 py-2">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          onClick={() => {
            const el = document.getElementById(section.id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={`px-3 py-2 text-sm whitespace-nowrap rounded-full transition-all min-h-[44px] ${
            activeSection === section.id
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white/80"
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  </nav>
);

// Sticky Mobile CTA Component
const StickyMobileCTA = ({ visible, onClick }: { visible: boolean; onClick: () => void }) => {
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#041a2f]/95 backdrop-blur-md border-t border-white/10 md:hidden sticky-cta-enter safe-area-inset-bottom">
      <Button
        onClick={onClick}
        className="w-full py-4 text-base font-serif rounded-full btn-premium min-h-[48px]"
        style={{
          backgroundColor: "#E0E4EA",
          color: "#041a2f"
        }}
      >
        <BionicText>Записаться — от $33</BionicText>
      </Button>
    </div>
  );
};

// Certificate Modal Component
const CertificateModal = () => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="ml-2 text-amber-400 hover:text-amber-300 underline text-sm inline-flex items-center gap-1 min-h-[44px] px-2">
        <Award className="w-4 h-4" />
        сертификат
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-2xl bg-[#041a2f] border-white/20">
      <img
        src="https://i.imgur.com/KY4Pd5o.png"
        alt="Сертификат Кен Уилбер"
        className="w-full h-auto rounded-lg"
      />
    </DialogContent>
  </Dialog>
);

// Experience Badge Component
const ExperienceBadge = ({ icon: Icon, number, label }: { icon: React.ElementType; number: string; label: string }) => (
  <div className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10">
    <Icon className="w-6 h-6 mb-2 text-amber-400" />
    <span className="text-3xl md:text-4xl font-bold text-amber-400">{number}</span>
    <span className="text-sm opacity-70 text-center">{label}</span>
  </div>
);

const MensCircle = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll spy for anchor nav and sticky CTA
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // Show sticky CTA after 30% scroll, hide near bottom
      const scrollPercent = scrollY / (docHeight - windowHeight);
      setShowStickyCTA(scrollPercent > 0.15 && scrollPercent < 0.85);
      
      // Update active section
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const scrollToPayment = () => {
    const element = document.getElementById("join-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Password Gate Screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 relative"
        style={{ backgroundColor: "#041a2f" }}
      >
        <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]"
          style={{ color: "#E0E4EA" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>
        <div className="max-w-md w-full text-center space-y-8">
          <img
            src="https://i.imgur.com/NGSxNw8.png"
            alt="Men's Circle"
            className="w-64 h-64 mx-auto mb-6 object-contain logo-glow"
          />
          <p
            className="text-lg font-serif leading-relaxed"
            style={{ color: "#E0E4EA" }}
          >
            <BionicText>
              Вход на эту страницу по приглашению. Введите код доступа, чтобы войти в пространство Мужского круга.
            </BionicText>
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Код доступа"
              className="text-center text-lg py-6 bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[48px]"
            />
            {error && (
              <p className="text-red-400 text-sm">Неверный код доступа</p>
            )}
            <Button
              type="submit"
              className="w-full py-6 text-lg font-serif rounded-full btn-premium min-h-[48px]"
              style={{
                backgroundColor: "#E0E4EA",
                color: "#041a2f"
              }}
            >
              <BionicText>Войти</BionicText>
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Main Landing Page (after password)
  return (
    <div
      className="min-h-screen font-serif relative overflow-hidden"
      style={{ backgroundColor: "#041a2f", color: "#E0E4EA" }}
    >
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <FloatingStars />

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(100, 200, 255, 0.08) 0%, transparent 50%)',
        }}
      />

      <Navigation />
      <AnchorNav activeSection={activeSection} />
      <StickyMobileCTA visible={showStickyCTA} onClick={scrollToPayment} />

      {/* Hero Section */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
          <img
            src="https://i.imgur.com/NGSxNw8.png"
            alt="Men's Circle"
            className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-4 object-contain logo-glow"
          />
          <h1 className="text-3xl md:text-4xl lg:text-5xl leading-tight uppercase tracking-wide">
            <BionicText>Мужской Круг Правды с Каннабисом</BionicText>
          </h1>
          <h2 className="text-lg md:text-xl lg:text-2xl leading-relaxed opacity-90 max-w-3xl mx-auto">
            <BionicText>
              Круг, где мужчины говорят как есть в осознанном взаимодействии с каннабисом.
            </BionicText>
          </h2>
          <div className="pt-4 flex flex-col items-center gap-3">
            <CTAButton onClick={scrollToPayment} />
            <button 
              onClick={scrollToPayment}
              className="flex items-center gap-1 text-sm opacity-60 hover:opacity-100 transition-opacity animate-bounce"
            >
              <ChevronDown className="w-4 h-4" />
              <span>от $33/месяц</span>
            </button>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section id="for-whom" className="py-16 md:py-20 px-4 md:px-6 bg-white/5 scroll-mt-32 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-4">
            <img
              src="https://i.imgur.com/Q6c3UZT.png"
              alt="For Whom"
              className="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Для кого это</SectionHeader>
          <p className="text-lg md:text-xl text-center opacity-90 mb-8">
            <BionicText>Для русскоязычных мужчин, которые:</BionicText>
          </p>
          <div className="space-y-4">
            <BulletItem>Чувствуют внутреннее напряжение, усталость, потерянность — даже если снаружи "всё нормально".</BulletItem>
            <BulletItem>Много несут в себе и редко говорят о самом важном вслух.</BulletItem>
            <BulletItem>Хочется честных, тёплых мужских разговоров без игры в "я в порядке".</BulletItem>
            <BulletItem>Уже знакомы с каннабисом и готовы относиться к нему уважительно как к растению-учителю, а не способу забыться или убежать от проблем.</BulletItem>
          </div>
        </div>
      </section>

      {/* What Is This Section */}
      <section id="what-is" className="py-16 md:py-20 px-4 md:px-6 scroll-mt-32 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <SectionHeader>Что это</SectionHeader>
          <div className="space-y-6 text-center">
            <p className="text-lg md:text-xl leading-relaxed opacity-90">
              <BionicText>Онлайн-круг для русскоязычных мужчин со всего мира.</BionicText>
            </p>
            <p className="text-lg md:text-xl leading-relaxed opacity-90">
              <BionicText>Мы встречаемся в Zoom, и каждый участник входит в круг в союзе с растением-учителем (каннабисом) в мягкой, осознанной дозе.</BionicText>
            </p>
            <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 mt-8">
              <p className="text-lg md:text-xl leading-relaxed opacity-90">
                <BionicText>Это не про накуриться вместе. Это про внимательную совместную работу с растением, чтобы честнее чувствовать, говорить и впускать свет внутрь.</BionicText>
              </p>
            </div>
          </div>
          <div className="pt-8 text-center">
            <CTAButton onClick={scrollToPayment} />
          </div>
        </div>
      </section>

      {/* How Meeting Goes Section */}
      <section id="how-it-works" className="py-16 md:py-20 px-4 md:px-6 bg-white/5 scroll-mt-32 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-4">
            <img
              src="https://i.imgur.com/RpmgjXZ.png"
              alt="How Meeting Goes"
              className="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Как проходит встреча</SectionHeader>
          <div className="space-y-4">
            <MeetingStep
              title="Открытие"
              duration="10–15 мин"
              description="Короткое знакомство, простые договорённости, настрой. Переход из суеты дня в более собранное состояние."
            />
            <MeetingStep
              title="Союз с растением"
              duration="≈10 мин"
              description='Каждый соединяется с каннабисом в мягкой дозе с ясным намерением. Цель — не "улететь", а стать честнее и чувствительнее к себе.'
            />
            <MeetingStep
              title="Активация 1 — «Освобождение»"
              duration="15–20 мин"
              description="Веду медитацию-активацию на отпускание лишних зажимов и защит, чтобы сердце, тело и голос могли звучать свободнее."
            />
            <MeetingStep
              title="Круг Правды"
              duration="60–90 мин"
              description="По очереди каждый говорит о самом важном сейчас: страхи, переходы, радости, тупики, боль, празднования, благодарность, надежда. Без масок."
            />
            <MeetingStep
              title="Активация 2 — «Внутренний Свет»"
              duration="15–20 мин"
              description="Вторая медитация-активация: соединяемся с внутренним источником, впускаем свет в то, что поднялось."
            />
            <MeetingStep
              title="Интеграция"
              duration="5–10 мин"
              description="Короткий финальный круг и один конкретный шаг, который забираешь с собой. Закрываем поле и возвращаемся в повседневность."
            />
          </div>
        </div>
      </section>

      {/* Who Leads Section */}
      <section id="who-leads" className="py-16 md:py-20 px-4 md:px-6 scroll-mt-32 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <SectionHeader>Кто ведёт</SectionHeader>
          <div className="text-center space-y-6">
            {/* Profile Photos */}
            <div className="flex justify-center gap-4 md:gap-6 mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20">
                <img
                  src="https://i.imgur.com/40cWWoe.jpeg"
                  alt="Aleksandr - Shamanic"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20">
                <img
                  src="https://i.imgur.com/XctlWbQ.jpeg"
                  alt="Aleksandr - Professional"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-semibold">
              <BionicText>Я — Александр.</BionicText>
            </p>
            
            {/* Experience Badges - Phase 3 Trust Enhancement */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 my-8">
              <ExperienceBadge icon={Sparkles} number="150+" label="церемоний" />
              <ExperienceBadge icon={GraduationCap} number="MIT" label="выпускник" />
              <ExperienceBadge icon={Clock} number="10+" label="лет в AI" />
            </div>
            
            <div className="space-y-4 text-lg md:text-xl leading-relaxed opacity-90">
              <p><BionicText>Провёл 150+ церемоний и процессов с растениями-учителями для людей из разных стран и культур.</BionicText></p>
              <p>
                <BionicText>Давно и плотно углубляю мастерство в интегральной теории у Кена Уилбера.</BionicText>
                <CertificateModal />
              </p>
              <p><BionicText>Изучал инновационное предпринимательство в MIT, более 10 лет строю стартапы на основе искусственного интеллекта и консультирую фаундеров в web3 стартап студии </BionicText><a href="https://rndao.io/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">RnD Ventures</a>.</p>
              <p><BionicText>Ваш проводник — не только про траву, но и про очень конкретную реальность: деньги, стезя, отношения, ответственность, физическое тело, достижения, творчество, создание блага.</BionicText></p>
            </div>
          </div>
          <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 mt-8">
            <p className="text-lg md:text-xl leading-relaxed opacity-90 text-center">
              <BionicText>В круге моя задача — держать форму, глубину и безопасность процесса, вести активации и вовремя вмешаться, если что-то идёт не туда.</BionicText>
            </p>
          </div>
        </div>
      </section>

      {/* Safety and Rules Section */}
      <section id="safety" className="py-16 md:py-20 px-4 md:px-6 bg-white/5 scroll-mt-32 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-4">
            <img
              src="https://i.imgur.com/GMwBqqz.png"
              alt="Safety and Rules"
              className="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Безопасность и правила</SectionHeader>
          <p className="text-lg md:text-xl text-center opacity-90 mb-8">
            <BionicText>Чтобы всем было безопасно и по-настоящему, опираемся на несколько простых правил.</BionicText>
          </p>

          {/* Cannabis */}
          <InfoCard icon={Sparkles}>
            <p className="font-semibold mb-2"><BionicText>Каннабис</BionicText></p>
            <div className="space-y-2">
              <p><BionicText>Участие — только с каннабисом в мягкой, осознанной дозе.</BionicText></p>
              <p><BionicText>Цель — ясность и честность, а не отключиться или потерять контроль.</BionicText></p>
            </div>
          </InfoCard>

          {/* Mental Health */}
          <InfoCard icon={Shield}>
            <p className="font-semibold mb-2"><BionicText>Психическое состояние</BionicText></p>
            <div className="space-y-2">
              <p><BionicText>Если у тебя тяжёлые психиатрические диагнозы, были эпизоды психоза или сейчас очень нестабильное состояние — этот формат не подойдёт.</BionicText></p>
              <p><BionicText>Круг не заменяет психотерапию и не отменяет работу с врачом или терапевтом.</BionicText></p>
            </div>
          </InfoCard>

          {/* Presence */}
          <InfoCard icon={Users}>
            <p className="font-semibold mb-2"><BionicText>Присутствие</BionicText></p>
            <div className="space-y-2">
              <p><BionicText>Конфиденциальность: всё, что сказано в круге, остаётся в круге.</BionicText></p>
              <p><BionicText>Камеры включены. Мы приходим как участники, а не зрители.</BionicText></p>
              <p><BionicText>Я оставляю за собой право остановить процесс или кого-то из участников, если вижу, что это небезопасно для него или для круга.</BionicText></p>
            </div>
          </InfoCard>

          {/* Communication */}
          <InfoCard icon={MessageCircle}>
            <p className="font-semibold mb-2"><BionicText>Общение</BionicText></p>
            <div className="space-y-2">
              <p><BionicText>Говорим от себя, о себе, без попытки "исправить" других.</BionicText></p>
              <p><BionicText>Не даём советов без запроса.</BionicText></p>
              <p><BionicText>Не перебиваем и не спорим с чужим опытом.</BionicText></p>
              <p><BionicText>Уважаем время: у каждого есть возможность быть услышанным.</BionicText></p>
            </div>
          </InfoCard>
        </div>
      </section>

      {/* Contribution Section */}
      <section id="join-section" className="py-16 md:py-20 px-4 md:px-6 scroll-mt-32 md:scroll-mt-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <img
              src="https://i.imgur.com/EH24PWf.png"
              alt="Men's Circle"
              className="w-40 h-40 md:w-56 md:h-56 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Вклад и деньги</SectionHeader>
          <div className="text-center space-y-4 mb-8">
            <p className="text-lg md:text-xl leading-relaxed opacity-90">
              <BionicText>Формат и содержание одинаковы для всех. Ты сам выбираешь уровень вклада — по своим возможностям и внутреннему отклику.</BionicText>
            </p>
          </div>

          <div className="grid gap-4 md:gap-6">
            {/* $33 Option */}
            <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="px-8 md:px-10 py-5 md:py-6 text-lg md:text-xl font-serif rounded-full btn-premium mb-4 min-h-[48px]"
                style={{
                  backgroundColor: "#E0E4EA",
                  color: "#041a2f"
                }}
                onClick={() => {
                  window.open("https://buy.stripe.com/fZu14ndUMfSHgOJcLmdEs0u", "_blank");
                }}
              >
                <BionicText>$33 в месяц</BionicText>
              </Button>
              <p className="text-base md:text-lg opacity-80">
                <BionicText>Базовый вклад за месяц (1 встреча).</BionicText>
              </p>
            </div>

            {/* $100 Option - RECOMMENDED - Phase 1 Enhancement */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-amber-900/20 to-amber-800/10 rounded-2xl border-2 border-amber-500/40 text-center recommended-card relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-[#041a2f] px-4 py-1 rounded-full text-sm font-bold">
                Рекомендуемый
              </div>
              <Button
                className="px-10 md:px-12 py-6 md:py-7 text-xl md:text-2xl font-serif rounded-full btn-premium mb-4 mt-2 min-h-[56px]"
                style={{
                  backgroundColor: "#E0E4EA",
                  color: "#041a2f"
                }}
                onClick={() => {
                  window.open("https://buy.stripe.com/28E14n4kc21R8id8v6dEs0v", "_blank");
                }}
              >
                <BionicText>$100 в месяц</BionicText>
              </Button>
              <p className="text-lg md:text-xl opacity-90">
                <BionicText>Поддерживающий вклад, если хочешь сильнее поддержать круг и моё время.</BionicText>
              </p>
            </div>

            {/* $333 Option */}
            <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="px-8 md:px-10 py-5 md:py-6 text-lg md:text-xl font-serif rounded-full btn-premium mb-4 min-h-[48px]"
                style={{
                  backgroundColor: "#E0E4EA",
                  color: "#041a2f"
                }}
                onClick={() => {
                  window.open("https://buy.stripe.com/28EeVdg2UeODcyt8v6dEs0w", "_blank");
                }}
              >
                <BionicText>$333 в месяц</BionicText>
              </Button>
              <p className="text-base md:text-lg opacity-80">
                <BionicText>Вклад покровителя, если можешь и чувствуешь, что это честно для тебя.</BionicText>
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg md:text-xl leading-relaxed opacity-80 italic">
              <BionicText>Если отклик сильный, а с деньгами сейчас непросто — </BionicText>
              <a href="https://t.me/integralevolution" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">напиши</a>
              <BionicText>, что-нибудь придумаем.</BionicText>
            </p>
          </div>
        </div>
      </section>

      {/* What You Take Away Section */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-8">
          <SectionHeader>Что ты заберёшь с собой</SectionHeader>
          <div className="space-y-4">
            <InfoCard icon={Heart}>
              <span className="flex items-center"><BionicText>Место, где можно говорить правду, а не играть роль.</BionicText></span>
            </InfoCard>
            <InfoCard icon={Users}>
              <span className="flex items-center"><BionicText>Ощущение, что ты не один со своими вопросами и переходами.</BionicText></span>
            </InfoCard>
            <InfoCard icon={MessageCircle}>
              <span className="flex items-center"><BionicText>Тёплое, но честное мужское зеркало.</BionicText></span>
            </InfoCard>
            <InfoCard icon={Sparkles}>
              <span className="flex items-center"><BionicText>Более зрелые отношения с каннабисом как с растением-учителем.</BionicText></span>
            </InfoCard>
            <InfoCard icon={Clock}>
              <span className="flex items-center"><BionicText>Опыт двух активаций — Освобождение и Внутренний Свет — и один конкретный шаг в сторону более честной, собранной жизни.</BionicText></span>
            </InfoCard>
          </div>
        </div>
      </section>

      {/* What This Is Not Section */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <SectionHeader>Что это точно не</SectionHeader>
          <div className="space-y-4">
            <BulletItem>Не "покурить с пацанами".</BulletItem>
            <BulletItem>Не соревнование "кто круче".</BulletItem>
            <BulletItem>Не психотерапия и не диагностика.</BulletItem>
            <BulletItem>Не попытка "перевести" тебя в какую-то веру или систему.</BulletItem>
          </div>
          <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 mt-8 text-center">
            <p className="text-lg md:text-xl leading-relaxed opacity-90">
              <BionicText>Это круг для взрослых мужчин, которые чувствуют: "Хватит делать вид, что всё ок. Пора говорить по-настоящему — и впускать свет внутрь."</BionicText>
            </p>
          </div>
        </div>
      </section>

      {/* How to Join Section */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-8">
          <SectionHeader>Как присоединиться</SectionHeader>
          <p className="text-lg md:text-xl text-center opacity-90">
            <BionicText>Круг набирается по тёплым приглашениям и рекомендациям.</BionicText>
          </p>
          <div className="pt-4 text-center">
            <CTAButton onClick={scrollToPayment} />
          </div>
        </div>
      </section>

      <div className="bg-white pb-16 md:pb-0">
        <Footer />
      </div>
      <ScrollToTop />
    </div>
  );
};

export default MensCircle;
