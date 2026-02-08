import React, { useState } from "react";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import { BudgetCard } from "./BudgetCard";
import { TravelCompanionCard } from "./TravelCompanionCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { Trip } from "../types";

interface PreferencesFormProps {
  onGenerateTrip: (tripData: Omit<Trip, "id" | "createdAt" | "place">) => void;
}

const destinations = [
  "Paris, France",
  "Tokyo, Japan",
  "New York, USA",
  "Bali, Indonesia",
  "karachi",
  "Pakistan",
  "Dubai, UAE",
  "London, United Kingdom",
  "Rome, Italy",
  "Sydney, Australia",
  "Barcelona, Spain",
  "Bangkok, Thailand",
  "Maldives",
  "Santorini, Greece",
  "Iceland",
  "Swiss Alps, Switzerland",
  "Machu Picchu, Peru",
];

import { api } from "../services/api";

type Budget = "cheap" | "moderate" | "luxury";
type TravelWith = "just-me" | "couple" | "friends" | "family";

export function PreferencesForm({ onGenerateTrip }: PreferencesFormProps) {
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState<Budget | null>(null);
  const [travelWith, setTravelWith] = useState<TravelWith | null>(null);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const filteredDestinations = destinations.filter((d) =>
    d.toLowerCase().includes(destination.toLowerCase())
  );

  const isFormComplete = destination && origin && startDate && endDate && budget && travelWith;
  const progress = [destination, origin, startDate, endDate, budget, travelWith].filter(Boolean).length;
  const progressPercent = (progress / 6) * 100;

  // ✅ CALL BACKEND API
  const createTrip = async (payload: any) => {
    return await api.trips.create(payload);
  };

  const handleGenerateTrip = async () => {
    setApiError("");

    if (!destination || !origin || !startDate || !endDate || !budget || !travelWith) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (numDays <= 0) {
      setApiError("End date must be later than start date");
      return;
    }

    // Map budget enum to backend expected values
    const budgetMap: Record<string, string> = {
      cheap: "cheap",
      moderate: "mid",
      luxury: "luxury",
    };

    const travelersMap: Record<string, number> = {
      "just-me": 1,
      couple: 2,
      friends: 4,
      family: 4,
    };

    // Construct the correct payload based on user provided schema
    const apiPayload = {
      title: `Trip to ${destination}`, // Required
      destination: destination, // Required
      startDate: start.toISOString(), // Required
      endDate: end.toISOString(), // Required

      travelers: travelersMap[travelWith!] || 1, // Optional
      budgetLevel: budgetMap[budget!] || "cheap", // Optional
      interests: [], // Optional, default empty array as not collected in form yet

      // Keep original fields for UI state management in parent component if needed
      origin: origin,
      days: numDays,
      travelWith: travelWith,
      budget: budget
    };

    console.log("Sending payload:", apiPayload);

    try {
      setLoading(true);

      // ✅ send to backend
      // We ignore the response here as we just proceed to the next step, 
      // but ideally we should use the created ID.
      await createTrip(apiPayload);

      // ✅ keep your existing UI flow
      onGenerateTrip(apiPayload as any);
    } catch (err: any) {
      console.error("Trip creation error:", err);
      // Show full error message from backend if possible to help debugging
      setApiError(err?.message || JSON.stringify(err) || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1595234336271-178875797b4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBwbGFubmluZyUyMHdvcmtzcGFjZSUyMGRlc2t8ZW58MXx8fHwxNzY0Nzc4NzczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Travel planning background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/85 via-black/80 to-gray-900/85" />
      </div>

      <div className="max-w-5xl mx-auto animate-fade-in relative">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI-Powered Trip Planning</span>
          </div>

          <h1 className="text-5xl mb-4 text-white">Plan Your Perfect Journey</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Share your travel preferences and let our AI create a personalized itinerary tailored just for you
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-8">
            <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
              <span>Complete your preferences</span>
              <span className="text-purple-400">{progress}/6</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200">
          <div className="space-y-8">
            {/* Origin and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin */}
              <div className="group">
                <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span>Starting Location</span>
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g., London, New York"
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-lg"
                />
              </div>

              {/* Destination */}
              <div className="group">
                <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span>Where to?</span>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      setShowDestinations(true);
                    }}
                    onFocus={() => setShowDestinations(true)}
                    placeholder="Search destinations... (e.g., Paris, Tokyo, Bali)"
                    className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 pr-12 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-lg"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  {showDestinations && destination && filteredDestinations.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-10 max-h-64 overflow-y-auto">
                      {filteredDestinations.map((dest, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setDestination(dest);
                            setShowDestinations(false);
                          }}
                          className="w-full text-left px-5 py-3 hover:bg-purple-50 transition-colors flex items-center gap-3 first:rounded-t-2xl last:rounded-b-2xl"
                          type="button"
                        >
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span>{dest}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-lg"
                />
              </div>

              <div className="group">
                <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>End Date</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-lg"
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 mb-4 text-lg text-gray-900">
                <span className="text-2xl">💰</span>
                <span>What's your budget preference?</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BudgetCard
                  type="cheap"
                  title="Budget"
                  description="Stay conscious of costs"
                  icon="💵"
                  selected={budget === "cheap"}
                  onClick={() => setBudget("cheap")}
                />
                <BudgetCard
                  type="moderate"
                  title="Moderate"
                  description="Balance comfort & cost"
                  icon="💰"
                  selected={budget === "moderate"}
                  onClick={() => setBudget("moderate")}
                />
                <BudgetCard
                  type="luxury"
                  title="Luxury"
                  description="Premium experience"
                  icon="💎"
                  selected={budget === "luxury"}
                  onClick={() => setBudget("luxury")}
                />
              </div>
            </div>

            {/* Travel Companions */}
            <div>
              <label className="flex items-center gap-2 mb-4 text-lg text-gray-900">
                <span className="text-2xl">👥</span>
                <span>Who's joining you on this adventure?</span>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TravelCompanionCard
                  type="just-me"
                  title="Solo"
                  description="Traveling alone"
                  icon="✈️"
                  selected={travelWith === "just-me"}
                  onClick={() => setTravelWith("just-me")}
                />
                <TravelCompanionCard
                  type="couple"
                  title="Couple"
                  description="Romantic getaway"
                  icon="🥂"
                  selected={travelWith === "couple"}
                  onClick={() => setTravelWith("couple")}
                />
                <TravelCompanionCard
                  type="family"
                  title="Family"
                  description="Fun for everyone"
                  icon="🏡"
                  selected={travelWith === "family"}
                  onClick={() => setTravelWith("family")}
                />
                <TravelCompanionCard
                  type="friends"
                  title="Friends"
                  description="Group adventure"
                  icon="⛵"
                  selected={travelWith === "friends"}
                  onClick={() => setTravelWith("friends")}
                />
              </div>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                {apiError}
              </div>
            )}

            {/* Generate Button */}
            <div className="pt-6">
              <button
                onClick={handleGenerateTrip}
                disabled={!isFormComplete || loading}
                className={`w-full py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg ${isFormComplete && !loading
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-blue-100 text-blue-600 cursor-not-allowed"
                  }`}
                type="button"
              >
                <Sparkles className="w-6 h-6" />
                <span className="font-medium">
                  {loading
                    ? "Creating trip..."
                    : isFormComplete
                      ? "Generate My Perfect Trip"
                      : `Complete ${6 - progress} more field${6 - progress > 1 ? "s" : ""}`}
                </span>
              </button>

              {isFormComplete && !loading && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  ✨ Your personalized itinerary will be ready in seconds!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg mb-2 text-gray-900">AI-Powered</h3>
            <p className="text-sm text-gray-600">Smart recommendations based on your preferences</p>
          </div>
          <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg mb-2 text-gray-900">Instant Results</h3>
            <p className="text-sm text-gray-600">Get your itinerary in seconds, not hours</p>
          </div>
          <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg mb-2 text-gray-900">Personalized</h3>
            <p className="text-sm text-gray-600">Tailored to your budget and travel style</p>
          </div>
        </div>
      </div>
    </div>
  );
}
