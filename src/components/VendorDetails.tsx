import React from 'react';
import {
    ArrowLeft, MapPin, Phone, Mail, MessageCircle,
    Star, CheckCircle, Award, Briefcase, ShieldCheck,
    Building2, GitBranch, DollarSign,
} from 'lucide-react';
import { BASE_URL } from '../services/api';
import type { Vendor } from '../types';

interface VendorDetailsProps {
    vendor: Vendor;
    onBack: () => void;
}

function resolveLogoUrl(url?: string) {
    if (!url) return '';
    return url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function VendorDetails({ vendor, onBack }: VendorDetailsProps) {
    const services = [...(vendor.services || []), ...(vendor.customServices || [])];

    const firstBranch = vendor.branches?.[0];
    const rawPhone = firstBranch?.phone || vendor.phone || '';
    const hasRealPhone = rawPhone.replace(/[^0-9]/g, '').length >= 5;

    const address =
        firstBranch?.location ||
        vendor.city ||
        (vendor.serviceLocations?.length ? vendor.serviceLocations.join(', ') : null) ||
        vendor.location ||
        'Physical office not present';

    const logoUrl = resolveLogoUrl(vendor.logoUrl || vendor.image);

    /* ── WhatsApp helper ────────────────────────── */
    const toWhatsAppNumber = (phone: string) => {
        let d = phone.replace(/[^0-9]/g, '');
        if (d.startsWith('0') && d.length === 11) d = '92' + d.slice(1);
        else if (d.length === 10 && !d.startsWith('92')) d = '92' + d;
        return d;
    };

    const openWhatsApp = () => {
        if (!hasRealPhone) return;
        window.open(`https://wa.me/${toWhatsAppNumber(rawPhone)}`, '_blank');
    };

    const openEmail = () => {
        if (!vendor.email?.includes('@')) return;
        window.location.href = `mailto:${vendor.email}`;
    };

    const budgetLabel =
        vendor.budgetMin != null && vendor.budgetMax != null
            ? `$${vendor.budgetMin.toLocaleString()} – $${vendor.budgetMax.toLocaleString()}`
            : null;

    return (
        <div className="min-h-screen bg-gray-950 text-white relative pb-16 z-20">

            {/* ── Ambient blobs ───────────────────────────── */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* ── Sticky nav ──────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-gray-950/85 backdrop-blur-xl border-b border-white/8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="group flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-widest hidden sm:block">Back to Vendors</span>
                    </button>

                    <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Partner
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 relative z-10 space-y-6">

                {/* ── HERO ────────────────────────────────────── */}
                <div className="bg-white/[0.04] backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                    {/* Top colour bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-400" />

                    <div className="p-6 sm:p-8 lg:p-5 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">

                        {/* Logo */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 shrink-0 rounded-2xl bg-gray-900 border border-white/10 overflow-hidden flex items-center justify-center shadow-xl">
                            {logoUrl ? (
                                <img src={logoUrl} alt={vendor.companyName} className="w-full h-full object-contain p-2" />
                            ) : (
                                <Building2 className="w-10 h-10 text-gray-600" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                                    {vendor.vendorType || vendor.category || 'Travel Partner'}
                                </span>
                                {vendor.paid && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                        Premium
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight mb-3">
                                {vendor.companyName || vendor.name}
                            </h1>

                            {/* Meta row */}
                            
                        </div>

                        {/* CTA button */}
                        <div className="shrink-0 w-full sm:w-auto">
                            <button
                                onClick={hasRealPhone ? openWhatsApp : openEmail}
                                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <MessageCircle className="w-4 h-4" />
                                {hasRealPhone ? 'Chat on WhatsApp' : 'Send Email'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Special offer ────────────────────────────── */}
                {vendor.specialOffer && (
                    <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 sm:p-6 flex items-start gap-4">
                        <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 shrink-0">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-500/80 mb-1">Exclusive Offer</p>
                            <p className="text-white font-semibold text-sm sm:text-base leading-relaxed">{vendor.specialOffer}</p>
                        </div>
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
                    </div>
                )}

                {/* ── Main grid ───────────────────────────────── */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left 2/3 */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* About */}
                        <section className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold text-white">About</h2>
                            </div>
                            <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                                {vendor.aboutUs || vendor.description ||
                                    'This vendor is a verified partner on TripMate. Contact them directly for more information about their services.'}
                            </p>
                        </section>

                        {/* Services */}
                        {services.length > 0 && (
                            <section className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">Services</h2>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2.5">
                                    {services.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl px-4 py-3 transition-colors">
                                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span className="text-gray-200 text-sm font-medium">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Branches */}
                        {vendor.branches && vendor.branches.length > 0 && (
                            <section className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                                        <GitBranch className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white">
                                        Branch Network
                                        <span className="ml-2 text-xs font-semibold text-gray-500">({vendor.branches.length})</span>
                                    </h2>
                                </div>
                                <div className="space-y-2.5">
                                    {vendor.branches.map((b, i) => (
                                        <div key={i} className="flex items-center justify-between gap-4 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="w-6 h-6 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="text-white text-sm font-semibold truncate">{b.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                                                {b.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />{b.location}
                                                    </span>
                                                )}
                                                {b.phone && (
                                                    <button
                                                        onClick={() => window.open(`https://wa.me/${toWhatsAppNumber(b.phone!)}`, '_blank')}
                                                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                                                    >
                                                        <Phone className="w-3 h-3" />{b.phone}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right 1/3 — Contact card */}
                    <div className="space-y-4">
                        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-6 lg:sticky lg:top-24">
                            <h2 className="text-base font-bold text-white mb-5">Direct Contact</h2>

                            <div className="space-y-3 mb-6">

                                {/* Location */}
                                <div className="flex items-start gap-3 p-3.5 bg-white/5 rounded-xl border border-white/8">
                                    <div className="p-2 bg-gray-900 rounded-lg border border-white/8 shrink-0">
                                        <MapPin className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Location</p>
                                        <p className="text-sm text-white font-medium leading-snug break-words">{address}</p>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div
                                    role={hasRealPhone ? 'button' : undefined}
                                    onClick={hasRealPhone ? openWhatsApp : undefined}
                                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${hasRealPhone
                                        ? 'bg-white/5 hover:bg-emerald-500/8 border-white/8 hover:border-emerald-500/30 cursor-pointer group'
                                        : 'bg-white/5 border-white/8'}`}
                                >
                                    <div className={`p-2 bg-gray-900 rounded-lg border shrink-0 transition-colors ${hasRealPhone ? 'border-white/8 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10' : 'border-white/8'}`}>
                                        <Phone className={`w-4 h-4 transition-colors ${hasRealPhone ? 'text-gray-400 group-hover:text-emerald-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Phone</p>
                                        <p className={`text-sm font-medium leading-snug break-all ${hasRealPhone ? 'text-white group-hover:text-emerald-400 transition-colors' : 'text-gray-600'}`}>
                                            {rawPhone || 'Contact for details'}
                                        </p>
                                        {hasRealPhone && (
                                            <p className="text-[10px] text-emerald-500/70 mt-0.5">Tap to open WhatsApp</p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div
                                    role="button"
                                    onClick={openEmail}
                                    className="flex items-start gap-3 p-3.5 bg-white/5 hover:bg-blue-500/8 rounded-xl border border-white/8 hover:border-blue-500/30 cursor-pointer transition-all group"
                                >
                                    <div className="p-2 bg-gray-900 rounded-lg border border-white/8 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 shrink-0 transition-colors">
                                        <Mail className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Email</p>
                                        <p className="text-sm text-white group-hover:text-blue-400 font-medium leading-snug break-all transition-colors">
                                            {vendor.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            

                            {!hasRealPhone && vendor.email?.includes('@') && (
                                <button
                                    onClick={openEmail}
                                    className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
                                >
                                    <Mail className="w-4 h-4" />
                                    Send an Email
                                </button>
                            )}
                        </div>

                        {/* Budget card */}
                        {budgetLabel && (
                            <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/10 p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-4 h-4 text-yellow-400" />
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Budget Range</p>
                                </div>
                                <p className="text-lg font-black text-white">{budgetLabel}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Per person / package estimate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
