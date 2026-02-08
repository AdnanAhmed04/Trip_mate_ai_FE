import { useState } from 'react';



import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { Header } from './components/Header';
import { SignInModal } from './components/SignInModal';
import { PreferencesForm } from './components/PreferencesForm';
import { MyTrips } from './components/MyTrips';
import { RecommendedPlaces } from './components/RecommendedPlaces';
import { PlaceDetails } from './components/PlaceDetails';
import { LandingPage, type Vendor } from './components/LandingPage';
import { VendorDetails } from './components/VendorDetails';
import { VendorListing } from './components/VendorListing';
import { VendorRegistrationForm } from './components/VendorRegistrationForm';

export interface Place {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  coordinates: { lat: number; lng: number };
  image: string;
  rating: number;
  category: string;
  bestTimeToVisit: string;
  duration: string;
}

export interface Trip {
  id: string;
  destination: string;
  days: number;
  budget: 'cheap' | 'moderate' | 'luxury';
  travelWith: 'just-me' | 'couple' | 'friends' | 'family';
  createdAt: Date;
  place: Place;
}

export interface TripRecommendation {
  destination: string;
  days: number;
  budget: 'cheap' | 'moderate' | 'luxury';
  travelWith: 'just-me' | 'couple' | 'friends' | 'family';
  places: Place[];
}

type ViewType = 'landing' | 'create' | 'trips' | 'recommended' | 'place-details' | 'vendor-details' | 'vendor-listing' | 'vendor-registration' | 'login' | 'signup';

