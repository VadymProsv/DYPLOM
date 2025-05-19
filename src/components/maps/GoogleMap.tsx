import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  width?: string;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  markerPosition?: { lat: number; lng: number };
  isInteractive?: boolean;
}

const defaultCenter = { lat: 50.4501, lng: 30.5234 }; // Київ
const defaultZoom = 12;

export default function Map({
  center = defaultCenter,
  zoom = defaultZoom,
  height = '400px',
  width = '100%',
  onLocationSelect,
  markerPosition,
  isInteractive = true
}: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (markerPosition && marker) {
      marker.setPosition(markerPosition);
    }
  }, [markerPosition, marker]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isInteractive || !onLocationSelect || !e.latLng) return;

    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    onLocationSelect(location);
  }, [isInteractive, onLocationSelect]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={{ height, width }}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        }}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={isInteractive}
            onDragEnd={(e) => {
              if (onLocationSelect && e.latLng) {
                onLocationSelect({
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                });
              }
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
} 