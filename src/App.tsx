import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Layout/Header';
import LoginModal from './components/Auth/LoginModal';
import FlightSearchForm from './components/Search/FlightSearchForm';
import FlightResults from './components/Search/FlightResults';
import BookingForm from './components/Booking/BookingForm';
import BookingConfirmation from './components/Booking/BookingConfirmation';
import UserDashboard from './components/Dashboard/UserDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { SearchParams, Flight } from './types';
import heroFlight from './assets/hero-flight.jpg';

const AppContent: React.FC = () => {
  const { currentUser, searchFlights } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<'search' | 'results' | 'booking' | 'confirmation' | 'dashboard'>('search');
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  // New state for round trip
  const [selectedReturnFlight, setSelectedReturnFlight] = useState<Flight | null>(null);
  const [isSelectingReturn, setIsSelectingReturn] = useState(false);
  const [returnFlightResults, setReturnFlightResults] = useState<Flight[]>([]);
  const [bookingCode, setBookingCode] = useState<string>('');
  // New state for search options
  const [showAllDates, setShowAllDates] = useState(false);
  const [showFromDate, setShowFromDate] = useState(true);

  const handleSearch = (params: SearchParams) => {
    setSelectedFlight(null);
    setSelectedReturnFlight(null);
    setIsSelectingReturn(false);
    setSearchParams(params);
    setShowAllDates(false); // reset to default on new search
    setShowFromDate(true);
    // Default: show flights on or after selected date
    const results = searchFlights({
      ...params,
      departureDate: params.departureDate,
    }, { fromDate: true });
    setSearchResults(results);
    setCurrentView('results');
  };

  // Helper to update search results based on toggle
  const updateSearchResults = (allDates: boolean) => {
    if (!searchParams) return;
    if (allDates) {
      setSearchResults(searchFlights(searchParams, { allDates: true }));
      setShowAllDates(true);
      setShowFromDate(false);
    } else {
      setSearchResults(searchFlights(searchParams, { fromDate: true }));
      setShowAllDates(false);
      setShowFromDate(true);
    }
  };

  // Modified flight select logic for round trip
  const handleFlightSelect = (flight: Flight) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    // Round trip: select departure first, then return
    if (searchParams?.tripType === 'roundTrip') {
      if (!isSelectingReturn) {
        // User is selecting departure flight
        setSelectedFlight(flight);
        setIsSelectingReturn(true);
        // Prepare return flight search: swap origin/destination, use returnDate
        const returnResults = searchFlights({
          origin: flight.destination, // swap
          destination: flight.origin, // swap
          departureDate: searchParams.returnDate || '',
          returnDate: '',
          travelers: searchParams.travelers,
          tripType: 'oneWay',
        }, { fromDate: true });
        setReturnFlightResults(returnResults);
      } else {
        // User is selecting return flight
        setSelectedReturnFlight(flight);
        setCurrentView('booking');
      }
    } else {
      // One way
      setSelectedFlight(flight);
      setCurrentView('booking');
    }
  };

  const handleBookingComplete = (code: string) => {
    setBookingCode(code);
    setCurrentView('confirmation');
  };

  const handleNewSearch = () => {
    setCurrentView('search');
    setSelectedFlight(null);
    setSelectedReturnFlight(null);
    setIsSelectingReturn(false);
    setSearchParams(null);
    setSearchResults([]);
    setReturnFlightResults([]);
  };

  const renderContent = () => {
    if (currentUser?.role === 'admin' && currentView === 'dashboard') {
      return <AdminDashboard />;
    }
    if (currentUser && currentView === 'dashboard') {
      return <UserDashboard />;
    }
    switch (currentView) {
      case 'results':
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('search')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
              >
                ← Modify Search
              </button>
              <FlightSearchForm onSearch={handleSearch} />
            </div>
            {/* Toggle for search results */}
            <div className="mb-4 flex gap-2 items-center">
              <span className="text-sm font-medium">Show:</span>
              <button
                className={`px-3 py-1 rounded ${showFromDate ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} text-sm font-medium`}
                onClick={() => updateSearchResults(false)}
                disabled={showFromDate}
              >
                Flights On or After Selected Date
              </button>
              <button
                className={`px-3 py-1 rounded ${showAllDates ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} text-sm font-medium`}
                onClick={() => updateSearchResults(true)}
                disabled={showAllDates}
              >
                All Flights for Route
              </button>
            </div>
            {/* Show both flights if both are selected (round trip) */}
            {searchParams?.tripType === 'roundTrip' && selectedFlight && selectedReturnFlight ? (
              <FlightResults
                flights={[]}
                searchParams={searchParams}
                onSelectFlight={handleFlightSelect}
                departureFlight={selectedFlight}
                returnFlight={selectedReturnFlight}
              />
            ) : !isSelectingReturn ? (
              <FlightResults
                flights={searchResults}
                searchParams={searchParams!}
                onSelectFlight={handleFlightSelect}
                disableSelection={false}
                selectionMessage={undefined}
                departureFlight={searchParams?.tripType === 'roundTrip' && selectedFlight ? selectedFlight : undefined}
                returnFlight={undefined}
              />
            ) : (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-700">Selected Departure Flight:</span>
                  <span className="ml-2">{selectedFlight?.airline} {selectedFlight?.flightNumber} ({selectedFlight?.departureDate})</span>
                </div>
                <h4 className="text-lg font-semibold mb-2">Select Return Flight</h4>
                <FlightResults
                  flights={returnFlightResults}
                  searchParams={{
                    origin: selectedFlight?.destination || '',
                    destination: selectedFlight?.origin || '',
                    departureDate: searchParams!.returnDate || '',
                    returnDate: '',
                    travelers: searchParams!.travelers,
                    tripType: 'oneWay',
                  }}
                  onSelectFlight={handleFlightSelect}
                  disableSelection={!selectedFlight}
                  selectionMessage={!selectedFlight ? 'Please select a departure flight first before choosing a return flight.' : undefined}
                  departureFlight={selectedFlight || undefined}
                  returnFlight={undefined}
                />
              </div>
            )}
          </div>
        );
      case 'booking':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <BookingForm
              flight={selectedFlight!}
              searchParams={searchParams!}
              onBookingComplete={handleBookingComplete}
              onCancel={() => setCurrentView('results')}
              // Pass return flight if round trip
              returnFlight={searchParams?.tripType === 'roundTrip' ? selectedReturnFlight : undefined}
            />
          </div>
        );
      case 'confirmation':
        return (
          <div className="max-w-2xl mx-auto p-6">
            <BookingConfirmation
              bookingCode={bookingCode}
              onNewSearch={handleNewSearch}
            />
          </div>
        );
      default:
        return (
          <>
            {/* Hero Section with Gradient and Graphics */}
            <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-sky-200 to-white opacity-90 z-0" />
              {/* Decorative Circles */}
              <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-2xl z-0 animate-pulse" />
              <div className="absolute -bottom-24 right-0 w-80 h-80 bg-sky-300 rounded-full opacity-20 blur-2xl z-0 animate-pulse" />
              {/* Hero Section */}
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto p-6 gap-10">
                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 drop-shadow-lg">
                    Discover the World with <span className="text-blue-600">SkyBook</span>
                  </h1>
                  <p className="text-2xl text-gray-700 mb-8 font-medium max-w-xl mx-auto md:mx-0">
                    Book flights to your favorite destinations with ease, comfort, and the best prices. Start your journey now!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                    <a href="#search" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200">
                      Start Searching
                    </a>
                    <span className="text-gray-500 text-sm">No account needed to search flights</span>
                  </div>
                </div>
                {/* Hero Image */}
                <div className="flex-1 flex items-center justify-center">
                  <img
                    src={heroFlight}
                    alt="Airplane flying in the sky"
                    className="w-full max-w-md rounded-3xl shadow-2xl border-4 border-white object-cover animate-fade-in"
                    style={{ minHeight: 280 }}
                  />
                </div>
              </div>
            </div>
            {/* Flight Search Form Section (after graphics) */}
            <div id="search" className="relative z-20 w-full max-w-2xl mx-auto -mt-12 mb-12">
              <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-8 backdrop-blur-md border border-blue-100">
                <FlightSearchForm onSearch={handleSearch} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onShowLogin={() => setShowLogin(true)}
        actions={currentUser && (
          <button
            onClick={() => setCurrentView('dashboard')}
            className="ml-4 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View My Bookings
          </button>
        )}
      />
      <main className="pt-8 pb-16">
        {renderContent()}
      </main>
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;