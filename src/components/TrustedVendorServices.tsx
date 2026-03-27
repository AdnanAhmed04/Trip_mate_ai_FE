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
    "Location not set";

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
      ? (v.logoUrl.startsWith('http') ? v.logoUrl : `${BASE_URL}/${v.logoUrl}`)
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
    <div className="py-16 bg-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">Trusted Vendor Services</h2>
          <p className="text-xl text-gray-600">
            Connect with verified travel experts and service providers
          </p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center text-gray-600 py-10">Loading vendors...</div>
        )}

        {!loading && error && (
          <div className="text-center py-10">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Make sure the backend is running on port 5000.
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 ">
            {topVendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => onVendorClick(vendor)}
                className="border-2  rounded-xl bg-[rgb(236,236,236)] overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <ImageWithFallback
                    src={vendor.image || ""}
                    alt={vendor.name || ""}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    fallbackSrc="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60"
                  />
                  <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{vendor.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-sm text-blue-600 mb-2">{vendor.category}</div>
                  <h3 className="text-xl mb-2">{vendor.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{vendor.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{vendor.location}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">View Details</span>
                      <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vendor Action Buttons */}
        <div className="mt-12 px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full">
            <button
              onClick={onViewVendors}
              className="
                w-fit sm:w-auto
                bg-gradient-to-r from-blue-600 to-blue-700
                text-white
                px-6 sm:px-8
                py-3 sm:py-4
                rounded-full
                hover:shadow-2xl
                transition-all
                text-base sm:text-lg
                hover:scale-105
                inline-flex items-center justify-center gap-2 cursor-pointer
              "
            >
              <Building2 className="w-5 h-5 " />
              <span>View More Vendors</span>
            </button>

            <button
              onClick={onRegisterVendor}
              className="
                w-fit sm:w-auto
                bg-white
                border-2 border-blue-600 cursor-pointer
                text-blue-600
                px-6 sm:px-8
                py-3 sm:py-4
                rounded-full
                hover:bg-blue-50
                transition-all
                text-base sm:text-lg
                hover:scale-105
                inline-flex items-center justify-center gap-2
              "
            >
              <ArrowRight className="w-5 h-5" />
              <span>Register as Vendor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
