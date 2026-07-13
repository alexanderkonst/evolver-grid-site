import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown, User, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/you-be-original-main-lockup.webp"; // Day 123 (Sasha 2026-07-13): main brand -> YOU be original

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
}

const Navigation = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navigation on game and onboarding routes
  const hideOnRoutes = ['/game', '/start', '/zone-of-genius', '/quality-of-life-map'];
  const shouldHide = hideOnRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHide) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUserProfile(user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('game_profiles')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setUserProfile(data);
    }
  };

  const handleLogout = async () => {
    // Clear user-specific localStorage to prevent profile mixing on shared devices
    window.localStorage.removeItem("game_profile_id");
    window.localStorage.removeItem("guest_appleseed_data");
    window.localStorage.removeItem("guest_ai_response");
    window.localStorage.removeItem("guest_excalibur_data");
    window.localStorage.removeItem("invited_by_profile_id");
    await supabase.auth.signOut();
    setUserProfile(null);
    navigate("/");
  };

  // Get display name: first name, or email prefix, or "Account"
  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return t('navigation.accountFallback');
  };

  const navLinks = [
    { to: "/game/next-move", labelKey: "navigation.navLinks.gameOfLife", isScroll: false, isPrimary: true },
    { to: "/modules", labelKey: "navigation.navLinks.tools", isScroll: false },
    { to: "/library", labelKey: "navigation.navLinks.library", isScroll: false },
    { to: "/contact", labelKey: "navigation.navLinks.contact", isScroll: false },
    { to: "https://buy.stripe.com/4gweVVb2E75r0Wk00p", labelKey: "navigation.navLinks.donate", isScroll: false, isExternal: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-modal bg-card/95 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              to="/"
              className="flex items-center transition-all duration-300 logo-glow hover:logo-glow-hover"
            >
              <img src={logo} alt="Aleksandr Konstantinov" loading="lazy" className="h-16 w-auto" />
            </Link>
          </div>

          {/* Left: Navigation */}
          <div className="flex items-center gap-8">

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                link.isScroll ? (
                  <a
                    key={link.to}
                    href={link.to}
                    className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.location.pathname === '/') {
                        const element = document.getElementById('modules');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        window.location.href = '/#modules';
                      }
                    }}
                  >
                    {t(link.labelKey)}
                  </a>
                ) : link.isExternal ? (
                  <a
                    key={link.to}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(link.labelKey)}
                  </a>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={`nav-link text-sm transition-colors ${link.isPrimary ? 'font-semibold text-amber-600 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(217,119,6,0.4)] hover:drop-shadow-[0_0_10px_rgba(217,119,6,0.6)]' : 'font-medium text-muted-foreground hover:text-foreground'}`}
                    activeClassName="text-foreground"
                  >
                    {t(link.labelKey)}
                  </NavLink>
                )
              ))}
            </div>
          </div>

          {/* Right: Auth Status & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Auth Status - Desktop */}
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center pl-4 border-l border-border">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs flex items-center gap-1 text-foreground"
                      >
                        {getDisplayName()}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/game/me" className="flex items-center cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          {t('navigation.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/game/next-move" className="flex items-center cursor-pointer">
                          <Gamepad2 className="h-4 w-4 mr-2" />
                          {t('navigation.gameOfLife')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('navigation.logOut')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-4 border-l border-border">
                  <span className="text-xs text-muted-foreground">{t('navigation.playingAsGuest')}</span>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="h-8 text-xs"
                  >
                    <Link to="/auth">{t('navigation.logInSignUp')}</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              link.isScroll ? (
                <a
                  key={link.to}
                  href={link.to}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    if (window.location.pathname === '/') {
                      const element = document.getElementById('modules');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.location.href = '/#modules';
                    }
                  }}
                >
                  {t(link.labelKey)}
                </a>
              ) : link.isExternal ? (
                <a
                  key={link.to}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {t(link.labelKey)}
                </a>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`block py-2 text-base transition-colors ${link.isPrimary ? 'font-semibold text-amber-600 dark:text-amber-400' : 'font-medium text-muted-foreground hover:text-foreground'}`}
                  activeClassName="text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {t(link.labelKey)}
                </NavLink>
              )
            ))}

            {/* Mobile Auth Status */}
            <div className="pt-3 border-t border-border mt-3">
              {user ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{getDisplayName()}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Link
                    to="/game/me"
                    className="flex items-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {t('navigation.profile')}
                  </Link>
                  <Link
                    to="/game/next-move"
                    className="flex items-center py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" />
                    {t('navigation.gameOfLife')}
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('navigation.logOut')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{t('navigation.playingAsGuestLong')}</p>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to="/auth">{t('navigation.logInSignUp')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
