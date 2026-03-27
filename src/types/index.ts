export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    subscriptionStatus?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Vendor {
    _id: string; // MongoDB ID
    companyName: string;
    vendorType: string;
    email: string;
    aboutUs: string;
    logoUrl?: string; // or image
    services?: string[];
    customServices?: string[];
    serviceLocations?: string[];
    specialOffer?: string;
    status?: string;
    paid?: boolean;
    blocked?: boolean;
    city?: string;
    budgetMin?: number;
    budgetMax?: number;
    id?: string;
    name?: string;
    image?: string;
    rating?: number;
    category?: string;
    description?: string;
    location?: string;
    branches?: { location?: string; phone?: string; name?: string }[];
}

export interface VendorResponse {
    total: number;
    vendors: Vendor[];
}

export interface Place {
    id: string;
    name: string;
    description: string;
    price: number;
    location: string;
    coordinates: { lat: number; lng: number };
    image: string;
    rating: number;
    category: string;
    bestTimeToVisit: string;
    duration: string;
}

export interface EmergingBusiness {
    name: string;
    type: string;
    description: string;
    address: string;
    weather?: string;
    locationLink?: string;
    imageUrl?: string;
}

export interface Hotel {
    hotelName: string;
    address: string;
    locationLink?: string;
    price: string;
    imageUrl: string;
    geoCoordinates: { lat: number; lng: number };
    rating: number;
    description: string;
    uniqueFeature?: string;
    weather?: string;
    nearbyEmergingBusinesses?: EmergingBusiness[];
}

export interface ItineraryItem {
    placeName: string;
    details: string;
    imageUrl: string;
    geoCoordinates: { lat: number; lng: number };
    ticketPricing: string;
    timeToTravel: string;
    bestTimeToVisit: string;
    address?: string;
    locationLink?: string;
    weather?: string;
    uniqueThing?: string;
    relatedEmergingBusinesses?: EmergingBusiness[];
}

export interface ItineraryDay {
    day: number;
    dayTitle?: string;
    dayDescription: string;
    weather?: string;
    uniqueHighlights?: string[];
    morning: ItineraryItem[];
    afternoon: ItineraryItem[];
    evening: ItineraryItem[];
    localTips: string[];
    estimatedCost: number;
    dayImage?: string;
}

export interface Trip {
    _id: string; // MongoDB ID
    id?: string; // local ID fallback
    userId: string;
    title: string;
    destination: string;
    origin: string;
    startDate: string;
    endDate: string;
    budgetLevel: 'cheap' | 'mid' | 'luxury';
    travelers: number;
    interests: string[];
    hotels: Hotel[];
    itinerary: ItineraryDay[];
    generatedBy: 'ai' | 'manual';
    createdAt: string;
    updatedAt: string;
    budget?: number | 'cheap' | 'moderate' | 'luxury';
    travelWith?: 'just-me' | 'couple' | 'friends' | 'family';
    days?: number;
    place?: Place;
}

export interface TripResponse {
    trips: Trip[];
}
