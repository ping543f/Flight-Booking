import React from 'react';
import { Plane, Clock, Calendar } from 'lucide-react';
import { Flight, SearchParams } from '../../types';
import { useApp } from '../../context/AppContext';

interface FlightResultsProps {
  flights: Flight[];
  searchParams: SearchParams;
  onSelectFlight: (flight: Flight) => void;
  disableSelection?: boolean;
  selectionMessage?: string;
  // Optionally, for round trip display
  departureFlight?: Flight;
  returnFlight?: Flight;
}

const FlightResults: React.FC<FlightResultsProps> = ({ flights, searchParams, onSelectFlight, disableSelection = false, selectionMessage, departureFlight, returnFlight }) => {
  const { getAllFlights } = useApp();

  // Only show flights for the selected date (not after)
  const flightsForSelectedDay = flights.filter(f => f.departureDate === searchParams.departureDate);

  // Find all available flights for the route (for next available suggestion)
  const allRouteFlights: Flight[] = getAllFlights().filter((f: Flight) =>
    f.origin === searchParams.origin &&
    f.destination === searchParams.destination &&
    f.available
  );

  // Find the next available flight after the selected date
  const nextAvailableFlight = allRouteFlights
    .filter(f => new Date(f.departureDate) > new Date(searchParams.departureDate))
    .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())[0];

  const formatCurrency = (amount: number) => `৳ ${amount.toLocaleString()}`;

  const getDynamicPrice = (flight: Flight) => {
    // Simulate dynamic pricing based on date and demand
    const basePrice = flight.basePrice;
    const date = new Date(searchParams.departureDate);
    const month = date.getMonth();
    
    // Peak season multiplier (December)
    let multiplier = month === 11 ? 1.8 : 1.0;
    
    // Weekend premium
    if (date.getDay() === 0 || date.getDay() === 6) {
      multiplier *= 1.1;
    }
    
    // Early booking discount
    const daysAhead = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysAhead > 30) {
      multiplier *= 0.9;
    }
    
    return Math.round(basePrice * multiplier * searchParams.travelers);
  };

  // Calculate duration from departure and arrival time (HH:mm)
  const calculateDuration = (departure: string, arrival: string) => {
    const [dh, dm] = departure.split(':').map(Number);
    const [ah, am] = arrival.split(':').map(Number);
    let dep = dh * 60 + dm;
    let arr = ah * 60 + am;
    if (arr < dep) arr += 24 * 60; // handle overnight flights
    const diff = arr - dep;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  // Track selected flight for highlight
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Reset highlight when flights change
    setSelectedId(null);
  }, [flights]);

  // Helper to render a single flight card
  const renderFlightCard = (flight: Flight, label?: string, isSelected?: boolean) => {
    const dynamicPrice = getDynamicPrice(flight);
    const duration = calculateDuration(flight.departureTime, flight.arrivalTime);
    return (
      <div
        key={flight.id}
        className={`bg-white rounded-xl shadow-md transition-shadow p-6 border-2 mb-4 relative ${isSelected ? 'border-blue-600 animate-pulse ring-4 ring-blue-100' : 'border-gray-200 hover:shadow-lg'} ${disableSelection ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => {
          if (!disableSelection) {
            setSelectedId(flight.id);
            onSelectFlight(flight);
          }
        }}
        style={isSelected ? { zIndex: 2 } : {}}
      >
        {label && <div className="mb-2 text-xs font-semibold text-blue-700 uppercase">{label}</div>}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Plane className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{flight.airline}</h4>
                <p className="text-sm text-gray-600">{flight.flightNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Route</p>
                <p className="font-medium text-gray-900">{flight.origin} → {flight.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-1" />Duration</p>
                <p className="font-medium text-gray-900">{duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center"><Calendar className="w-4 h-4 mr-1" />Date</p>
                <p className="font-medium text-gray-900 text-lg">{flight.departureDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center">Time</p>
                <p className="font-medium text-gray-900">{flight.departureTime} - {flight.arrivalTime}</p>
              </div>
            </div>
          </div>
          <div className="lg:text-right space-y-3">
            <div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(dynamicPrice)}</p>
              <p className="text-sm text-gray-500">{searchParams.travelers} {searchParams.travelers === 1 ? 'traveler' : 'travelers'}</p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                if (!disableSelection) {
                  setSelectedId(flight.id);
                  onSelectFlight(flight);
                }
              }}
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors ${disableSelection ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} ${isSelected ? 'scale-110' : ''}`}
              disabled={disableSelection}
              style={isSelected ? { fontSize: '1.2rem', fontWeight: 700 } : {}}
            >
              Select Flight
            </button>
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-4 text-blue-700 text-lg font-bold animate-bounce">Selected</div>
        )}
      </div>
    );
  };

  // Guidance message for round trip selection
  const showGuidance = !departureFlight && searchParams.tripType === 'roundTrip';

  // If both departure and return flight are provided, show both in order
  if (departureFlight && returnFlight) {
    return (
      <div className="space-y-4">
        <div className="mb-6 text-center">
          <span className="text-2xl font-bold text-blue-700">Your Selected Flights</span>
        </div>
        {renderFlightCard(departureFlight, 'Departure Flight', true)}
        {renderFlightCard(returnFlight, 'Return Flight', true)}
      </div>
    );
  }

  if (flightsForSelectedDay.length === 0) {
    return (
      <div className="text-center py-12">
        <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No flights found for {searchParams.departureDate}</h3>
        {nextAvailableFlight ? (
          <p className="text-gray-500">Next available flight: <span className="font-semibold">{nextAvailableFlight.airline} {nextAvailableFlight.flightNumber}</span> on <span className="font-semibold">{nextAvailableFlight.departureDate}</span> at <span className="font-semibold">{nextAvailableFlight.departureTime}</span></p>
        ) : (
          <p className="text-gray-500">No upcoming flights available for this route.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showGuidance && (
        <div className="mb-6 text-center animate-pulse">
          <span className="text-2xl font-bold text-blue-700">Select your Departure Flight first, then Return Flight</span>
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Available Flights ({flightsForSelectedDay.length})
      </h3>
      {disableSelection && selectionMessage && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded text-center font-medium">
          {selectionMessage}
        </div>
      )}
      {flightsForSelectedDay.map((flight: Flight) => renderFlightCard(flight, undefined, selectedId === flight.id))}
    </div>
  );
};

export default FlightResults;