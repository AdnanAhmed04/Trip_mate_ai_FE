import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, DollarSign, Filter, ArrowLeft, Star, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api, BASE_URL } from "../services/api";
import type { Vendor } from "../types";

interface VendorListingProps {
  onBack: () => void;
  onVendorClick: (vendor: Vendor) => void;
}

function normalizeText(s: string, max = 120) {
  const t = (s || "").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max) + "..." : t;
}

function stableRatingFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const r = 3.8 + (hash % 120) / 100; // 3.8 -> 4.99
  return Math.min(5, Math.round(r * 10) / 10);
}

function getVendorPlaceholderImage(vendorType: string) {
  const t = (vendorType || "").toLowerCase();
  if (t.includes("resort"))
    return "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=60";
  if (t.includes("tour"))
    return "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1200&q=60";
  if (t.includes("transport"))
    return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=60";
  if (t.includes("water"))
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=60";
  if (t.includes("hotel") || t.includes("villa"))
    return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=60";
  return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60";
}

function mapApiVendorToUi(v: Vendor): Vendor {
  const firstBranch = v.branches?.[0];
  const location =
    (firstBranch?.location?.trim() || "") ||
    (v.city?.trim() || "") ||
    (v.serviceLocations && v.serviceLocations.length > 0 ? v.serviceLocations.join(", ").trim() : "") ||
    "Global/Online";

  const image = v.logoUrl
    ? (v.logoUrl.startsWith('http') ? v.logoUrl : `${BASE_URL}${v.logoUrl.startsWith('/') ? '' : '/'}${v.logoUrl}`)
    : getVendorPlaceholderImage(v.vendorType);

  const services = [
    ...(v.services || []),
    ...((v.customServices || []).filter(Boolean) as string[]),
  ];

  const description =
    normalizeText(v.aboutUs, 120) ||
    normalizeText(services.slice(0, 4).join(" • "), 120) ||
    "Verified travel service provider";

  return {
    ...v,
    id: v._id,
    name: v.companyName || "Unnamed Vendor",
    category: v.vendorType || "Vendor",
    image,
    rating: stableRatingFromId(v._id),
    location,
    description,
    services,
  };
}

export function VendorListing({ onBack, onVendorClick }: VendorListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlace, setFilterPlace] = useState("");

  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await api.vendors.getAll();

        const mapped = (data.vendors || []).map(mapApiVendorToUi);

        if (alive) setAllVendors(mapped);
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

  const locations = useMemo(() => {
    return Array.from(new Set(allVendors.map((v) => v.location).filter(Boolean) as string[])).sort();
  }, [allVendors]);

  const filteredVendors = useMemo(() => {
    return allVendors.filter((vendor) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        (vendor.name || "").toLowerCase().includes(q) ||
        (vendor.category || "").toLowerCase().includes(q) ||
        (vendor.services || []).some((s) => s.toLowerCase().includes(q));

      const matchesPlace = !filterPlace || vendor.location === filterPlace;

      return matchesSearch && matchesPlace;
    });
  }, [allVendors, searchQuery, filterPlace]);

  return (
    <div className="min-h-[100dvh] bg-gray-950 text-white relative pb-16 animate-slide-up z-20">

      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Navigation & Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 sm:p-2.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wider uppercase hidden sm:block">Back to Home</span>
            <span className="font-bold text-xs tracking-wider uppercase sm:hidden">Back</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-6 sm:space-y-10">

        {/* Hero Section */}
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden h-[200px] sm:h-[300px] shadow-2xl border border-white/10">
          <div className="absolute inset-0">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1759038085950-1234ca8f5fed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBzZXJ2aWNlcyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2NDg2MzM1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Vendor services"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-2 sm:mb-4 leading-tight drop-shadow-lg text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">
                Discover Elite
              </span>
              <br />
              Travel Partners
            </h1>
            <p className="text-gray-300 text-sm sm:text-lg font-medium leading-relaxed max-w-xl drop-shadow-md">
              Explore our curated network of premium service providers, hand-picked for your ultimate journey.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, category, or service..."
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-900/50 border border-white/10 rounded-xl sm:rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Location Filter */}
            <div className="relative md:w-[30%]">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={filterPlace}
                onChange={(e) => setFilterPlace(e.target.value)}
                className="w-full pl-12 pr-10 py-3 sm:py-4 bg-gray-900/50 border border-white/10 rounded-xl sm:rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm sm:text-base appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 1rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                <option value="" className="bg-gray-900">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location} className="bg-gray-900">
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Header Stats */}
        <div className="flex justify-between items-center px-2">
          <p className="text-gray-400 font-bold uppercase text-[10px] sm:text-xs tracking-widest">
            {loading ? "Discovering services..." : `Showing ${Math.min(visibleCount, filteredVendors.length)} of ${filteredVendors.length} Verified Vendors`}
          </p>
          {visibleCount < filteredVendors.length && (
            <button
              onClick={() => setVisibleCount(filteredVendors.length)}
              className="text-[10px] sm:text-xs font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
            >
              Show All
            </button>
          )}
        </div>

        {/* Loading / Error States */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center">
            <Filter className="w-12 h-12 sm:w-16 sm:h-16 text-red-400/50 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Failed to load vendors</h3>
            <p className="text-gray-400">{error}</p>
          </div>
        )}

        {!loading && !error && filteredVendors.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-md">
            <Filter className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">No vendors found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          !loading && !error && (
            <div className="space-y-8 sm:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredVendors.slice(0, visibleCount).map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => onVendorClick(vendor)}
                    className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group flex flex-col hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                  >
                    {/* Image */}
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-900/50">
                      <ImageWithFallback
                        src={vendor.image || ""}
                        alt={vendor.name || ""}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-80" />

                      {/* Floating Rating Badge */}
                      <div className="absolute bottom-4 left-4 bg-gray-950/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs sm:text-sm font-bold text-white">{vendor.rating}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 flex flex-col flex-1">
                      <div className="mb-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 line-clamp-1">{vendor.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block">
                            {vendor.category}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 min-w-0">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-medium truncate">{vendor.location}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">{vendor.description}</p>

                      {/* Services Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(vendor.services || []).slice(0, 2).map((service, idx) => (
                          <span
                            key={idx}
                            className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium"
                          >
                            {service}
                          </span>
                        ))}
                        {(vendor.services || []).length > 2 && (
                          <span className="bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium">
                            +{(vendor.services || []).length - 2} more
                          </span>
                        )}
                      </div>

                      <button className="w-full bg-white/5 group-hover:bg-blue-600 border border-white/10 group-hover:border-blue-500 text-white py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest transition-all duration-300 shadow-lg mt-auto">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {visibleCount < filteredVendors.length && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVisibleCount(prev => prev + 6);
                    }}
                    className="px-8 py-3.5 sm:py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all shadow-xl hover:shadow-2xl active:scale-95 uppercase tracking-widest text-xs sm:text-sm"
                  >
                    Show More Vendors
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
