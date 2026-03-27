import { ArrowLeft, MapPin, Clock, Star, Calendar, Navigation } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Place } from '../App';

interface PlaceDetailsProps {
  place: Place;
  onBack: () => void;
  tripDestination: string;
  onSavePlace: (place: Place) => void;
  isAlreadySaved: boolean;
}

export function PlaceDetails({ place, onBack, tripDestination, onSavePlace, isAlreadySaved }: PlaceDetailsProps) {
  const handleGetDirections = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`,
      '_blank'
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to recommended places</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-96 w-full overflow-hidden">
          <ImageWithFallback
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-white text-3xl mb-2">{place.name}</h1>
            <div className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5" />
              <span>{place.location}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl mb-3">Overview</h2>
                <p className="text-gray-700 leading-relaxed">{place.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">Rating</div>
                    <div>{place.rating.toFixed(1)} out of 5</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div>{place.duration}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <div className="text-sm text-gray-600">Best Time to Visit</div>
                    <div>{place.bestTimeToVisit}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl mb-4">Pricing</h2>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl">${place.price}</span>
                  <span className="text-gray-600">per person</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Category: {place.category}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl mb-4">Location</h2>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Address</div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                    <span>{place.location}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Coordinates</div>
                  <div className="text-sm">
                    Lat: {place.coordinates.lat.toFixed(6)}, Lng: {place.coordinates.lng.toFixed(6)}
                  </div>
                </div>
                <button
                  onClick={handleGetDirections}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  Get Directions
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-8">
            <h2 className="text-xl mb-4">What to Expect</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm">Perfect for {place.category.toLowerCase()} enthusiasts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-sm">Great photo opportunities</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">🗺️</div>
                <div className="text-sm">Easy to navigate</div>
              </div>
            </div>

            {/* Let's Go Button */}
            <div className="flex justify-center">
              <button
                onClick={() => onSavePlace(place)}
                disabled={isAlreadySaved}
                className={`px-12 py-4 rounded-lg flex items-center justify-center gap-3 transition-all text-lg ${isAlreadySaved
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:scale-105'
                  }`}
              >
                <span>{isAlreadySaved ? 'Added to My Trips' : "Let's Go"}</span>
                {!isAlreadySaved && <span>🚀</span>}
                {isAlreadySaved && <span>✓</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}