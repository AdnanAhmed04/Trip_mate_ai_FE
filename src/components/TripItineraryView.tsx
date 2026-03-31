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

                <button
                    onClick={() => window.open(hotel.locationLink || getMapLink(hotel.hotelName, hotel.address, destination), '_blank')}
                    className=" inline-flex items-center border border-gray-200 border-2 gap-2 px-2 py-1 border border-gray-200 bg-[#F0FDF4] text-black cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-green-400 transition-all active:scale-95 group/btn border border-transparent"
                >
                    <MapPin size={14} className="group-hover/btn:scale-110 transition-transform" />
                    <span>Get Location</span>
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
                <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">


                    <div className="space-y-3 mb-8">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
                            Your Detailed <span className="text-[#313de8]"><i>Travel Plan</i></span>
                        </h1>
                        <div className="flex items-center gap-3 text-lg font-semibold text-gray-500 tracking-tight">
                            <span className="text-gray-800 truncate">{trip.origin || 'Trip'}</span>
                            <ArrowLeft className="w-4 h-4 rotate-180 text-blue-400 flex-shrink-0" />
                            <span className="text-[#313de8] truncate">{trip.destination}</span>
                        </div>
                    </div>

                    {/* Summary Info Card */}
                    <div className="  relative overflow-hidden group/summary">
                        <div className="absolute top-0 right-0 w-24 h-24  group-hover/summary:bg-blue-100 transition-colors duration-700" />

                        <div className="relative z-10">
                            <div className="flex flex-wrap gap-4 ">
                                {[
                                    {
                                        label: "Weather Forecast",
                                        value: "Perfect for tourists",
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/12481/12481553.png?uid=R109325010&ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-10 h-10 object-cover"
                                            />
                                        ),
                                        color: "text-blue-500",
                                    },
                                    {
                                        label: "Trip Budget",
                                        value: trip.budgetLevel,
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/16502/16502021.png?uid=R109325010&ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-12 h-12 object-cover"
                                            />
                                        ), color: "text-[#e8bb07]",
                                    },
                                    {
                                        label: "Trip Duration",
                                        value: `${itinerary.length} Days`,
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/5624/5624935.png?uid=R109325010&ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-12 h-12 object-cover"
                                            />
                                        ), color: "text-[#018f2e]",
                                    },
                                    {
                                        label: "Trip to",
                                        value: trip.destination,
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/5187/5187975.png?ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-10 h-12 object-cover"
                                            />
                                        ),
                                        color: "text-amber-500",
                                    },
                                    {
                                        label: "Safety / Comfort",
                                        value: (trip as any).safetyComfortLevel || "High / Comfortable",
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/5775/5775274.png?uid=R109325010&ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-12 h-12 object-cover"
                                            />
                                        ), color: "text-red-500",
                                    },
                                    {
                                        label: "Transport Complexity",
                                        value: (trip as any).transportComplexity || "Easy (Public Transit)",
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/5425/5425108.png?ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-12 h-12 object-cover"
                                            />
                                        ),
                                        color: "text-[#fcbd00]",
                                    },
                                    {
                                        label: "Seasonal Suitability",
                                        value: (trip as any).seasonalSuitability || derivedSeason,
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/10484/10484062.png?ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-12 h-12 object-cover"
                                            />
                                        ), color: "text-yellow-500",
                                    },
                                    {
                                        label: "Seasonal Alignment",
                                        value: (trip as any).seasonalAlignment || "Optimal",
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/3110/3110935.png?ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-12 h-12 object-cover"
                                            />
                                        ), color: "text-[#00fc4c]",
                                    },
                                    {
                                        label: "Generated By",
                                        value: "AI Planned",
                                        icon: (
                                            <img
                                                src="https://cdn-icons-png.freepik.com/512/13298/13298257.png?ga=GA1.1.1904773978.1767900027"
                                                alt="transport"
                                                className="w-12 h-12 object-cover"
                                            />
                                        ),
                                        color: "text-[#09d65b]",
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#f0f2f0] w-[280px] h-40 border-2 border-gray-300 rounded-lg p-5 flex items-center gap-4 transition-all duration-300"
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
                                <div className=''>
                                    <h2 className="text-3xl flex items-center gap-2 font-black text-gray-900 tracking-tight">
                                        Hotels Within Your Budget<span>
                                            <img
                                                src='https://cdn-icons-png.freepik.com/512/12340/12340872.png?ga=GA1.1.1904773978.1767900027'
                                                alt='weather'
                                                className="w-10 h86 object-cover"
                                            />
                                        </span>
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
                                    Daily Travel Plan
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
                                                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">Day {day.day}</h3>
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
                                                <img
                                                    src='https://www.svgrepo.com/show/502423/weather.svg'
                                                    alt='weather'
                                                    className="w-5 h-5 object-cover"
                                                />
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
                    <div className="flex justify-center md:justify-end mt-8">
                        <button 
                            onClick={handleSave}
                            disabled={saved || isSaving}
                            className={`px-8 py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-3 ${
                                saved 
                                    ? 'bg-green-500 text-white cursor-default shadow-lg shadow-green-500/20' 
                                    : 'bg-[#313de8] hover:bg-[#252eb5] text-white shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                            }`}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Saving...
                                </>
                            ) : saved ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Saved to Profile
                                </>
                            ) : (
                                <>
                                    <Bookmark className="w-5 h-5 fill-current" />
                                    Save to My Trips
                                </>
                            )}
                        </button>
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
                        className="group/item bg-[rgba(153,176,160,0.2)] mt-2 mb-2 flex flex-col md:flex-row gap-6 p-5 rounded-[2rem]  border border-[rgba(255,255,255,0.1)] transition-all duration-500"
                    >
                        {/* Image Layer */}
                        <div className="w-full md:w-56 h-56 rounded-[1.5rem] overflow-hidden flex-shrink-0 relative border border-gray-100/50">
                            <ImageWithFallback
                                src={getImageUrl(item.imageUrl, item.placeName)}
                                alt={item.placeName}
                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 left-4 bg-red-500">
                                <WeatherBadge weather={item.weather} />
                            </div>

                        </div>

                        {/* Content Layer */}
                        <div className="flex-1 flex flex-col min-w-0 ">
                            <div className="mb-4">
                                <div className=" flex flex-wrap items-center justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-3">
                                        <h5 className="text-xl font-black text-gray-900  transition-colors tracking-tight leading-none">
                                            {item.placeName}
                                        </h5>

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

                                <button
                                    onClick={() => window.open(item.locationLink || getMapLink(item.placeName, item.address, destination), '_blank')}
                                    className=" inline-flex items-center border border-gray-200 border-2 gap-2 px-2 py-1 border border-gray-200 bg-[#F0FDF4] text-black cursor-pointer rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-green-400 transition-all active:scale-95 group/btn border border-transparent"
                                >
                                    <MapPin size={14} className="group-hover/btn:scale-110 transition-transform" />
                                    <span>Get Location</span>
                                </button>

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
