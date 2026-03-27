import React, { useState, useEffect } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { MyTrips } from "./MyTrips";
import { api } from "../services/api";
import type { Trip } from "../types";


interface TripPlannerProps {
    onStartPlanning: () => void;
    onViewTrip: (trip: Trip) => void;
    onBack?: () => void;
}

export function TripPlanner({ onStartPlanning, onViewTrip, onBack }: TripPlannerProps) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showOnlySaved, setShowOnlySaved] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                // Ensure user is signed in or handle error gracefully
                // api.trips.getAll() handles headers automatically
                const data = await api.trips.getAll();
                console.log('Trips API response:', data);

                if (alive) {
                    if (Array.isArray(data)) {
                        setTrips(data);
                    } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
                        setTrips((data as any).data);
                    } else if (data && typeof data === 'object' && 'trips' in data && Array.isArray((data as any).trips)) {
                        setTrips((data as any).trips);
                    } else {
                        console.error('Unexpected trips response format:', data);
                        setTrips([]);
                    }
                }
            } catch (e: any) {
                if (alive) setError(e?.message || "Failed to load trips");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-500">
                <p>Error: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-blue-500 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="relative z-50 flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5 cursor-pointer" />
                        <span className="cursor-pointer">Back to Home</span>
                    </button>
                )}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                        <p className="text-gray-600 mt-1">Manage and view your planned adventures</p>
                    </div>
                    <div className="flex items-center gap-4 relative z-50">
                        <button
                            onClick={() => setShowOnlySaved(!showOnlySaved)}
                            className={`px-4 py-2 rounded-lg font-medium  cursor-pointer ${showOnlySaved
                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                : "bg-white text-gray-700 border border-gray-50 hover:bg-gray-100"
                                }`}
                        >
                            {showOnlySaved ? "Show All Trips" : "Saved Trips"}
                        </button>
                        <button
                            onClick={onStartPlanning}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700  cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Plan New Trip</span>
                        </button>
                    </div>
                </div>

                <MyTrips
                    trips={showOnlySaved ? trips.filter(t => t.generatedBy !== 'ai') : trips}
                    onViewTrip={onViewTrip}
                />
            </div>
        </div>
    );
}
