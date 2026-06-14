import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Calendar, Send, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BackButton from "@/components/BackButton";
// Logo is loaded from Imgur URL

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

// Event details
const EVENT_DETAILS = {
    title: "Мужской Круг с Каннабисом",
    date: "2025-01-04",
    startTime: "15:00:00", // UTC (11 PM Bali = 3 PM UTC)
    endTime: "17:00:00",   // 2 hours duration
    timezone: "UTC",
    zoomLink: "https://us02web.zoom.us/j/89745439171",
    telegram: "@IntegralEvolution",
};

// Generate calendar URLs
const generateCalendarUrls = () => {
    const startDate = new Date(`${EVENT_DETAILS.date}T${EVENT_DETAILS.startTime}Z`);
    const endDate = new Date(`${EVENT_DETAILS.date}T${EVENT_DETAILS.endTime}Z`);

    const formatDateGoogle = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace('.000', '');
    const formatDateOutlook = (date: Date) => date.toISOString();

    const title = encodeURIComponent(EVENT_DETAILS.title);
    const description = encodeURIComponent(`Zoom: ${EVENT_DETAILS.zoomLink}\n\nTelegram: ${EVENT_DETAILS.telegram}`);
    const location = encodeURIComponent(EVENT_DETAILS.zoomLink);

    return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDateGoogle(startDate)}/${formatDateGoogle(endDate)}&details=${description}&location=${location}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${formatDateOutlook(startDate)}&enddt=${formatDateOutlook(endDate)}&body=${description}&location=${location}`,
        apple: `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${formatDateGoogle(startDate)}%0ADTEND:${formatDateGoogle(endDate)}%0ASUMMARY:${title}%0ADESCRIPTION:${description}%0ALOCATION:${location}%0AEND:VEVENT%0AEND:VCALENDAR`,
    };
};

const MensCircleThankYou = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const calendarUrls = generateCalendarUrls();

    return (
        <div
            className="min-h-dvh font-serif"
            style={{ backgroundColor: "#041a2f", color: "#E0E4EA" }}
        >
            <Navigation />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-2xl mx-auto text-center space-y-8">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-emerald-400" />
                        </div>
                    </div>

                    <img
                        src="https://i.imgur.com/NGSxNw8.png"
                        alt={t('mensCircleThanks.imageAlt')}
                        loading="lazy"
                        className="w-48 h-48 mx-auto object-contain"
                    />

                    <h1 className="text-3xl md:text-4xl leading-tight">
                        <BionicText>СПАСИБО ЗА РЕГИСТРАЦИЮ!</BionicText>
                    </h1>

                    <p className="text-xl leading-relaxed opacity-90">
                        <BionicText>
                            Добро пожаловать в Мужской круг. Ниже — все детали для участия в ближайшем круге.
                        </BionicText>
                    </p>

                    {/* Event Details Card */}
                    <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-left space-y-6 mt-12">
                        <h2 className="text-2xl text-center mb-6">
                            <BionicText>ВАЖНЫЕ ДЕТАЛИ</BionicText>
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">📅</span>
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">Дата</p>
                                    <p className="text-lg">
                                        <BionicText>4 января 2025</BionicText>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🕐</span>
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">Время</p>
                                    <p className="text-lg">
                                        <BionicText>11 вечера по Бали · 10 утра по Амстердаму · 7 утра по Сан-Франциско</BionicText>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">🎥</span>
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">Zoom</p>
                                    <a
                                        href={EVENT_DETAILS.zoomLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg text-blue-300 hover:text-blue-200 underline break-all"
                                    >
                                        {EVENT_DETAILS.zoomLink}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Send className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">Telegram</p>
                                    <a
                                        href="https://t.me/IntegralEvolution"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-lg text-blue-300 hover:text-blue-200"
                                    >
                                        {EVENT_DETAILS.telegram}
                                    </a>
                                </div>
                            </div>

                            {/* Telegram Instructions inside box */}
                            <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                                <p className="text-lg leading-relaxed">
                                    <BionicText>Напиши мне в Telegram пару строк о себе и своём намерении.</BionicText>
                                    {" "}
                                    <a href="https://t.me/integralevolution" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">@integralevolution</a>
                                </p>
                                <p className="text-lg leading-relaxed opacity-90">
                                    <BionicText>Я отвечу продублировав дату, детали и пошлю предельно простые инструкции по подготовке.</BionicText>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add to Calendar */}
                    <div className="pt-8 space-y-4">
                        <p className="text-lg opacity-90">
                            <BionicText>Добавить в календарь:</BionicText>
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 border-white/20 hover:bg-white/10"
                                style={{ color: "#E0E4EA" }}
                                onClick={() => window.open(calendarUrls.google, "_blank")}
                            >
                                <Calendar className="w-4 h-4" />
                                {t('mensCircleThanks.calGoogle')}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 border-white/20 hover:bg-white/10"
                                style={{ color: "#E0E4EA" }}
                                onClick={() => window.open(calendarUrls.outlook, "_blank")}
                            >
                                <Calendar className="w-4 h-4" />
                                {t('mensCircleThanks.calOutlook')}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 border-white/20 hover:bg-white/10"
                                style={{ color: "#E0E4EA" }}
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = calendarUrls.apple;
                                    link.download = 'mens-circle.ics';
                                    link.click();
                                }}
                            >
                                <Calendar className="w-4 h-4" />
                                {t('mensCircleThanks.calApple')}
                            </Button>
                        </div>
                    </div>

                    {/* Telegram Instructions */}
                    <div className="pt-8 space-y-4 text-left p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-lg leading-relaxed">
                            <BionicText>Напиши мне в Telegram пару строк о себе и своём намерении.</BionicText>
                            {" "}
                            <a
                                href="https://t.me/integralevolution"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 hover:text-blue-200 underline"
                            >
                                @integralevolution
                            </a>
                        </p>
                        <p className="text-lg leading-relaxed opacity-90">
                            <BionicText>Я отвечу продублировав дату, детали и пошлю предельно простые инструкции по подготовке.</BionicText>
                        </p>
                    </div>

                    {/* Back Link */}
                    <div className="pt-12">
                        <BackButton
                            to="/mens-circle"
                            label={<BionicText>Вернуться на страницу Мужского круга</BionicText>}
                            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default MensCircleThankYou;
