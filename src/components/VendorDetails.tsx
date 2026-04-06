import { ArrowLeft, MapPin, Phone, Mail, MessageCircle, Star, CheckCircle, Clock, Users, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Vendor } from '../types';

interface VendorDetailsProps {
  vendor: Vendor;
  onBack: () => void;
}

export function VendorDetails({ vendor, onBack }: VendorDetailsProps) {
  // Combine services and customServices, fallback to empty array
  const services = [
    ...(vendor.services || []),
    ...(vendor.customServices || [])
  ];

  // Derive contact info from vendor object
  // Prioritize first branch for phone/location if available
  const firstBranch = vendor.branches?.[0];
  const contact = {
    phone: firstBranch?.phone || "Contact for details",
    email: vendor.email || "Contact for details",
    address: firstBranch?.location || vendor.city || (vendor.serviceLocations?.length ? vendor.serviceLocations.join(", ") : vendor.location) || "Physical office not present",
    whatsapp: firstBranch?.phone || ""
  };

  const handleWhatsAppClick = () => {
    if (!contact.whatsapp) return;
    window.open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleEmailClick = () => {
    if (!contact.email.includes('@')) return;
    window.location.href = `mailto:${contact.email}`;
  };

  const handlePhoneClick = () => {
    if (!contact.phone) return;
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 relative z-20">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-black mb-6 cursor-pointer relative z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to vendors</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-80 w-full overflow-hidden">
          <ImageWithFallback
            src={vendor.image || ""}
            alt={vendor.name || "Vendor Image"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{vendor.rating}</span>
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Verified Vendor
              </div>
            </div>
            <h1 className="text-white text-4xl mb-2">{vendor.name || vendor.companyName}</h1>
            <p className="text-white/90 text-lg">{vendor.category || vendor.vendorType}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Stats Cards - Placeholder stats or derived if available */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl mb-1">High</div>
              <div className="text-sm text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl mb-1">Top</div>
              <div className="text-sm text-gray-600">Rated Service</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl mb-1">Fast</div>
              <div className="text-sm text-gray-600">Response Time</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Services Section */}
            <div>
              <h2 className="text-2xl mb-6">Our Services</h2>
              <div className="space-y-3">
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <div key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No specific services listed.</p>
                )}
              </div>

              {vendor.specialOffer && (
                <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-600 text-white p-6 rounded-lg">
                  <h3 className="text-xl mb-2">Special Offer</h3>
                  <p className="text-blue-100 mb-4">
                    {vendor.specialOffer}
                  </p>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-2xl mb-6">Contact Information</h2>

              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Address</div>
                      <div>{contact.address}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Phone</div>
                      <button
                        onClick={handlePhoneClick}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.phone}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Email</div>
                      <button
                        onClick={handleEmailClick}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {contact.email}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button - Only if phone is available */}
              {contact.whatsapp && (
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-lg">Chat on WhatsApp</span>
                </button>
              )}

              <div className="mt-4 text-center text-sm text-gray-600">
                Response times may vary.
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl mb-4">About Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {vendor.aboutUs || vendor.description || "No description provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
