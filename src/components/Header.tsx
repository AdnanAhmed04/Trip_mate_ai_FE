import { User, Plane, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isSignedIn: boolean;
  onCreateTrip: () => void;
  onMyTrips: () => void;
  onProfileClick: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoutClick: () => void;
  currentView: 'create' | 'trips';
  onLogoClick?: () => void;
}

export function Header({ isSignedIn, onCreateTrip, onMyTrips, onProfileClick, onLoginClick, onSignupClick, onLogoutClick, currentView, onLogoClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            onClick={onLogoClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Plane className="w-6 h-6 text-white" />
                {/* <img src="" alt="" srcset="" /> */}
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="text-xl tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TripPlanner
              </div>
              <div className="text-xs text-gray-500">AI-Powered Travel</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button
              onClick={onCreateTrip}
              className={`px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                currentView === 'create'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Create Trip</span>
            </button>
            <button
              onClick={onMyTrips}
              className={`px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                currentView === 'trips'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>My Trips</span>
            </button>
          </nav>

          {/* Auth Buttons or Profile */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                {/* Profile Button */}
                <button
                  onClick={onProfileClick}
                  className="w-11 h-11 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <User className="w-5 h-5" />
                </button>
                {/* Logout Button */}
                <button
                  onClick={onLogoutClick}
                  className="hidden md:block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={onLoginClick}
                  className="hidden md:block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Login
                </button>
                {/* Signup Button */}
                <button
                  onClick={onSignupClick}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => {
                onCreateTrip();
                setMobileMenuOpen(false);
              }}
              className={`w-full px-5 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                currentView === 'create'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Create Trip</span>
            </button>
            <button
              onClick={() => {
                onMyTrips();
                setMobileMenuOpen(false);
              }}
              className={`w-full px-5 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                currentView === 'trips'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>My Trips</span>
            </button>
            {!isSignedIn ? (
              <>
                <button
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onSignupClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onLogoutClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-5 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}