export default function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [currentRecommendation, setCurrentRecommendation] = useState<TripRecommendation | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleLogin = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any email/password
    // In a real app, this would validate against a backend
    setIsSignedIn(true);
    setCurrentView('landing');
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any signup
    // In a real app, this would create a user account
    setIsSignedIn(true);
    setCurrentView('landing');
  };

  const handleCreateTrip = () => {
    if (!isSignedIn) {
      setShowSignInModal(true);
    } else {
      setCurrentView('create');
      setCurrentRecommendation(null);
    }
  };
    const handleShowLogin = () => {
    setCurrentView('login');
    setShowSignInModal(false);
  };

  const handleShowSignup = () => {
    setCurrentView('signup');
    setShowSignInModal(false);
  };

  const handleLogout = () => {
    setIsSignedIn(false);
    setTrips([]);
    setSelectedPlace(null);
    setCurrentRecommendation(null);
    setSelectedVendor(null);
    setCurrentView('landing');
    setShowSignInModal(false);
  };

  const handleSignIn = async (email: string, password: string) => {
    await handleLogin(email, password);
    setShowSignInModal(false);
  };


  const generatePlaces = (destination: string, budget: 'cheap' | 'moderate' | 'luxury', days: number): Place[] => {
    const placeImages = [
      'https://images.unsplash.com/photo-1763469027887-9d7811150ff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGNpdHl8ZW58MXx8fHwxNzYzNTQ1NTc3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1760841940521-67b382e26ead?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1vdXMlMjBsYW5kbWFyayUyMHRvdXJpc218ZW58MXx8fHwxNzYzNTY2NDU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1678687114989-ad452a24f289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHJlc29ydCUyMHZhY2F0aW9ufGVufDF8fHx8MTc2MzU0MDAxOXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1669986480140-2c90b8edb443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGFkdmVudHVyZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjM1NDY0MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1597049341906-17c85039c488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpYyUyMGFyY2hpdGVjdHVyZSUyMG1vbnVtZW50fGVufDF8fHx8MTc2MzU2NjQ1OHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1691750427379-ee11dc33d697?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBwYXJrJTIwc2NlbmljfGVufDF8fHx8MTc2MzU2NjQ1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    ];

    const categories = ['Historical', 'Nature', 'Adventure', 'Cultural', 'Beach', 'Mountain'];
    const priceMultiplier = budget === 'cheap' ? 1 : budget === 'moderate' ? 2 : 3;
    
    return Array.from({ length: Math.min(days * 2, 6) }, (_, i) => ({
      id: `place-${i + 1}`,
      name: `${destination} Attraction ${i + 1}`,
      description: `Experience the beauty and culture of this amazing ${categories[i % categories.length].toLowerCase()} destination. Perfect for travelers seeking memorable experiences.`,
      price: Math.floor((50 + Math.random() * 150) * priceMultiplier),
      location: `${destination}, District ${i + 1}`,
      coordinates: { lat: 25.276987 + (Math.random() - 0.5) * 0.1, lng: 55.296249 + (Math.random() - 0.5) * 0.1 },
      image: placeImages[i % placeImages.length],
      rating: 4 + Math.random(),
      category: categories[i % categories.length],
      bestTimeToVisit: 'October to March',
      duration: `${Math.floor(2 + Math.random() * 4)} hours`,
    }));
  };

  const handleGenerateTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'place'>) => {
    const places = generatePlaces(tripData.destination, tripData.budget, tripData.days);
    const recommendation: TripRecommendation = {
      destination: tripData.destination,
      days: tripData.days,
      budget: tripData.budget,
      travelWith: tripData.travelWith,
      places,
    };
    setCurrentRecommendation(recommendation);
    setCurrentView('recommended');
  };

  const handleSavePlace = (place: Place) => {
    if (currentRecommendation) {
      const newTrip: Trip = {
        id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        destination: currentRecommendation.destination,
        days: currentRecommendation.days,
        budget: currentRecommendation.budget,
        travelWith: currentRecommendation.travelWith,
        createdAt: new Date(),
        place,
      };
      setTrips([...trips, newTrip]);
    }
  };

  const handleViewTrip = (trip: Trip) => {
    setSelectedPlace(trip.place);
    setCurrentView('place-details');
  };

  const handleViewPlaceDetails = (place: Place) => {
    setSelectedPlace(place);
    setCurrentView('place-details');
  };

  const handleBackToRecommended = () => {
    setCurrentView('recommended');
    setSelectedPlace(null);
  };

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('vendor-details');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedVendor(null);
  };

  const handleGetStarted = () => {
    if (!isSignedIn) {
      setCurrentView('login');
    } else {
      setCurrentView('create');
    }
  };

  const showHeader = currentView !== 'landing' && currentView !== 'vendor-details' && currentView !== 'vendor-listing' && currentView !== 'vendor-registration' && currentView !== 'login' && currentView !== 'signup';

  return (
    <div className="min-h-screen ">
      {currentView === 'login' && (
        <LoginPage onSwitchToSignup={handleShowSignup} onLogin={handleLogin} />
      )}
      {currentView === 'signup' && (
        <SignupPage onSwitchToLogin={handleShowLogin} onSignup={handleSignup} />
      )}
      {showHeader && (
        <Header
          isSignedIn={isSignedIn}
          onCreateTrip={handleCreateTrip}
          onMyTrips={() => setCurrentView('trips')}
          onProfileClick={() => setShowSignInModal(true)}
          onLoginClick={handleShowLogin}
          onSignupClick={handleShowSignup}
          onLogoutClick={handleLogout}
          currentView={currentView === 'create' ? 'create' : 'trips'}
          onLogoClick={() => setCurrentView('landing')}
        />
      )}

      <main className={showHeader ? "container mx-auto px-4 py-8" : ""}>
        {currentView === 'landing' && (
          <LandingPage 
            onVendorClick={handleVendorClick}
            onGetStarted={handleGetStarted}
            onViewVendors={() => setCurrentView('vendor-listing')}
            onRegisterVendor={() => setCurrentView('vendor-registration')}
          />
        )}

        {currentView === 'vendor-listing' && (
          <VendorListing
            onBack={handleBackToLanding}
            onVendorClick={handleVendorClick}
          />
        )}

        {currentView === 'vendor-registration' && (
          <VendorRegistrationForm
            onBack={handleBackToLanding}
            onSubmit={(data) => {
              console.log('Vendor registration submitted:', data);
              alert('Thank you for registering! Your application will be reviewed.');
              setCurrentView('landing');
            }}
          />
        )}

        {currentView === 'vendor-details' && selectedVendor && (
          <div className="container mx-auto px-4 py-8">
            <VendorDetails 
              vendor={selectedVendor}
              onBack={handleBackToLanding}
            />
          </div>
        )}

        {currentView === 'create' && (
          <PreferencesForm onGenerateTrip={handleGenerateTrip} />
        )}
        
        {currentView === 'trips' && (
          <MyTrips trips={trips} onViewTrip={handleViewTrip} />
        )}
        
        {currentView === 'recommended' && currentRecommendation && (
          <RecommendedPlaces
            recommendation={currentRecommendation}
            onPlaceClick={handleViewPlaceDetails}
            onSavePlace={handleSavePlace}
            savedTripIds={trips.map(t => t.place.id)}
          />
        )}
        
        {currentView === 'place-details' && selectedPlace && currentRecommendation && (
          <PlaceDetails
            place={selectedPlace}
            onBack={handleBackToRecommended}
            tripDestination={currentRecommendation.destination}
            onSavePlace={handleSavePlace}
            isAlreadySaved={trips.some(t => t.place.id === selectedPlace.id)}
          />
        )}
      </main>

      {showSignInModal && (
        <SignInModal
          onClose={() => setShowSignInModal(false)}
          onSignIn={handleSignIn}
        />
      )}
    </div>
  );
}