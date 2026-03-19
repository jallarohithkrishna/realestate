import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ExternalLink, MapPin, Layers } from 'lucide-react';

// Google Maps Style Red Pin
const GooglePin = L.divIcon({
  className: 'custom-google-pin',
  html: `
    <div style="position: relative; width: 34px; height: 34px;">
      <svg viewBox="0 0 24 24" width="34" height="34" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" stroke="#fff" stroke-width="1.5"/>
        <circle cx="12" cy="9" r="3.5" fill="#fff"/>
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34]
});

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  lat?: number;
  lng?: number;
}

interface PropertyMapProps {
  properties: Property[];
}

function MapUpdater({ properties }: { properties: Property[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validPoints = properties
        .filter(p => p.lat && p.lng)
        .map(p => [p.lat as number, p.lng as number] as L.LatLngExpression);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [properties, map]);

  return null;
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const navigate = useNavigate();
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const validProperties = properties.filter(p => p.lat && p.lng);

  if (validProperties.length === 0) {
    return (
      <div className="h-[500px] bg-gray-50 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-gray-200 p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No properties with location coordinates</h3>
        <p className="text-gray-500 max-w-xs">Add coordinates to your properties to see them on the interactive map.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white h-[650px] relative z-0 group animate-in fade-in duration-700">
      {/* Google Style Layer Switcher */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setMapStyle(mapStyle === 'street' ? 'satellite' : 'street')}
          className="bg-white p-0.5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all active:scale-95 group/layer overflow-hidden"
          title={mapStyle === 'street' ? 'Satellite View' : 'Map View'}
        >
          <div className="relative w-16 h-16 rounded-md overflow-hidden">
            <img
              src={mapStyle === 'street'
                ? "https://khms0.google.com/kh/v=947?x=151&y=108&z=8"
                : "https://mt1.google.com/vt/lyrs=m&x=151&y=108&z=8"
              }
              className="w-full h-full object-cover transition-transform duration-500 group-hover/layer:scale-110"
              alt="layer switch"
            />
            <div className="absolute inset-0 bg-black/5 group-hover/layer:bg-transparent transition-colors"></div>
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-tighter py-1 text-center text-gray-900">
              {mapStyle === 'street' ? 'Satellite' : 'Map'}
            </div>
          </div>
        </button>
      </div>

      <MapContainer
        center={[17.3850, 78.4867]} // Default to Hyderabad
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url={mapStyle === 'street'
            ? "http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}"
            : "http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
          }
        />

        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.lat!, property.lng!]}
            icon={GooglePin}
          >
            <Popup className="property-popup luxury-popup" offset={[0, -10]}>
              <div className="w-[280px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Luxury
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-gray-900 mb-1 leading-tight">{property.title}</h3>
                  <div className="flex items-center gap-1.5 text-blue-600 font-black mb-4">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-xl tracking-tighter">{property.price}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    Details
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapUpdater properties={validProperties} />
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Label Overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-100 shadow-xl pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Luxury Map</span>
        </div>
      </div>
    </div>
  );
}
