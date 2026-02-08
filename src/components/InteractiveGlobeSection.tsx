import { useRef, useState } from 'react';
import { Globe } from 'cobe'; // npm install cobe

const InteractiveGlobeSection = () => {
  const [hoveredMarker, setHoveredMarker] = useState(null);

  // Example marker data - adjust positions in spherical coordinates (phi, theta)
  const markers = [
    { id: 1, label: 'Paris • Four Seasons Hotel George V', type: 'hotel', phi: 0.75, theta: 0.2 },
    { id: 2, label: 'Tokyo • Aman Tokyo', type: 'hotel', phi: 1.05, theta: -0.4 },
    { id: 3, label: 'Santorini • Canaves Oia Suites', type: 'hotel', phi: 0.9, theta: 0.45 },
    { id: 4, label: 'Machu Picchu • Peru', type: 'attraction', phi: -0.3, theta: -1.1 },
    { id: 5, label: 'Bora Bora • Four Seasons Resort', type: 'hotel', phi: -0.45, theta: -0.7 },
    { id: 6, label: 'Cape Town • Table Mountain', type: 'attraction', phi: -0.8, theta: 0.6 },
  ];

  const globeRef = useRef();

  return (
   {/* Interactive Globe Section - Refined & Fully Interactive */}
<section className="py-24 bg-gradient-to-b from-gray-50 to-white">
  <div className="max-w-7xl mx-auto px-6">
    <div className="text-center mb-14">
      <h2 className="text-5xl font-bold text-gray-900 mb-4">
        Discover the World’s Finest Destinations
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Drag to rotate • Scroll to zoom • Hover markers for luxury hotels and iconic attractions
      </p>
    </div>

    {/* Globe Container */}
    <div className="relative mx-auto max-w-4xl">
      <div className="aspect-square bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div 
          ref={globeRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: 'none' }}
        >
          {/* Earth */}
          <div 
            className="absolute inset-0 rounded-full bg-cover bg-center"
            style={{
              backgroundImage: 'ur[](https://unpkg.com/world-globe-texture@0.1.0/earth-blue-marble.jpg)',
              transform: `rotateY(${rotation}deg) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
          
          {/* Clouds Layer */}
          <div 
            className="absolute inset-0 rounded-full bg-cover bg-center opacity-70 mix-blend-screen pointer-events-none"
            style={{
              backgroundImage: 'ur[](https://unpkg.com/world-globe-texture@0.1.0/clouds.png)',
              transform: `rotateY(${rotation * 0.95}deg) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />

          {/* Atmospheric Glow */}
          <div className="absolute inset-0 rounded-full shadow-2xl shadow-cyan-500/30 pointer-events-none" />
          <div className="absolute -inset-8 rounded-full bg-gradient-radial from-cyan-400/20 to-transparent blur-3xl pointer-events-none" />

          {/* Interactive Markers */}
          {globeMarkers.map((marker) => (
            <div
              key={marker.id}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
              style={{
                top: marker.position.top,
                left: marker.position.left,
                transform: `translate(-50%, -50%) scale(${zoom})`,
              }}
              onMouseEnter={() => setHoveredMarker(marker.id)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/60 animate-ping" 
                     style={{ animationDuration: '2.5s' }} />
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-4 border-white 
                  ${marker.type === "hotel" 
                    ? "bg-gradient-to-br from-rose-600 to-rose-800" 
                    : "bg-gradient-to-br from-amber-500 to-orange-600"}`}>
                  {marker.type === "hotel" ? 
                    <Hotel className="w-7 h-7 text-white" /> : 
                    <MapPin className="w-7 h-7 text-white" />
                  }
                </div>

                {/* Elegant Tooltip */}
                {hoveredMarker === marker.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 px-6 py-3 bg-gray-900 text-white rounded-2xl shadow-2xl whitespace-nowrap border border-gray-700">
                    <p className="font-semibold text-base">{marker.label}</p>
                    <p className="text-sm text-gray-300">{marker.subtitle}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 border-8 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Legend */}
    <div className="flex justify-center gap-12 mt-12 text-gray-700">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-rose-800 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
          <Hotel className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold">Luxury Hotels</p>
          <p className="text-sm text-gray-500">Handpicked 5-star stays</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold">Iconic Attractions</p>
          <p className="text-sm text-gray-500">Must-see experiences</p>
        </div>
      </div>
    </div>
  </div>
</section>
  );
};

export default InteractiveGlobeSection;