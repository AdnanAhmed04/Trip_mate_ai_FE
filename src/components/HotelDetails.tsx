import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, MapPin, CheckCircle, Lock,
  CalendarCheck, X, ChevronLeft, ChevronRight, ZoomIn,
  Sparkles,
} from "lucide-react";
import { api, BASE_URL } from "../services/api";
import type { RegisteredHotel } from "../types";

interface HotelDetailsProps {
  hotel: RegisteredHotel;
  onBack: () => void;
  onUpgrade: () => void;
  /** true = opened from trip view → show Book button. false = from landing → show info message */
  showBooking?: boolean;
}

function resolveUrl(url?: string) {
  if (!url) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
  return url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ── Lightbox ────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all z-10">
        <X className="w-5 h-5" />
      </button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold tracking-widest">
        {idx + 1} / {images.length}
      </div>
      {images.length > 1 && (
        <button onClick={prev} className="absolute left-3 sm:left-6 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
      <div className="max-w-5xl w-full mx-14 sm:mx-20">
        <img src={images[idx]} alt={`hotel-${idx}`} className="w-full max-h-[80vh] object-contain rounded-2xl select-none" draggable={false} />
      </div>
      {images.length > 1 && (
        <button onClick={next} className="absolute right-3 sm:right-6 p-2.5 sm:p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-full">
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`shrink-0 w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden border-2 transition-all ${i === idx ? "border-white scale-105" : "border-white/20 opacity-60 hover:opacity-100"}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export function HotelDetails({ hotel, onBack, onUpgrade, showBooking = false }: HotelDetailsProps) {
  let isPaid = false;
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    isPaid = (u?.subscriptionStatus || u?.user?.subscriptionStatus) === "paid";
  } catch { isPaid = false; }

  const [bookingOpen, setBookingOpen] = useState(false);
  const [checkIn, setCheckIn]         = useState("");
  const [checkOut, setCheckOut]       = useState("");
  const [guests, setGuests]           = useState(1);
  const [submitting, setSubmitting]   = useState(false);
  const [message, setMessage]         = useState("");
  const [error, setError]             = useState("");
  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages: string[] = (() => {
    const imgs = hotel.images && hotel.images.length > 0 ? hotel.images : [];
    return imgs.length > 0 ? imgs.map(u => resolveUrl(u)) : [resolveUrl(hotel.logoUrl)];
  })();

  const openLightbox = (idx: number) => { setLightboxIndex(idx); setLightboxOpen(true); };

  const hotelId = hotel._id || hotel.hotelId || "";

  const handleBook = async () => {
    setError(""); setMessage(""); setSubmitting(true);
    try {
      const res = await api.bookings.create({ hotelId, checkIn, checkOut, guests });
      setMessage(res.message || "Booking request submitted!");
      setBookingOpen(false);
    } catch (e: any) {
      setError(String(e.message).toLowerCase().includes("upgrade")
        ? "Booking is for paid users only. Please upgrade."
        : e.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const budgetLabel: Record<string, string> = { cheap: "Budget", mid: "Mid-Range", luxury: "Luxury" };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative pb-8">

      {lightboxOpen && <Lightbox images={allImages} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}

      {/* Navbar — just Back button, no badge */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center">
          <button onClick={onBack} className="group flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors">
            <div className="p-2 sm:p-2.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wider uppercase">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 relative z-10 space-y-6 sm:space-y-8">

        {/* ── Hero + Gallery ── */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="relative h-56 sm:h-80 lg:h-[420px] w-full cursor-zoom-in group" onClick={() => openLightbox(0)}>
            <img src={allImages[0]} alt={hotel.hotelName} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent" />
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 drop-shadow-lg">{hotel.hotelName}</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-sm">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  {hotel.city}
                </span>
                {hotel.budgetCategory && (
                  <span className="bg-blue-600/80 backdrop-blur-md text-white text-xs uppercase tracking-widest font-black px-3 py-1.5 rounded-lg">
                    {budgetLabel[hotel.budgetCategory] || hotel.budgetCategory}
                  </span>
                )}
                {allImages.length > 1 && (
                  <span className="bg-black/40 backdrop-blur-md text-white/70 text-xs px-3 py-1.5 rounded-full">
                    📷 {allImages.length} photos
                  </span>
                )}
              </div>
            </div>
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 p-3 bg-gray-900/60 overflow-x-auto">
              {allImages.map((imgUrl, idx) => (
                <button key={idx} onClick={() => openLightbox(idx)} className={`shrink-0 h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${idx === 0 ? "border-blue-500/60" : "border-white/10 hover:border-white/30"}`}>
                  <img src={imgUrl} alt={`hotel-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details + Booking ── */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* About — with Verified badge inside */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">About This Hotel</h2>
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Verified Hotel
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{hotel.description}</p>
              {/* Address with proper pin icon */}
              <div className="mt-4 flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{hotel.address}</span>
              </div>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {hotel.amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-xl border border-white/5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-gray-200 text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Price + Booking / Info */}
          <div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 lg:sticky lg:top-28">
              <div className="mb-6">
                <span className="text-3xl font-black text-white">${hotel.pricePerNight}</span>
                <span className="text-gray-400"> / night</span>
              </div>

              {message && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">{message}</div>
              )}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
              )}

              {/* Landing page → info message only, no book button */}
              {!showBooking ? (
                <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/20 text-blue-300 text-sm flex items-start gap-3">
                  <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                  <span>
                    Our AI will recommend hotel based on your budget and interests when you generate a trip.
                  </span>
                </div>
              ) : (
                /* Trip view → show Book / Upgrade */
                isPaid ? (
                  !bookingOpen ? (
                    <button onClick={() => setBookingOpen(true)} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      <CalendarCheck className="w-5 h-5" /> Book Now
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider">Check-in</label>
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full mt-1 bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider">Check-out</label>
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full mt-1 bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider">Guests</label>
                        <input type="number" min={1} value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full mt-1 bg-gray-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-white" />
                      </div>
                      <button onClick={handleBook} disabled={submitting} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
                        {submitting ? "Submitting..." : "Confirm Booking Request"}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-start gap-3">
                      <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Hotel booking is a premium feature. Upgrade to a paid plan to book this hotel.</span>
                    </div>
                    <button onClick={onUpgrade} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" /> Upgrade to Book
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
