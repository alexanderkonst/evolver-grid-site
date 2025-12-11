import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, Users, Shield, Heart, Sparkles, MessageCircle, Send } from "lucide-react";
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
  
  .logo-glow {
    animation: logoGlow 6s ease-in-out infinite;
  }
  
  .btn-premium {
    transition: all 0.3s ease;
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
  <h3 className="text-xl md:text-3xl text-center mb-6 md:mb-8 uppercase tracking-wide">
    <BionicText>{children}</BionicText>
  </h3>
);

// CTA Button Component
const CTAButton = ({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) => (
  <Button
    onClick={onClick}
    className={`${compact ? 'px-6 py-4 text-base' : 'px-6 md:px-8 py-5 md:py-6 text-base md:text-lg'} font-serif rounded-full btn-premium w-full sm:w-auto min-h-[48px]`}
    style={{
      backgroundColor: "#E0E4EA",
      color: "#041a2f"
    }}
  >
    <BionicText>Записаться на ближайший круг</BionicText>
  </Button>
);

// Sticky Mobile CTA Component
const StickyMobileCTA = ({ onClick }: { onClick: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtPayment, setIsAtPayment] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollY / pageHeight;

      // Show after 20% scroll
      setIsVisible(scrollPercent > 0.2);

      // Hide when at payment section
      const paymentSection = document.getElementById("join-section");
      if (paymentSection) {
        const rect = paymentSection.getBoundingClientRect();
        setIsAtPayment(rect.top < window.innerHeight && rect.bottom > 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible || isAtPayment) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#041a2f]/95 backdrop-blur-sm border-t border-white/10 p-4 pb-safe-4">
      <Button
        onClick={onClick}
        className="w-full py-4 text-base font-serif rounded-full btn-premium min-h-[48px]"
        style={{
          backgroundColor: "#E0E4EA",
          color: "#041a2f"
        }}
      >
        <BionicText>Записаться на круг</BionicText>
      </Button>
    </div>
  );
};

// Info Card Component
const InfoCard = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
    <div className="flex items-start gap-3 md:gap-4">
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 text-[15px] md:text-lg leading-relaxed opacity-90">
        {children}
      </div>
    </div>
  </div>
);

// Meeting Step Component
const MeetingStep = ({ title, duration, description }: { title: string; duration: string; description: string }) => (
  <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-base md:text-xl font-semibold">
          <BionicText>{title}</BionicText>
        </h4>
        <span className="text-xs md:text-sm opacity-70 bg-white/10 px-2 py-1 rounded-full whitespace-nowrap">{duration}</span>
      </div>
      <p className="text-[15px] md:text-lg opacity-90 leading-relaxed">
        <BionicText>{description}</BionicText>
      </p>
    </div>
  </div>
);

// Bullet Item Component
const BulletItem = ({ children }: { children: string }) => (
  <div className="flex items-start gap-3">
    <div className="w-2 h-2 rounded-full bg-white/60 mt-2 md:mt-2.5 flex-shrink-0" />
    <p className="text-[15px] md:text-lg leading-relaxed opacity-90">
      <BionicText>{children}</BionicText>
    </p>
  </div>
);

