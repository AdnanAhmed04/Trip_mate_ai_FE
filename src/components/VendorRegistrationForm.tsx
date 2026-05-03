import React, { useState } from "react";
import { X, Plus, Upload, Building2, Mail, MapPin, FileText, Tag, ArrowLeft, CheckCircle, Phone, ShieldCheck, Ticket } from "lucide-react";
import { api } from "../services/api";

interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
}

interface VendorFormData {
  companyName: string;
  vendorServices: string[];
  branches: Branch[];
  vendorType: string;
  companyLogo: File | null;
  email: string;
  phone: string;
  aboutUs: string;
  specialOffer: string;
  ourServices: string[];
  serviceLocations: string[];
}

interface VendorRegistrationFormProps {
  onBack: () => void;
}

const serviceOptions = [
  "Luxury Beach Resorts",
  "Water Sports Activities",
  "Spa & Wellness Packages",
  "Beachfront Villa Rentals",
  "Sunset Cruises",
  "Island Hopping Tours",
  "Travel & Tours",
  "Event Management",
  "Transportation",
  "Hotel / Villa",
  "Other"
];

const vendorTypeOptions = [
  "Resort",
  "Travel & Tours",
  "Transportation",
  "Event Management",
  "Water Sports",
  "Hotel / Villa",
  "Other",
];

