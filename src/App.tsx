import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { VendorDetails } from './components/VendorDetails';
import { VendorRegistrationForm } from './components/VendorRegistrationForm';
import { VendorListing } from './components/VendorListing';
import { TripPlanner } from './components/TripPlanner';
import { PreferencesForm } from './components/PreferencesForm';
import { api } from './services/api';
import type { Vendor } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'vendor-details' | 'vendor-registration' | 'vendor-listing' | 'trip-planner' | 'trip-planner-form'>('landing');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [pendingView, setPendingView] = useState<string | null>(null);

  // Login/Signup state moved to components

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.auth.me();
        if (user) {
          setIsSignedIn(true);
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.log("Not signed in or session expired");
        setIsSignedIn(false);
        localStorage.removeItem('user');
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    console.log('Attempting login...');
    const response = await api.auth.login({ email, password });
    console.log('Login response:', response);
    if (response.user) {
      console.log('User found, redirecting...');
      // Token is handled via HttpOnly cookie
      localStorage.setItem('user', JSON.stringify(response.user));
      setIsSignedIn(true);
      if (pendingView) {
        console.log('Redirecting to pending view:', pendingView);
        setCurrentView(pendingView as any);
        setPendingView(null);
      } else {
        console.log('Redirecting to landing');
        setCurrentView('landing');
      }
    } else {
      console.error('No user in response');
      alert("Login failed: " + (response as any).message || "Unknown error");
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    const response = await api.auth.register({
      name,
      email,
      password
    });

    if (response.user) {
      // Token is handled via HttpOnly cookie
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
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setCurrentView('landing')}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                TripMate
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => setCurrentView('landing')} className="text-gray-600 hover:text-black transition-colors">Home</button>
              <button onClick={() => setCurrentView('vendor-listing')} className="text-gray-600 hover:text-black transition-colors">Vendors</button>
              <button onClick={() => setCurrentView('trip-planner')} className="text-gray-600 hover:text-black transition-colors">Trip Planner</button>
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Welcome!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200 transition-all font-medium text-sm"
                  >
                    log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setCurrentView('login')}
                    className="text-gray-600 hover:text-black transition-colors font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setCurrentView('signup')}
                    className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all font-medium text-sm"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {currentView === 'landing' && (
          <LandingPage
            onVendorClick={handleVendorClick}
            onViewVendors={() => setCurrentView('vendor-listing')}
            onRegisterVendor={() => setCurrentView('vendor-registration')}
            onGetStarted={() => {
              if (isSignedIn) {
                setCurrentView('trip-planner-form');
              } else {
                setPendingView('trip-planner-form');
                setCurrentView('login');
              }
            }}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={() => setCurrentView('signup')}
          />
        )}

        {currentView === 'signup' && (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        )}

        {currentView === 'vendor-details' && selectedVendor && (
          <VendorDetails
            vendor={selectedVendor}
            onBack={handleBackToVendors}
          />
        )}

        {currentView === 'vendor-registration' && (
          <VendorRegistrationForm
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'vendor-listing' && (
          <VendorListing
            onBack={() => setCurrentView('landing')}
            onVendorClick={handleVendorClick}
          />
        )}

        {currentView === 'trip-planner' && (
          <TripPlanner
            onStartPlanning={() => setCurrentView('trip-planner-form')}
          />
        )}

        {currentView === 'trip-planner-form' && (
          <PreferencesForm
            onGenerateTrip={(trip) => {
              console.log("Trip generated", trip);
              setCurrentView('trip-planner');
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;