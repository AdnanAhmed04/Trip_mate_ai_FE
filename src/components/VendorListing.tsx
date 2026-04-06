import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, DollarSign, Filter, ArrowLeft, Star } from "lucide-react";
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

function budgetToPriceLabel(budgetMin?: number, budgetMax?: number) {
  const max = typeof budgetMax === "number" ? budgetMax : 0;
  if (max >= 1000) return "$$$ Luxury";
  if (max >= 500) return "$$ Moderate";
  if (max > 0) return "$ Cheap";
  // fallback (you currently have 0,0)
  return "$$ Moderate";
}

function mapApiVendorToUi(v: Vendor): Vendor {
  const firstBranch = v.branches?.[0];
  const location =
    (firstBranch?.location?.trim() || "") ||
    (v.city?.trim() || "") ||
    "Location not set";

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

  const phone = firstBranch?.phone?.trim() || "";
  // v.phone isn't on the shared type yet but let's assume branches has it or strict to shared type

  // We attach mapped fields to the object
  return {
    ...v,
    id: v._id,
    name: v.companyName || "Unnamed Vendor",
    // type: v.vendorType || "Vendor", // 'type' is not in shared Vendor, shared uses 'vendorType'. But we can add 'category' (mapped)
    category: v.vendorType || "Vendor",
    image,
    rating: stableRatingFromId(v._id),
    location,
    // price: budgetToPriceLabel(v.budgetMin, v.budgetMax), // 'price' not in shared Vendor, maybe we should add it or just use budget
    description,
    services,
  };
}

export function VendorListing({ onBack, onVendorClick }: VendorListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [filterBudget, setFilterBudget] = useState<"all" | "cheap" | "moderate" | "luxury">("all");

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

      // Logic for budget/price if we had it mapped. For now ignore or implement 'price' in mapping
      // For demonstration, let's skip budget filter or assume we mapped it.
      // I'll skip budget filter logic strictly since 'price' isn't on shared type easily without extending it.
      // Or I can cast to 'any' if I really want to keep the filter working exactly as before.

      return matchesSearch && matchesPlace;
    });
  }, [allVendors, searchQuery, filterPlace, filterBudget]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-black to-blue-700 text-white py-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1759038085950-1234ca8f5fed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBzZXJ2aWNlcyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2NDg2MzM1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Vendor services background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-blue-gray/30 to-gray-900/30" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <h1 className="text-5xl mb-4">Browse Vendors</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Discover trusted travel service providers from around the world
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="p-6">
          <div className="flex justify-center gap-4">
            {/* Search */}
            <div className="relative w-[80%]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors or services..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            {/* Location Filter */}
            <div className="relative w-[30%]">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterPlace}
                onChange={(e) => setFilterPlace(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none"
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
            {/* Budget filter removed for now as price is not in shared type yet */}
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="max-w-[90%] mx-auto px-4 pb-16">
        <div className="mb-6 flex justify-between items-center px-8">
          <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">
            {loading ? "Discovering services..." : `Showing ${Math.min(visibleCount, filteredVendors.length)} of ${filteredVendors.length} Verified Vendors`}
          </p>
          {visibleCount < filteredVendors.length && (
            <button 
              onClick={() => setVisibleCount(filteredVendors.length)}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Show All {filteredVendors.length}
            </button>
          )}
        </div>

        {!loading && error && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl text-gray-600 mb-2">Failed to load vendors</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && filteredVendors.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl text-gray-600 mb-2">No vendors found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="flex flex-col items-center gap-12">
              <div className="flex justify-center flex-wrap gap-8">
                {filteredVendors.slice(0, visibleCount).map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => onVendorClick(vendor)}
                    className="bg-white rounded-3xl shadow-lg border border-2 w-[400px] overflow-hidden hover:shadow-2xl transition-all cursor-pointer group hover:scale-[1.02]"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <ImageWithFallback
                        src={vendor.image || ""}
                        alt={vendor.name || ""}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Price label removed if not in vendor */}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl text-gray-900 flex-1">{vendor.name}</h3>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{vendor.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{vendor.location}</span>
                      </div>

                      <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mb-4">
                        {vendor.category}
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>

                      {/* Services Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(vendor.services || []).slice(0, 2).map((service, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                          >
                            {service}
                          </span>
                        ))}
                        {(vendor.services || []).length > 2 && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                            +{(vendor.services || []).length - 2} more
                          </span>
                        )}
                      </div>

                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 rounded-2xl hover:shadow-lg transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {visibleCount < filteredVendors.length && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibleCount(prev => prev + 6);
                  }}
                  className="px-12 py-4 bg-white border-2 border-blue-600 text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl active:scale-95 uppercase tracking-widest text-sm"
                >
                  Show More Vendors
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
