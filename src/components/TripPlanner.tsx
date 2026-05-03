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

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isFreeUser = user?.subscriptionStatus === 'free';

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-950 gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 font-medium animate-pulse">Loading your adventures...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-950 px-6 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] max-w-md w-full backdrop-blur-md">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ArrowLeft className="w-8 h-8 text-red-400 rotate-90" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-400 mb-8">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Filter logic: Free users only see manual (saved) trips. Paid users can toggle.
    const filteredTrips = isFreeUser 
        ? trips.filter(t => t.generatedBy !== 'ai')
        : (showOnlySaved ? trips.filter(t => t.generatedBy !== 'ai') : trips);

    return (
        <div className="min-h-screen bg-gray-950 pt-12 pb-20 px-6 relative overflow-hidden">
            {/* Abstract Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="w-full lg:max-w-7xl mx-auto relative z-10 px-0 sm:px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 px-6 sm:px-0">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all border border-white/10 group"
                                    aria-label="Go Back"
                                >
                                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            )}
                            <div className="inline-block bg-blue-600/20 backdrop-blur-md text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20">
                                <span className="text-xs font-black tracking-[0.2em] uppercase">My Collection</span>
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">Planned Journeys</h1>
                        <p className="text-gray-400 text-lg">Manage and relive your past and future adventures.</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {!isFreeUser && (
                            <button
                                onClick={() => setShowOnlySaved(!showOnlySaved)}
                                className={`flex-1 md:flex-none px-6 py-4 rounded-2xl font-bold transition-all border cursor-pointer backdrop-blur-md ${showOnlySaved
                                    ? "bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                    : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                {showOnlySaved ? "Show All" : "Saved Only"}
                            </button>
                        )}
                        <button
                            onClick={onStartPlanning}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Plan New</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-10 md:p-12 shadow-2xl">
                    <MyTrips
                        trips={filteredTrips}
                        onViewTrip={onViewTrip}
                    />
                </div>
            </div>
        </div>
    );
}
