import React from 'react';
import { ArrowLeft, MapPin, Phone, Mail, MessageCircle, Star, CheckCircle, Clock, Users, Award, Briefcase, Globe, ShieldCheck } from 'lucide-react';
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

  const handleContactNowClick = () => {
    if (contact.whatsapp) {
      window.open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    } else if (contact.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative pb-6 sm:pb-8 animate-slide-up z-20">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[120px] translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 sm:p-2.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wider uppercase hidden sm:block">Back to Vendors</span>
            <span className="font-bold text-xs tracking-wider uppercase sm:hidden">Back</span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-2 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              Verified Elite
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 relative z-10 space-y-6 sm:space-y-8">
        
        {/* Compact Hero Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          
          {/* Company Avatar / Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl sm:rounded-3xl bg-gray-900/80 border border-white/10 p-1.5 sm:p-2 shadow-xl">
            <ImageWithFallback
              src={vendor.image || ""}
              alt={vendor.name || "Vendor Image"}
              className="w-full h-full object-contain rounded-xl sm:rounded-2xl"
            />
          </div>

          {/* Hero Content */}
          <div className="flex-1 text-center sm:text-left min-w-0 flex flex-col justify-center w-full">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-1 sm:mb-2 leading-tight break-words">
              {vendor.name || vendor.companyName}
            </h1>
            <p className="text-blue-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 sm:mb-5 break-words">
              {vendor.category || vendor.vendorType}
            </p>
            
            {/* Quick Stats & Action Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
              <div className="bg-white/5 rounded-xl p-2.5 sm:p-3 border border-white/5 px-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm sm:text-base font-bold text-white">{vendor.rating}</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 sm:p-3 border border-white/5 px-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm sm:text-base font-bold text-white">Top Rated</span>
              </div>

              {contact.phone && (
                <button 
                  onClick={handleContactNowClick}
                  className="bg-white text-gray-950 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-2 group w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <Phone className="w-4 h-4 group-hover:scale-110 group-hover:text-blue-600 transition-transform shrink-0" />
                  <span className="whitespace-nowrap">Contact Now</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Special Offer */}
        {vendor.specialOffer && (
          <div className="bg-gradient-to-r from-blue-600 to-sky-400 p-[2px] rounded-2xl sm:rounded-[2rem]">
            <div className="bg-gray-950 rounded-[15px] sm:rounded-[30px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 sm:mb-3">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
                  <h3 className="text-white text-xs sm:text-sm font-bold uppercase tracking-widest whitespace-nowrap">Exclusive Offer</h3>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white leading-snug break-words">
                  {vendor.specialOffer}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* About Us Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="p-2.5 sm:p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">About The Vendor</h2>
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
                {vendor.aboutUs || vendor.description || "Experience top-tier service customized for your elite travel needs. This vendor has not provided a detailed description yet, but holds our Verified status."}
              </p>
            </div>

            {/* Premium Services Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-white/10 shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="p-2.5 sm:p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Premium Services</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <div key={index} className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-xl border border-white/5">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="font-medium text-gray-200 text-sm sm:text-base break-words w-full">{service}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-1 sm:col-span-2 bg-gray-900/50 p-6 rounded-xl border border-white/5 text-center">
                    <p className="text-gray-400 text-sm sm:text-base">Standard verified services included.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Direct Contact */}
          <div className="space-y-6 sm:space-y-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg lg:sticky lg:top-28">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-6">Direct Contact</h2>

              <div className="space-y-4 mb-8">
                {/* Location */}
                <div className="flex items-start gap-3 sm:gap-4 group">
                  <div className="p-3 bg-gray-900/80 rounded-xl border border-white/5 text-gray-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-colors shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Location</div>
                    <div className="font-medium text-white text-sm sm:text-base break-words whitespace-normal leading-tight">{contact.address}</div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 sm:gap-4 group">
                  <div className="p-3 bg-gray-900/80 rounded-xl border border-white/5 text-gray-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Phone</div>
                    <button 
                      onClick={handlePhoneClick} 
                      className="font-medium text-white hover:text-blue-400 transition-colors text-left text-sm sm:text-base w-full break-words whitespace-normal"
                    >
                      {contact.phone}
                    </button>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 sm:gap-4 group">
                  <div className="p-3 bg-gray-900/80 rounded-xl border border-white/5 text-gray-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Email</div>
                    <button 
                      onClick={handleEmailClick} 
                      className="font-medium text-white hover:text-emerald-400 transition-colors text-left text-sm sm:text-base w-full break-all whitespace-normal"
                    >
                      {contact.email}
                    </button>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              {contact.whatsapp && (
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold text-sm sm:text-base"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  <span className="whitespace-nowrap">Chat on WhatsApp</span>
                </button>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
