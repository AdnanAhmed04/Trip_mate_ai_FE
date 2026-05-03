import React, { useMemo, useState } from 'react';
import {
    ArrowLeft, MapPin, Calendar, Clock, DollarSign, Star,
    Info, ChevronDown, Sparkles, Cloud, Bookmark,
    Zap, Home, Navigation, Compass, Shield, Bus, Sun, CalendarCheck
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Trip, Hotel, ItineraryDay, ItineraryItem, EmergingBusiness } from '../types';

const getMapLink = (name: string, address?: string, destination?: string) => {
    const query = [name, address, destination].filter(Boolean).join(' ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};
import { api } from '../services/api';

/**
 * Professional Weather Badge
 */
const WeatherBadge = ({ weather }: { weather?: string }) => {
    if (!weather) return null;
    return (
        <div style={{ background: 'rgba(30,58,138,0.4)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(8px)' }}>
            <Cloud className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{weather}</span>
        </div>
    );
};

/**
 * Modern Emerging Business Card (Nearby Gems)
 */
const EmergingBusinessCard = ({ biz, destination }: { biz: EmergingBusiness; destination?: string }) => (
    <div className="group/biz flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 backdrop-blur-sm">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
            <ImageWithFallback
                src={biz.imageUrl || ''}
                alt={biz.name}
                className="w-full h-full object-cover group-hover/biz:scale-110 transition-transform duration-500"
            />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
                <h6 className="text-xs font-black truncate text-white uppercase tracking-tight">{biz.name}</h6>
                <a
                    href={biz.locationLink || getMapLink(biz.name, biz.address, destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-md"
                    title="View on Map"
                >
                    <Navigation size={12} />
                </a>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{biz.type}</span>
                {biz.weather && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400">
                        <Cloud size={10} />
                        <span>{biz.weather}</span>
                    </div>
                )}
            </div>
        </div>
    </div>
);

interface TripItineraryViewProps {
    trip: Trip;
    onBack: () => void;
}

/**
 * Premium Hotel Card Component
 */
const HotelCard = ({ hotel, destination }: { hotel: Hotel; destination: string }) => (
    <div className="group/hotel rounded-[2.5rem] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-500 flex flex-col h-full hover:bg-white/10 hover:border-white/20 hover:shadow-3xl hover:-translate-y-1">
        {/* Image Header */}
        <div className="relative h-44 md:h-56 overflow-hidden">
            <ImageWithFallback
                src={hotel.imageUrl}
                alt={hotel.hotelName}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover/hotel:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-2 font-black text-xs text-white">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span>{hotel.rating}</span>
            </div>

            <div className="absolute bottom-6 left-6">
                <WeatherBadge weather={hotel.weather} />
            </div>
        </div>

        {/* Content */}
        <div className="p-5 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-base md:text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">
                        {hotel.hotelName}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <address className="not-italic truncate max-w-[120px] md:max-w-[150px]">{hotel.address}</address>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 font-black text-base md:text-lg text-green-400">
                        <span className="text-xs opacity-60">$</span>
                        <span>{hotel.price.replace('$', '')}</span>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Per Night</span>
                </div>
            </div>

            <p className="text-[13px] md:text-sm text-gray-400 leading-relaxed mb-4 md:mb-8 line-clamp-2 italic">
                "{hotel.uniqueFeature || hotel.description}"
            </p>

            {/* Emerging Businesses near hotel */}
            {hotel.nearbyEmergingBusinesses && hotel.nearbyEmergingBusinesses.length > 0 && (
                <div className="mt-auto pt-6 border-t border-white/5">
                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Local Discoveries
                    </h5>
                    <div className="space-y-3">
                        {hotel.nearbyEmergingBusinesses.slice(0, 2).map((biz, idx) => (
                            <EmergingBusinessCard key={idx} biz={biz} destination={destination} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 md:mt-8">
                <button
                    onClick={() => window.open(hotel.locationLink || getMapLink(hotel.hotelName, hotel.address, destination), '_blank')}
                    className="w-full group/btn relative overflow-hidden bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 rounded-2xl p-3 md:p-4 transition-all duration-300 cursor-pointer shadow-xl"
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 group-hover/btn:text-white transition-colors" />
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 group-hover/btn:text-white transition-colors">
                            Locate Sanctuary
                        </span>
                    </div>
                </button>
            </div>
        </div>
    </div>
);

const DAY_IMAGES: string[] = [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1500043357865-c6b8827edf7c?auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2000&q=80',
];

export function TripItineraryView({ trip, onBack }: TripItineraryViewProps) {
    const [expandedDays, setExpandedDays] = useState<number[]>([0]);

    const toggleDay = (index: number) => {
        setExpandedDays((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Stable fallback if an item/hotel image is missing.
    const getFallbackImage = (term: string) => {
        // Use a deterministic pick based on the term so it doesn't "shuffle" every render.
        let hash = 0;
        for (let i = 0; i < term.length; i++) hash = (hash * 31 + term.charCodeAt(i)) >>> 0;
        const idx = hash % DAY_IMAGES.length;
        return DAY_IMAGES[idx];
    };

    const getImageUrl = (url: string, searchTerm: string) => {
        if (!url) {
            return getFallbackImage(searchTerm || 'travel');
        }
        return url;
    };

    // Pick a stable image for each day index (0-based)
    const getDayImage = (dayIndex: number) => {
        return DAY_IMAGES[dayIndex % DAY_IMAGES.length];
    };

    // Optional: if itinerary is dynamic, memo can help avoid recalcs.
    const itinerary = useMemo(() => trip.itinerary ?? [], [trip.itinerary]);

    const derivedSeason = useMemo(() => {
        let allWeather = "";
        itinerary.forEach(day => {
            if (day.weather) allWeather += day.weather.toLowerCase() + " ";
            ['morning', 'afternoon', 'evening'].forEach(timeOfDay => {
                const items = (day as any)[timeOfDay];
                if (Array.isArray(items)) {
                    items.forEach(item => { if (item.weather) allWeather += item.weather.toLowerCase() + " "; });
                }
            });
        });

        if (allWeather.match(/snow|cold|freez|ice|winter|-/i)) return "Winter";
        if (allWeather.match(/rain|cloud|mild|breeze|fall|spring|autumn/i)) return "Spring/Fall";
        if (allWeather.match(/sun|hot|warm|clear|summer/i)) return "Summer";
        return "Summer"; // default
    }, [itinerary]);

    const [saved, setSaved] = useState(trip.generatedBy !== 'ai');
    const [isSaving, setIsSaving] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const handleSave = async () => {
        if (saved || isSaving) return;

        try {
            setIsSaving(true);
            await api.trips.update(trip._id || trip.id || '', { generatedBy: 'manual' });
            setSaved(true);
            trip.generatedBy = 'manual';

            setShowNotification(true);
            setTimeout(() => {
                setShowNotification(false);
            }, 4000);
        } catch (error) {
            console.error('Failed to save trip:', error);
            alert('Failed to save trip. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-10 pb-20 px-4 sm:px-8 md:px-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Navigation */}
            <div className="max-w-7xl mx-auto mb-8 relative z-50">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-3 text-gray-400 hover:text-blue-400 transition-all cursor-pointer bg-white/5 hover:bg-blue-600/10 px-6 py-3 rounded-2xl border border-white/5 hover:border-blue-500/30 shadow-2xl backdrop-blur-xl"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black tracking-[0.2em] uppercase">Return to Journeys</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 space-y-16">
                {/* Header Section */}
                <div className="text-center md:text-left space-y-8">
                    <div className="inline-flex items-center gap-3 bg-blue-600/20 backdrop-blur-md text-blue-400 px-5 py-2 rounded-full border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase">AI-Curated Excellence</span>
                    </div>
                    <div className="relative">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.85] text-white">
                            Your <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 italic px-2">
                                Travel Plan
                                <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500 to-blue-500/0 blur-sm" />
                            </span>
                        </h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 sm:gap-10 md:gap-16 py-6 sm:py-8">
                        {/* Origin */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">Origin</span>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter capitalize leading-none">{trip.origin || 'karachi'}</span>
                        </div>

                        {/* Route Indicator - Mobile Responsive */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative flex items-center justify-center w-24 sm:w-32 h-8 sm:h-10">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                                </div>
                                <div className="relative z-10 bg-gray-950 px-2 sm:px-3">
                                    <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 animate-plane-move" />
                                </div>
                            </div>
                            <span className="text-[10px] sm:text-[12px] font-bold text-blue-500/60 tracking-[0.2em] mt-1">TOWARDS</span>
                        </div>

                        {/* Destination */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <span className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">Destination</span>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-black text-blue-400 tracking-tighter capitalize leading-none">{trip.destination}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Duration", value: `${itinerary.length} Days`, icon: <CalendarCheck className="w-6 h-6 animate-pulse-subtle" />, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-500/20" },
                        { label: "Budget", value: trip.budgetLevel, icon: <DollarSign className="w-6 h-6 animate-float" />, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-500/20" },
                        { label: "Weather", value: "Optimal", icon: <Cloud className="w-6 h-6 animate-sun" />, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-500/20" },
                        { label: "Experience", value: "Premium", icon: <Sparkles className="w-6 h-6 animate-spin-slow" />, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-500/20" },
                    ].map((stat, i) => (
                        <div key={i} 
                            style={{ animationDelay: `${i * 150}ms` }}
                            className={`relative bg-white/5 backdrop-blur-2xl border ${stat.border} p-4 rounded-2xl group hover:bg-white/10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.1)] hover:-translate-y-1 overflow-hidden animate-slide-up`}
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute -top-10 -right-10 w-20 h-20 ${stat.bg} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                            
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                {React.cloneElement(stat.icon as React.ReactElement, { className: "w-4 h-4" })}
                            </div>
                            <div className="relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1 group-hover:text-gray-400 transition-colors">{stat.label}</p>
                                <p className="text-base md:text-lg font-black text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hotels Section */}
                {trip.hotels && trip.hotels.length > 0 && (
                    <section className="space-y-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4 border-b border-white/5">
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Premium Stays</h2>
                                    <Home className="w-8 h-8 text-blue-500 animate-bounce" />
                                </div>
                                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em]">Handpicked accommodations for your elite journey</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {trip.hotels.map((hotel, idx) => (
                                <HotelCard key={idx} hotel={hotel} destination={trip.destination} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Daily Timeline */}
                <section className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 md:p-12 shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2">Daily Timeline</h2>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.4em]">A curated journey through {trip.destination}</p>
                        </div>
                        <div className="bg-blue-600/20 border border-blue-500/20 px-5 py-2 rounded-full flex items-center gap-3">
                            <Clock className="w-6 h-6 text-blue-400 animate-spin-slow" />
                            <span className="text-[12px] font-black uppercase tracking-widest text-blue-300">{itinerary.length} Days Experience</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {itinerary.map((day, index) => (
                            <div key={index} className="relative group/day">
                                {/* Day Header */}
                                <div
                                    onClick={() => toggleDay(index)}
                                    className={`cursor-pointer p-6 md:p-8 rounded-[2.5rem] transition-all duration-700 border ${expandedDays.includes(index)
                                        ? 'bg-white/10 border-blue-500/40 shadow-2xl shadow-blue-500/10'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${expandedDays.includes(index) ? 'bg-blue-600 text-white shadow-xl rotate-6' : 'bg-white/5 text-gray-500'
                                                }`}>
                                                <span className="text-2xl font-black">0{day.day}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Day {day.day}</h3>
                                                <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] mt-1 uppercase">
                                                    {formatDate(new Date(new Date(trip.startDate).getTime() + index * 86400000).toISOString())}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-700 ${expandedDays.includes(index) ? 'bg-blue-600/20 border-blue-500/40 rotate-180' : 'bg-white/5 border-white/10'
                                            }`}>
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedDays.includes(index) && (
                                        <div className="mt-8 pt-8 border-t border-white/5 space-y-10 animate-fade-in">
                                            {/* Hero Day Image */}
                                            <div className="relative h-[250px] md:h-[320px] rounded-[2.5rem] overflow-hidden group/img shadow-2xl">
                                                <ImageWithFallback
                                                    src={day.dayImage || getDayImage(index)}
                                                    alt={day.dayTitle || `Day ${day.day}`}
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                                                <div className="absolute bottom-8 left-8 right-8">
                                                    <div className="flex items-center gap-2 mb-4 bg-blue-600 px-3 py-1 rounded-full w-fit shadow-lg">
                                                        <Sparkles className="w-3 h-3 text-white" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Daily Highlight</span>
                                                    </div>
                                                    <h4 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">
                                                        {day.dayTitle || `Discovering ${trip.destination}`}
                                                    </h4>
                                                </div>
                                            </div>

                                            {/* Daily Strategy */}
                                            {day.dayDescription && (
                                                <div className="bg-gradient-to-r from-blue-600/10 to-transparent border-l-4 border-blue-500 p-6 rounded-xl flex gap-6 items-start">
                                                    <Zap className="w-8 h-8 text-blue-400 flex-shrink-0 animate-pulse" />
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Strategic Mission</p>
                                                        <p className="text-base md:text-xl font-medium text-gray-300 leading-relaxed italic">"{day.dayDescription}"</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Activity Sections */}
                                            <div className="space-y-12">
                                                <ActivitySection title="Morning Mission" items={day.morning} getImageUrl={getImageUrl} destination={trip.destination} />
                                                <ActivitySection title="Afternoon Discovery" items={day.afternoon} getImageUrl={getImageUrl} destination={trip.destination} />
                                                <ActivitySection title="Evening Vibes" items={day.evening} getImageUrl={getImageUrl} destination={trip.destination} />
                                            </div>

                                            {/* Local Tips */}
                                            {day.localTips && day.localTips.length > 0 && (
                                                <div className="bg-purple-600/5 border border-purple-500/20 p-6 md:p-10 rounded-[2.5rem] relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                                                    <h4 className="text-xl font-black text-white mb-6 flex items-center gap-4 uppercase tracking-tighter">
                                                        <Info className="w-6 h-6 text-purple-400" /> Local Wisdom
                                                    </h4>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {day.localTips.map((tip, i) => (
                                                            <div key={i} className="flex gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group/tip">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover/tip:scale-125 transition-transform" />
                                                                <p className="text-sm font-bold text-gray-400 leading-relaxed italic">{tip}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Final Save Button */}
            {/* Floating Save Button */}
            <div className="fixed bottom-8 right-8 z-[90]">
                <button
                    onClick={handleSave}
                    disabled={saved || isSaving}
                    className={`group/save cursor-pointer relative overflow-hidden px-6 py-4 md:px-2 md:py-2 rounded-[2.5rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] border backdrop-blur-xl ${saved
                        ? 'bg-green-500/20 text-green-400 border-green-500/30 cursor-default shadow-none'
                        : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/30 hover:shadow-blue-500/60 hover:-translate-y-2 active:scale-95 cursor-pointer'
                        }`}
                >
                    {!saved && !isSaving && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/save:animate-[shimmer_2s_infinite] pointer-events-none" />
                    )}
                    <div className={`p-1  rounded-xl ${saved ? 'bg-green-500/20' : 'bg-white/20'}`}>
                        {isSaving ? <Zap className="w-5 h-5 animate-spin" /> : <Bookmark className={`w-5 h-4 ${saved ? 'fill-current' : ''}`} />}
                    </div>
                    <span className="text-[10px] md:text-xs">{isSaving ? 'Processing...' : saved ? 'Saved to Profile' : 'Save to Profile'}</span>
                </button>
            </div>

            {/* Notification */}
            {showNotification && (
                <div className="fixed bottom-28 right-8 bg-green-500 text-white px-8 py-5 rounded-[2rem] shadow-2xl animate-slide-up flex items-center gap-4 z-[100] border border-white/20 backdrop-blur-xl">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                        <p className="font-black text-sm tracking-tight">Mission Accomplished!</p>
                        <p className="text-xs text-green-100 mt-0.5 font-bold uppercase tracking-widest opacity-80">Trip added to your collection.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActivitySection({ title, items, getImageUrl, destination }: { title: string; items: ItineraryItem[]; getImageUrl: (url: string, term: string) => string; destination: string; }) {
    if (!items || items.length === 0) return null;

    const isMorning = title.toLowerCase().includes('morning');
    const isAfternoon = title.toLowerCase().includes('afternoon');
    const theme = isMorning
        ? { icon: <Sun className="w-4 h-4 animate-sun" />, accent: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' }
        : isAfternoon
            ? { icon: <Compass className="w-4 h-4 animate-compass" />, accent: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' }
            : { icon: <Clock className="w-4 h-4 animate-spin-slow" />, accent: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6">
                <div className={`flex items-center gap-3 ${theme.bg} ${theme.border} border px-4 py-1.5 rounded-full`}>
                    <span className={theme.accent}>{theme.icon}</span>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>{title}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div className="grid gap-4">
                {items.map((item, idx) => (
                    <div key={idx} className="group/card bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:bg-white/10 hover:border-blue-500/30 transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {/* Image */}
                        <div className="md:w-48 h-40 md:h-auto relative overflow-hidden flex-shrink-0">
                            <img
                                src={getImageUrl(item.imageUrl, item.placeName)}
                                alt={item.placeName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h5 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{item.placeName}</h5>
                                    {item.ticketPricing && (
                                        <span className="text-[8px] font-black uppercase tracking-widest bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                                            {item.ticketPricing}
                                        </span>
                                    )}
                                </div>
                                {item.address && (
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium mb-3">
                                        <MapPin className="w-3 h-3 text-blue-500" />
                                        <span className="truncate max-w-xs">{item.address}</span>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">{item.details}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                <div className="flex gap-3">
                                    {item.timeToTravel && (
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                            <Clock className="w-3 h-3 text-blue-400" />
                                            <span>{item.timeToTravel}</span>
                                        </div>
                                    )}
                                    {item.bestTimeToVisit && (
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                            <Navigation className="w-3 h-3 text-amber-400" />
                                            <span>{item.bestTimeToVisit}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => window.open(item.locationLink || getMapLink(item.placeName, item.address, destination), '_blank')}
                                    className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg border border-blue-500/20 transition-all text-[9px] font-black uppercase tracking-widest cursor-pointer shadow-lg active:scale-95"
                                >
                                    <MapPin className="w-3 h-3" />
                                    <span>Map</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

