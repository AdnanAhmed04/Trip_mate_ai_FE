import React, { useState } from "react";
import { Search, MapPin, Calendar, Sparkles, Loader2, ArrowLeft, Plane, ChevronRight, Check } from "lucide-react";
import type { Trip } from "../types";
import { api } from "../services/api";

interface PreferencesFormProps {
  onGenerateTrip: (trip: Trip) => void;
  onBack?: () => void;
}

const destinations = [
  "Lahore, Pakistan", "Karachi, Pakistan", "Islamabad, Pakistan",
  "Murree, Pakistan", "Swat, Pakistan", "Hunza, Pakistan",
  "Skardu, Pakistan", "Peshawar, Pakistan", "Multan, Pakistan",
  "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE",
  "Doha, Qatar", "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia",
  "Istanbul, Turkey", "Antalya, Turkey", "Bursa, Turkey",
  "London, United Kingdom", "Manchester, United Kingdom",
  "Paris, France", "Nice, France", "Lyon, France",
  "Rome, Italy", "Milan, Italy", "Venice, Italy",
  "Barcelona, Spain", "Madrid, Spain", "Malaga, Spain",
  "Amsterdam, Netherlands", "Berlin, Germany", "Munich, Germany",
  "New York, USA", "Los Angeles, USA", "Chicago, USA",
  "Tokyo, Japan", "Osaka, Japan", "Kyoto, Japan",
  "Bangkok, Thailand", "Phuket, Thailand", "Pattaya, Thailand",
  "Bali, Indonesia", "Jakarta, Indonesia",
  "Kuala Lumpur, Malaysia", "Langkawi, Malaysia",
  "Singapore, Singapore", "Malé, Maldives",
  "Colombo, Sri Lanka", "Baku, Azerbaijan", "Tashkent, Uzbekistan"
];

type Budget = "cheap" | "moderate" | "luxury";
type TravelWith = "just-me" | "couple" | "friends" | "family";

const interestOptions = [
  { id: "food", label: "Food", icon: "🍜", bg: "#431407", border: "#f97316" },
  { id: "adventure", label: "Adventure", icon: "🧗", bg: "#1e1b4b", border: "#6366f1" },
  { id: "shopping", label: "Shopping", icon: "🛍️", bg: "#164e63", border: "#06b6d4" },
  { id: "history", label: "History", icon: "🏛️", bg: "#3f2b1d", border: "#d97706" },
  { id: "nature", label: "Nature", icon: "🌲", bg: "#064e3b", border: "#10b981" },
  { id: "nightlife", label: "Nightlife", icon: "🎉", bg: "#4c0519", border: "#f43f5e" },
  { id: "culture", label: "Culture", icon: "🎭", bg: "#3b0764", border: "#a855f7" },
  { id: "relax", label: "Relax", icon: "🧘", bg: "#1e3a8a", border: "#3b82f6" },
];

const budgetOptions = [
  { type: "cheap" as Budget, label: "Budget", desc: "Smart savings", icon: "💵", bg: "#064e3b", border: "#10b981", accent: "#34d399" },
  { type: "moderate" as Budget, label: "Moderate", desc: "Comfort & value", icon: "💰", bg: "#1e3a5f", border: "#3b82f6", accent: "#60a5fa" },
  { type: "luxury" as Budget, label: "Luxury", desc: "Premium only", icon: "💎", bg: "#3b1a5a", border: "#a855f7", accent: "#c084fc" },
];

const companionOptions = [
  { type: "just-me" as TravelWith, label: "Solo", desc: "Just me", icon: "🧳", bg: "#431407", border: "#f97316", accent: "#fb923c" },
  { type: "couple" as TravelWith, label: "Couple", desc: "Romantic", icon: "🥂", bg: "#4c0519", border: "#f43f5e", accent: "#fb7185" },
  { type: "family" as TravelWith, label: "Family", desc: "Everyone", icon: "🏡", bg: "#052e16", border: "#22c55e", accent: "#4ade80" },
  { type: "friends" as TravelWith, label: "Friends", desc: "Group fun", icon: "⛵", bg: "#0c1a3b", border: "#38bdf8", accent: "#7dd3fc" },
];

