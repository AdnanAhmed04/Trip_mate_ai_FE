import React, { useMemo, useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Calendar, Clock, DollarSign, Star,
    Info, ChevronDown, Sparkles, Cloud, Bookmark,
    Zap, Home, Navigation, Compass, Shield, Bus, Sun, CalendarCheck
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Trip, Hotel, ItineraryDay, ItineraryItem, EmergingBusiness, RegisteredHotel } from '../types';
import { api, BASE_URL } from '../services/api';

// A real, admin-approved hotel that can be booked (paid users) or triggers upgrade (free users)
const BookableHotelCard = ({ hotel, tripId, onViewDetails, isAlreadyBooked = false }: { hotel: RegisteredHotel; tripId?: string; onViewDetails?: (hotel: RegisteredHotel) => void; isAlreadyBooked?: boolean }) => {
    let isPaid = false;
    try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        isPaid = (u?.subscriptionStatus || u?.user?.subscriptionStatus) === 'paid';
    } catch { isPaid = false; }

    // If already booked (from server), start in done state
    const [status, setStatus]       = useState<'idle' | 'form' | 'booking' | 'done' | 'error'>(isAlreadyBooked ? 'done' : 'idle');
    const [checkIn, setCheckIn]     = useState('');
    const [checkOut, setCheckOut]   = useState('');
    const [guests, setGuests]       = useState(1);
    const [msg, setMsg]             = useState(isAlreadyBooked ? 'Booking request already submitted for this hotel.' : '');

    const imgUrl = (() => {
        const url = hotel.logoUrl || (hotel.images && hotel.images[0]) || '';
        if (!url) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=60';
        return url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    })();

    const handleBook = async () => {
        setStatus('booking');
        setMsg('');
        try {
            const res = await api.bookings.create({ hotelId: hotel.hotelId || hotel._id, tripId, checkIn, checkOut, guests });
            setStatus('done');
            setMsg(res.message || 'Booking request submitted! The hotel will confirm shortly.');
        } catch (e: any) {
            setStatus('error');
            setMsg(e.message || 'Booking failed. Please try again.');
        }
    };

    const handleUpgrade = async () => {
        try {
            const { url } = await api.payments.createTripCheckoutSession();
            if (url) window.location.href = url;
        } catch (e: any) {
            alert(e.message || 'Could not start upgrade.');
        }
    };

    const inp = "w-full bg-gray-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm";

    return (
        <div className="rounded-2xl overflow-hidden bg-gray-900 border border-emerald-500/20 flex flex-col h-full">
            {/* Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <ImageWithFallback src={imgUrl} alt={hotel.hotelName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Verified
                </span>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h4 className="text-base font-bold text-white leading-tight mb-1 line-clamp-1">{hotel.hotelName}</h4>
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
                    <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{hotel.city}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-2 flex-1">{hotel.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-xl font-bold text-green-400">${hotel.pricePerNight}</span>
                    <span className="text-xs text-gray-500">/night</span>
                </div>

                {/* Success / Error message */}
                {(status === 'done' || status === 'error') && msg && (
                    <div className={`mb-3 p-3 rounded-xl text-xs leading-relaxed ${status === 'done' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                        {msg}
                    </div>
                )}

                {/* Booking form — shown after "Book Now" click */}
                {status === 'form' && (
                    <div className="mb-4 space-y-2.5 bg-gray-800/60 border border-white/8 rounded-xl p-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Check-in</label>
                                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className={inp} />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Check-out</label>
                                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className={inp} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 block">Guests</label>
                            <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(Number(e.target.value))} className={inp} />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button onClick={() => setStatus('idle')} className="flex-1 border border-white/10 text-gray-400 hover:text-white text-xs font-semibold rounded-xl py-2 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleBook}
                                disabled={!checkIn || !checkOut}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/30 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl py-2 flex items-center justify-center gap-1.5 transition-colors"
                            >
                                <CalendarCheck className="w-3.5 h-3.5" />
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {/* Booking in progress */}
                {status === 'booking' && (
                    <div className="mb-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs text-center">
                        Submitting booking request…
                    </div>
                )}

                <div className="mt-auto">
                    {isPaid ? (
                        status === 'done' ? (
                            <div className="w-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm rounded-xl py-2.5 flex items-center justify-center gap-2">
                                <CalendarCheck className="w-4 h-4" /> Requested ✓
                            </div>
                        ) : status !== 'form' && status !== 'booking' ? (
                            <button
                                onClick={() => setStatus('form')}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors"
                            >
                                <CalendarCheck className="w-4 h-4" />
                                Book Now
                            </button>
                        ) : null
                    ) : (
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-amber-500/20 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-white font-semibold text-sm rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors"
                        >
                            🔒 Upgrade to Book
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const getMapLink = (name: string, address?: string, destination?: string) => {
    const query = [name, address, destination].filter(Boolean).join(' ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const WeatherBadge = ({ weather }: { weather?: string }) => {
    if (!weather) return null;
    return (
        <div className="inline-flex items-center gap-1.5 bg-blue-950/80 border border-blue-500/30 rounded-lg px-2.5 py-1 backdrop-blur-sm">
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] font-semibold text-sky-300 uppercase tracking-wide">{weather}</span>
        </div>
    );
};

const EmergingBusinessCard = ({ biz, destination }: { biz: EmergingBusiness; destination?: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
            <ImageWithFallback
                src={biz.imageUrl || ''}
                alt={biz.name}
                className="w-full h-full object-cover"
            />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <h6 className="text-xs font-semibold text-white truncate">{biz.name}</h6>
                <a
                    href={biz.locationLink || getMapLink(biz.name, biz.address, destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors flex-shrink-0"
                    title="View on Map"
                >
                    <Navigation size={11} />
                </a>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500">{biz.type}</span>
                {biz.weather && (
                    <span className="flex items-center gap-1 text-[10px] text-blue-400">
                        <Cloud size={9} />{biz.weather}
                    </span>
                )}
            </div>
        </div>
    </div>
);

interface TripItineraryViewProps {
    trip: Trip;
    onBack: () => void;
    onHotelClick?: (hotel: RegisteredHotel) => void;
}

const HotelCard = ({ hotel, destination }: { hotel: Hotel; destination: string }) => (
    <div className="rounded-2xl overflow-hidden bg-gray-900 border border-white/10 flex flex-col h-full hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <ImageWithFallback
                src={hotel.imageUrl}
                alt={hotel.hotelName}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
                <WeatherBadge weather={hotel.weather} />
            </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1 mr-3">
                    <h4 className="text-base font-bold text-white leading-tight line-clamp-1">{hotel.hotelName}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <address className="not-italic truncate">{hotel.address}</address>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-green-400">{hotel.price}</div>
                    <div className="text-[10px] text-gray-500">per night</div>
                </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2 flex-1">
                {hotel.uniqueFeature || hotel.description}
            </p>
            {hotel.nearbyEmergingBusinesses && hotel.nearbyEmergingBusinesses.length > 0 && (
                <div className="border-t border-white/5 pt-4 mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-amber-400" /> Nearby Gems
                    </p>
                    <div className="space-y-2">
                        {hotel.nearbyEmergingBusinesses.slice(0, 2).map((biz, idx) => (
                            <EmergingBusinessCard key={idx} biz={biz} destination={destination} />
                        ))}
                    </div>
                </div>
            )}
            <button
                onClick={() => window.open(hotel.locationLink || getMapLink(hotel.hotelName, hotel.address, destination), '_blank')}
                className="mt-auto w-full border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 text-xs font-semibold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-colors"
            >
                <MapPin className="w-3.5 h-3.5" /> View on Map
            </button>
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

export function TripItineraryView({ trip, onBack, onHotelClick }: TripItineraryViewProps) {
    const [expandedDays, setExpandedDays] = useState<number[]>([0]);

    let isPaid = false;
    try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        isPaid = (u?.subscriptionStatus || u?.user?.subscriptionStatus) === 'paid';
    } catch { isPaid = false; }

    // Fetch user's existing bookings to show "already booked" state on revisit
    const [bookedHotelIds, setBookedHotelIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isPaid) return;
        api.bookings.getMy()
            .then(res => {
                const ids = new Set<string>();
                (res.bookings || []).forEach((b: any) => {
                    // hotel can be populated object or raw ObjectId string
                    const id =
                        (typeof b.hotel === 'object' && b.hotel !== null)
                            ? (b.hotel._id || b.hotel.id || '')
                            : (b.hotel || '');
                    if (id) ids.add(String(id));
                });
                setBookedHotelIds(ids);
            })
            .catch(() => {});
    }, [isPaid]);

    const toggleDay = (index: number) => {
        setExpandedDays((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getFallbackImage = (term: string) => {
        let hash = 0;
        for (let i = 0; i < term.length; i++) hash = (hash * 31 + term.charCodeAt(i)) >>> 0;
        return DAY_IMAGES[hash % DAY_IMAGES.length];
    };

    const getImageUrl = (url: string, searchTerm: string) => {
        if (!url) return getFallbackImage(searchTerm || 'travel');
        return url;
    };


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
        return "Summer";
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
            setTimeout(() => setShowNotification(false), 4000);
        } catch (error) {
            console.error('Failed to save trip:', error);
            alert('Failed to save trip. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-8 pb-24 px-4 sm:px-6 md:px-10 relative"
            style={{ overflowX: 'hidden' }}>
            {/* Subtle background glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/8 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Back button */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span>Back to trips</span>
                    </button>
                </div>

                {/* ── Trip Header Card ─────────────────────────────── */}
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Left — badge + title */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <span className="text-xs text-blue-400 font-medium">AI-Generated Itinerary</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                {trip.origin && (
                                    <><span className="text-gray-300">{trip.origin}</span><span className="mx-2 text-gray-600">→</span></>
                                )}
                                <span className="text-blue-400">{trip.destination}</span>
                            </h1>
                        </div>

                        {/* Right — dates + travelers */}
                        <div className="flex flex-col items-end gap-2">
                            {trip.startDate && (
                                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300 whitespace-nowrap">
                                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{formatDate(trip.startDate)}</span>
                                    {trip.endDate && <><span className="text-gray-600 mx-1">–</span><span>{formatDate(trip.endDate)}</span></>}
                                </div>
                            )}
                            {trip.travelers && (
                                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-300 whitespace-nowrap">
                                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                                    <span>{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Stats Pills ──────────────────────────────────── */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {[
                        { icon: <CalendarCheck className="w-4 h-4" />, label: 'Duration', value: `${itinerary.length} days`, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                        { icon: <DollarSign className="w-4 h-4" />, label: 'Budget', value: trip.budgetLevel, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                        { icon: <Bus className="w-4 h-4" />, label: 'Travelers', value: trip.travelers ? `${trip.travelers} pax` : '—', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                        { icon: <Sun className="w-4 h-4" />, label: 'Season', value: derivedSeason, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                    ].map((stat, i) => (
                        <div key={i} className={`flex items-center gap-2 border rounded-full px-4 py-2 ${stat.bg}`}>
                            <span className={stat.color}>{stat.icon}</span>
                            <span className="text-xs text-gray-400">{stat.label}:</span>
                            <span className={`text-xs font-semibold ${stat.color}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* ── AI-Generated Hotels (free users only) ────────── */}
                {!isPaid && trip.hotels && trip.hotels.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-1">
                            <Home className="w-5 h-5 text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Suggested Stays</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">Handpicked accommodations for your journey</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {trip.hotels.map((hotel, idx) => (
                                <HotelCard key={idx} hotel={hotel} destination={trip.destination} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Bookable Hotels (registered, admin-verified) ─── */}
                {trip.registeredHotels && trip.registeredHotels.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-1">
                            <Home className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-xl font-bold text-white">Verified Hotels</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {trip.registeredHotels.map((hotel, idx) => {
                                // hotel._id comes from the trip snapshot, hotelId is the real Hotel ref
                                const hid = hotel._id?.toString() || hotel.hotelId?.toString() || '';
                                const hid2 = hotel.hotelId?.toString() || hotel._id?.toString() || '';
                                const alreadyBooked = bookedHotelIds.has(hid) || bookedHotelIds.has(hid2);
                                return (
                                    <BookableHotelCard
                                        key={idx}
                                        hotel={hotel}
                                        tripId={trip._id}
                                        onViewDetails={onHotelClick}
                                        isAlreadyBooked={alreadyBooked}
                                    />
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Daily Timeline ───────────────────────────────── */}
                <section className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-5 h-5 text-blue-400" />
                                <h2 className="text-xl font-bold text-white">Day-by-Day Itinerary</h2>
                            </div>
                            <p className="text-sm text-gray-500">Your curated journey through {trip.destination}</p>
                        </div>
                        <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {itinerary.length} days
                        </span>
                    </div>

                    <div className="space-y-3">
                        {itinerary.map((day, index) => {
                            const isOpen = expandedDays.includes(index);
                            const dayDate = formatDate(new Date(new Date(trip.startDate).getTime() + index * 86400000).toISOString());
                            return (
                                <div key={index} className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${isOpen ? 'bg-gray-900 border-blue-500/30' : 'bg-gray-900/60 border-white/8 hover:border-white/15'}`}>
                                    {/* Accordion Header */}
                                    <button
                                        onClick={() => toggleDay(index)}
                                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-white/8 text-gray-400'}`}>
                                                {day.day}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`font-semibold text-sm leading-tight transition-colors ${isOpen ? 'text-blue-400' : 'text-white'}`}>
                                                    {day.dayTitle || `Day ${day.day} — ${trip.destination}`}
                                                </div>
                                                <div className={`text-xs mt-0.5 font-medium transition-colors ${isOpen ? 'text-blue-300/70' : 'text-gray-500'}`}>
                                                    {dayDate}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-all duration-200 ${isOpen ? 'text-blue-400 rotate-180' : 'text-gray-500'}`} />
                                    </button>

                                    {/* Accordion Body */}
                                    {isOpen && (
                                        <div className="px-5 pb-6 space-y-6 border-t border-white/8 pt-5">
                                            {/* Day description */}
                                            {day.dayDescription && (
                                                <div className="flex gap-3 bg-blue-500/8 border-l-2 border-blue-500 rounded-r-xl pl-4 pr-4 py-3">
                                                    <p className="text-sm text-gray-300 leading-relaxed">{day.dayDescription}</p>
                                                </div>
                                            )}

                                            {/* Time-of-day sections */}
                                            <div className="space-y-8">
                                                <ActivitySection title="Morning" items={day.morning} getImageUrl={getImageUrl} destination={trip.destination} />
                                                <ActivitySection title="Afternoon" items={day.afternoon} getImageUrl={getImageUrl} destination={trip.destination} />
                                                <ActivitySection title="Evening" items={day.evening} getImageUrl={getImageUrl} destination={trip.destination} />
                                            </div>

                                            {/* Local Tips */}
                                            {day.localTips && day.localTips.length > 0 && (
                                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
                                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-purple-300 mb-4">
                                                        <Info className="w-4 h-4" /> Local Tips
                                                    </h4>
                                                    <div className="grid sm:grid-cols-2 gap-3">
                                                        {day.localTips.map((tip, i) => (
                                                            <div key={i} className="flex gap-2.5 bg-white/5 border border-white/8 rounded-xl p-3">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                                                <p className="text-xs text-gray-400 leading-relaxed">{tip}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* ── Floating Save Button ─────────────────────────── */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleSave}
                    disabled={saved || isSaving}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm shadow-2xl border transition-all duration-200 ${
                        saved
                            ? 'bg-green-500/20 border-green-500/30 text-green-400 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 border-blue-400/30 text-white hover:-translate-y-0.5 active:scale-95 cursor-pointer'
                    }`}
                >
                    {isSaving
                        ? <Zap className="w-4 h-4 animate-spin" />
                        : <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    }
                    <span>{isSaving ? 'Saving…' : saved ? 'Saved' : 'Save Trip'}</span>
                </button>
            </div>

            {/* ── Save Notification ──────────────────────────────── */}
            {showNotification && (
                <div className="fixed bottom-20 right-6 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-50 border border-white/20">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Trip saved!</p>
                        <p className="text-xs text-green-100 mt-0.5 opacity-80">Added to your profile.</p>
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
    destination,
}: {
    title: string;
    items: ItineraryItem[];
    getImageUrl: (url: string, term: string) => string;
    destination: string;
}) {
    if (!items || items.length === 0) return null;

    const isMorning = title.toLowerCase().includes('morning');
    const isAfternoon = title.toLowerCase().includes('afternoon');

    const theme = isMorning
        ? { icon: <Sun className="w-3.5 h-3.5" />, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
        : isAfternoon
        ? { icon: <Compass className="w-3.5 h-3.5" />, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
        : { icon: <Clock className="w-3.5 h-3.5" />, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' };

    return (
        <div className="space-y-3">
            {/* Section label */}
            <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 ${theme.bg} ${theme.border} border rounded-full px-3 py-1`}>
                    <span className={theme.color}>{theme.icon}</span>
                    <span className={`text-xs font-semibold ${theme.color}`}>{title}</span>
                </div>
                <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Place cards */}
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col sm:flex-row bg-gray-900 border border-white/8 rounded-xl overflow-hidden hover:border-blue-500/20 transition-colors"
                    >
                        {/* Image */}
                        <div className="w-full sm:w-48 sm:min-w-[192px] sm:flex-shrink-0 h-44 sm:h-auto relative overflow-hidden">
                            <img
                                src={getImageUrl(item.imageUrl, item.placeName)}
                                alt={item.placeName}
                                className="w-full h-full object-cover"
                                onError={e => {
                                    (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600';
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-1.5">
                                    <h5 className="font-semibold text-white text-base leading-tight">{item.placeName}</h5>
                                    {item.ticketPricing && (
                                        <span className="text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0">
                                            {item.ticketPricing}
                                        </span>
                                    )}
                                </div>
                                {item.address && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                                        <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                        <span className="truncate">{item.address}</span>
                                    </div>
                                )}
                                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{item.details}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/8">
                                <div className="flex flex-wrap gap-3">
                                    {item.timeToTravel && (
                                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <Clock className="w-3 h-3 text-blue-400" /> {item.timeToTravel}
                                        </span>
                                    )}
                                    {item.bestTimeToVisit && (
                                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                            <Navigation className="w-3 h-3 text-amber-400" /> {item.bestTimeToVisit}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => window.open(item.locationLink || getMapLink(item.placeName, item.address, destination), '_blank')}
                                    className="flex items-center gap-1.5 border border-blue-500/25 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-500 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer active:scale-95"
                                >
                                    <MapPin className="w-3 h-3" /> Map
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
