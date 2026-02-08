import React, { useState } from "react";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import { BudgetCard } from "./BudgetCard";
import { TravelCompanionCard } from "./TravelCompanionCard";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { Trip } from "../App";

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

type Budget = "cheap" | "moderate" | "luxury";
type TravelWith = "just-me" | "couple" | "friends" | "family";

const TRIPS_API = "http://localhost:5000/api/trips";

export function PreferencesForm({ onGenerateTrip }: PreferencesFormProps) {
  const [destination, setDestination] = useState("");
  const [showDestinations, setShowDestinations] = useState(false);
  const [days, setDays] = useState("");
  const [budget, setBudget] = useState<Budget | null>(null);
  const [travelWith, setTravelWith] = useState<TravelWith | null>(null);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const filteredDestinations = destinations.filter((d) =>
    d.toLowerCase().includes(destination.toLowerCase())
  );

  const isDaysValid = days && parseInt(days) > 0 && parseInt(days) <= 365;
  const isFormComplete = destination && isDaysValid && budget && travelWith;
  const progress = [destination, days, budget, travelWith].filter(Boolean).length;
  const progressPercent = (progress / 4) * 100;

  // ✅ CALL BACKEND API
  const createTrip = async (payload: {
    destination: string;
    days: number;
    budget: Budget;
    travelWith: TravelWith;
  }) => {
    // If your /api/trips is protected later, this will work automatically
    const token = localStorage.getItem("token");

    const res = await fetch(TRIPS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to create trip");
    return data;
  };

  const handleGenerateTrip = async () => {
    setApiError("");

    if (!destination || !days || !budget || !travelWith) return;

    const numDays = parseInt(days);
    if (!(numDays > 0 && numDays <= 365)) return;

    const payload = {
      destination,
      days: numDays,
      budget,
      travelWith,
    };

    try {
      setLoading(true);

      // ✅ send to backend
      const created = await createTrip(payload);

      // ✅ keep your existing UI flow
      // If backend returns the saved trip, you can use it if needed:
      // console.log("Trip created:", created);

      onGenerateTrip(payload);
    } catch (err: any) {
      setApiError(err?.message || "Something went wrong");
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
              <span className="text-purple-400">{progress}/4</span>
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
            {/* Destination */}
            <div className="group">
              <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span>Where would you like to go?</span>
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

            {/* Days */}
            <div className="group">
              <label className="flex items-center gap-2 mb-3 text-lg text-gray-900">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>How many days are you planning?</span>
              </label>

              <input
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g., 3, 7, 14"
                className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none text-lg"
              />
              <p className="text-sm text-gray-500 mt-2 ml-1">Recommended: 3-14 days for best experience</p>
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
                className={`w-full py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg ${
                  isFormComplete && !loading
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
                    : `Complete ${4 - progress} more field${4 - progress > 1 ? "s" : ""}`}
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
