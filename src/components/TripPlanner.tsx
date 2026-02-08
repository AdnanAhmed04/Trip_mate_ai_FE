import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { MyTrips } from "./MyTrips";
import { api } from "../services/api";
import type { Trip } from "../types";

interface TripPlannerProps {
    onStartPlanning: () => void;
}

export function TripPlanner({ onStartPlanning }: TripPlannerProps) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                        <p className="text-gray-600 mt-1">Manage and view your planned adventures</p>
                    </div>
                    <button
                        onClick={onStartPlanning}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Plan New Trip</span>
                    </button>
                </div>

                <MyTrips trips={trips} onViewTrip={(trip) => console.log("View trip", trip)} />
            </div>
        </div>
    );
}
