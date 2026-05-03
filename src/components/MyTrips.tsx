import { useState } from 'react';
import { MapPin, Calendar, DollarSign, Users, Star, ChevronDown } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Trip } from '../types';

interface MyTripsProps {
  trips: Trip[];
  onViewTrip: (trip: Trip) => void;
}

export function MyTrips({ trips, onViewTrip }: MyTripsProps) {
  const [visibleCount, setVisibleCount] = useState(6);

  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem]">
        <div className="text-7xl mb-8">✈️</div>
        <h2 className="text-3xl font-bold text-white mb-4">No adventures yet</h2>
        <p className="text-gray-400 text-lg max-w-sm mx-auto leading-relaxed">
          Your travel history is currently empty. Start planning your first dream journey today!
        </p>
      </div>
    );
  }

  const getBudgetLabel = (budget: string | undefined) => {
    if (!budget) return 'N/A';
    if (budget === 'mid') return 'Moderate';
    return budget.charAt(0).toUpperCase() + budget.slice(1);
  };

  const getTravelWithLabel = (travelWith: string | undefined) => {
    if (!travelWith) return 'N/A';
    switch (travelWith) {
      case 'just-me': return 'Just Me';
      case 'couple': return 'A Couple';
      case 'friends': return 'Friends';
      case 'family': return 'Family';
      default: return travelWith;
    }
  };

  const getTripImage = (trip: Trip) => {
    if (trip.place?.image) return trip.place.image;
    if (trip.hotels?.length > 0 && trip.hotels[0].imageUrl) return trip.hotels[0].imageUrl;
    if (trip.itinerary?.length > 0) {
      const firstDay = trip.itinerary[0];
      if (firstDay.morning?.length > 0) return firstDay.morning[0].imageUrl;
      if (firstDay.afternoon?.length > 0) return firstDay.afternoon[0].imageUrl;
      if (firstDay.evening?.length > 0) return firstDay.evening[0].imageUrl;
    }
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000&auto=format&fit=crop";
  };

  const getTripName = (trip: Trip) => {
    return trip.title || trip.place?.name || `Trip to ${trip.destination}`;
  };

  const getTripPrice = (trip: Trip) => {
    if (trip.place?.price) return `$${trip.place.price}`;
    if (trip.itinerary?.length > 0) {
      const totalCost = trip.itinerary.reduce((sum, day) => sum + (day.estimatedCost || 0), 0);
      if (totalCost > 0) return `$${totalCost}`;
    }
    return "Free";
  };

  const getTripDescription = (trip: Trip) => {
    if (trip.place?.description) return trip.place.description;
    if (trip.itinerary?.length > 0) return `A ${trip.itinerary.length}-day trip to ${trip.destination} featuring ${trip.hotels?.length || 0} hotels.`;
    return `A wonderful trip to ${trip.destination}.`;
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const visibleTrips = trips.slice(0, visibleCount);
  const hasMore = trips.length > visibleCount;

  return (
    <div className="w-full space-y-12">
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {visibleTrips.map((trip) => (
          <div
            key={trip._id || trip.id}
            onClick={() => onViewTrip(trip)}
            className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:border-blue-500/50 transition-all duration-500 cursor-pointer flex flex-col h-full hover:shadow-[0_0_40px_rgba(37,99,235,0.15)] hover:-translate-y-2"
          >
            <div className="relative h-44 sm:h-56 w-full overflow-hidden">
              <ImageWithFallback
                src={getTripImage(trip)}
                alt={trip.destination}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
                <span className="text-sm font-black text-white">{getTripPrice(trip)}</span>
              </div>

              {trip.generatedBy === 'ai' && (
                <div className="absolute top-4 left-4 bg-blue-600/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-lg border border-blue-400/30">
                  AI Planned
                </div>
              )}
              
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex flex-col flex-1">
              <div className="flex items-start gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                    {getTripName(trip)}
                  </h3>
                  <p className="text-sm text-gray-400 font-medium truncate">{trip.destination}</p>
                </div>
              </div>

              {trip.place?.rating && (
                <div className="flex items-center gap-1.5 mb-3 sm:mb-4 bg-white/5 w-fit px-2 py-1 rounded-lg border border-white/5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold text-white">{trip.place.rating.toFixed(1)}</span>
                </div>
              )}

              <p className="text-sm text-gray-400 line-clamp-2 mb-4 sm:mb-6 leading-relaxed flex-1">
                {getTripDescription(trip)}
              </p>

              <div className="pt-4 sm:pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Budget</span>
                    <span className="text-xs text-white font-bold">{getBudgetLabel(trip.budgetLevel || (trip.budget as any))}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Type</span>
                    <span className="text-xs text-white font-bold">{getTravelWithLabel(trip.travelWith || (trip.travelers ? (trip.travelers === 1 ? 'just-me' : 'group') : undefined))}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300">
                  <Star className="w-4 h-4 text-blue-400 group-hover:text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            className="group relative px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors" />
            <div className="absolute inset-0 border border-blue-500/30 rounded-2xl group-hover:border-blue-500/50 transition-colors" />
            <div className="relative flex items-center gap-3 text-blue-400 group-hover:text-white transition-colors">
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              <span>Load More Journeys</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}