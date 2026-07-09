import React, { useState } from "react";
import {
  ArrowLeft, Upload, MapPin, FileText,
  Tag, CheckCircle, ShieldCheck, X, Star, DollarSign,
  Building2, Wifi, Coffee, Car, Dumbbell, Waves,
  UtensilsCrossed, ImagePlus,
} from "lucide-react";
import { api } from "../services/api";

const AMENITY_OPTIONS = [
  { label: "Free WiFi", icon: Wifi },
  { label: "Swimming Pool", icon: Waves },
  { label: "Restaurant", icon: UtensilsCrossed },
  { label: "Gym / Fitness Center", icon: Dumbbell },
  { label: "Parking", icon: Car },
  { label: "Breakfast Included", icon: Coffee },
  { label: "Spa", icon: Star },
  { label: "Airport Shuttle", icon: MapPin },
  { label: "Room Service", icon: FileText },
  { label: "Bar / Lounge", icon: Coffee },
  { label: "Business Center", icon: Building2 },
  { label: "Concierge", icon: ShieldCheck },
];

const BUDGET_OPTIONS = [
  { value: "cheap",   label: "Budget / Cheap", desc: "Under $100/night. Great for backpackers & value travelers.", color: "emerald" },
  { value: "mid",     label: "Mid-Range",       desc: "$100–$300/night. Comfort with a reasonable price.",         color: "blue"    },
  { value: "luxury",  label: "Luxury",          desc: "$300+/night. Premium experience & five-star service.",      color: "amber"   },
];

const MAX_IMAGES = 5;

interface ImageItem { file: File; preview: string; }

interface FormState {
  hotelName: string; city: string; address: string;
  description: string; pricePerNight: string;
  budgetCategory: string; amenities: string[];
}

const INIT: FormState = {
  hotelName: "", city: "", address: "",
  description: "", pricePerNight: "", budgetCategory: "", amenities: [],
};

