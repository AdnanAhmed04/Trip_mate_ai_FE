import { useState, useEffect } from "react";
import { TrustedVendorServices } from "./TrustedVendorServices";
import { TrustedHotelsServices } from "./TrustedHotelsServices";
import {
  Hotel,
  Trees,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Star,
  ArrowRight,
  Users,
  Building2,
  TrendingUp,
  Shield,
  DollarSign,
  MessageSquare,
  Sparkles,
  Clock,
  Menu,
  X,
  LogOut,
  Zap,
  CalendarCheck,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AnimatedCounter } from "./AnimatedCounter";
import InteractiveGlobeSection from "./InteractiveGlobeSection";
import CustomerReviewSlider from "./ReviewSlider";
import navlogo from "../navlogo.png";
import { clsx } from 'clsx';
import { Vendor, RegisteredHotel } from "../types";

interface GlobeMarker {
  id: string;
  label: string;
  type: "hotel" | "place";
  position: { top: string; left: string };
}

interface LandingPageProps {
  onVendorClick: (vendor: Vendor) => void;
  onGetStarted: () => void;
  onViewVendors?: () => void;
  onRegisterVendor?: () => void;
  onMyTrips?: () => void;
  onLeaveFeedback?: () => void;
  onLogout?: () => void;
  onHotelClick?: (hotel: RegisteredHotel) => void;
  onRegisterHotel?: () => void;
}



const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'ar', name: 'العربية', flag: 'sa' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'fr', name: 'Français', flag: 'fr' },
];

const globeMarkers: GlobeMarker[] = [
  {
    id: "1",
    label: "NYC Hotels",
    type: "hotel",
    position: { top: "35%", left: "25%" },
  },
  {
    id: "2",
    label: "Paris Attractions",
    type: "place",
    position: { top: "30%", left: "48%" },
  },
  {
    id: "3",
    label: "Tokyo Hotels",
    type: "hotel",
    position: { top: "38%", left: "78%" },
  },
  {
    id: "4",
    label: "London Sites",
    type: "place",
    position: { top: "32%", left: "47%" },
  },
  {
    id: "5",
    label: "Sydney Resorts",
    type: "hotel",
    position: { top: "70%", left: "80%" },
  },
  {
    id: "6",
    label: "Rome Heritage",
    type: "place",
    position: { top: "36%", left: "52%" },
  },
  {
    id: "7",
    label: "Bali Paradise",
    type: "hotel",
    position: { top: "58%", left: "72%" },
  },
  {
    id: "8",
    label: "Dubai Luxury",
    type: "hotel",
    position: { top: "42%", left: "58%" },
  },
  {
    id: "9",
    label: "Rio Adventures",
    type: "place",
    position: { top: "62%", left: "32%" },
  },
  {
    id: "10",
    label: "Cairo Wonders",
    type: "place",
    position: { top: "40%", left: "54%" },
  },
];

