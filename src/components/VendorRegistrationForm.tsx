import React, { useState } from "react";
import { X, Plus, Upload, Building2, Mail, MapPin, FileText, Tag, ArrowLeft } from "lucide-react";

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
  aboutUs: string;
  specialOffer: string;
  ourServices: string[];
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

const VENDOR_REGISTER_URL = "http://localhost:5000/api/vendors/register";

// ✅ Put your token here for testing OR store it in localStorage after login/register
const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InJlYWRlclRlc3RAZXhhbXBsZS5jb20iLCJzdWIiOiI2OGIwYWU2MTk0ZjRjN2MzMzg1MjM2YmUiLCJyb2xlcyI6WyJSZWFkZXIiXSwiaWF0IjoxNzU2NDA5NTk4LCJleHAiOjE3NTY0MTMxOTh9.-gUm7z6yMVUzIc2cRVmzzhOssPk71r8tJ7I7ZuPs1VE";

export function VendorRegistrationForm({ onBack }: VendorRegistrationFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    companyName: "",
    vendorServices: [],
    branches: [],
    vendorType: "",
    companyLogo: null,
    email: "",
    aboutUs: "",
    specialOffer: "",
    ourServices: [],
  });

  const [customService, setCustomService] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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

    if (!formData.aboutUs.trim()) newErrors.aboutUs = "About Us is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ API submit (token applied here)
  const submitVendor = async (data: VendorFormData) => {
    const token = localStorage.getItem("token") || TEST_TOKEN; // use stored token if you have it

    const fd = new FormData();
    fd.append("companyName", data.companyName);
    fd.append("vendorType", data.vendorType);
    fd.append("email", data.email);
    fd.append("aboutUs", data.aboutUs);
    fd.append("specialOffer", data.specialOffer || "");

    // backend expects "services"
    fd.append("services", JSON.stringify(data.vendorServices));

    // branches optional
    fd.append("branches", JSON.stringify(data.branches || []));

    // IMPORTANT: multer field is uploadLogo.single("logo")
    if (data.companyLogo) fd.append("logo", data.companyLogo);

    const res = await fetch(VENDOR_REGISTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ do not set Content-Type for FormData
      },
      body: fd,
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result?.message || "Vendor register failed");
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const filteredData: VendorFormData = {
      ...formData,
      branches: formData.branches.filter((b) => b.name.trim() && b.location.trim() && b.phone.trim()),
    };

    try {
      setLoading(true);
      const result = await submitVendor(filteredData);
      alert(result?.message || "Vendor registered!");
      // optional reset
      // setFormData({...});
    } catch (err: any) {
      alert(err?.message || "Error submitting vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl mb-2 text-gray-900">Vendor Registration</h1>
          <p className="text-xl text-gray-600">Join our platform and reach thousands of travelers</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
          {/* Company Name */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Company Name *</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Enter your company name"
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            />
            {errors.companyName && <p className="text-red-500 text-sm mt-2">{errors.companyName}</p>}
          </div>

          {/* Vendor Services */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <Tag className="w-5 h-5 text-blue-600" />
              <span>Vendor Services * (Select at least 1)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {serviceOptions.map((service) => (
                <label
                  key={service}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.vendorServices.includes(service)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.vendorServices.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900">{service}</span>
                </label>
              ))}
            </div>

            {/* Custom Service */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="Add custom service..."
                className="flex-1 border-2 border-gray-200 rounded-2xl px-5 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomService();
                  }
                }}
              />
              <button type="button" onClick={handleAddCustomService} className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors">
                Add
              </button>
            </div>

            {/* Custom chips */}
            {formData.vendorServices.filter((s) => !serviceOptions.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.vendorServices
                  .filter((s) => !serviceOptions.includes(s))
                  .map((service) => (
                    <span key={service} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2">
                      {service}
                      <button type="button" onClick={() => handleServiceToggle(service)} className="hover:text-blue-900">
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            {errors.vendorServices && <p className="text-red-500 text-sm mt-2">{errors.vendorServices}</p>}
          </div>

          {/* Branches */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Branches (Optional)</span>
            </label>
            <p className="text-sm text-gray-500 mb-4">
              Add your business locations. Each branch requires a name, location, and phone number.
            </p>

            <div className="space-y-4">
              {formData.branches.map((branch, index) => (
                <div key={branch.id} className="border-2 border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg text-gray-900">Branch {index + 1}</h3>
                    <button type="button" onClick={() => handleRemoveBranch(branch.id)} className="text-red-500 hover:text-red-700 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={branch.name}
                      onChange={(e) => handleBranchChange(branch.id, "name", e.target.value)}
                      placeholder="Branch Name *"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                    <input
                      type="text"
                      value={branch.location}
                      onChange={(e) => handleBranchChange(branch.id, "location", e.target.value)}
                      placeholder="Branch Location *"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                    <input
                      type="tel"
                      value={branch.phone}
                      onChange={(e) => handleBranchChange(branch.id, "phone", e.target.value)}
                      placeholder="Branch Phone *"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={handleAddBranch} className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Add Branch</span>
            </button>

            {errors.branches && <p className="text-red-500 text-sm mt-2">{errors.branches}</p>}
          </div>

          {/* Vendor Type */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Vendor Type *</span>
            </label>

            <select
              value={formData.vendorType}
              onChange={(e) => setFormData({ ...formData, vendorType: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            >
              <option value="">Select vendor type</option>
              {vendorTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {errors.vendorType && <p className="text-red-500 text-sm mt-2">{errors.vendorType}</p>}
          </div>

          {/* Company Logo */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <Upload className="w-5 h-5 text-blue-600" />
              <span>Company Logo * (Any image format)</span>
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
              {logoPreview ? (
                <div className="space-y-4">
                  <img src={logoPreview} alt="Logo preview" className="w-32 h-32 object-contain mx-auto rounded-xl" />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setFormData({ ...formData, companyLogo: null });
                    }}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload logo</p>
                  <p className="text-sm text-gray-500">Any image format</p>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>

            {errors.companyLogo && <p className="text-red-500 text-sm mt-2">{errors.companyLogo}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Email *</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="company@example.com"
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            />
            {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
          </div>

          {/* About Us */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>About Us *</span>
            </label>
            <textarea
              value={formData.aboutUs}
              onChange={(e) => setFormData({ ...formData, aboutUs: e.target.value })}
              placeholder="Tell us about your company..."
              rows={6}
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
            />
            {errors.aboutUs && <p className="text-red-500 text-sm mt-2">{errors.aboutUs}</p>}
          </div>

          {/* Special Offer */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
              <Tag className="w-5 h-5 text-blue-600" />
              <span>Special Offer (Optional)</span>
            </label>
            <input
              type="text"
              value={formData.specialOffer}
              onChange={(e) => setFormData({ ...formData, specialOffer: e.target.value })}
              placeholder="e.g., 10% discount on bookings"
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 rounded-2xl hover:shadow-2xl transition-all text-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