export function PreferencesForm({ onGenerateTrip, onBack }: PreferencesFormProps) {
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [showOrigins, setShowOrigins] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState<Budget | null>(null);
  const [travelWith, setTravelWith] = useState<TravelWith | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const filteredDestinations = destinations.filter((d) =>
    d.toLowerCase().includes(destination.toLowerCase())
  );

  const filteredOrigins = destinations.filter((d) =>
    d.toLowerCase().includes(origin.toLowerCase())
  );

  const fields = [destination, origin, startDate, endDate, budget, travelWith];
  const progress = fields.filter(Boolean).length + (selectedInterests.length > 0 ? 1 : 0);
  const progressPercent = (progress / 7) * 100;
  const isFormComplete = fields.every(Boolean) && selectedInterests.length > 0;

  const getDayCount = () => {
    if (!startDate || !endDate) return null;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
  };
  const dayCount = getDayCount();

  const handleGenerateTrip = async () => {
    setApiError("");
    if (!isFormComplete) return;
    if (!dayCount || dayCount <= 0) { setApiError("End date must be after start date"); return; }

    const budgetMap: Record<string, string> = { cheap: "cheap", moderate: "mid", luxury: "luxury" };
    const travelersMap: Record<string, number> = { "just-me": 1, couple: 2, friends: 4, family: 4 };

    const apiPayload = {
      title: `Trip to ${destination}`,
      destination, origin, startDate, endDate,
      travelers: travelersMap[travelWith!] || 1,
      budgetLevel: budgetMap[budget!] || "cheap",
      interests: selectedInterests,
    };

    try {
      setLoading(true);
      const response = await api.trips.create(apiPayload);
      onGenerateTrip(response.trip);
    } catch (err: any) {
      const errMsg = err?.message || "";
      if (errMsg.includes("Daily limit") || err?.code === "LIMIT_REACHED") {
        setShowUpgradeModal(true);
        try {
          const session = await api.payments.createTripCheckoutSession();
          if (session.url) setTimeout(() => { window.location.href = session.url; }, 4000);
        } catch { setApiError("Payment initiation failed. Please try again."); setShowUpgradeModal(false); }
        return;
      }
      setApiError(errMsg || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Shared input style ─── */
  const inputCls = `
    w-full rounded-xl px-4 py-3 text-sm outline-none transition-all
    bg-[#0f172a] border border-[#1e293b] text-white placeholder-slate-500
    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
  `;

  return (
    <div style={{ background: "linear-gradient(135deg, #020617 0%, #0c1445 50%, #020617 100%)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "40%", left: "30%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Back */}
        {onBack && (
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", marginBottom: 28, fontSize: 14, padding: 0 }}>
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 999, padding: "6px 16px", marginBottom: 20 }}>
            <Sparkles size={14} color="#60a5fa" />
            <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 500 }}>AI-Powered by Llama .</span>
          </div>

          <h1 className="form-title" style={{ fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: "0 0 12px", letterSpacing: "-1px" }}>
            Plan Your Perfect<br />
            <span style={{ background: "linear-gradient(90deg, #60a5fa, #38bdf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Journey
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, maxWidth: 500, margin: "0 auto 28px" }}>
            Share your preferences and let our AI craft a personalized itinerary in seconds
          </p>

          {/* Progress bar */}

        </div>

        {/* ── Main Card ── */}
        <div className="form-card" style={{ width: "100%", background: "rgba(15,23,42,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, backdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>

          {/* Locations */}
          <div className="input-grid" style={{ gap: 16, marginBottom: 24 }}>
            {/* Origin */}
            <div style={{ position: "relative" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                <span style={{ width: 24, height: 24, background: "rgba(59,130,246,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plane size={13} color="#60a5fa" style={{ transform: "rotate(-45deg)" }} />
                </span>
                Starting From
              </label>
              <div style={{ position: "relative" }}>
                <input type="text" value={origin} onChange={(e) => { setOrigin(e.target.value); setShowOrigins(true); }} onFocus={() => setShowOrigins(true)} placeholder="e.g., Lahore, Dubai" className={inputCls} />
                <Search size={15} color="rgba(255,255,255,0.2)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>

              {showOrigins && origin && filteredOrigins.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, zIndex: 50, maxHeight: 220, overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.7)" }}>
                  {filteredOrigins.map((dest, i) => (
                    <button key={i} type="button" onClick={() => { setOrigin(dest); setShowOrigins(false); }}
                      style={{ width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.65)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <MapPin size={13} color="#60a5fa" />
                      {dest}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div style={{ position: "relative" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                <span style={{ width: 24, height: 24, background: "rgba(168,85,247,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={13} color="#a78bfa" />
                </span>
                Where To?
              </label>
              <div style={{ position: "relative" }}>
                <input type="text" value={destination} onChange={(e) => { setDestination(e.target.value); setShowDestinations(true); }} onFocus={() => setShowDestinations(true)} placeholder="Search destinations..." className={inputCls} style={{ paddingRight: 40 }} />
                <Search size={15} color="rgba(255,255,255,0.2)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              </div>

              {showDestinations && destination && filteredDestinations.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, zIndex: 50, maxHeight: 220, overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.7)" }}>
                  {filteredDestinations.map((dest, i) => (
                    <button key={i} type="button" onClick={() => { setDestination(dest); setShowDestinations(false); }}
                      style={{ width: "100%", textAlign: "left", padding: "11px 16px", background: "none", border: "none", color: "rgba(255,255,255,0.65)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                      <MapPin size={13} color="#a78bfa" />
                      {dest}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
              <span style={{ width: 24, height: 24, background: "rgba(14,165,233,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={13} color="#38bdf8" />
              </span>
              Travel Dates
              {dayCount && (
                <span style={{ marginLeft: "auto", background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.25)", color: "#38bdf8", fontSize: 11, padding: "3px 12px", borderRadius: 999, fontWeight: 600 }}>
                  {dayCount} day{dayCount > 1 ? "s" : ""}
                </span>
              )}
            </label>
            <div className="input-grid" style={{ gap: 12 }}>
              <input type="date" value={startDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setStartDate(e.target.value)} className={inputCls} style={{ colorScheme: "dark" } as any} />
              <input type="date" value={endDate} min={startDate || new Date().toISOString().split("T")[0]} onChange={(e) => setEndDate(e.target.value)} className={inputCls} style={{ colorScheme: "dark" } as any} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 0 28px" }} />

          {/* Budget */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
              <span>💰</span> Budget Preference
            </label>
            <div className="budget-grid" style={{ gap: 12 }}>
              {budgetOptions.map((opt) => {
                const sel = budget === opt.type;
                return (
                  <button key={opt.type} type="button" onClick={() => setBudget(opt.type)}
                    style={{ position: "relative", background: sel ? opt.bg : "rgba(15,23,42,0.6)", border: `2px solid ${sel ? opt.border : "rgba(255,255,255,0.08)"}`, borderRadius: 18, padding: "18px 16px", textAlign: "left", cursor: "pointer", transition: "all 0.2s", boxShadow: sel ? `0 8px 24px ${opt.border}30` : "none" }}>
                    {sel && (
                      <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, background: opt.border, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={11} color="#fff" />
                      </div>
                    )}
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{opt.icon}</div>
                    <div style={{ color: sel ? opt.accent : "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ color: sel ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)", fontSize: 12 }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Companions */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
              <span>👥</span> Who's Joining?
            </label>
            <div className="companion-grid" style={{ gap: 12 }}>
              {companionOptions.map((opt) => {
                const sel = travelWith === opt.type;
                return (
                  <button key={opt.type} type="button" onClick={() => setTravelWith(opt.type)}
                    style={{ position: "relative", background: sel ? opt.bg : "rgba(15,23,42,0.6)", border: `2px solid ${sel ? opt.border : "rgba(255,255,255,0.08)"}`, borderRadius: 18, padding: "16px 12px", textAlign: "left", cursor: "pointer", transition: "all 0.2s", boxShadow: sel ? `0 8px 24px ${opt.border}30` : "none" }}>
                    {sel && (
                      <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, background: opt.border, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={10} color="#fff" />
                      </div>
                    )}
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{opt.icon}</div>
                    <div style={{ color: sel ? opt.accent : "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ color: sel ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)", fontSize: 11 }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
              <span>🎯</span> Points of Interest (Pick any)
              <span style={{ marginLeft: "auto", color: selectedInterests.length > 0 ? "#4ade80" : "rgba(255,255,255,0.3)", fontSize: 11 }}>
                {selectedInterests.length} selected
              </span>
            </label>
            <div className="interest-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
              {interestOptions.map((opt) => {
                const sel = selectedInterests.includes(opt.id);
                return (
                  <button key={opt.id} type="button" 
                    onClick={() => {
                      if (sel) setSelectedInterests(prev => prev.filter(i => i !== opt.id));
                      else setSelectedInterests(prev => [...prev, opt.id]);
                    }}
                    style={{ 
                      position: "relative", 
                      background: sel ? opt.bg : "rgba(15,23,42,0.4)", 
                      border: `1.5px solid ${sel ? opt.border : "rgba(255,255,255,0.06)"}`, 
                      borderRadius: 14, 
                      padding: "12px 8px", 
                      textAlign: "center", 
                      cursor: "pointer", 
                      transition: "all 0.2s",
                      transform: sel ? "scale(1.02)" : "scale(1)"
                    }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{opt.icon}</div>
                    <div style={{ color: sel ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 11 }}>{opt.label}</div>
                    {sel && (
                      <div style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, background: opt.border, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0f172a" }}>
                        <Check size={8} color="#fff" strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error */}
          {apiError && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", padding: "12px 16px", borderRadius: 12, fontSize: 13, marginBottom: 20 }}>
              ⚠️ {apiError}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateTrip}
            disabled={!isFormComplete || loading}
            style={{
              width: "100%", padding: "16px", borderRadius: 16, border: "none", fontWeight: 700, fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              cursor: isFormComplete && !loading ? "pointer" : "not-allowed",
              background: isFormComplete && !loading
                ? "linear-gradient(135deg, #2563eb, #0ea5e9)"
                : "rgba(255,255,255,0.05)",
              color: isFormComplete && !loading ? "#fff" : "rgba(255,255,255,0.2)",
              boxShadow: isFormComplete && !loading ? "0 8px 32px rgba(37,99,235,0.4)" : "none",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> Crafting your itinerary...</>
            ) : isFormComplete ? (
              <><Sparkles size={20} /> Generate My Trip <ChevronRight size={20} /></>
            ) : (
              <span>Complete {7 - progress} more field{7 - progress > 1 ? "s" : ""} to continue</span>
            )}
          </button>

          {isFormComplete && !loading && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 12 }}>
              ✨ Usually ready in under 30 seconds
            </p>
          )}
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 28 }}>
          {[{ icon: "🤖", text: "Llama 3.3 AI" }, { icon: "⚡", text: "~30 sec generation" }, { icon: "🗺️", text: "Real map links" }, { icon: "🏨", text: "Hotel suggestions" }, { icon: "🔁", text: "No repeated places" }].map(f => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", padding: "6px 14px", borderRadius: 999, fontSize: 12 }}>
              <span>{f.icon}</span><span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", padding: 20 }}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 28, padding: "48px 40px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}>
            <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #3b82f6, #a855f7)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Sparkles size={28} color="#fff" />
            </div>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 24, margin: "0 0 12px" }}>Daily Limit Reached</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>
              Upgrade to <strong style={{ color: "#60a5fa" }}>Premium</strong> for just{" "}
              <strong style={{ color: "#fff" }}>PKR 1500</strong> and unlock unlimited trip generation!
            </p>
            <Loader2 size={24} color="#3b82f6" style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
            <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>Redirecting to checkout...</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        
        .form-title { font-size: 36px; }
        @media (min-width: 640px) { .form-title { font-size: 48px; } }
        @media (min-width: 1024px) { 
          .form-title { font-size: 82px !important; } 
          .form-card label { font-size: 15px !important; }
          .form-card input { font-size: 16px !important; }
          .form-card p { font-size: 18px !important; }
          .budget-grid button div:nth-child(3) { font-size: 16px !important; }
          .budget-grid button div:nth-child(4) { font-size: 13px !important; }
          .companion-grid button div:nth-child(2) { font-size: 15px !important; }
          .companion-grid button div:nth-child(3) { font-size: 12px !important; }
        }
        
        .form-card { padding: 24px 20px; }
        @media (min-width: 640px) { .form-card { padding: 40px 40px 36px; } }
        @media (min-width: 1024px) { .form-card { padding: 56px 56px 48px !important; } }
        
        .input-grid { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .input-grid { grid-template-columns: 1fr 1fr; } }
        
        .budget-grid { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 480px) { .budget-grid { grid-template-columns: 1fr 1fr; } }
        @media (min-width: 768px) { .budget-grid { grid-template-columns: repeat(3, 1fr); } }
        
        .companion-grid { display: grid; grid-template-columns: 1fr 1fr; }
        @media (min-width: 768px) { .companion-grid { grid-template-columns: repeat(4, 1fr); } }
      `}</style>
    </div>
  );
}
