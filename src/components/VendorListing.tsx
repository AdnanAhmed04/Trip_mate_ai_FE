import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, ArrowLeft, Star, Filter, Building2, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api, BASE_URL } from "../services/api";
import type { Vendor } from "../types";

interface VendorListingProps {
  onBack: () => void;
  onVendorClick: (vendor: Vendor) => void;
}

function normalizeText(s: string, max = 90) {
  const t = (s || "").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

function stableRatingFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return Math.min(5, Math.round((3.8 + (hash % 120) / 100) * 10) / 10);
}

function getVendorPlaceholderImage(vendorType: string) {
  const t = (vendorType || "").toLowerCase();
  if (t.includes("resort"))   return "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=60";
  if (t.includes("tour"))     return "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=60";
  if (t.includes("transport"))return "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=60";
  if (t.includes("water"))    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=60";
  if (t.includes("hotel") || t.includes("villa")) return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=60";
  return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60";
}

function mapApiVendorToUi(v: Vendor): Vendor {
  const firstBranch = v.branches?.[0];
  const location =
    firstBranch?.location?.trim() ||
    v.city?.trim() ||
    (v.serviceLocations?.length ? v.serviceLocations.join(", ") : "") ||
    "Global / Online";

  const image = v.logoUrl
    ? (v.logoUrl.startsWith("http") ? v.logoUrl : `${BASE_URL}${v.logoUrl.startsWith("/") ? "" : "/"}${v.logoUrl}`)
    : getVendorPlaceholderImage(v.vendorType);

  const services = [...(v.services || []), ...((v.customServices || []).filter(Boolean) as string[])];
  const description =
    normalizeText(v.aboutUs, 90) ||
    normalizeText(services.slice(0, 3).join(" · "), 90) ||
    "Verified travel service provider";

  return { ...v, id: v._id, name: v.companyName || "Unnamed Vendor", category: v.vendorType || "Vendor", image, rating: stableRatingFromId(v._id), location, description, services };
}

export function VendorListing({ onBack, onVendorClick }: VendorListingProps) {
  const [searchQuery, setSearchQuery]   = useState("");
  const [filterPlace, setFilterPlace]   = useState("");
  const [allVendors, setAllVendors]     = useState<Vendor[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.vendors.getAll();
        if (alive) setAllVendors((data.vendors || []).map(mapApiVendorToUi));
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load vendors.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const locations = useMemo(() =>
    Array.from(new Set(allVendors.map(v => v.location).filter(Boolean) as string[])).sort(),
    [allVendors]
  );

  const filteredVendors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allVendors.filter(v => {
      const matchSearch = !q ||
        (v.name || "").toLowerCase().includes(q) ||
        (v.category || "").toLowerCase().includes(q) ||
        (v.services || []).some(s => s.toLowerCase().includes(q));
      return matchSearch && (!filterPlace || v.location === filterPlace);
    });
  }, [allVendors, searchQuery, filterPlace]);

  return (
    <div className="min-h-[100dvh] bg-gray-950 text-white relative pb-16 animate-slide-up z-20">

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 bg-gray-950/85 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button onClick={onBack} className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <span className="p-1.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block">Back</span>
          </button>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            {loading ? "Loading…" : `${filteredVendors.length} Partners`}
          </p>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden h-[160px] sm:h-[200px] shadow-xl border border-white/10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1759038085950-1234ca8f5fed?auto=format&fit=crop&w=1200&q=70"
            alt="Vendors"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Curated Vendor Network</p>
            <h1 className="text-2xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Elite Travel Partners
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-sm">
              Hand-picked vendors for your ultima te journey.
            </p>
          </div>
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, or service…"
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all text-sm"
            />
          </div>
          <div className="relative sm:w-52">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select
              value={filterPlace}
              onChange={e => setFilterPlace(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25em 1.25em",
              }}
            >
              <option value="" className="bg-gray-900">All Locations</option>
              {locations.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
            </select>
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden animate-pulse">
                <div className="h-32 bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3.5 bg-white/8 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-10 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && filteredVendors.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <Filter className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-white font-bold mb-1">No vendors found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or location filter.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filteredVendors.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.slice(0, visibleCount).map(vendor => (
                <div
                  key={vendor.id}
                  onClick={() => onVendorClick(vendor)}
                  className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-200 cursor-pointer group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-36 overflow-hidden bg-gray-900 shrink-0">
                    <ImageWithFallback
                      src={vendor.image || ""}
                      alt={vendor.name || ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/10 to-transparent" />

                    {/* Rating badge */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-white">{vendor.rating}</span>
                    </div>

                    {/* Logo overlay */}
                    {vendor.logoUrl && (
                      <div className="absolute bottom-2.5 left-2.5 w-9 h-9 rounded-xl bg-gray-950/80 border border-white/15 overflow-hidden flex items-center justify-center">
                        <img src={vendor.image} alt="" className="w-full h-full object-contain p-1" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    {/* Name + category */}
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 mb-1">{vendor.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                          {vendor.category}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500 text-[11px]">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[120px]">{vendor.location}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">{vendor.description}</p>

                    {/* Service tags */}
                    {(vendor.services || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(vendor.services || []).slice(0, 2).map((s, i) => (
                          <span key={i} className="bg-white/5 border border-white/8 text-gray-400 px-2 py-0.5 rounded-full text-[10px]">
                            {s}
                          </span>
                        ))}
                        {(vendor.services || []).length > 2 && (
                          <span className="bg-white/5 border border-white/8 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">
                            +{(vendor.services || []).length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-auto">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">View Profile</span>
                      <span className="w-6 h-6 rounded-lg bg-white/5 group-hover:bg-blue-600 border border-white/10 group-hover:border-blue-500 flex items-center justify-center transition-all">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < filteredVendors.length && (
              <div className="flex justify-center">
                <button
                  onClick={() => setVisibleCount(p => p + 9)}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
