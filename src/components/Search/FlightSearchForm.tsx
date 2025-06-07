import React, { useState } from 'react';
import { Search, ArrowRightLeft, Calendar, Users } from 'lucide-react';
import { SearchParams } from '../../types';
import { airports } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

interface FlightSearchFormProps {
  onSearch: (params: SearchParams) => void;
}

const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch }) => {
  const { allRoutes } = useApp();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: 'DAC',
    destination: 'KUL',
    departureDate: '2025-06-03',
    returnDate: '2025-06-07',
    travelers: 1,
    tripType: 'roundTrip'
  });

  // Only show available routes
  const availableOrigins = Array.from(new Set(allRoutes.map(r => r.origin)));
  const availableDestinations = (origin: string) =>
    allRoutes.filter(r => r.origin === origin).map(r => r.destination);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const swapAirports = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Type */}
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="tripType"
              value="roundTrip"
              checked={searchParams.tripType === 'roundTrip'}
              onChange={(e) => setSearchParams(prev => ({ ...prev, tripType: e.target.value as 'roundTrip' | 'oneWay' }))}
              className="mr-2"
            />
            <span className="text-sm font-medium">Round Trip</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="tripType"
              value="oneWay"
              checked={searchParams.tripType === 'oneWay'}
              onChange={(e) => setSearchParams(prev => ({ ...prev, tripType: e.target.value as 'roundTrip' | 'oneWay' }))}
              className="mr-2"
            />
            <span className="text-sm font-medium">One Way</span>
          </label>
        </div>

        {/* Origin and Destination */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
            <select
              value={searchParams.origin}
              onChange={e => setSearchParams(prev => ({ ...prev, origin: e.target.value, destination: availableDestinations(e.target.value)[0] || '' }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableOrigins.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swapAirports}
              className="bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
            >
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <select
              value={searchParams.destination}
              onChange={e => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableDestinations(searchParams.origin).map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates and Travelers */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Departure
            </label>
            <input
              type="date"
              value={searchParams.departureDate}
              onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {searchParams.tripType === 'roundTrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Return
              </label>
              <input
                type="date"
                value={searchParams.returnDate || ''}
                onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              Travelers
            </label>
            <select
              value={searchParams.travelers}
              onChange={(e) => setSearchParams(prev => ({ ...prev, travelers: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Traveler' : 'Travelers'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Search className="w-5 h-5" />
              <span>Search Flights</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FlightSearchForm;