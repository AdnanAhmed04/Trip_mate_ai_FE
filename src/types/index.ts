export interface User {
    id: string;
    email: string;
    name?: string;
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
    specialOffer?: string;
    status?: string;
    city?: string;
    budgetMin?: number;
    budgetMax?: number;
    // UI specific fields (mapped)
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

export interface Trip {
    id: string; // MongoDB ID or local ID
    destination: string;
    origin?: string;
    startDate?: string;
    endDate?: string;
    budget: number | 'cheap' | 'moderate' | 'luxury';
    travelWith?: 'just-me' | 'couple' | 'friends' | 'family';
    createdAt?: string | Date;
    place?: Place; // Legacy support for UI
}

export interface TripResponse {
    trips: Trip[];
}
