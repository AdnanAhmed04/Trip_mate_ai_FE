import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Hotel as HotelIcon, MapPin, Star } from "lucide-react";
import { api, BASE_URL } from "../services/api";
import { RegisteredHotel } from "../types";

function normalizeText(s: string, max = 120) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "..." : t;
}

function getHotelImage(h: RegisteredHotel) {
  const url = h.logoUrl || (h.images && h.images[0]) || "";
  if (!url) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=60";
  return url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

const budgetLabel: Record<string, string> = {
  cheap: "Budget",
  mid: "Mid-Range",
  luxury: "Luxury",
};

export function TrustedHotelsServices({
  onHotelClick,
  onRegisterHotel,
}: {
  onHotelClick: (hotel: RegisteredHotel) => void;
  onRegisterHotel: () => void;
}) {
  const [hotels, setHotels] = useState<RegisteredHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.hotels.getAll();
        if (alive) setHotels(data.hotels || []);
      } catch (e: any) {
        if (alive) setError(e?.message || "Something went wrong.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const topHotels = useMemo(() => hotels.slice(0, 6), [hotels]);

  return (
    <div className="py-16 sm:py-24 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-600/20 backdrop-blur-md text-blue-400 px-6 py-2 rounded-full mb-4 border border-blue-500/30">
            <span className="flex items-center justify-center gap-2 font-semibold text-sm">🏨 Verified Stays</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Trusted Hotels Services
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Handpicked, admin-verified hotels. Upgrade to a paid plan to book directly from your trip.
          </p>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Discovering top hotels...</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 bg-red-900/10 rounded-3xl border border-red-900/20">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && topHotels.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-gray-400 font-medium">No hotels listed yet. Be the first to register your hotel!</p>
          </div>
        )}

        {!loading && !error && topHotels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topHotels.map((hotel) => (
              <div
                key={hotel._id}
                onClick={() => onHotelClick(hotel)}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer flex flex-col h-full hover:shadow-[0_0_40px_rgba(37,99,235,0.15)]"
              >
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <img
                    src={getHotelImage(hotel)}
                    alt={hotel.hotelName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-blue-600/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-2.5 py-1.5 rounded-lg border border-blue-400/30">
                      {budgetLabel[hotel.budgetCategory || "mid"]}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                    {hotel.hotelName}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1 leading-relaxed">
                    {normalizeText(hotel.description, 110)}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-300 mb-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/20">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="truncate font-medium">{hotel.city}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      ${hotel.pricePerNight}
                      <span className="text-xs text-gray-400 font-normal"> /night</span>
                    </span>
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-white transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <button
            onClick={onRegisterHotel}
            className="bg-white/5 backdrop-blur-md border border-white/10 cursor-pointer text-white font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-white/10 transition-all text-sm sm:text-lg hover:scale-105 inline-flex items-center justify-center gap-2 shadow-2xl"
          >
            <HotelIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <span className="whitespace-nowrap">Register Your Hotel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
