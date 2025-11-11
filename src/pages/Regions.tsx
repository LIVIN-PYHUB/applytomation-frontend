import { useState, useEffect } from 'react';
import { mastersDataApi } from '../services/api';
import { MapPin } from 'lucide-react';

export default function Regions() {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry || selectedState) {
      fetchCities(selectedCountry || undefined, selectedState || undefined);
    }
  }, [selectedCountry, selectedState]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await mastersDataApi.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId: number) => {
    try {
      const response = await mastersDataApi.getStates(countryId);
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCities = async (countryId?: number, stateId?: number) => {
    try {
      const response = await mastersDataApi.getCities(countryId, stateId);
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleToggleLocation = (locationKey: string) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(locationKey)) {
      newSelected.delete(locationKey);
    } else {
      newSelected.add(locationKey);
    }
    setSelectedLocations(newSelected);
  };

  const regions = [
    {
      name: 'North America',
      countries: ['United States', 'Canada', 'Mexico']
    },
    {
      name: 'Europe',
      countries: ['United Kingdom', 'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark']
    },
    {
      name: 'Asia Pacific',
      countries: ['China', 'Japan', 'India', 'Singapore', 'Australia', 'South Korea', 'Indonesia', 'Thailand', 'Vietnam', 'Malaysia']
    },
    {
      name: 'Middle East',
      countries: ['UAE', 'Saudi Arabia', 'Israel', 'Qatar', 'Kuwait']
    },
    {
      name: 'Latin America',
      countries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru']
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Regions & Locations</h1>
      <p className="text-gray-600 mb-6">Select regions and specific countries/cities</p>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {regions.map((region) => (
          <div key={region.name} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {region.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {region.countries.map((country) => {
                const locationKey = `${region.name}-${country}`;
                return (
                  <button
                    key={country}
                    onClick={() => handleToggleLocation(locationKey)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedLocations.has(locationKey)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {country}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedLocations.size > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              {selectedLocations.size} location{selectedLocations.size > 1 ? 's' : ''} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedLocations).map((location) => (
                <span
                  key={location}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {location.split('-')[1]}
                </span>
              ))}
            </div>
          </div>
      )}
    </div>
  );
}

