import { MapPin, Calendar, DollarSign, Users, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Trip } from '../App';

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

  const getBudgetLabel = (budget: string) => {
    return budget.charAt(0).toUpperCase() + budget.slice(1);
  };

  const getTravelWithLabel = (travelWith: string) => {
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

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl mb-8">My Trips</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            onClick={() => onViewTrip(trip)}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <ImageWithFallback
                src={trip.place.image}
                alt={trip.place.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-sm">
                ${trip.place.price}
              </div>
              <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                {trip.place.category}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg mb-1">{trip.place.name}</h3>
                  <p className="text-xs text-gray-600">{trip.destination}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{trip.place.rating.toFixed(1)}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.days} days</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  <span>{getBudgetLabel(trip.budget)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>{getTravelWithLabel(trip.travelWith)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}