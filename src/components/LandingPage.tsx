import { useState, useEffect } from "react";
import { TrustedVendorServices, UiVendor } from "./TrustedVendorServices";
import {
  Hotel,
  Trees,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Star,
  ArrowRight,
  Users,
  Building2,
  TrendingUp,
  Shield,
  DollarSign,
  MessageSquare,
  Sparkles,
  Clock,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { AnimatedCounter } from "./AnimatedCounter";
import InteractiveGlobeSection from "./InteractiveGlobeSection";
import CustomerReviewSlider from "./ReviewSlider";
import { clsx } from 'clsx';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  location: string;
  description: string;
}

interface GlobeMarker {
  id: string;
  label: string;
  type: "hotel" | "place";
  position: { top: string; left: string };
}

interface LandingPageProps {
  onVendorClick: (vendor: Vendor) => void;
  onGetStarted: () => void;
  onViewVendors?: () => void;
  onRegisterVendor?: () => void;
}



const globeMarkers: GlobeMarker[] = [
  {
    id: "1",
    label: "NYC Hotels",
    type: "hotel",
    position: { top: "35%", left: "25%" },
  },
  {
    id: "2",
    label: "Paris Attractions",
    type: "place",
    position: { top: "30%", left: "48%" },
  },
  {
    id: "3",
    label: "Tokyo Hotels",
    type: "hotel",
    position: { top: "38%", left: "78%" },
  },
  {
    id: "4",
    label: "London Sites",
    type: "place",
    position: { top: "32%", left: "47%" },
  },
  {
    id: "5",
    label: "Sydney Resorts",
    type: "hotel",
    position: { top: "70%", left: "80%" },
  },
  {
    id: "6",
    label: "Rome Heritage",
    type: "place",
    position: { top: "36%", left: "52%" },
  },
  {
    id: "7",
    label: "Bali Paradise",
    type: "hotel",
    position: { top: "58%", left: "72%" },
  },
  {
    id: "8",
    label: "Dubai Luxury",
    type: "hotel",
    position: { top: "42%", left: "58%" },
  },
  {
    id: "9",
    label: "Rio Adventures",
    type: "place",
    position: { top: "62%", left: "32%" },
  },
  {
    id: "10",
    label: "Cairo Wonders",
    type: "place",
    position: { top: "40%", left: "54%" },
  },
];

export function LandingPage({
  onVendorClick,
  onGetStarted,
  onViewVendors,
  onRegisterVendor,
}: LandingPageProps) {
  const [hoveredMarker, setHoveredMarker] = useState<
    string | null
  >(null);
  const [scrolled, setScrolled] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  const backgroundImages = [
    "https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBkZXN0aW5hdGlvbiUyMHNjZW5pY3xlbnwxfHx8fDE3NjM3Mjg1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHRyb3BpY2FsJTIwcGFyYWRpc2UlMjB2YWNhdGlvbnxlbnwxfHx8fDE3NjM3Mjg1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1713959989861-2425c95e9777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjM2Njk3NTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1708892442858-187af554be24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHVyYmFuJTIwdHJhdmVsfGVufDF8fHx8MTc2MzcyODU3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(
        (prev) => (prev + 1) % backgroundImages.length,
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* Navigation Bar */}
      <nav
  className="
    fixed top-0 left-0 right-0 z-50
    backdrop-blur-sm h-20
    bg-white/70
    transition-all duration-300 p-0
  "
>

        <div className="max-w-8xl mx-auto px-6 py-4 ">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                className={`text-2xl transition-colors ${
                  scrolled ? "text-purple-600" : "text-white"
                }`}
              >
              <img src="/src/navlogo.png" className={`w-15 h-32`} alt="" srcset="" />

              </div>
              <span
                className={`text-xl transition-colors ${
                  scrolled ? "text-gray-900" : "text-white"
                }`}
              >
                {/* TripPlanner */}
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={onGetStarted}
              className={`px-6 py-2 rounded-full transition-all ${
                scrolled
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg"
                  : "bg-white text-purple-600 hover:shadow-xl"
              }`}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
      

      {/* Hero Section */}
      <div className="relative min-h-[700px] flex items-center pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={backgroundImages[currentBgIndex]}
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-purple-900/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="max-w-3xl">
              <div className="inline-block bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 border border-white/20">
                <span className="flex items-center gap-2">
                  ✨ AI-Powered Travel Planning
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl mb-6 text-white leading-tight">
                Your Dream Vacation
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Starts Here
                </span>
              </h1>

              <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
                Discover amazing destinations, connect with
                trusted vendors, and create unforgettable
                memories with our AI-powered trip planning
                platform.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-12">
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 w-fit text-white px-8 py-4 rounded-full hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2 text-lg hover:scale-105"
                >
                  <span>Start Planning Your Trip</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Animated Stats Counter */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-4xl text-white mb-1">
                    <AnimatedCounter end={200} suffix="+" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    Active Users
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-4xl text-white mb-1">
                    <AnimatedCounter end={100} suffix="+" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    Active Vendors
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-4xl text-white mb-1">
                    <AnimatedCounter end={1000} suffix="+" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300">
                    Total Trips
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Ads - Bottom Right */}
       <div className="absolute bottom-6 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-xs shadow-2xl backdrop-blur-sm z-20 border border-white/30 max-w-[180px] animate-bump">
  <div className="flex items-center gap-2">
    <span className="text-base">🎉</span>
    <div className="text-xs leading-tight">
      <div className="font-semibold">Special Offer</div>
      <div>20% on Premium</div>
    </div>
  </div>