export function HotelRegistrationForm({ onBack }: { onBack: () => void }) {
  const [form, setForm]           = useState<FormState>(INIT);
  const [images, setImages]       = useState<ImageItem[]>([]);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [showSuccess, setSuccess] = useState(false);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (a: string) =>
    set("amenities", form.amenities.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...form.amenities, a]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files    = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    const newItems: ImageItem[] = files.slice(0, remaining)
      .filter(f => f.type.startsWith("image/"))
      .map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newItems]);
    e.target.value = "";
  };

  const removeImage = (idx: number) =>
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.hotelName.trim())   e.hotelName     = "Hotel name is required";
    if (!form.city.trim())        e.city          = "City is required";
    if (!form.address.trim())     e.address       = "Address is required";
    if (!form.description.trim()) e.description   = "Description is required";
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) e.pricePerNight = "Enter a valid price per night";
    if (!form.budgetCategory)     e.budgetCategory = "Select a budget category";
    if (images.length === 0)      e.images        = "Upload at least 1 hotel image (max 5)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("hotelName",     form.hotelName);
      fd.append("city",          form.city);
      fd.append("address",       form.address);
      fd.append("description",   form.description);
      fd.append("pricePerNight", form.pricePerNight);
      fd.append("budgetCategory",form.budgetCategory);
      fd.append("amenities",     JSON.stringify(form.amenities));
      images.forEach(img => fd.append("images", img.file));

      const res: any = await api.hotels.register(fd);

      // After registration → redirect to Stripe payment (same as vendor)
      if (res?.hotel?.id) {
        try {
          const stripeRes = await api.hotels.createCheckoutSession(res.hotel.id);
          if (stripeRes?.url) {
            window.location.href = stripeRes.url;
            return;
          }
        } catch (stripeErr: any) {
          setErrors({ submit: stripeErr?.message || "Failed to initiate payment. Please try again." });
          setLoading(false);
          return;
        }
      }

      // Fallback if no Stripe URL
      setSuccess(true);
      setTimeout(() => onBack(), 4000);
    } catch (err: any) {
      setErrors({ submit: err?.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const inp   = "w-full bg-gray-900/50 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none";
  const lbl   = "flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base font-bold text-white tracking-tight";
  const ico   = "w-4 h-4 sm:w-5 sm:h-5 text-blue-400";

  const budgetColor: Record<string, { sel: string; unsel: string; text: string }> = {
    emerald: { sel: "border-emerald-500/60 bg-emerald-500/10", unsel: "border-white/10 bg-gray-900/50 hover:border-emerald-500/30", text: "text-emerald-300" },
    blue:    { sel: "border-blue-500/60    bg-blue-500/10",    unsel: "border-white/10 bg-gray-900/50 hover:border-blue-500/30",    text: "text-blue-300"    },
    amber:   { sel: "border-amber-500/60  bg-amber-500/10",   unsel: "border-white/10 bg-gray-900/50 hover:border-amber-500/30",   text: "text-amber-300"   },
  };

  return (
    <div className="min-h-[100dvh] bg-gray-950 text-white relative pt-6 pb-12 px-4 sm:px-6 lg:px-8 z-20">

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Hero Banner ── */}
        <div className="mb-8 mt-4 relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden h-[250px] sm:h-[310px] shadow-2xl border border-white/10">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
            alt="Hotel"
            className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-transparent" />

          <div className="relative z-10 px-6 sm:px-12 h-full flex flex-col justify-center">
            <button
              onClick={onBack}
              className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block text-xs font-bold uppercase tracking-wider">Back</span>
            </button>

            <div className="max-w-2xl mt-10 sm:mt-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 backdrop-blur-md mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Hotel Partner Program</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-3 leading-tight">
                Register Your Hotel
              </h1>
              <p className="text-gray-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
                List your property on TripMate and get discovered by thousands of travelers planning their next trip with AI.
              </p>
            </div>
          </div>
        </div>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-10"
        >
          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
              {errors.submit}
            </div>
          )}

          {/* Hotel Name */}
          <div>
            <label className={lbl}><Building2 className={ico} /><span>Hotel Name *</span></label>
            <input type="text" value={form.hotelName} onChange={e => set("hotelName", e.target.value)} placeholder="e.g. Grand Hyatt Karachi" className={inp} />
            {errors.hotelName && <p className="text-red-400 mt-2 text-sm">{errors.hotelName}</p>}
          </div>

          {/* City + Address */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className={lbl}><MapPin className={ico} /><span>City *</span></label>
              <input type="text" value={form.city} onChange={e => set("city", e.target.value)} placeholder="e.g. Dubai, Lahore, Paris" className={inp} />
              {errors.city && <p className="text-red-400 mt-2 text-sm">{errors.city}</p>}
            </div>
            <div>
              <label className={lbl}><MapPin className={ico} /><span>Full Address *</span></label>
              <input type="text" value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street, Area, City, Country" className={inp} />
              {errors.address && <p className="text-red-400 mt-2 text-sm">{errors.address}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={lbl}><FileText className={ico} /><span>Hotel Description *</span></label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="What makes your hotel special — vibe, nearby attractions, signature experiences..." rows={5} className={`${inp} resize-none`} />
            {errors.description && <p className="text-red-400 mt-2 text-sm">{errors.description}</p>}
          </div>

          {/* Price */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className={lbl}><DollarSign className={ico} /><span>Price Per Night (USD) *</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                <input type="number" min="1" value={form.pricePerNight} onChange={e => set("pricePerNight", e.target.value)} placeholder="0" className={`${inp} pl-9`} />
              </div>
              {errors.pricePerNight && <p className="text-red-400 mt-2 text-sm">{errors.pricePerNight}</p>}
            </div>
          </div>

          {/* Budget Category */}
          <div>
            <label className={lbl}><Tag className={ico} /><span>Budget Category *</span></label>
            <div className="grid sm:grid-cols-3 gap-4">
              {BUDGET_OPTIONS.map(b => {
                const sel = form.budgetCategory === b.value;
                const c   = budgetColor[b.color];
                return (
                  <label key={b.value} className={`flex flex-col gap-2 p-4 sm:p-5 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${sel ? c.sel : c.unsel}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="budgetCategory" value={b.value} checked={sel} onChange={() => set("budgetCategory", b.value)} className="w-4 h-4" />
                      <span className={`font-bold text-sm sm:text-base ${sel ? c.text : "text-gray-300"}`}>{b.label}</span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed pl-7">{b.desc}</p>
                  </label>
                );
              })}
            </div>
            {errors.budgetCategory && <p className="text-red-400 mt-2 text-sm">{errors.budgetCategory}</p>}
          </div>

          {/* Amenities */}
          <div>
            <label className={lbl}><CheckCircle className={ico} /><span>Amenities <span className="text-gray-400 text-sm font-normal">(Select all that apply)</span></span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {AMENITY_OPTIONS.map(({ label, icon: Icon }) => {
                const sel = form.amenities.includes(label);
                return (
                  <label key={label} className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${sel ? "border-blue-500/50 bg-blue-500/10" : "border-white/10 bg-gray-900/50 hover:border-white/20"}`}>
                    <input type="checkbox" checked={sel} onChange={() => toggleAmenity(label)} className="w-4 h-4 text-blue-500 bg-gray-900 border-gray-600 rounded" />
                    <Icon className={`w-4 h-4 shrink-0 ${sel ? "text-blue-400" : "text-gray-500"}`} />
                    <span className={`text-xs sm:text-sm font-medium leading-tight ${sel ? "text-blue-300" : "text-gray-300"}`}>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Hotel Photos Gallery ── */}
          <div>
            <label className={lbl}>
              <ImagePlus className={ico} />
              <span>
                Hotel Photos *
                <span className="text-gray-400 text-sm font-normal ml-2">{images.length}/{MAX_IMAGES} — min 1, max 5</span>
              </span>
            </label>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square border border-white/10 bg-gray-900">
                    <img src={img.preview} alt={`hotel-${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Cover</div>
                    )}
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-white/20 bg-gray-900/40 cursor-pointer hover:bg-gray-900/60 hover:border-blue-500/40 transition-all group">
                    <ImagePlus className="w-6 h-6 text-gray-500 group-hover:text-blue-400 mb-1 transition-colors" />
                    <span className="text-[10px] text-gray-500 group-hover:text-blue-400 font-bold uppercase tracking-wider">Add More</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
                  </label>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 bg-gray-900/30 rounded-2xl sm:rounded-3xl p-8 sm:p-12 cursor-pointer hover:bg-gray-900/50 hover:border-blue-500/40 transition-all group">
                <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:bg-white/10 transition-colors">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <p className="text-white font-bold mb-1 text-sm sm:text-base">Click to upload hotel photos</p>
                <p className="text-gray-500 text-xs sm:text-sm">Select 1–5 images · PNG, JPG, WEBP · Max 5 MB each</p>
                <p className="text-gray-600 text-xs mt-2">First image will be used as the cover photo</p>
                <input type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" />
              </label>
            )}
            {errors.images && <p className="text-red-400 mt-2 text-sm">{errors.images}</p>}
          </div>

          {/* Submit */}
          <div className="pt-6 sm:pt-8">
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all text-base sm:text-lg font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Submitting..." : "Submit Hotel Registration"}
            </button>
            <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 font-medium">
              Your hotel will be reviewed by our admin team before going live on TripMate.
            </p>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
          <div className="bg-gray-900 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] max-w-md w-full relative z-[101] animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-3 text-white tracking-tight">Registration Submitted!</h2>
            <p className="text-gray-400 text-center text-sm sm:text-base leading-relaxed mb-8">
              Our admin team will review your hotel. Once approved, it will appear in Trusted Hotels and show up in AI-generated trip recommendations.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-[loading_4s_linear_forwards]" />
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-400 font-bold uppercase tracking-widest">Redirecting to home...</p>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes loading { 0% { width:0% } 100% { width:100% } }`}</style>
    </div>
  );
}
