import { useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import useOnclickOutside from 'react-cool-onclickoutside';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface PlacesAutocompleteProps {
  onSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export default function PlacesAutocomplete({
  onSelect,
  defaultValue = '',
  placeholder = '',
  className = '',
}: PlacesAutocompleteProps) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'ua' }, // Обмежуємо пошук Україною
    },
    defaultValue,
  });

  const ref = useOnclickOutside(() => {
    clearSuggestions();
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect(description, { lat, lng });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderSuggestions = () =>
    data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion;

      return (
        <li
          key={place_id}
          onClick={() => handleSelect(suggestion.description)}
          className="cursor-pointer p-2 hover:bg-gray-100"
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </li>
      );
    });

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <div ref={ref} className="relative">
        <input
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder={placeholder}
          className={`w-full p-2 border rounded-md ${className}`}
        />
        {status === 'OK' && (
          <ul className="absolute z-10 w-full bg-white mt-1 border rounded-md shadow-lg max-h-60 overflow-auto">
            {renderSuggestions()}
          </ul>
        )}
      </div>
    </LoadScript>
  );
} 