const MensCircle = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
          className="absolute top-6 left-6 flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
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
              className="text-center text-lg py-6 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            {error && (
              <p className="text-red-400 text-sm">Неверный код доступа</p>
            )}
            <Button
              type="submit"
              className="w-full py-6 text-lg font-serif rounded-full btn-premium"
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

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5 md:space-y-8">
          <img
            src="https://i.imgur.com/NGSxNw8.png"
            alt="Men's Circle"
            className="w-32 h-32 md:w-56 md:h-56 mx-auto mb-2 md:mb-4 object-contain logo-glow"
          />
          <h1 className="text-2xl md:text-4xl lg:text-5xl leading-tight uppercase tracking-wide px-2">
            <BionicText>Мужской Круг Правды с Каннабисом</BionicText>
          </h1>
          <h2 className="text-base md:text-xl lg:text-2xl leading-relaxed opacity-90 max-w-3xl mx-auto px-2">
            <BionicText>
              Круг, где мужчины говорят как есть в осознанном взаимодействии с каннабисом.
            </BionicText>
          </h2>
          <div className="pt-2 md:pt-4">
            <CTAButton onClick={scrollToPayment} />
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center mb-2 md:mb-4">
            <img
              src="https://i.imgur.com/raDNNNi.jpeg"
              alt="For Whom"
              className="w-20 h-20 md:w-32 md:h-32 mx-auto object-cover rounded-full"
            />
          </div>
          <SectionHeader>Для кого это</SectionHeader>
          <p className="text-base md:text-xl text-center opacity-90 mb-6 md:mb-8">
            <BionicText>Для русскоязычных мужчин, которые:</BionicText>
          </p>
          <div className="space-y-3 md:space-y-4">
            <BulletItem>Чувствуют внутреннее напряжение, усталость, потерянность — даже если снаружи "всё нормально".</BulletItem>
            <BulletItem>Много несут в себе и редко говорят о самом важном вслух.</BulletItem>
            <BulletItem>Хочется честных, тёплых мужских разговоров без игры в "я в порядке".</BulletItem>
            <BulletItem>Уже знакомы с каннабисом и готовы относиться к нему уважительно как к растению-учителю, а не способу забыться или убежать от проблем.</BulletItem>
          </div>
        </div>
      </section>

      {/* What Is This Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center mb-2 md:mb-4">
            <img
              src="https://i.imgur.com/Q6c3UZT.png"
              alt="What Is This"
              className="w-20 h-20 md:w-32 md:h-32 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Что это</SectionHeader>
          <div className="space-y-4 md:space-y-6 text-center">
            <p className="text-base md:text-xl leading-relaxed opacity-90">
              <BionicText>Онлайн-круг для русскоязычных мужчин со всего мира.</BionicText>
            </p>
            <p className="text-base md:text-xl leading-relaxed opacity-90">
              <BionicText>Мы встречаемся в Zoom, и каждый участник входит в круг в союзе с растением-учителем (каннабисом) в мягкой, осознанной дозе.</BionicText>
            </p>
            <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 mt-6 md:mt-8">
              <p className="text-base md:text-xl leading-relaxed opacity-90">
                <BionicText>Это не про накуриться вместе. Это про внимательную совместную работу с растением, чтобы честнее чувствовать, говорить и впускать свет внутрь.</BionicText>
              </p>
            </div>
          </div>
          <div className="pt-6 md:pt-8 text-center">
            <CTAButton onClick={scrollToPayment} />
          </div>
        </div>
      </section>

      {/* How Meeting Goes Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center mb-2 md:mb-4">
            <img
              src="https://i.imgur.com/RpmgjXZ.png"
              alt="How Meeting Goes"
              className="w-20 h-20 md:w-32 md:h-32 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Как проходит встреча</SectionHeader>
          <div className="space-y-3 md:space-y-4">
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
          <div className="pt-6 md:pt-8 text-center">
            <CTAButton onClick={scrollToPayment} />
          </div>
        </div>
      </section>

      {/* Who Leads Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <SectionHeader>Кто ведёт</SectionHeader>
          <div className="text-center space-y-4 md:space-y-6">
            {/* Profile Photos */}
            <div className="flex justify-center gap-3 md:gap-6 mb-4 md:mb-6">
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20">
                <img
                  src="https://i.imgur.com/40cWWoe.jpeg"
                  alt="Aleksandr - Shamanic"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20">
                <img
                  src="https://i.imgur.com/XctlWbQ.jpeg"
                  alt="Aleksandr - Professional"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <p className="text-lg md:text-2xl font-semibold">
              <BionicText>Я — Александр.</BionicText>
            </p>
            <div className="space-y-3 md:space-y-4 text-[15px] md:text-xl leading-relaxed opacity-90">
              <p><BionicText>Провёл 150+ церемоний и процессов с растениями-учителями для людей из разных стран и культур.</BionicText></p>
              <p>
                <BionicText>Давно и плотно углубляю мастерство в интегральной теории у Кена Уилбера.</BionicText>
                <a href="https://i.imgur.com/KY4Pd5o.png" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-300 hover:text-blue-200 underline text-xs md:text-sm">(сертификат)</a>
              </p>
              <p><BionicText>Изучал инновационное предпринимательство в MIT, более 10 лет строю стартапы на основе искусственного интеллекта и консультирую фаундеров в web3 стартап студии </BionicText><a href="https://rndao.io/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">RnD Ventures</a>.</p>
              <p><BionicText>Ваш проводник — не только про траву, но и про очень конкретную реальность: деньги, стезя, отношения, ответственность, физическое тело, достижения, творчество, создание блага.</BionicText></p>
            </div>
          </div>
          <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 mt-6 md:mt-8">
            <p className="text-base md:text-xl font-semibold mb-3 md:mb-4 text-center">
              <BionicText>В круге я:</BionicText>
            </p>
            <div className="space-y-2 md:space-y-3">
              <BulletItem>держу поле и границы,</BulletItem>
              <BulletItem>веду две активации,</BulletItem>
              <BulletItem>слежу за безопасностью и ритмом,</BulletItem>
              <BulletItem>вмешиваюсь, если кто-то теряет контакт с собой или ломает поле.</BulletItem>
            </div>
          </div>
          <div className="pt-6 md:pt-8 text-center">
            <CTAButton onClick={scrollToPayment} />
          </div>
        </div>
      </section>

      {/* Safety and Rules Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center mb-2 md:mb-4">
            <img
              src="https://i.imgur.com/GMwBqqz.png"
              alt="Safety and Rules"
              className="w-20 h-20 md:w-32 md:h-32 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Безопасность и правила</SectionHeader>
          <p className="text-base md:text-xl text-center opacity-90 mb-6 md:mb-8">
            <BionicText>Чтобы всем было безопасно и по-настоящему, опираемся на несколько простых правил.</BionicText>
          </p>

          <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 mb-4 md:mb-6">
            <p className="font-semibold mb-2"><BionicText>Каннабис</BionicText></p>
            <p className="text-[15px] md:text-xl leading-relaxed opacity-90">
              <BionicText>Участие — только с каннабисом, в мягкой дозировке. Цель — ясность и честность, а не диссоциация.</BionicText>
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {/* Mental Health */}
            <InfoCard icon={Shield}>
              <p className="font-semibold mb-2"><BionicText>Про психическое здоровье</BionicText></p>
              <p><BionicText>Если у тебя тяжёлые психиатрические диагнозы, были эпизоды психоза или сейчас очень нестабильное состояние — это пространство не подойдёт.</BionicText></p>
              <p className="mt-2"><BionicText>Круг не является психотерапией и не заменяет работу с врачом или терапевтом.</BionicText></p>
            </InfoCard>

            {/* Presence Format */}
            <InfoCard icon={Users}>
              <p className="font-semibold mb-2"><BionicText>Формат присутствия</BionicText></p>
              <div className="space-y-1.5 md:space-y-2">
                <p><BionicText>Конфиденциальность: всё, что сказано в кругу, остаётся в кругу.</BionicText></p>
                <p><BionicText>Камеры включены. Мы приходим как участники, а не как зрители.</BionicText></p>
                <p><BionicText>Я оставляю за собой право остановить процесс или человека, если вижу, что это небезопасно для него или для поля.</BionicText></p>
              </div>
            </InfoCard>

            {/* How We Speak */}
            <InfoCard icon={MessageCircle}>
              <p className="font-semibold mb-2"><BionicText>Как мы говорим</BionicText></p>
              <div className="space-y-1.5 md:space-y-2">
                <p><BionicText>Говорим от себя, честно и по сути.</BionicText></p>
                <p><BionicText>Не даём советов без прямого запроса.</BionicText></p>
                <p><BionicText>Не перебиваем и не спорим с личным опытом другого.</BionicText></p>
                <p><BionicText>Уважаем время и место каждого.</BionicText></p>
              </div>
            </InfoCard>
          </div>

          <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <p className="text-base md:text-xl leading-relaxed opacity-90">
              <BionicText>Круг набирается только по приглашениям и рекомендациям и нигде не рекламируется.</BionicText>
            </p>
          </div>
        </div>
      </section>

      {/* Contribution Section */}
      <section id="join-section" className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center mb-4 md:mb-8">
            <img
              src="https://i.imgur.com/EH24PWf.png"
              alt="Men's Circle"
              className="w-32 h-32 md:w-56 md:h-56 mx-auto object-contain"
            />
          </div>
          <SectionHeader>Вклад и деньги</SectionHeader>
          <div className="text-center space-y-3 md:space-y-4 mb-6 md:mb-8">
            <p className="text-base md:text-xl leading-relaxed opacity-90">
              <BionicText>Формат один и тот же для всех. Ты сам выбираешь уровень вклада — по своим возможностям и отклику.</BionicText>
            </p>
          </div>

          <div className="grid gap-3 md:gap-6">
            {/* $33 Option */}
            <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-6 text-base md:text-xl font-serif rounded-full btn-premium mb-3 min-h-[48px]"
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
              <p className="text-sm md:text-lg opacity-80 leading-relaxed">
                <BionicText>Базовый вклад за месяц (1 встреча), минимальный энергообмен, чтобы круг жил.</BionicText>
              </p>
            </div>

            {/* $100 Option */}
            <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-6 text-base md:text-xl font-serif rounded-full btn-premium mb-3 min-h-[48px]"
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
              <p className="text-sm md:text-lg opacity-80 leading-relaxed">
                <BionicText>Поддерживающий вклад, если хочешь сильнее поддержать поле и моё время.</BionicText>
              </p>
            </div>

            {/* $333 Option */}
            <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-6 text-base md:text-xl font-serif rounded-full btn-premium mb-3 min-h-[48px]"
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
              <p className="text-sm md:text-lg opacity-80 leading-relaxed">
                <BionicText>Вклад покровителя поля, если можешь и чувствуешь, что это твоё «да».</BionicText>
              </p>
            </div>
          </div>

          <div className="text-center space-y-3 md:space-y-4 mt-6 md:mt-8">
            <p className="text-base md:text-xl leading-relaxed opacity-90">
              <BionicText>Содержание одинаково для всех уровней. Разный вклад — про честность с самим собой.</BionicText>
            </p>
            <p className="text-base md:text-xl leading-relaxed opacity-80 italic">
              <BionicText>Если отклик сильный, а с деньгами сейчас непросто — </BionicText>
              <a href="https://t.me/integralevolution" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">напиши</a>
              <BionicText>, обязательно решим.</BionicText>
            </p>
          </div>

          <div className="pt-6 md:pt-8 text-center hidden md:block">
            <CTAButton onClick={scrollToPayment} />
          </div>
        </div>
      </section>

      {/* What You Take Away Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <SectionHeader>Что ты заберёшь с собой</SectionHeader>
          <div className="space-y-3 md:space-y-4">
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
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
          <SectionHeader>Что это точно не</SectionHeader>
          <div className="space-y-3 md:space-y-4">
            <BulletItem>Не "покурить с пацанами".</BulletItem>
            <BulletItem>Не соревнование "кто круче".</BulletItem>
            <BulletItem>Не психотерапия и не диагностика.</BulletItem>
            <BulletItem>Не попытка "перевести" тебя в какую-то веру или систему.</BulletItem>
          </div>
          <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10 mt-6 md:mt-8 text-center">
            <p className="text-base md:text-xl leading-relaxed opacity-90">
              <BionicText>Это круг для взрослых мужчин, которые чувствуют: «Хватит делать вид, что всё ок. Пора говорить по-настоящему — и впускать свет внутрь.»</BionicText>
            </p>
          </div>
        </div>
      </section>


      {/* Bottom padding for sticky CTA on mobile */}
      <div className="h-20 md:hidden" />

      <div className="bg-white">
        <Footer />
      </div>
      <ScrollToTop />
      <StickyMobileCTA onClick={scrollToPayment} />
    </div>
  );
};

export default MensCircle;