export function VendorRegistrationForm({ onBack }: VendorRegistrationFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    companyName: "",
    vendorServices: [],
    branches: [],
    vendorType: "",
    companyLogo: null,
    email: "",
    phone: "",
    aboutUs: "",
    specialOffer: "",
    ourServices: [],
    serviceLocations: [],
  });

  const [customService, setCustomService] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      vendorServices: prev.vendorServices.includes(service)
        ? prev.vendorServices.filter((s) => s !== service)
        : [...prev.vendorServices, service],
      ourServices: prev.vendorServices.includes(service)
        ? prev.ourServices.filter((s) => s !== service)
        : [...prev.ourServices, service],
    }));
  };

  const handleAddCustomService = () => {
    if (customService.trim() && !formData.vendorServices.includes(customService)) {
      setFormData((prev) => ({
        ...prev,
        vendorServices: [...prev.vendorServices, customService],
        ourServices: [...prev.ourServices, customService],
      }));
      setCustomService("");
    }
  };

  const handleAddCustomLocation = () => {
    if (customLocation.trim() && !formData.serviceLocations.includes(customLocation)) {
      setFormData((prev) => ({
        ...prev,
        serviceLocations: [...prev.serviceLocations, customLocation],
      }));
      setCustomLocation("");
    }
  };

  const handleRemoveLocation = (location: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceLocations: prev.serviceLocations.filter((l) => l !== location),
    }));
  };

  const handleAddBranch = () => {
    const newBranch: Branch = {
      id: Date.now().toString(),
      name: "",
      location: "",
      phone: "",
    };
    setFormData((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));
  };

  const handleRemoveBranch = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b.id !== id),
    }));
  };

  const handleBranchChange = (id: string, field: keyof Branch, value: string) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, companyLogo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (formData.vendorServices.length === 0) newErrors.vendorServices = "Select at least one service";

    if (formData.branches.length > 0) {
      const hasInvalidBranch = formData.branches.some((b) => {
        const hasData = b.name.trim() || b.location.trim() || b.phone.trim();
        if (hasData) return !b.name.trim() || !b.location.trim() || !b.phone.trim();
        return false;
      });
      if (hasInvalidBranch) newErrors.branches = "Each branch must have a name, location, and phone number";
    }

    if (!formData.vendorType) newErrors.vendorType = "Vendor type is required";
    if (!formData.companyLogo) newErrors.companyLogo = "Company logo is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.phone.trim()) newErrors.phone = "Contact number is required";

    if (!formData.aboutUs.trim()) newErrors.aboutUs = "About Us is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitVendor = async (data: VendorFormData) => {
    const fd = new FormData();
    fd.append("companyName", data.companyName);
    fd.append("vendorType", data.vendorType);
    fd.append("email", data.email);
    fd.append("phone", data.phone);
    fd.append("aboutUs", data.aboutUs);
    fd.append("specialOffer", data.specialOffer || "");

    fd.append("services", JSON.stringify(data.vendorServices));
    fd.append("branches", JSON.stringify(data.branches || []));
    fd.append("serviceLocations", JSON.stringify(data.serviceLocations || []));

    if (data.companyLogo) fd.append("logo", data.companyLogo);

    return api.vendors.register(fd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalServiceLocations = [...formData.serviceLocations];
    if (customLocation.trim() && !finalServiceLocations.includes(customLocation.trim())) {
      finalServiceLocations.push(customLocation.trim());
    }

    const finalVendorServices = [...formData.vendorServices];
    if (customService.trim() && !finalVendorServices.includes(customService.trim())) {
      finalVendorServices.push(customService.trim());
    }

    const filteredData: VendorFormData = {
      ...formData,
      serviceLocations: finalServiceLocations,
      vendorServices: finalVendorServices,
      branches: formData.branches.filter((b) => b.name.trim() && b.location.trim() && b.phone.trim()),
    };
    
    try {
      setLoading(true);
      await submitVendor(filteredData);
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        onBack();
      }, 4000);
    } catch (err: any) {
      alert(err?.message || "Error submitting vendor");
      setLoading(false);
    }
  };

  // Base input classes for dark mode
  const inputBaseClasses = "w-full bg-gray-900/50 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-white placeholder-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all outline-none";
  const labelClasses = "flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base font-bold text-white tracking-tight";
  const iconClasses = "w-4 h-4 sm:w-5 sm:h-5 text-blue-400";

  return (
    <div className="min-h-[100dvh] bg-gray-950 text-white relative pt-6 pb-12 px-4 sm:px-6 lg:px-8 animate-slide-up z-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-emerald-600/10 rounded-full blur-[100px] sm:blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Hero Section */}
        <div className="mb-8 mt-4 relative z-50 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden h-[250px] sm:h-[300px] md:h-[350px] shadow-2xl border border-white/10">
          <img
            src="https://images.pexels.com/photos/19825310/pexels-photo-19825310.jpeg"
            alt="travel"
            className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/70 to-transparent"></div>

          <div className="relative z-10 px-6 sm:px-12 h-full flex flex-col justify-center">
            <button
              onClick={onBack}
              className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all cursor-pointer border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider hidden sm:block">Back</span>
            </button>

            <div className="max-w-2xl mt-10 sm:mt-12">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 backdrop-blur-md mb-3 sm:mb-4 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest">Partner Program</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-2 sm:mb-4 leading-tight drop-shadow-lg">
                Vendor Registration
              </h1>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed max-w-xl drop-shadow-md">
                Join our elite platform, showcase your premium services, and connect with thousands of exclusive travelers.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 p-5 sm:p-8 md:p-12 space-y-8 sm:space-y-10 relative z-10">
          
          {/* Company Name */}
          <div>
            <label className={labelClasses}>
              <Building2 className={iconClasses} />
              <span>Company Name *</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Enter your company name"
              className={inputBaseClasses}
            />
            {errors.companyName && <p className="text-red-400 mt-2 text-sm font-medium">{errors.companyName}</p>}
          </div>

          {/* Vendor Services */}
          <div>
            <label className={labelClasses}>
              <Tag className={iconClasses} />
              <span>Vendor Services * <span className="text-gray-400 text-sm font-normal">(Select at least 1)</span></span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
              {serviceOptions.map((service) => {
                const isSelected = formData.vendorServices.includes(service);
                return (
                  <label
                    key={service}
                    className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/10 bg-gray-900/50 hover:border-white/20 hover:bg-gray-900/80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleServiceToggle(service)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 bg-gray-900 border-gray-600 rounded focus:ring-blue-500/50 focus:ring-offset-gray-900"
                    />
                    <span className={`text-sm sm:text-base font-medium ${isSelected ? 'text-blue-300' : 'text-gray-300'}`}>{service}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom Service Input */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="Add custom service..."
                className={inputBaseClasses}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomService();
                  }
                }}
              />
              <button 
                type="button" 
                onClick={handleAddCustomService} 
                className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-blue-600/30 font-bold transition-colors cursor-pointer shrink-0"
              >
                + Add Custom
              </button>
            </div>

            {/* Custom Service Chips */}
            {formData.vendorServices.filter((s) => !serviceOptions.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.vendorServices
                  .filter((s) => !serviceOptions.includes(s))
                  .map((service) => (
                    <span key={service} className="bg-white/10 text-white border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                      {service}
                      <button type="button" onClick={() => handleServiceToggle(service)} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
            {errors.vendorServices && <p className="text-red-400 mt-2 text-sm font-medium">{errors.vendorServices}</p>}
          </div>

          {/* Service Locations */}
          <div>
            <label className={labelClasses}>
              <MapPin className={iconClasses} />
              <span>Service Locations</span>
            </label>
            <p className="text-gray-400 text-sm mb-4">
              Where do you operate? This plots your business on our Interactive Globe.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g., Paris, Tokyo, Worldwide..."
                className={inputBaseClasses}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomLocation();
                  }
                }}
              />
              <button 
                type="button" 
                onClick={handleAddCustomLocation} 
                className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-emerald-500/30 font-bold transition-colors cursor-pointer shrink-0"
              >
                + Add Location
              </button>
            </div>

            {formData.serviceLocations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.serviceLocations.map((location) => (
                  <span key={location} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                    {location}
                    <button type="button" onClick={() => handleRemoveLocation(location)} className="text-emerald-400/70 hover:text-emerald-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Branches */}
          <div>
            <label className={labelClasses}>
              <Building2 className={iconClasses} />
              <span>Branches <span className="text-gray-400 text-sm font-normal">(Optional)</span></span>
            </label>
            <p className="text-gray-400 text-sm mb-4">
              Add specific physical locations.
            </p>

            <div className="space-y-4">
              {formData.branches.map((branch, index) => (
                <div key={branch.id} className="bg-gray-900/50 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative group">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Branch {index + 1}</h3>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveBranch(branch.id)} 
                      className="text-red-400/70 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => handleBranchChange(branch.id, "name", e.target.value)}
                      placeholder="Branch Name *"
                      className={inputBaseClasses}
                    />
                    <input
                      type="text"
                      value={branch.location}
                      onChange={(e) => handleBranchChange(branch.id, "location", e.target.value)}
                      placeholder="Branch Location *"
                      className={inputBaseClasses}
                    />
                    <input
                      type="tel"
                      value={branch.phone}
                      onChange={(e) => handleBranchChange(branch.id, "phone", e.target.value)}
                      placeholder="Branch Phone *"
                      className={inputBaseClasses}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={handleAddBranch} 
              className="mt-4 flex items-center justify-center sm:justify-start gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-xl sm:rounded-2xl text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer w-full sm:w-auto font-bold"
            >
              <Plus className="w-5 h-5" />
              <span>Add Branch</span>
            </button>

            {errors.branches && <p className="text-red-400 mt-2 text-sm font-medium">{errors.branches}</p>}
          </div>

          {/* Vendor Type */}
          <div>
            <label className={labelClasses}>
              <Tag className={iconClasses} />
              <span>Vendor Type *</span>
            </label>
            <select
              value={formData.vendorType}
              onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
              className={`${inputBaseClasses} appearance-none cursor-pointer`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 1rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
                paddingRight: "2.5rem"
              }}
            >
              <option value="" className="bg-gray-900 text-gray-500">Select vendor type</option>
              {vendorTypeOptions.map((type) => (
                <option key={type} value={type} className="bg-gray-900 text-white">
                  {type}
                </option>
              ))}
            </select>
            {errors.vendorType && <p className="text-red-400 mt-2 text-sm font-medium">{errors.vendorType}</p>}
          </div>

          {/* Company Logo */}
          <div>
            <label className={labelClasses}>
              <Upload className={iconClasses} />
              <span>Company Logo *</span>
            </label>

            <div className="border-2 border-dashed border-white/20 bg-gray-900/30 rounded-2xl p-4 sm:p-5 text-center hover:bg-gray-900/50 transition-colors cursor-pointer group max-w-sm">
              {logoPreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img src={logoPreview} alt="Logo preview" className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto rounded-xl bg-gray-950 p-2 shadow-xl border border-white/10" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLogoPreview(null);
                        setFormData({ ...formData, companyLogo: null });
                      }}
                      className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block w-full h-full">
                  <div className="p-4 bg-white/5 rounded-full inline-block mb-4 group-hover:bg-white/10 transition-colors">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-white font-bold mb-1">Click to upload logo</p>
                  <p className="text-gray-500 text-sm">PNG, JPG up to 5MB</p>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>
            {errors.companyLogo && <p className="text-red-400 mt-2 text-sm font-medium">{errors.companyLogo}</p>}
          </div>

          {/* Contact Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className={labelClasses}>
                <Mail className={iconClasses} />
                <span>Email *</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="company@example.com"
                className={inputBaseClasses}
              />
              {errors.email && <p className="text-red-400 mt-2 text-sm font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className={labelClasses}>
                <Phone className={iconClasses} />
                <span>Contact Number *</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (234) 567-8900"
                className={inputBaseClasses}
              />
              {errors.phone && <p className="text-red-400 mt-2 text-sm font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* About Us */}
          <div>
            <label className={labelClasses}>
              <FileText className={iconClasses} />
              <span>About Us *</span>
            </label>
            <textarea
              value={formData.aboutUs}
              onChange={(e) => setFormData({ ...formData, aboutUs: e.target.value })}
              placeholder="Tell us about your company and services..."
              rows={5}
              className={`${inputBaseClasses} resize-none`}
            />
            {errors.aboutUs && <p className="text-red-400 mt-2 text-sm font-medium">{errors.aboutUs}</p>}
          </div>

          {/* Special Offer Grid */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 bg-blue-900/10 border border-blue-500/20 p-5 sm:p-6 rounded-2xl sm:rounded-3xl">
            <div>
              <label className={labelClasses}>
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span>Special Offer <span className="text-gray-400 text-sm font-normal">(Optional)</span></span>
              </label>
              <input
                type="text"
                value={formData.specialOffer}
                onChange={(e) => setFormData({ ...formData, specialOffer: e.target.value })}
                placeholder="e.g., 10% discount on bookings"
                className={inputBaseClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span>Promo Code <span className="text-gray-400 text-sm font-normal">(Optional)</span></span>
              </label>
              <input
                type="text"
                value={formData.specialOffer}
                onChange={(e) => setFormData({ ...formData, specialOffer: e.target.value })}
                placeholder="e.g., ELITE2025"
                className={inputBaseClasses}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 sm:pt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all text-base sm:text-lg font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit Application"}
            </button>
            <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 font-medium">
              By submitting, you agree to our Terms of Service and Elite Partner Guidelines.
            </p>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-md" />
          <div className="bg-gray-900 border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] max-w-md w-full relative z-[101] transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-center mb-3 text-white leading-tight tracking-tight">
              Application Received!
            </h2>
            <p className="text-gray-400 text-center text-sm sm:text-base leading-relaxed mb-8 font-medium">
              Our admin team will review your elite services. We will notify you via email shortly.
            </p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 animate-[loading_4s_linear_forwards]" />
              </div>
              <p className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest">
                Redirecting...
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
