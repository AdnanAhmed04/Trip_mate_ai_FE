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
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path === '/vendor/payment-success' || path.endsWith('/vendor/payment-success')) {
      const sessionId = params.get('session_id');
      if (sessionId) {
        setPaymentSessionId(sessionId);
        setCurrentView('payment-success');
      }
      window.history.replaceState({}, '', '/');
    } else if (path === '/vendor/payment-cancel' || path.endsWith('/vendor/payment-cancel')) {
      setCurrentView('payment-cancel');
      window.history.replaceState({}, '', '/');
    } else if (path === '/trip-payment-success' || path.endsWith('/trip-payment-success')) {
      const sessionId = params.get('session_id');
      if (sessionId) {
        setPaymentSessionId(sessionId);
        setCurrentView('trip-payment-success');
      }
      window.history.replaceState({}, '', '/');
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
        setCurrentView('admin-dashboard');
      } else if (pendingView) {
        setCurrentView(pendingView as any);
        setPendingView(null);
      } else {
        setCurrentView('landing');
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
        setCurrentView(pendingView as any);
        setPendingView(null);
      } else {
        setCurrentView('landing');
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
    setCurrentView('landing');
  };

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('vendor-details');
    window.scrollTo(0, 0);
  };

  const handleBackToVendors = () => {
    setSelectedVendor(null);
    setCurrentView('vendor-listing');
  };

  return (
    <div className="min-h-screen bg-white">


      <main className="pt-16">
        {currentView === 'landing' && (
          <LandingPage
            onVendorClick={handleVendorClick}
            onViewVendors={() => setCurrentView('vendor-listing')}
            onRegisterVendor={() => setCurrentView('vendor-registration')}
            onMyTrips={() => setCurrentView('trip-planner')}
            onLeaveFeedback={() => {
              if (isSignedIn) setCurrentView('feedback');
              else { setPendingView('feedback'); setCurrentView('login'); }
            }}
            onGetStarted={() => {
              if (isSignedIn) setCurrentView('trip-planner-form');
              else { setPendingView('trip-planner-form'); setCurrentView('login'); }
            }}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={() => setCurrentView('signup')}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'signup' && (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={() => setCurrentView('login')}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'vendor-details' && selectedVendor && (
          <VendorDetails vendor={selectedVendor} onBack={handleBackToVendors} />
        )}

        {currentView === 'vendor-registration' && (
          <VendorRegistrationForm onBack={() => setCurrentView('landing')} />
        )}

        {currentView === 'vendor-listing' && (
          <VendorListing onBack={() => setCurrentView('landing')} onVendorClick={handleVendorClick} />
        )}

        {currentView === 'trip-planner' && (
          <TripPlanner
            onStartPlanning={() => setCurrentView('trip-planner-form')}
            onViewTrip={(trip) => { setSelectedTrip(trip); setCurrentView('view-itinerary'); }}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'trip-planner-form' && (
          <PreferencesForm
            onGenerateTrip={(trip) => { setSelectedTrip(trip); setCurrentView('view-itinerary'); }}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'view-itinerary' && selectedTrip && (
          <TripItineraryView trip={selectedTrip} onBack={() => setCurrentView('trip-planner')} />
        )}

        {currentView === 'payment-success' && (
          <PaymentSuccess sessionId={paymentSessionId} onGoHome={() => setCurrentView('landing')} />
        )}

        {currentView === 'payment-cancel' && (
          <PaymentCancel onGoHome={() => setCurrentView('landing')} onRetry={() => setCurrentView('vendor-registration')} />
        )}

        {currentView === 'trip-payment-success' && (
          <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-3xl font-black mb-4 text-gray-900">Payment Successful!</h2>
              <p className="text-gray-600 mb-8 text-lg">You now have unlimited access to generate trips.</p>
              <button onClick={() => setCurrentView('trip-planner-form')} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Start Planning Your Next Trip
              </button>
            </div>
          </div>
        )}

        {currentView === 'feedback' && <FeedbackForm onBack={() => setCurrentView('landing')} />}

        {currentView === 'admin-dashboard' && <AdminDashboard onLogout={handleLogout} />}
      </main>
    </div>
  );
}

export default App;
