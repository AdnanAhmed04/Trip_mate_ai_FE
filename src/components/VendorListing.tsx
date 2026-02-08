import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, DollarSign, Filter, ArrowLeft, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type ApiBranch = {
  _id?: string;
  name: string;
  location: string;
  phone: string;
};

type ApiVendor = {
  _id: string;
  companyName: string;
  vendorType: string;
  services: string[];
  customServices?: string[];
  branches?: ApiBranch[];
  aboutUs: string;
  specialOffer?: string;
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;

  // if later you add these in backend, mapping will use them
  phone?: string;
  whatsapp?: string;
  email: string;
  logoUrl?: string;
};

type VendorsApiResponse = {
  total: number;
  vendors: ApiVendor[];
};

interface Vendor {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number;
  location: string;
  price: string;
  services: string[];
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  branches: Array<{
    name: string;
    location: string;
    phone: string;
  }>;
  raw?: ApiVendor;
}

interface VendorListingProps {
  onBack: () => void;
  onVendorClick: (vendor: any) => void;
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

function mapApiVendorToUi(v: ApiVendor): Vendor {
  const firstBranch = v.branches?.[0];
  const location =
    (firstBranch?.location?.trim() || "") ||
    (v.city?.trim() || "") ||
    "Location not set";

  // If later your backend serves uploaded logos (logoUrl), you can use it:
  // const image = v.logoUrl ? `http://localhost:5000/${v.logoUrl}` : getVendorPlaceholderImage(v.vendorType);
  const image = getVendorPlaceholderImage(v.vendorType);

  const services = [
    ...(v.services || []),
    ...((v.customServices || []).filter(Boolean) as string[]),
  ];

  const description =
    normalizeText(v.aboutUs, 120) ||
    normalizeText(services.slice(0, 4).join(" • "), 120) ||
    "Verified travel service provider";

  const phone = firstBranch?.phone?.trim() || v.phone?.trim() || "";
  const whatsapp = v.whatsapp?.trim() || phone;

  return {
    id: v._id,
    name: v.companyName || "Unnamed Vendor",
    type: v.vendorType || "Vendor",
    image,
    rating: stableRatingFromId(v._id),
    location,
    price: budgetToPriceLabel(v.budgetMin, v.budgetMax),
    services,
    description,
    phone,
    email: v.email || "",
    whatsapp,
    branches: (v.branches || []).map((b) => ({
      name: b.name,
      location: b.location,
      phone: b.phone,
    })),
    raw: v,
  };
}

export function VendorListing({ onBack, onVendorClick }: VendorListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlace, setFilterPlace] = useState("");
  const [filterBudget, setFilterBudget] = useState<"all" | "cheap" | "moderate" | "luxury">("all");

  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/vendors";

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL);
        const data: VendorsApiResponse = await res.json();

        if (!res.ok) throw new Error((data as any)?.message || "Failed to load vendors");

        // OPTIONAL: show only approved vendors
        // const filtered = (data.vendors || []).filter(v => v.status === "approved");
        const mapped = (data.vendors || []).map(mapApiVendorToUi);

        if (alive) setAllVendors(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message || "Something went wrong");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const locations = useMemo(() => {
    return Array.from(new Set(allVendors.map((v) => v.location))).sort();
  }, [allVendors]);

  const filteredVendors = useMemo(() => {
    return allVendors.filter((vendor) => {
      const q = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !q ||
        vendor.name.toLowerCase().includes(q) ||
        vendor.type.toLowerCase().includes(q) ||
        vendor.services.some((s) => s.toLowerCase().includes(q));

      const matchesPlace = !filterPlace || vendor.location === filterPlace;

      // your UI uses price string, so keep same logic
      const matchesBudget =
        filterBudget === "all" ||
        (filterBudget === "cheap" && vendor.price.includes("$") && !vendor.price.includes("$$")) ||
        (filterBudget === "moderate" && vendor.price.includes("$$") && !vendor.price.includes("$$$")) ||
        (filterBudget === "luxury" && vendor.price.includes("$$$"));

      return matchesSearch && matchesPlace && matchesBudget;
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

            {/* Budget Filter */}
            {/* <div className="relative w-[30%]">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterBudget}
                onChange={(e) => setFilterBudget(e.target.value as typeof filterBudget)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none"
              >
                <option value="all">All Budgets</option>
                <option value="cheap">Below 100 $</option>
                <option value="moderate">Below 500 $</option>
                <option value="luxury">Above 1000 $</option>
              </select>
            </div> */}
          </div>
        </div>
      </div>

      {/* Vendor Grid */}
      <div className="max-w-[90%] mx-auto px-4 pb-16">
        <div className="mb-6 flex justify-items-start">
          <p className="text-gray-600 w-[35%] flex justify-center">
            {loading ? "Loading..." : `Showing ${filteredVendors.length} ${filteredVendors.length === 1 ? "vendor" : "vendors"}`}
          </p>
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
            <div className="flex justify-center flex-wrap gap-8">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => onVendorClick(vendor)}
                  className="bg-white rounded-3xl shadow-lg border border-2 w-[400px] overflow-hidden hover:shadow-2xl transition-all cursor-pointer group hover:scale-[1.02]"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={vendor.image}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm">
                      {vendor.price}
                    </div>
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
                      {vendor.type}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>

                    {/* Services Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.services.slice(0, 2).map((service, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs"
                        >
                          {service}
                        </span>
                      ))}
                      {vendor.services.length > 2 && (
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                          +{vendor.services.length - 2} more
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
          )
        )}
      </div>
    </div>
  );
}
