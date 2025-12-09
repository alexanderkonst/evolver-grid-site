import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
// Logo is loaded from Imgur URL

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
            src="https://i.imgur.com/NGSxNw8.png"
            alt="Men's Circle"
            className="w-32 h-32 mx-auto mb-6 object-contain"
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
            src="https://i.imgur.com/NGSxNw8.png"
            alt="Men's Circle"
            className="w-28 h-28 mx-auto mb-4 object-contain"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
            <BionicText>МУЖСКОЙ КРУГ С КАННАБИСОМ</BionicText>
          </h1>
          <h2 className="text-xl md:text-2xl leading-relaxed opacity-90 max-w-3xl mx-auto">
            <BionicText>
              Со-создаём один из самых душевных, качественных, трансформирующих и глобально ориентированных русскоязычных мужских кругов на планете с каннабисом как растением силы.
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
            <p><BionicText>Время: 11 вечера по Бали · 10 утра по Амстердаму · 7 утра по Сан-Франциско</BionicText></p>
            <p><BionicText>Длительность: 2 часа</BionicText></p>
            <p><BionicText>Частота: по умолчанию раз в месяц, можем поменять вместе на первом круге.</BionicText></p>
          </div>

          {/* Beautiful cards instead of bullet points */}
          <div className="grid gap-6 mt-12">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🧘</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    <BionicText>Медитация</BionicText>
                  </h4>
                  <p className="text-lg opacity-90">
                    <BionicText>В начале и в конце я проведу для нас медитацию, чтобы погрузиться глубже в себя и отпустить груз тревог.</BionicText>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    <BionicText>Живой разговор</BionicText>
                  </h4>
                  <p className="text-lg opacity-90">
                    <BionicText>Затем будет живой разговор и то, что рождается в моменте.</BionicText>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">
                    <BionicText>Вместе создаём</BionicText>
                  </h4>
                  <p className="text-lg opacity-90">
                    <BionicText>Правила и периодичность встреч дорабатываем вместе.</BionicText>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section - Contribution with Stripe Buttons */}
      <section id="join-section" className="py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <h3 className="text-2xl md:text-3xl text-center mb-4">
            <BionicText>ЗАПИСАТЬСЯ НА ПЕРВЫЙ КРУГ</BionicText>
          </h3>
          <p className="text-xl text-center opacity-90 mb-12">
            <BionicText>Выберите свой вклад за участие</BionicText>
          </p>

          <div className="grid gap-6">
            {/* $33 Option */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="px-10 py-6 text-xl font-serif rounded-full mb-6"
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
              <p className="text-xl">
                <BionicText>Для тех, кто в процессе перехода</BionicText>
              </p>
            </div>

            {/* $100 Option */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="px-10 py-6 text-xl font-serif rounded-full mb-6"
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
              <p className="text-xl">
                <BionicText>Полная трансформационная ценность</BionicText>
              </p>
            </div>

            {/* $333 Option */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
              <Button
                className="px-10 py-6 text-xl font-serif rounded-full mb-6"
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
              <p className="text-xl">
                <BionicText>Стать бенефактором</BionicText>
              </p>
            </div>
          </div>

          <p className="text-lg leading-relaxed opacity-90 text-center mt-12">
            <BionicText>
              Ежемесячный вклад за участие в круге поддерживает мою работу по созданию, удержанию и организации поля, а также даёт возможность делать стипендии для других.
            </BionicText>
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

            <div className="space-y-4">
              <h4 className="text-xl font-semibold">
                <BionicText>Будет ли доступна запись?</BionicText>
              </h4>
              <p className="text-lg leading-relaxed opacity-90">
                <BionicText>
                  Да, запись будет доступна только для зарегистрированных участников.
                </BionicText>
              </p>
            </div>
          </div>

          {/* CTA Button after FAQ */}
          <div className="pt-8 text-center">
            <Button
              onClick={scrollToPayment}
              className="px-8 py-6 text-lg font-serif rounded-full"
              style={{
                backgroundColor: "#E0E4EA",
                color: "#041a2f"
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
