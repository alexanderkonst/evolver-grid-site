import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import mensCircleIcon from "@/assets/mens-circle-icon.png";

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
            src={mensCircleIcon}
            alt="Men's Circle"
            className="w-24 h-24 mx-auto mb-6"
          />
          <p
            className="text-lg font-serif leading-relaxed"
            style={{ color: "#E0E4EA" }}
          >
            <BionicText>
              Вход в этот модуль по приглашению. Введите код доступа, чтобы войти в пространство Мужского круга.
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
              className="w-full py-6 text-lg font-serif rounded-full"
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
      className="min-h-screen font-serif"
      style={{ backgroundColor: "#041a2f", color: "#E0E4EA" }}
    >
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <img
            src={mensCircleIcon}
            alt="Men's Circle"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
            <BionicText>МУЖСКОЙ КРУГ С КАННАБИСОМ</BionicText>
          </h1>
          <h2 className="text-xl md:text-2xl leading-relaxed opacity-90 max-w-3xl mx-auto">
            <BionicText>
              Создаём один из самых душевных, качественных, трансформирующих и глобально ориентированных русскоязычных мужских кругов на планете с каннабисом как растением силы.
            </BionicText>
          </h2>
          <Button
            onClick={scrollToPayment}
            className="px-8 py-6 text-lg font-serif rounded-full mt-8"
            style={{
              backgroundColor: "#E0E4EA",
              color: "#041a2f"
            }}
          >
            <BionicText>Записаться на первый круг</BionicText>
          </Button>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h3 className="text-2xl md:text-3xl mb-8">
            <BionicText>ВИДЕНИЕ</BionicText>
          </h3>
          <p className="text-lg md:text-xl leading-relaxed opacity-90">
            <BionicText>
              Это пространство для русскоязычных мужчин, которые относятся к каннабису как к растению силы и хотят использовать его для простого и душевного разговора, поддержки и роста. Как в бане, как в походе в горы, как у костра.
            </BionicText>
          </p>
        </div>
      </section>

      {/* How the Circle Works */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-8">
          <h3 className="text-2xl md:text-3xl text-center mb-8">
            <BionicText>КАК УСТРОЕН КРУГ</BionicText>
          </h3>

          <div className="space-y-4 text-lg leading-relaxed opacity-90">
            <p><BionicText>Дата первого круга: 4 января</BionicText></p>
            <p><BionicText>Длительность: 2 часа</BionicText></p>
            <p><BionicText>Частота: по умолчанию раз в месяц, можем поменять вместе на первом круге.</BionicText></p>
          </div>

          <ul className="space-y-3 text-lg leading-relaxed opacity-90 list-disc list-inside mt-8">
            <li><BionicText>в начале я провожу короткую медитацию;</BionicText></li>
            <li><BionicText>затем — живой разговор и то, что рождается в моменте, никаких других правил;</BionicText></li>
            <li><BionicText>в конце — ещё одна короткая медитация;</BionicText></li>
            <li><BionicText>правила и периодичность встреч дорабатываем вместе.</BionicText></li>
          </ul>
        </div>
      </section>

      {/* Contribution Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h3 className="text-2xl md:text-3xl text-center mb-8">
            <BionicText>ВКЛАД ЗА УЧАСТИЕ</BionicText>
          </h3>

          <p className="text-lg leading-relaxed opacity-90 text-center">
            <BionicText>
              За участие в круге я прошу ежемесячный вклад — это поддерживает мою работу по созданию, удержанию и организации поля, а также даёт возможность делать стипендии для других.
            </BionicText>
          </p>

          <div className="space-y-6 mt-8">
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="text-lg">
                <BionicText>$33 в месяц — для тех, кому важно войти бережно, но оставаться в честном обмене.</BionicText>
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="text-lg">
                <BionicText>$100 в месяц — сбалансированный обмен за энергию, архитектуру, ведение и организацию круга.</BionicText>
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <p className="text-lg">
                <BionicText>$333 в месяц — для тех, кто чувствует отклик поддержать меня, круг и стипендии для других участников.</BionicText>
              </p>
            </div>
          </div>

          <p className="text-lg leading-relaxed opacity-90 text-center mt-8">
            <BionicText>Выбираете уровень сами, без объяснений.</BionicText>
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-3xl mx-auto space-y-12">
          <h3 className="text-2xl md:text-3xl text-center mb-8">
            <BionicText>FAQ</BionicText>
          </h3>

          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">
                <BionicText>Какая рекомендованная доза каннабиса?</BionicText>
              </h4>
              <p className="text-lg leading-relaxed opacity-90">
                <BionicText>
                  Рекомендация — примерно 30–50% от вашей обычной дозы. Каждый сам отвечает за выбранную дозу, своё здоровье и соблюдение законов своей страны.
                </BionicText>
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold">
                <BionicText>Кто принимает решения в круге?</BionicText>
              </h4>
              <div className="text-lg leading-relaxed opacity-90 space-y-3">
                <p><BionicText>Любой участник может предложить изменение формата или новое правило.</BionicText></p>
                <p><BionicText>По умолчанию мы принимаем и пробуем предложение, если нет обоснованных возражений по безопасности.</BionicText></p>
                <p><BionicText>Если видим риск для безопасности, дорабатываем предложение и возвращаемся к нему позже.</BionicText></p>
                <p><BionicText>Если после двух раундов правок единства нет, выносим вопрос на голосование; решение принимается, если за него не менее 2/3 участников.</BionicText></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Join Section */}
      <section id="join-section" className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          <h3 className="text-2xl md:text-3xl mb-8">
            <BionicText>КАК ПРИСОЕДИНИТЬСЯ</BionicText>
          </h3>

          <ol className="space-y-4 text-lg leading-relaxed opacity-90 text-left max-w-xl mx-auto list-decimal list-inside">
            <li><BionicText>Выберите свой уровень ежемесячного вклада.</BionicText></li>
            <li><BionicText>Оплатите через Stripe по ссылке на этой странице.</BionicText></li>
            <li><BionicText>Получите письмо / сообщение с подробностями и ссылкой на первый круг.</BionicText></li>
          </ol>

          <div className="pt-8">
            <Button
              className="px-8 py-6 text-lg font-serif rounded-full"
              style={{
                backgroundColor: "#E0E4EA",
                color: "#041a2f"
              }}
              onClick={() => {
                // TODO: Add Stripe payment link
                window.open("#", "_blank");
              }}
            >
              <BionicText>Записаться на первый круг</BionicText>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default MensCircle;
