import "flag-icons/css/flag-icons.min.css";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import createGlobe from 'cobe';
import { api } from '../services/api';
import { Vendor } from '../types';
import spaceBg from '../space.png';

const LOCATION_COORDINATES: Record<string, [number, number]> = {
  "canada": [56.13, -106.34],
  "united states": [37.09, -95.71],
  "usa": [37.09, -95.71],
  "uk": [55.37, -3.43],
  "united kingdom": [55.37, -3.43],
  "france": [46.22, 2.21],
  "paris": [48.85, 2.35],
  "japan": [36.20, 138.25],
  "tokyo": [35.67, 139.65],
  "germany": [51.16, 10.45],
  "italy": [41.87, 12.56],
  "rome": [41.90, 12.49],
  "spain": [40.46, -3.74],
  "australia": [-25.27, 133.77],
  "sydney": [-33.86, 151.20],
  "india": [20.59, 78.96],
  "china": [35.86, 104.19],
  "brazil": [-14.23, -51.92],
  "mexico": [23.63, -102.55],
  "south africa": [-30.55, 22.93],
  "dubai": [25.20, 55.27],
  "uae": [23.42, 53.84],
  "europe": [54.52, 15.25],
  "asia": [34.04, 100.61],
  "north america": [54.52, -105.25],
  "south america": [-8.78, -55.49],
  "africa": [8.78, 34.50],
  "new york": [40.71, -74.00],
  "london": [51.50, -0.12],
  "cape town": [-33.92, 18.42],
  "bali": [-8.40, 115.18],
  "peru": [-9.19, -75.01],
  "sharjah": [25.34, 55.42],
  "pakistan": [30.37, 69.34],
  "karachi": [24.86, 67.00],
  "delhi": [28.70, 77.10],
  "toronto": [43.65, -79.38],
  "oman": [21.51, 55.92],
  "muscat": [23.58, 58.40],
  "singapore": [1.35, 103.81]
};

const matchLocation = (location: string): [number, number] | null => {
  const normalized = location.toLowerCase();
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }
  return null;
};

const InteractiveGlobeSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);

  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.vendors.getAll();
        if (alive && data.vendors) {
          setVendors(data.vendors);
        }
      } catch (e) {
        console.error("Failed to load vendors for globe", e);
      }
    })();
    return () => { alive = false; };
  }, []);

  const markers = useMemo(() => {
    const plotted: { location: [number, number], size: number }[] = [];
    vendors.forEach(v => {
      const locations = v.serviceLocations?.length
        ? v.serviceLocations
        : [v.branches?.[0]?.location || v.city || "global"];

      locations.forEach(loc => {
        const coords = matchLocation(loc);
        if (coords) {
          plotted.push({ location: coords, size: 0.05 });
        }
      });
    });

    // Always keep 30 static pins populated as requested
    const staticPins: [number, number][] = [
      [25.20, 55.27],   // Dubai
      [25.34, 55.42],   // Sharjah
      [24.86, 67.00],   // Karachi, Pakistan
      [28.70, 77.10],   // Delhi, India
      [43.65, -79.38],  // Toronto, Canada
      [23.58, 58.40],   // Muscat, Oman
      [-33.86, 151.20], // Sydney, Australia
      [40.71, -74.00],  // New York, USA
      [51.50, -0.12],   // London, UK
      [1.35, 103.81],   // Singapore

      // Additional 20
      [35.67, 139.65],  // Tokyo, Japan
      [48.85, 2.35],    // Paris, France
      [41.90, 12.49],   // Rome, Italy
      [40.41, -3.70],   // Madrid, Spain
      [52.52, 13.40],   // Berlin, Germany
      [-33.92, 18.42],  // Cape Town, SA
      [30.04, 31.23],   // Cairo, Egypt
      [-22.90, -43.17], // Rio de Janeiro, Brazil
      [-34.60, -58.38], // Buenos Aires, Argentina
      [19.43, -99.13],  // Mexico City, Mexico
      [34.05, -118.24], // Los Angeles, USA
      [49.28, -123.12], // Vancouver, Canada
      [37.56, 126.97],  // Seoul, South Korea
      [39.90, 116.40],  // Beijing, China
      [13.75, 100.50],  // Bangkok, Thailand
      [3.13, 101.68],   // Kuala Lumpur, Malaysia
      [41.00, 28.97],   // Istanbul, Turkey
      [24.71, 46.67],   // Riyadh, Saudi Arabia
      [19.07, 72.87],   // Mumbai, India
      [-36.84, 174.76], // Auckland, New Zealand

      // Pakistan Northern Areas & Tourist Spots
      [33.90, 73.39],   // Murree
      [35.29, 75.63],   // Skardu
      [36.31, 74.65],   // Hunza
      [35.92, 74.30],   // Gilgit
      [35.22, 72.42],   // Swat
      [34.90, 73.65],   // Naran
      [35.85, 71.78]    // Chitral
    ];

    staticPins.forEach(coords => {
      plotted.push({ location: coords, size: 0.05 });
    });

    return plotted;
  }, [vendors]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;
    let currentPhi = 0;

    // Setup resize observer
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.15, // Realistic 3D tilt
      dark: 0,
      diffuse: 1.5, // Stronger spherical lighting
      mapSamples: 24000, // Higher resolution landmasses
      mapBrightness: 4, // Deep contrast
      baseColor: [0.15, 0.4, 0.75], // Professional corporate blue land
      markerColor: [1, 0.4, 0.1], // High contrast orange/red pins
      glowColor: [0.85, 0.9, 1], // Subtle atmospheric edge glow
      markers: markers,
      onRender: (state) => {
        if (!pointerInteracting.current) {
          currentPhi += 0.003;
        }
        state.phi = currentPhi + pointerInteractionMovement.current;
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [markers]);

  return (
    <section
      style={{ backgroundImage: `url(${spaceBg})` }}
      className="bg-cover bg-center bg-no-repeat py-12 md:py-20 overflow-hidden"
    >
      <div className="max-w-7xl min-h-[auto] lg:min-h-screen mx-auto px-6 flex flex-col justify-center">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Global Vendor Network
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover active vendors offering services across different locations worldwide
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 w-full">
          {/* Globe Container - Left */}
          <div className="relative w-full lg:w-1/2 flex justify-center h-[280px] sm:h-[400px] md:h-[500px] lg:h-[550px]">
            <div className="w-full h-full bg-transparent overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing max-w-[300px] sm:max-w-none"
                style={{ width: '100%', height: '100%', aspectRatio: '1/1', touchAction: 'none' }}
                onPointerDown={(e) => {
                  pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                  if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                }}
                onPointerUp={() => {
                  pointerInteracting.current = null;
                  if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                  pointerInteracting.current = null;
                  if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                }}
                onMouseMove={(e) => {
                  if (pointerInteracting.current !== null) {
                    const delta = e.clientX - pointerInteracting.current;
                    pointerInteractionMovement.current = delta * 0.01;
                  }
                }}
                onTouchMove={(e) => {
                  if (pointerInteracting.current !== null && e.touches[0]) {
                    const delta = e.touches[0].clientX - pointerInteracting.current;
                    pointerInteractionMovement.current = delta * 0.01;
                  }
                }}
              />
            </div>
          </div>

          {/* Legend / Country List - Right */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="max-w-md w-full">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Service Availability</h3>
              <p className="text-gray-300 mb-8 text-sm sm:text-base leading-relaxed">
                Our trusted vendors currently operate across these major destinations worldwide, ensuring top-tier service wherever you go.
              </p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-white">
                {[
                  { name: "UAE", code: "ae" },
                  { name: "Pakistan", code: "pk" },
                  { name: "Thailand", code: "th" },
                  { name: "UK", code: "gb" },
                  { name: "France", code: "fr" },
                  { name: "USA", code: "us" },
                  { name: "Canada", code: "ca" },
                  { name: "Australia", code: "au" },
                  { name: "Singapore", code: "sg" },
                  { name: "South Africa", code: "za" }
                ].map((loc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 font-medium hover:text-blue-400 transition-all cursor-default group"
                  >
                    <span className={`fi fi-${loc.code} w-5 h-4 rounded-sm shadow-md group-hover:scale-110 transition-transform`}></span>
                    <span className="text-sm sm:text-base">{loc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveGlobeSection;