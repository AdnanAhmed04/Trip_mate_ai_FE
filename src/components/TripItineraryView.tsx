import React, { useMemo, useState } from 'react';
import {
    ArrowLeft, MapPin, Calendar, Clock, DollarSign, Star,
    Info, ChevronDown, Sparkles, Cloud, Bookmark,
    Zap, Home, Navigation, Compass
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
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/80 backdrop-blur-sm text-[#313de8] transition-all hover:bg-blue-100/80">
            <Cloud className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{weather}</span>
        </div>
    );
};

/**
 * Modern Emerging Business Card (Nearby Gems)
 */
const EmergingBusinessCard = ({ biz, destination }: { biz: EmergingBusiness; destination?: string }) => (
    <div className="group/biz flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white transition-all duration-300">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
            <ImageWithFallback
                src={biz.imageUrl || ''}
                alt={biz.name}
                className="w-full h-full object-cover group-hover/biz:scale-110 transition-transform"
            />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <h6 className="text-[11px] font-bold text-gray-900 truncate">{biz.name}</h6>
                <a
                    href={biz.locationLink || getMapLink(biz.name, biz.address, destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 px-2 bg-blue-50 text-[#313de8] rounded-md hover:bg-[#313de8] hover:text-white transition-all"
                    title="View on Map"
                >
                    <Navigation size={10} />
                </a>
            </div>
            <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tight mb-1">{biz.type}</p>
            {biz.weather && <div className="flex items-center gap-1 text-[8px] text-blue-600 font-bold"><Cloud size={8} /> {biz.weather}</div>}
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
    <div className="group/hotel bg-white rounded-3xl overflow-hidden border border-gray-100 transition-all duration-500 flex flex-col h-full">
        {/* Image Header */}
        <div className="relative h-48 overflow-hidden">
            <ImageWithFallback
                src={hotel.imageUrl}
                alt={hotel.hotelName}
                className="w-full h-full object-cover group-hover/hotel:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 font-bold text-xs">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{hotel.rating}</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
                <WeatherBadge weather={hotel.weather} />
            </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-bold text-gray-900 group-hover/hotel:text-[#313de8] transition-colors line-clamp-1">
                    {hotel.hotelName}
                </h4>
                <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-2 py-1 rounded-lg">
                    <DollarSign className="w-3 h-3" />
                    <span>{hotel.price}</span>
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <address className="not-italic truncate text-gray-400">{hotel.address}</address>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-4 italic leading-relaxed">
                "{hotel.uniqueFeature || hotel.description}"
            </p>

            {/* Emerging Businesses near hotel */}
            {hotel.nearbyEmergingBusinesses && hotel.nearbyEmergingBusinesses.length > 0 && (
                <div className="mt-auto pt-4 border-t border-gray-50">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-amber-400" />
                        Nearby Gems
                    </h5>
                    <div className="space-y-2 ">
                        {hotel.nearbyEmergingBusinesses.slice(0, 2).map((biz, idx) => (
                            <EmergingBusinessCard key={idx} biz={biz} destination={destination} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-2 flex gap-2">
                <a
                    href={hotel.locationLink || getMapLink(hotel.hotelName, hotel.address, destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-300 flex items-center justify-center gap-2 py-3 text-black rounded-xl text-[14px] font-black uppercase tracking-widest hover:bg-green-400 transition-all border border-transparent"
                >
                    <MapPin size={20} />
                    <span>Get Location</span>
                </a>
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
        <div className="w-full mx-auto pt-28 px-6 md:px-12 animate-fade-in bg-gray-50/10 min-h-screen relative z-50">
            {/* Top Navigation */}
            <div className="flex items-center justify-between  mt-8 relative z-50">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all group cursor-pointer relative z-50">
                    <div className="w-10 h-10  flex items-center justify-center ">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight group-hover:text-gray-900 uppercase">
                        Return to My Adventures
                    </span>
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-start">
                {/* Left Column */}
                <div className="lg:col-span-4 space-y-8 sticky top-32">
                    {/* Featured Destination Image (re-enabled) */}
                    <div className="relative h-52 w-full rounded-3xl overflow-hidden  group/hero animate-fade-in mb-4">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1.5 bg-blue-600/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                                    Featured Adventure
                                </span>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/10">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-[10px] font-semibold text-white">4.9 Rating</span>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-white leading-tight tracking-tight">{trip.destination}</h2>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
                            Your Detailed  <span className="text-[#313de8]"><i>Travel Plan</i></span>
                        </h1>
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-500 tracking-tight">
                            <span className="text-gray-800 truncate">{trip.origin || 'Trip'}</span>
                            <ArrowLeft className="w-4 h-4 rotate-180 text-blue-400 flex-shrink-0" />
                            <span className="text-[#313de8] truncate">{trip.destination}</span>
                        </div>
                    </div>

                    {/* Summary Info Card */}
                    <div className="rounded-3xl p-6 lg:p-8 border border-gray-300 relative overflow-hidden group/summary">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover/summary:bg-blue-100 transition-colors duration-700" />

                        <div className="relative z-10 p-6 rounded-2xl">
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    {
                                        label: "Weather Forecast",
                                        value: "Perfect for tourists",
                                        icon: (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#313de8"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-7 h-7"
                                            >
                                                <path d="M13 16a3 3 0 0 1 0 6H7a5 5 0 1 1 4.9-6z" />
                                                <path d="M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36" />
                                            </svg>
                                        ),
                                        color: "text-blue-500",
                                    },
                                    {
                                        label: "Trip Budget",
                                        value: trip.budgetLevel,
                                        icon: (<svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1a908" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /> </svg>),
                                        color: "text-green-500",
                                    },
                                    {
                                        label: "Trip Duration",
                                        value: `${itinerary.length} Days`,
                                        icon: <Clock className="w-6 h-6" />,
                                        color: "text-red-500",
                                    },
                                    {
                                        label: "Travel Method",
                                        value: trip.generatedBy === "ai" ? "AI Planned" : "Custom",
                                        icon: (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="#3d49f5"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-7 h-7"
                                            >
                                                <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
                                                <circle cx="12" cy="8" r="2" />
                                                <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
                                            </svg>
                                        ),
                                        color: "text-amber-500",
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-white border-2 border-gray-300 rounded-lg p-5 flex items-center gap-4 transition-all duration-300"
                                    >
                                        <div className={item.color}>{item.icon}</div>

                                        <div>
                                            <p className="text-sm font-semibold capitalize tracking-wider text-gray-800">
                                                {item.label}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 capitalize">{item.value}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Extra card (Generated By) */}
                                <div className="bg-white border-2 border-gray-300 rounded-lg p-5 flex items-center gap-4 transition-all duration-300">
                                    <div className="text-gray-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#09d65b"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-7 h-7"
                                        >
                                            <path d="M12 18V5" />
                                            <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
                                            <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
                                            <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
                                            <path d="M18 18a4 4 0 0 0 2-7.464" />
                                            <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
                                            <path d="M6 18a4 4 0 0 1-2-7.464" />
                                            <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold capitalize tracking-wider text-gray-800">
                                            Generated By
                                        </p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {trip.generatedBy === "ai" ? "AI Planned" : "Custom"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Hotels Section */}
                    {trip.hotels && trip.hotels.length > 0 && (
                        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                                        Where You'll <span className="text-[#313de8] italic">Stay</span>
                                    </h2>
                                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Recommended for your budget</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100/50">
                                    <Home className="w-5 h-5 text-[#313de8]" />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {trip.hotels.map((hotel, idx) => (
                                    <HotelCard key={idx} hotel={hotel} destination={trip.destination} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-12 border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50" />

                        <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8 relative z-10">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
                                    Daily <span className="text-[#313de8] italic uppercase">Expedition</span>
                                </h2>
                                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                    A journey curated for {trip.destination}
                                </p>
                            </div>
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                                <Sparkles className="w-4 h-4 text-[#313de8]" />
                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{itinerary.length} Days</span>
                            </div>
                        </div>

                        <div className="pl-4 sm:pl-10 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1.5 before:bg-gradient-to-b before:from-[#313de8]/30 before:via-[#313de8]/10 before:to-transparent before:rounded-full space-y-10">
                            {itinerary.map((day: ItineraryDay, index: number) => (
                                <div key={index} className="relative group/day animate-slide-up" style={{ animationDelay: `${index * 120}ms` }}>
                                    {/* Connector */}
                                    <div className={`absolute -left-[1.6rem] sm:-left-[3.15rem] top-10 w-5 h-5 rounded-full border-4 border-white z-20 transition-all duration-500 ${expandedDays.includes(index) ? 'bg-[#313de8] scale-125' : 'bg-blue-200 group-hover/day:bg-blue-400'}`} />

                                    <div className={`bg-white rounded-[2rem] p-6 sm:p-8 transition-all duration-500 overflow-hidden border ${expandedDays.includes(index) ? 'border-blue-100/50' : 'border-gray-100 group-hover/day:border-blue-50'}`}>
                                        <button onClick={() => toggleDay(index)} className="w-full flex items-center justify-between gap-6 group/header text-left cursor-pointer">
                                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-4 mb-4">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${expandedDays.includes(index) ? 'bg-[#F0FDF4] text-gray-600 hover:rotate-6' : 'bg-gray-50 text-gray-400 group-hover/header:bg-blue-50 group-hover/header:text-[#313de8]'}`}>
                                                            <Calendar className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-1 p-2">
                                                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Day {day.day}</h3>
                                                            </div>
                                                        </div>
                                                    </div>




                                                </div>

                                            </div>


                                            <div
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${expandedDays.includes(index) ? 'rotate-180 bg-[#313de8]/10 text-[#313de8]' : 'bg-gray-50 text-gray-300'
                                                    }`}
                                            >
                                                <ChevronDown className="w-6 h-6" />

                                            </div>
                                        </button>
                                        <div className="text-gray-400 font-black text-[14px] uppercase space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-blue-500/50" />
                                                <span>
                                                    {formatDate(
                                                        new Date(
                                                            new Date(trip.startDate).getTime() + index * 86400000
                                                        ).toISOString()
                                                    )}
                                                </span>
                                            </div>


                                            <div className='flex items-center'>
                                                <img className='w-8 h-6' src="https://www.svgrepo.com/show/502423/weather.svg" alt="weather" />
                                                <p> weather {day.weather}</p>
                                            </div>
                                        </div>

                                        {expandedDays.includes(index) && (
                                            <div className="mt-10 animate-fade-in-down pt-8 border-t border-gray-100/50">
                                                {/* Hero Image per Day */}
                                                <div className="relative w-full h-56 md:h-80 mb-10 rounded-[2rem] overflow-hidden">
                                                    <ImageWithFallback
                                                        src={day.dayImage || getDayImage(index)}
                                                        alt={day.dayTitle || `Day ${day.day}`}
                                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover/day:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                                    <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/20 backdrop-blur-xl rounded-full border border-white/20 mb-4">
                                                            <Sparkles className="w-4 h-4 text-white" />
                                                            <span className="text-[10px] tracking-[0.2em] text-white font-black uppercase">
                                                                Live Your Adventure
                                                            </span>
                                                        </div>
                                                        <h3 className="text-3xl font-black text-white tracking-tighter leading-none">
                                                            {day.dayTitle || `Exploring ${trip.destination}`}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {day.dayDescription && (
                                                    <div className="mb-12 p-8 bg-blue-50/30 backdrop-blur-sm rounded-[2rem] border border-blue-100/50 flex items-start gap-4  hover:bg-blue-50/50 transition-colors duration-500">
                                                        <Zap className="w-6 h-6 text-[#313de8] mt-1 flex-shrink-0 animate-pulse" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-[#313de8] uppercase tracking-[0.2em] mb-2 block">Daily Strategy</span>
                                                            <p className="text-gray-700 font-medium leading-relaxed italic text-lg">{day.dayDescription}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-16 py-4">
                                                    <ActivitySection title="Morning Mission" items={day.morning} getImageUrl={getImageUrl} destination={trip.destination} />
                                                    <ActivitySection title="Afternoon Discovery" items={day.afternoon} getImageUrl={getImageUrl} destination={trip.destination} />
                                                    <ActivitySection title="Evening Vibes" items={day.evening} getImageUrl={getImageUrl} destination={trip.destination} />
                                                </div>

                                                {day.localTips && day.localTips.length > 0 && (
                                                    <div className="mt-12 p-8 lg:p-12 bg-gray-900 rounded-[2.5rem] relative overflow-hidden group/tips">
                                                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(49,61,232,0.1),transparent)] pointer-events-none" />
                                                        <h4 className="flex items-center gap-4  font-black mb-8 text-2xl tracking-tighter uppercase relative z-10">
                                                            <div className="p-3  rounded-2xl">
                                                                <Info className="w-6 h-6 text-gray-800" />
                                                            </div>
                                                            Traveler Tips & Insights
                                                        </h4>
                                                        <div className="grid sm:grid-cols-2 gap-4 relative z-10">
                                                            {day.localTips.map((tip, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="bg-gray-50/50 backdrop-blur-md p-6 rounded-2xl text-blue-800 flex items-start gap-4 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group/tip"
                                                                >
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0 group-hover/tip:scale-150 transition-transform" />
                                                                    <span className="font-bold leading-relaxed">{tip}</span>
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
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden border border-gray-100 mt-12 group/final">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 group-hover/final:opacity-100 transition-opacity duration-700" />
                    </div>
                </div>
            </div>

            {/* Notification Popup */}
            {showNotification && (
                <div className="fixed bottom-6 left-6 bg-orange-500 border border-orange-400 text-white px-6 py-4 rounded-xl  animate-slide-in-out-left flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Trip Saved Successfully!</p>
                        <p className="text-orange-100 text-xs mt-0.5">You can now view this in your My Trips section.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActivitySection({
    title,
    items,
    getImageUrl,
    destination
}: {
    title: string;
    items: ItineraryItem[];
    getImageUrl: (url: string, term: string) => string;
    destination: string;
}) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <span className="text-[16px] font-black text-gray-900 uppercase tracking-tight">{title}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            </div>

            <div className="space-y-6">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="group/item flex flex-col md:flex-row gap-6 p-5 rounded-[2rem]  border border-gray-100 transition-all duration-500"
                    >
                        {/* Image Layer */}
                        <div className="w-full md:w-56 h-56 rounded-[1.5rem] overflow-hidden flex-shrink-0 relative border border-gray-100/50">
                            <ImageWithFallback
                                src={getImageUrl(item.imageUrl, item.placeName)}
                                alt={item.placeName}
                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4">
                                <WeatherBadge weather={item.weather} />
                            </div>
                        </div>

                        {/* Content Layer */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="mb-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-3">
                                        <h5 className="text-xl font-black text-gray-900  transition-colors tracking-tight leading-none">
                                            {item.placeName}
                                        </h5>
                                        <a
                                            href={item.locationLink || getMapLink(item.placeName, item.address, destination)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 flex gap-3 items-center border px-4 bg-[#F0FDF4] text-black rounded-xl hover:bg-green-400 transition-all font-black text-[12px] uppercase tracking-wider"
                                            title="View on Map"
                                        >
                                            <Navigation size={14} />
                                            <span>Location</span>
                                        </a>
                                    </div>
                                    {item.ticketPricing && item.ticketPricing.toLowerCase() !== 'free' && (
                                        <div className="px-3 py-1 bg-green-50 rounded-full border border-green-100 backdrop-blur-sm">
                                            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">
                                                {item.ticketPricing}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {item.address && (
                                    <div className="flex items-center gap-2 mb-3 text-gray-500">
                                        <MapPin size={12} className="flex-shrink-0 text-gray-500" />
                                        <p className="text-[12px] font-bold truncate max-w-xs">{item.address}</p>
                                    </div>
                                )}

                                {item.uniqueThing && (
                                    <div className="inline-flex items-center gap-2 mb-4 p-1.5 pr-3 bg-indigo-50/50 backdrop-blur-sm rounded-xl border border-indigo-100/50 group-hover/item:bg-indigo-50 group-hover/item:border-indigo-200 transition-all duration-300">
                                        <div className="px-2 py-1 bg-indigo-600 text-white text-[8px] font-black rounded-lg uppercase tracking-widest">
                                            Specialty
                                        </div>
                                        <p className="text-[11px] font-bold text-indigo-900 line-clamp-1 italic">{item.uniqueThing}</p>
                                    </div>
                                )}

                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4 line-clamp-2">
                                    {item.details}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-5">
                                <div className="flex flex-wrap gap-3">
                                    <div className={`flex items-center gap-3 bg-[#F0FDF4] rounded-xl px-3 py-2 transition-all group-hover/item:bg-white text-gray-600 ${item.timeToTravel?.includes('18-24 hours') ? 'bg-green-300 rounded-xl' : 'bg-gray-50/80'}`}>
                                        <Clock size={12} className="text-gray-500" />
                                        <span className="text-[10px] font-black tracking-tight">{item.timeToTravel}</span>
                                    </div>
                                    <div className={`flex items-center gap-3 bg-[#F0FDF4] px-3 py-2 rounded-xl border border-gray-100 transition-all group-hover/item:bg-white ${item.bestTimeToVisit?.includes('Early morning departure') ? 'bg-green-300' : 'bg-gray-50/80'}`}>
                                        <Compass size={12} className="text-amber-500" />
                                        <span className="text-[10px] font-black text-gray-600 tracking-tight">{item.bestTimeToVisit}</span>
                                    </div>
                                </div>

                                <a
                                    href={item.locationLink || getMapLink(item.placeName, item.address, destination)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className=" inline-flex items-center gap-2 px-2 py-1 border border-gray-200 bg-[#F0FDF4] text-black cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-green-400 transition-all active:scale-95 group/btn border border-transparent"
                                >
                                    <MapPin size={14} className="group-hover/btn:scale-110 transition-transform" />
                                    <span>Get Location</span>
                                </a>
                            </div>

                            {/* Local Gems Display */}
                            {item.relatedEmergingBusinesses && item.relatedEmergingBusinesses.length > 0 && (
                                <div className="mt-6 pt-5 border-t border-dash border-gray-100">
                                    <div className="flex items-center gap-2 mb-4 px-1">
                                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Hidden Gems Nearby</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {item.relatedEmergingBusinesses.slice(0, 2).map((biz, bIdx) => (
                                            <EmergingBusinessCard key={bIdx} biz={biz} destination={destination} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