export function LandingPage({
  onVendorClick,
  onGetStarted,
  onViewVendors,
  onRegisterVendor,
  onMyTrips,
  onLeaveFeedback,
  onLogout,
  onHotelClick,
  onRegisterHotel,
}: LandingPageProps) {
  const [currentLang, setCurrentLang] = useState('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(^|;) ?googtrans=([^;]*)(;|$)/);
    if (match && match[2]) {
      const parts = match[2].split('/');
      const code = parts[parts.length - 1];
      if (code && LANGUAGES.some(l => l.code === code)) {
        setCurrentLang(code);
      }
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    if (langCode === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; domain=${window.location.hostname}; path=/`;
    }
    window.location.reload();
  };

  const [hoveredMarker, setHoveredMarker] = useState<
    string | null
  >(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBkZXN0aW5hdGlvbiUyMHNjZW5pY3xlbnwxfHx8fDE3NjM3Mjg1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHRyb3BpY2FsJTIwcGFyYWRpc2UlMjB2YWNhdGlvbnxlbnwxfHx8fDE3NjM3Mjg1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1713959989861-2425c95e9777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjM2Njk3NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1708892442858-187af554be24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHVyYmFuJTIwdHJhdmVsfGVufDF8fHx8MTc2MzcyODU3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(
        (prev) => (prev + 1) % backgroundImages.length,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      <nav className={clsx(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-4 sm:py-6",
        isMenuOpen ? "bg-gray-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"
      )}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-[110]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center cursor-pointer transform hover:scale-105 transition-transform" onClick={() => { setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <img
                  src={navlogo}
                  className="h-16 sm:h-24 w-auto object-contain"
                  alt="TripMate Logo"
                />
              </div>
            </div>

            {/* Desktop Actions (Visible on md and larger) */}
            <div className="hidden md:flex items-center gap-3 sm:gap-6">
              <button
                onClick={onMyTrips}
                className="font-bold cursor-pointer px-5 sm:px-6 py-2.5 rounded-full transition-all border border-white/10 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 active:scale-95 items-center justify-center text-xs sm:text-sm"
              >
                My Trips
              </button>

              <button
                onClick={onGetStarted}
                className="font-bold cursor-pointer px-5 sm:px-8 py-2.5 rounded-full transition-all border border-white/30 text-white bg-blue-600/40 backdrop-blur-md hover:bg-blue-600/60 active:scale-95 flex items-center justify-center shadow-lg text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                Get Started
              </button>

              {/* Language Dropdown */}
              <div className="relative group flex items-center">
                <button
                  className="flex items-center gap-2 transition-all font-bold text-xs px-3.5 py-2.5 rounded-full border border-white/10 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 cursor-pointer shadow-sm"
                >
                  <img
                    src={`https://flagcdn.com/w40/${LANGUAGES.find(l => l.code === currentLang)?.flag || 'gb'}.png`}
                    width="24"
                    alt="Flag"
                    className="rounded-sm shadow-sm"
                  />
                  <span className="uppercase tracking-widest ml-1">{LANGUAGES.find(l => l.code === currentLang)?.code}</span>
                  <svg className="w-2.5 h-2.5 ml-1 opacity-50 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div className="absolute right-0 top-[100%] mt-3 w-40 bg-gray-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 p-2 group-hover:visible transition-all duration-300 transform origin-top-right group-hover:translate-y-0 translate-y-4 z-50 shadow-2xl">
                  <div className="space-y-1">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center gap-3 rounded-xl transition-all cursor-pointer ${currentLang === lang.code
                          ? 'bg-blue-600/40 text-white font-bold border border-blue-500/20'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white font-medium'
                          }`}
                      >
                        <img
                          src={`https://flagcdn.com/w40/${lang.flag}.png`}
                          width="20"
                          alt="Flag"
                          className="rounded-sm shadow-sm"
                        />
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Hamburger Toggle (Visible on screens smaller than md) */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white transition-all active:scale-90 shadow-2xl backdrop-blur-xl relative z-[120]"
              >
                {isMenuOpen ? <X size={24} className="animate-in fade-in zoom-in duration-300" /> : <Menu size={24} className="animate-in fade-in zoom-in duration-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={clsx(
          "md:hidden fixed inset-0 z-[90] transition-all duration-500",
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}>
          {/* Enhanced Glass Backdrop (Outside Click) */}
          <div
            className="absolute inset-0 bg-gray-950/90 backdrop-blur-2xl transition-opacity duration-500"
            onClick={() => setIsMenuOpen(false)}
          >
            {/* Animated Gradient Blobs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
          </div>

          {/* Menu Content */}
          <div className={clsx(
            "relative mt-[80px] mx-4 bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 space-y-8 transition-all duration-500 ease-out transform rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)]",
            isMenuOpen ? "translate-y-0 opacity-100 scale-100" : "-translate-y-12 opacity-0 scale-90"
          )}>
            {/* Language Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-2">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/70">Select Language</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setIsMenuOpen(false);
                    }}
                    className={clsx(
                      "flex items-center gap-3 p-4 rounded-[1.2rem] border transition-all duration-300",
                      currentLang === lang.code
                        ? "bg-blue-600/40 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    )}
                  >
                    <img src={`https://flagcdn.com/w40/${lang.flag}.png`} width="22" className="rounded-sm shadow-sm" alt={lang.name} />
                    <span className="text-xs font-bold tracking-tight">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  onGetStarted();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-[1.2rem] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 border border-white/20"
              >
                <Zap className="w-4 h-4" />
                Plan New Trip
              </button>

              <button
                onClick={() => {
                  onMyTrips?.();
                  setIsMenuOpen(false);
                }}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-5 rounded-[1.2rem] transition-all flex items-center justify-center gap-3 shadow-lg uppercase tracking-widest"
              >
                <CalendarCheck className="w-4 h-4 text-blue-400" />
                View Past Trips
              </button>
            </div>

            {/* Bottom Section */}
            <div className="pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  onLogout?.();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-5 rounded-[1.2rem] bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500/20 transition-all shadow-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                    <LogOut size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">Session</p>
                    <p className="text-sm font-bold">Sign Out</p>
                  </div>
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={backgroundImages[currentBgIndex]}
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-blue-900/40" />
          <div className="absolute inset-0 bg-black/20 sm:hidden" /> {/* Extra darkening for mobile text readability */}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <div className="max-w-3xl flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="inline-block bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full mb-6 border border-white/20 animate-fade-in-down">
                <span className="flex items-center gap-2 text-sm sm:text-base font-medium">
                  ✨ AI-Powered Travel Planning
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 text-white leading-tight font-bold animate-fade-in-up">
                Your Dream Vacation
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-300">
                  Starts Here
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl mb-10 text-gray-200 leading-relaxed max-w-2xl animate-fade-in-up delay-200">
                Discover amazing destinations, connect with
                trusted vendors, and create unforgettable
                memories with our AI-powered trip planning
                platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12 w-full sm:w-auto animate-fade-in-up delay-300">
                <button
                  onClick={onGetStarted}
                  className="bg-blue-600/30 backdrop-blur-md border border-blue-500/30 cursor-pointer text-white px-8 py-4 rounded-full hover:bg-blue-600/50 transition-all flex items-center justify-center gap-2 text-lg font-bold hover:scale-105 active:scale-95 shadow-lg"
                >
                  <span>Start Planning Your Trip</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Animated Stats Counter */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-2xl animate-fade-in-up delay-300">
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10 hover:border-white/30 transition-colors flex flex-col items-center sm:items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div className="text-xl sm:text-4xl font-bold text-white mb-0.5">
                    <AnimatedCounter end={200} suffix="+" />
                  </div>
                  <div className="text-[8px] sm:text-sm text-gray-300 font-bold uppercase tracking-wider text-center sm:text-left leading-tight">
                    Active Users
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10 hover:border-white/30 transition-colors flex flex-col items-center sm:items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <div className="text-xl sm:text-4xl font-bold text-white mb-0.5">
                    <AnimatedCounter end={100} suffix="+" />
                  </div>
                  <div className="text-[8px] sm:text-sm text-gray-300 font-bold uppercase tracking-wider text-center sm:text-left leading-tight">
                    Active Vendors
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10 hover:border-white/30 transition-colors flex flex-col items-center sm:items-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg sm:rounded-xl flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  </div>
                  <div className="text-xl sm:text-4xl font-bold text-white mb-0.5">
                    <AnimatedCounter end={1000} suffix="+" />
                  </div>
                  <div className="text-[8px] sm:text-sm text-gray-300 font-bold uppercase tracking-wider text-center sm:text-left leading-tight">
                    Total Trips
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Ads - Responsive Positioning */}
        <div className="blink-bounce absolute bottom-6 right-4 sm:bottom-20 sm:right-8 bg-gradient-to-br from-orange-500 to-red-600 text-white px-4 py-3 rounded-2xl text-xs shadow-2xl z-20 border border-white/20 max-w-[200px] hover:scale-110 transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div className="leading-tight">
              <div className="font-bold text-sm mb-0.5">20% Off Premium</div>
              <div className="text-orange-50 text-[10px]">for First <b className="text-white">50</b> Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-lg">
            🔥 Limited Time: Book now and get off on paid package.
            Valid until June 31, 2026
          </p>
        </div>
      </div>

      {/* Plan Your Perfect Journey Section */}
      <div className="relative py-16 sm:py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758272959377-1d5466d3841b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb3VybmV5JTIwcGxhbm5pbmclMjBtYXAlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzY0Nzc4NzczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Journey planning background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-black/80 to-gray-900/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block bg-blue-600/20 backdrop-blur-md text-blue-400 px-6 py-2 rounded-full mb-4 border border-blue-500/30">
              <span className="flex items-center justify-center gap-2 font-semibold text-sm sm:text-base">
                ✨ Simple & Efficient
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 text-white font-bold leading-tight">
              Plan Your Perfect Journey
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform makes trip planning
              effortless in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] z-10 transition-transform group-hover:scale-110">
                1
              </div>
              <div className="h-full bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 pt-12 border border-white/10 hover:border-blue-500/50 transition-all hover:bg-white/10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">
                  Choose Your Destination
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base md:text-lg">
                  Tell us where you want to go, how many days
                  you'll stay, and your budget preferences.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] z-10 transition-transform group-hover:scale-110">
                2
              </div>
              <div className="h-full bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 pt-12 border border-white/10 hover:border-blue-500/50 transition-all hover:bg-white/10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">
                  Get AI Recommendations
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base md:text-lg">
                  Our AI analyzes your preferences and suggests
                  personalized destinations and experiences.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] z-10 transition-transform group-hover:scale-110">
                3
              </div>
              <div className="h-full bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 pt-12 border border-white/10 hover:border-blue-500/50 transition-all hover:bg-white/10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <Star className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">
                  Explore & Ready to Go
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base md:text-lg">
                  Review detailed information about each place,
                  save the ones you like, and start your adventure with ease.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <button
              onClick={onGetStarted}
              className="bg-blue-600/30 backdrop-blur-md border border-blue-500/30 cursor-pointer text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full hover:bg-blue-600/50 transition-all flex items-center justify-center gap-3 text-lg sm:text-xl font-bold hover:scale-105 active:scale-95 mx-auto shadow-lg"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
      <InteractiveGlobeSection />


      {/* Vendor Services Section */}

      <TrustedVendorServices
        onVendorClick={onVendorClick}
        onViewVendors={onViewVendors || (() => { })}
        onRegisterVendor={onRegisterVendor || (() => { })}
      />

      {/* Trusted Hotels Section */}
      <TrustedHotelsServices
        onHotelClick={onHotelClick || (() => { })}
        onRegisterHotel={onRegisterHotel || (() => { })}
      />


      {/* Why Trust Us Section */}
      <div className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1742782459449-85ed928fe8ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt="Trust background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/95 via-black/80 to-gray-950/95" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Heading */}
          <div className="text-center sm:mb-4">
            <div className="inline-block bg-blue-600/20 backdrop-blur-md text-blue-400 px-4 py-2 rounded-full mb-6 border border-blue-500/20">
              <span className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                🛡️ Trusted & Secure
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-white tracking-tight">
              Why Trust Us?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We're committed to providing the best travel planning experience through transparency, security, and innovation.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 1 — Trusted Hotels */}
            <div
              onClick={onRegisterHotel}
              className="group bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Hotel className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Trusted Hotels</h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                Admin-verified hotels handpicked for your budget. Book directly from your AI trip — premium members only.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center mb-4 border border-green-500/20 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Transparent Pricing</h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                No hidden fees, just clear service. Honest pricing with zero surprise booking charges.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Secure Booking</h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                256-bit SSL encryption and secure payment gateways protect your data and payments.
              </p>
            </div>

            {/* Card 4 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Exclusive Deals</h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                Member-only offers and flash discounts from our verified global travel partner network.
              </p>
            </div>

            {/* Card 5 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">AI Recommendations</h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                AI algorithms analyze millions of data points for hyper-personalized travel suggestions.
              </p>
            </div>

            {/* Card 6 */}
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-cyan-600/20 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Verified Listings</h3>
              <p className="text-gray-400 leading-relaxed text-xs sm:text-sm">
                Every vendor undergoes a rigorous 5-step verification for quality, reliability and safety.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="relative mt-12 sm:mt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <CustomerReviewSlider onLeaveFeedback={onLeaveFeedback} />
          </div>
        </div>
      </div>


      <footer className="bg-gray-950 text-white pt-2 pb-12 border-t border-white/5 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Footer CTA Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 mb-20 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join thousands of travelers who trust us with their dream vacations. Experience the future of travel planning today.
              </p>
              <button
                onClick={onGetStarted}
                className="bg-blue-600 hover:bg-blue-500 cursor-pointer text-white px-10 py-5 rounded-2xl font-bold transition-all inline-flex items-center gap-3 shadow-2xl hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                <span>Plan Your Trip Now</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            {/* Brand Column */}
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-center gap-3">
                <img src={navlogo} alt="TripMate" className="h-26 w-26 object-contain" />
              </div>
              <p className="text-gray-400 leading-relaxed pr-4">
                Redefining the way you travel with AI-powered itineraries and a global network of trusted vendors. Your journey, perfected.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'Facebook', 'Instagram', 'Linkedin'].map((social) => (
                  <div key={social} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/50 transition-all cursor-pointer group">
                    <span className="sr-only">{social}</span>
                    <div className="w-4 h-4 bg-gray-400 group-hover:bg-blue-400 transition-colors rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-8 text-white">Quick Links</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <button onClick={onMyTrips} className="hover:text-blue-400 transition-colors cursor-pointer">My Trips</button>
                </li>
                <li>
                  <button onClick={onViewVendors} className="hover:text-blue-400 transition-colors cursor-pointer">Explore Vendors</button>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-bold mb-8 text-white">Services</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <button onClick={onGetStarted} className="hover:text-blue-400 transition-colors cursor-pointer">AI Trip Planner</button>
                </li>
                <li>
                  <button onClick={onViewVendors} className="hover:text-blue-400 transition-colors cursor-pointer">Vendor Network</button>
                </li>
                <li>
                  <button onClick={onGetStarted} className="hover:text-blue-400 transition-colors cursor-pointer">Travel Buddy</button>
                </li>
                <li>
                  <button onClick={onGetStarted} className="hover:text-blue-400 transition-colors cursor-pointer">Group Tours</button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-8 text-white">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>support@tripmate.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span>+92-318-8397653</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span>Pakistan , Pk </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} TripMate. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm text-gray-500">
              <button className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
              <button className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
              <button className="hover:text-white transition-colors cursor-pointer">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

