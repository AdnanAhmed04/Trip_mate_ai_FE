import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Building2, MapPin, Star } from "lucide-react";
import { api, BASE_URL } from "../services/api";
import { Vendor } from "../types";

function normalizeText(s: string, max = 120) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "..." : t;
}

// ✅ If you don't have vendor logo URLs yet, use a placeholder based on vendorType
function getVendorPlaceholderImage(vendorType: string) {
  const t = (vendorType || "").toLowerCase();
  if (t.includes("resort")) return "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=60";
  if (t.includes("tour")) return "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=60";
  if (t.includes("transport")) return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=60";
  if (t.includes("hotel") || t.includes("villa")) return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=60";
  return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60";
}

// ✅ small deterministic rating (until you add rating in backend)
function stableRatingFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const r = 3.8 + (hash % 120) / 100; // 3.8 to 4.99
  return Math.min(5, Math.round(r * 10) / 10);
}

function mapApiVendorToUi(v: Vendor): Vendor {
  const firstBranch = v.branches?.[0];
  const location =
    (firstBranch?.location?.trim() || "") ||
    (v.city?.trim() || "") ||
    (v.serviceLocations && v.serviceLocations.length > 0 ? v.serviceLocations.join(", ").trim() : "") ||
    "Physical office not present";

  const category = v.vendorType || "Vendor";

  const description = v.aboutUs?.trim()
    ? normalizeText(v.aboutUs, 110)
    : normalizeText(
      (v.services || []).slice(0, 3).join(" • "),
      110
    ) || "Verified travel service provider";

  return {
    ...v,
    id: v._id,
    name: v.companyName || "Unnamed Vendor",
    image: v.logoUrl
      ? (v.logoUrl.startsWith('http') ? v.logoUrl : `${BASE_URL}${v.logoUrl.startsWith('/') ? '' : '/'}${v.logoUrl}`)
      : getVendorPlaceholderImage(v.vendorType),
    rating: stableRatingFromId(v._id),
    category,
    description,
    location,
  };
}

function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => setImgSrc(src), [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
    />
  );
}

export function TrustedVendorServices({
  onVendorClick,
  onViewVendors,
  onRegisterVendor,
}: {
  onVendorClick: (vendor: Vendor) => void;
  onViewVendors: () => void;
  onRegisterVendor: () => void;
}) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.vendors.getAll();

        const ui = (data.vendors || []).map(mapApiVendorToUi);
        if (alive) setVendors(ui);
      } catch (e: any) {
        if (alive) setError(e?.message || "Something went wrong. Check if backend is running.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const topVendors = useMemo(() => vendors.slice(0, 6), [vendors]);

  return (
    <div className="py-16 sm:py-24 bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Trusted Vendor Services
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Connect with verified travel experts and service providers worldwide
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center text-gray-400 py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Discovering top vendors...</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20 bg-red-900/10 rounded-3xl border border-red-900/20">
            <p className="text-red-400 font-medium">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Please ensure your connection is stable or backend is active.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topVendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => onVendorClick(vendor)}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 cursor-pointer flex flex-col h-full hover:shadow-[0_0_40px_rgba(37,99,235,0.15)]"
              >
                <div className="relative h-44 sm:h-52 w-full overflow-hidden">
                  <ImageWithFallback
                    src={vendor.image || ""}
                    alt={vendor.name || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    fallbackSrc="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-blue-600/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-2.5 py-1.5 rounded-lg border border-blue-400/30">
                      {vendor.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {vendor.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-1 leading-relaxed">
                    {vendor.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-gray-300 mb-6 bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/20">
                      <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="truncate font-medium">{vendor.location}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between group/btn">
                    <span className="text-sm font-bold text-blue-400 group-hover/btn:text-white transition-colors">Explore Services</span>
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-white transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vendor Action Buttons */}
        <div className="mt-16">
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-6 w-full max-w-2xl mx-auto px-4">
            <button
              onClick={onViewVendors}
              className="
                flex-1 sm:flex-none
                bg-blue-600/20 backdrop-blur-md border border-blue-500/30
                text-white font-bold
                px-4 sm:px-10
                py-4 sm:py-5
                rounded-2xl
                hover:bg-blue-600/40
                transition-all
                text-[12px] sm:text-base lg:text-lg
                hover:scale-105
                inline-flex items-center justify-center gap-2 cursor-pointer shadow-2xl
              "
            >
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              <span className="whitespace-nowrap">More Vendors</span>
            </button>

            <button
              onClick={onRegisterVendor}
              className="
                flex-1 sm:flex-none
                bg-white/5 backdrop-blur-md border border-white/10 cursor-pointer
                text-white font-bold
                px-4 sm:px-10
                py-4 sm:py-5
                rounded-2xl
                hover:bg-white/10
                transition-all
                text-[12px] sm:text-base lg:text-lg
                hover:scale-105
                inline-flex items-center justify-center gap-2 shadow-2xl
              "
            >
              <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              <span className="whitespace-nowrap">Register Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