</div>

      </div>

      {/* Ad Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-lg">
            🔥 Limited Time: Book now and get free travel
            insurance • Valid until Dec 31, 2025
          </p>
        </div>
      </div>

      {/* Plan Your Perfect Journey Section */}
      <div className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758272959377-1d5466d3841b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb3VybmV5JTIwcGxhbm5pbmclMjBtYXAlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzY0Nzc4NzczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Journey planning background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/85 via-black/80 to-gray-900/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full mb-4">
              <span className="flex items-center gap-2">
                ✨ Simple & Efficient
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-4 text-white">
              Plan Your Perfect Journey
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Our AI-powered platform makes trip planning
              effortless in just three simple steps
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                1
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 pt-12 border border-purple-100">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <MapPin className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-2xl mb-3 text-gray-900">
                  Choose Your Destination
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Tell us where you want to go, how many days
                  you'll stay, and your budget preferences.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                2
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 pt-12 border border-purple-100">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <Sparkles className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-2xl mb-3 text-gray-900">
                  Get AI Recommendations
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI analyzes your preferences and suggests
                  personalized destinations and experiences.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
                3
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 pt-12 border border-purple-100">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-md">
                  <Star className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-2xl mb-3 text-gray-900">
                  Explore & Get Ready to Go
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Review detailed information about each place,
                  save the ones you like, and get ready to start
                  your adventure with ease.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-full hover:shadow-2xl transition-all inline-flex items-center gap-3 text-lg hover:scale-105"
            >
              <span>Start Planning Now</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
{/* <InteractiveGlobeSection/> */}
     

      {/* Vendor Services Section */}
     
<TrustedVendorServices
        onVendorClick={onVendorClick}
        onViewVendors={onViewVendors}
        onRegisterVendor={onRegisterVendor}
      />


      {/* Why Trust Us Section */}
      <div className="relative py-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1742782459449-85ed928fe8ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cnVzdCUyMHJlbGlhYmlsaXR5JTIwdHJhdmVsfGVufDF8fHx8MTc2NDc3ODc3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Trust background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/85 via-black/80 to-gray-900/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-12 sm:mb-16">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 text-white">
      Why Trust Us?
    </h2>
    <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
      We're committed to providing the best travel planning experience
    </p>
  </div>

  {/* Cards */}
<div className=" ">
  <div
    className="flex justify-center gap-8"
  >
    {/* Card */}
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-[200px] items-start flex-1">
      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
        <MessageSquare className="w-6 h-6 text-orange-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Real User Reviews
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          See what other travellers say about their experiences and get honest
          feedback. Rated 4.8/5 by 200,000+ happy travellers.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-[200px]   items-start flex-1">
      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
        <DollarSign className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Transparent Pricing
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          No hidden fees, just clear, straightforward service. Zero booking fees.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100  w-[200px]   items-start flex-1">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
        <Shield className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Secure Booking
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your data and payments are always protected with industry-leading security.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 fl w-[200px]   items-start flex-1">
      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
        <Clock className="w-6 h-6 text-purple-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">
          Exclusive Deals
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Enjoy special offers and discounts you won’t find elsewhere.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 w-[200px] items-start flex-1">
      <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center shrink-0">
        <Sparkles className="w-6 h-6 text-fuchsia-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">
          AI-Powered Recommendations
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Get personalized travel suggestions based on your preferences and past trips.
        </p>
      </div>
    </div>
  </div>
</div>

</div>
     <div className='mt-12 h-[500px]'>
                <CustomerReviewSlider />
              </div>
      </div>
         

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of travelers who trust us with their
            dream vacations
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-all inline-flex items-center gap-2 text-lg shadow-lg"
          >
            <span>Plan Your Trip Now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}

export type { Vendor };