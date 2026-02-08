import { MapPin, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { TripRecommendation, Place } from '../App';

interface RecommendedPlacesProps {
  recommendation: TripRecommendation;
  onPlaceClick: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  savedTripIds: string[];
}

export function RecommendedPlaces({ recommendation, onPlaceClick }: RecommendedPlacesProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Recommended Places in {recommendation.destination}</h1>
        <p className="text-gray-600">
          Discover amazing destinations based on your preferences for {recommendation.days} days
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendation.places.map((place) => {
          return (
            <div
              key={place.id}
              onClick={() => onPlaceClick(place)}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <ImageWithFallback
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-md text-sm">
                  ${place.price}
                </div>
                <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
                  {place.category}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg mb-2">{place.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{place.rating.toFixed(1)}</span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {place.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{place.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}