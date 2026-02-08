import { ArrowLeft, MapPin, Phone, Mail, MessageCircle, Star, CheckCircle, Clock, Users, Award } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Vendor } from './LandingPage';

interface VendorDetailsProps {
  vendor: Vendor;
  onBack: () => void;
}

const vendorServices: { [key: string]: string[] } = {
  'v1': [
    'Luxury Hotel Bookings',
    'Private Jet Charters',
    'VIP Airport Transfers',
    'Personal Travel Concierge',
    'Exclusive Restaurant Reservations',
    'Custom Itinerary Planning'
  ],
  'v2': [
    'Mountain Expeditions',
    'Scuba Diving Tours',
    'Safari Adventures',
    'Rock Climbing Experiences',
    'White Water Rafting',
    'Wilderness Camping'
  ],
  'v3': [
    'Historical Site Tours',
    'Museum Guided Visits',
    'Local Cultural Workshops',
    'Traditional Cuisine Classes',
    'Art Gallery Tours',
    'Heritage Walking Tours'
  ],
  'v4': [
    'Luxury Beach Resorts',
    'Water Sports Activities',
    'Spa & Wellness Packages',
    'Beachfront Villa Rentals',
    'Sunset Cruises',
    'Island Hopping Tours'
  ],
  'v5': [
    'Himalayan Trekking',
    'Base Camp Expeditions',
    'Mountain Photography Tours',
    'High Altitude Training',
    'Guided Hiking Trips',
    'Mountaineering Courses'
  ],
  'v6': [
    'City Walking Tours',
    'Food & Wine Experiences',
    'Architecture Tours',
    'Shopping District Guides',
    'Nightlife Exploration',
    'Street Art Tours'
  ]
};

const vendorContact: { [key: string]: { phone: string; email: string; address: string; whatsapp: string } } = {
  'v1': {
    phone: '+1 (555) 123-4567',
    email: 'concierge@luxurytravel.com',
    address: '123 Fifth Avenue, Suite 500, New York, NY 10001, USA',
    whatsapp: '+1-555-123-4567'
  },
  'v2': {
    phone: '+61 2 9876 5432',
    email: 'adventures@globaltours.com.au',
    address: '45 Harbor Street, Sydney NSW 2000, Australia',
    whatsapp: '+61-2-9876-5432'
  },
  'v3': {
    phone: '+39 06 1234 5678',
    email: 'info@culturalheritage.it',
    address: 'Via dei Fori Imperiali 1, 00186 Roma, Italy',
    whatsapp: '+39-06-1234-5678'
  },
  'v4': {
    phone: '+62 361 123456',
    email: 'paradise@beachresorts.co.id',
    address: 'Jl. Pantai Kuta No. 88, Bali 80361, Indonesia',
    whatsapp: '+62-361-123456'
  },
  'v5': {
    phone: '+977 1 4567890',
    email: 'trek@mountainspecialists.np',
    address: 'Thamel Marg, Kathmandu 44600, Nepal',
    whatsapp: '+977-1-4567890'
  },
  'v6': {
    phone: '+33 1 42 86 82 00',
    email: 'explore@cityguides.fr',
    address: '25 Rue de Rivoli, 75001 Paris, France',
    whatsapp: '+33-1-42-86-82-00'
  }
};

export function VendorDetails({ vendor, onBack }: VendorDetailsProps) {
  const services = vendorServices[vendor.id] || [];
  const contact = vendorContact[vendor.id];

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = `mailto:${contact.email}`;
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-700 hover:text-black mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to vendors</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="relative h-80 w-full overflow-hidden">
          <ImageWithFallback
            src={vendor.image}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white px-3 py-1 rounded-full flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{vendor.rating}</span>
              </div>
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                Verified Vendor
              </div>
            </div>
            <h1 className="text-white text-4xl mb-2">{vendor.name}</h1>
            <p className="text-white/90 text-lg">{vendor.category}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Stats Cards */}
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl mb-1">5000+</div>
              <div className="text-sm text-gray-600">Happy Travelers</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl mb-1">15+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl mb-1">24/7</div>
              <div className="text-sm text-gray-600">Customer Support</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Services Section */}
            <div>
              <h2 className="text-2xl mb-6">Our Services</h2>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-xl mb-2">Special Offer</h3>
                <p className="text-purple-100 mb-4">
                  Book now and get 15% off on your first trip package!
                </p>
                <div className="text-sm text-purple-200">
                  Valid until: December 31, 2025
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-2xl mb-6">Contact Information</h2>
              
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Address</div>
                      <div>{contact.address}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Phone</div>
                      <button
                        onClick={handlePhoneClick}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.phone}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Email</div>
                      <button
                        onClick={handleEmailClick}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {contact.email}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-lg">Chat on WhatsApp</span>
              </button>

              <div className="mt-4 text-center text-sm text-gray-600">
                Average response time: Under 5 minutes
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl mb-4">About Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {vendor.description}. We pride ourselves on delivering exceptional travel experiences 
              with attention to every detail. Our team of experienced professionals is dedicated to 
              making your journey unforgettable.
            </p>
            <p className="text-gray-700 leading-relaxed">
              With years of expertise in the travel industry and a passion for exploration, we've 
              helped thousands of travelers create memories that last a lifetime. From planning to 
              execution, we're with you every step of the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
