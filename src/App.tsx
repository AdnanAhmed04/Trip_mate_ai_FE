import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { VendorDetails } from './components/VendorDetails';
import { VendorRegistrationForm } from './components/VendorRegistrationForm';
import { VendorListing } from './components/VendorListing';
import { TripPlanner } from './components/TripPlanner';
import { PreferencesForm } from './components/PreferencesForm';
import { PaymentSuccess } from './components/PaymentSuccess';
import { PaymentCancel } from './components/PaymentCancel';
import { TripItineraryView } from './components/TripItineraryView';
import { FeedbackForm } from './components/FeedbackForm';
import { AdminDashboard } from './components/AdminDashboard';
import { api } from './services/api';
import type { Vendor, Trip } from './types';

type ViewType = 'landing' | 'login' | 'signup' | 'vendor-details' | 'vendor-registration' | 'vendor-listing' | 'trip-planner' | 'trip-planner-form' | 'payment-success' | 'payment-cancel' | 'trip-payment-success' | 'view-itinerary' | 'feedback' | 'admin-dashboard';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'ar', name: 'العربية', flag: 'sa' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'fr', name: 'Français', flag: 'fr' },
];

function App() {
  const [currentLang, setCurrentLang] = useState('en');
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [pendingView, setPendingView] = useState<string | null>(null);
  const [paymentSessionId, setPaymentSessionId] = useState<string>('');

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.view) {
        setCurrentView(state.view);
        if (state.vendor !== undefined) setSelectedVendor(state.vendor);
        if (state.trip !== undefined) setSelectedTrip(state.trip);
      } else {
        setCurrentView('landing');
        setSelectedVendor(null);
        setSelectedTrip(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state
    if (!window.history.state) {
      window.history.replaceState({ 
        view: currentView, 
        vendor: selectedVendor, 
        trip: selectedTrip 
      }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, selectedVendor, selectedTrip]);

  const navigateTo = (view: ViewType, data?: { vendor?: Vendor | null, trip?: Trip | null }) => {
    setCurrentView(view);
    const newVendor = data?.vendor !== undefined ? data.vendor : selectedVendor;
    const newTrip = data?.trip !== undefined ? data.trip : selectedTrip;
    
    if (data?.vendor !== undefined) setSelectedVendor(data.vendor);
    if (data?.trip !== undefined) setSelectedTrip(data.trip);
    
    window.history.pushState({ 
      view, 
      vendor: newVendor,
      trip: newTrip 
    }, '');
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path === '/vendor/payment-success' || path.endsWith('/vendor/payment-success')) {
      const sessionId = params.get('session_id');
      if (sessionId) {
        setPaymentSessionId(sessionId);
        setCurrentView('payment-success');
      }
      window.history.replaceState({ view: 'payment-success' }, '', '/');
    } else if (path === '/vendor/payment-cancel' || path.endsWith('/vendor/payment-cancel')) {
      setCurrentView('payment-cancel');
      window.history.replaceState({ view: 'payment-cancel' }, '', '/');
    } else if (path === '/trip-payment-success' || path.endsWith('/trip-payment-success')) {
      const sessionId = params.get('session_id');
      if (sessionId) {
        setPaymentSessionId(sessionId);
        setCurrentView('trip-payment-success');
      }
      window.history.replaceState({ view: 'trip-payment-success' }, '', '/');
    } else {
      const payment = params.get('payment');
      const sessionId = params.get('session_id');
      if (payment === 'success' && sessionId) {
        setPaymentSessionId(sessionId);
        setCurrentView('payment-success');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (payment === 'cancel') {
        setCurrentView('payment-cancel');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.auth.me();
        if (user) {
          setIsSignedIn(true);
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        setIsSignedIn(false);
        localStorage.removeItem('user');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentView === 'trip-payment-success' && paymentSessionId) {
      api.payments.getSuccessInfo(paymentSessionId)
        .then((res) => {
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        })
        .catch((err) => console.error('Trip payment verification failed:', err));
    }
  }, [currentView, paymentSessionId]);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    const response = await api.auth.login({ email, password });
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsSignedIn(true);
      if (response.user.role === 'admin') {
        navigateTo('admin-dashboard');
      } else if (pendingView) {
        navigateTo(pendingView as any);
        setPendingView(null);
      } else {
        navigateTo('landing');
      }
    } else {
      alert("Login failed");
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    const response = await api.auth.register({ name, email, password });
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsSignedIn(true);
      if (pendingView) {
        navigateTo(pendingView as any);
        setPendingView(null);
      } else {
        navigateTo('landing');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error('Logout failed', e);
    }
    localStorage.removeItem('user');
    setIsSignedIn(false);
    navigateTo('landing');
  };

  const handleVendorClick = (vendor: Vendor) => {
    navigateTo('vendor-details', { vendor });
  };

  const handleBackToVendors = () => {
    navigateTo('vendor-listing', { vendor: null });
  };

  return (
    <div className="min-h-screen bg-white">


      <main>
        {currentView === 'landing' && (
          <LandingPage
            onVendorClick={handleVendorClick}
            onViewVendors={() => navigateTo('vendor-listing')}
            onRegisterVendor={() => navigateTo('vendor-registration')}
            onMyTrips={() => navigateTo('trip-planner')}
            onLeaveFeedback={() => {
              if (isSignedIn) navigateTo('feedback');
              else { setPendingView('feedback'); navigateTo('login'); }
            }}
            onGetStarted={() => {
              if (isSignedIn) navigateTo('trip-planner-form');
              else { setPendingView('trip-planner-form'); navigateTo('login'); }
            }}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={() => navigateTo('signup')}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'signup' && (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={() => navigateTo('login')}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'vendor-details' && selectedVendor && (
          <VendorDetails vendor={selectedVendor} onBack={handleBackToVendors} />
        )}

        {currentView === 'vendor-registration' && (
          <VendorRegistrationForm onBack={() => navigateTo('landing')} />
        )}

        {currentView === 'vendor-listing' && (
          <VendorListing onBack={() => navigateTo('landing')} onVendorClick={handleVendorClick} />
        )}

        {currentView === 'trip-planner' && (
          <TripPlanner
            onStartPlanning={() => navigateTo('trip-planner-form')}
            onViewTrip={(trip) => navigateTo('view-itinerary', { trip })}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'trip-planner-form' && (
          <PreferencesForm
            onGenerateTrip={(trip) => navigateTo('view-itinerary', { trip })}
            onBack={() => navigateTo('landing')}
          />
        )}

        {currentView === 'view-itinerary' && selectedTrip && (
          <TripItineraryView trip={selectedTrip} onBack={() => navigateTo('trip-planner')} />
        )}

        {currentView === 'payment-success' && (
          <PaymentSuccess sessionId={paymentSessionId} onGoHome={() => navigateTo('landing')} />
        )}

        {currentView === 'payment-cancel' && (
          <PaymentCancel onGoHome={() => navigateTo('landing')} onRetry={() => navigateTo('vendor-registration')} />
        )}

        {currentView === 'trip-payment-success' && (
          <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-3xl font-black mb-4 text-gray-900">Payment Successful!</h2>
              <p className="text-gray-600 mb-8 text-lg">You now have unlimited access to generate trips.</p>
              <button onClick={() => navigateTo('trip-planner-form')} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Start Planning Your Next Trip
              </button>
            </div>
          </div>
        )}

        {currentView === 'feedback' && <FeedbackForm onBack={() => navigateTo('landing')} />}

        {currentView === 'admin-dashboard' && <AdminDashboard onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;
