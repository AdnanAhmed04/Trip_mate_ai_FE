import { MapPin, Calendar, DollarSign, Users, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Trip } from '../types';

interface MyTripsProps {
  trips: Trip[];
  onViewTrip: (trip: Trip) => void;
}

export function MyTrips({ trips, onViewTrip }: MyTripsProps) {
  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">✈️</div>
        <h2 className="text-2xl mb-2">No trips yet</h2>
        <p className="text-gray-600">Create your first trip to get started!</p>
      </div>
    );
  }

  const getBudgetLabel = (budget: string | undefined) => {
    if (!budget) return 'N/A';
    // Handle 'mid' vs 'moderate'
    if (budget === 'mid') return 'Moderate';
    return budget.charAt(0).toUpperCase() + budget.slice(1);
  };

  const getTravelWithLabel = (travelWith: string | undefined) => {
    if (!travelWith) return 'N/A';
    switch (travelWith) {
      case 'just-me':
        return 'Just Me';
      case 'couple':
        return 'A Couple';
      case 'friends':
        return 'Friends';
      case 'family':
        return 'Family';
      default:
        return travelWith;
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
    if (trip.itinerary?.length > 0) return `A ${trip.itinerary.length}-day trip to ${trip.destination} featuring ${trip.hotels?.length || 0} hotels and exciting daily activities.`;
    return `A wonderful trip to ${trip.destination}.`;
  };

  return (
    <div className="max-w-9xl mx-auto">
      {/* <h1 className="text-3xl mb-8">Past trips</h1> */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <div
            key={trip._id || trip.id}
            onClick={() => onViewTrip(trip)}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <ImageWithFallback
                src={getTripImage(trip)}
                alt={trip.destination}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-sm font-semibold shadow-sm">
                {getTripPrice(trip)}
              </div>
              {trip.generatedBy === 'ai' && (
                <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                  AI Generated
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-lg mb-1 font-semibold truncate">{getTripName(trip)}</h3>
                  <p className="text-sm text-gray-600 truncate">{trip.destination}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {trip.place?.rating && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{trip.place.rating.toFixed(1)}</span>
                </div>
              )}

              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {getTripDescription(trip)}
              </p>

              <div className="space-y-2 text-sm">
                {trip.startDate && trip.endDate && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  <span>{getBudgetLabel(trip.budgetLevel || (trip.budget as any))}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>{getTravelWithLabel(trip.travelWith || (trip.travelers ? (trip.travelers === 1 ? 'just-me' : 'group') : undefined))}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}