import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("notFound.code")}</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.title")}</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          {t("notFound.home")}
        </Link>
        {/* Phase 0 i18n pilot — temporary switcher placement to prove the
            pipeline end-to-end. Proper home (global menu / Settings) is a
            Phase 1 UX decision. See docs/specs/i18n/scope_of_work.md. */}
        <LanguageSwitcher className="mt-8 flex items-center justify-center gap-2" />
      </div>
    </div>
  );
};

export default NotFound;
