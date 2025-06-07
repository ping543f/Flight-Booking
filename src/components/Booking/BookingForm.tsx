import React, { useState } from 'react';
import { Flight, SearchParams } from '../../types';
import { useApp } from '../../context/AppContext';
import { User, CreditCard, Check } from 'lucide-react';

interface BookingFormProps {
  flight: Flight;
  searchParams: SearchParams;
  onBookingComplete: (bookingCode: string) => void;
  onCancel: () => void;
  // Add optional returnFlight for round trip
  returnFlight?: Flight | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  flight, 
  searchParams, 
  onBookingComplete, 
  onCancel, 
  returnFlight 
}) => {
  const { currentUser, createBooking } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: ''
  });
  // Calculate total price for round trip if returnFlight is present
  const totalPrice = returnFlight
    ? Math.round((flight.basePrice + returnFlight.basePrice) * searchParams.travelers)
    : Math.round(flight.basePrice * searchParams.travelers);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const route = searchParams.tripType === 'roundTrip' && returnFlight
      ? `${flight.origin} → ${flight.destination} → ${flight.origin}`
      : `${flight.origin} → ${flight.destination}`;
    const bookingCode = createBooking({
      userId: currentUser?.id || 'guest',
      userName: contactInfo.name,
      userEmail: contactInfo.email,
      flightId: flight.id + (returnFlight ? `,${returnFlight.id}` : ''),
      route,
      departureDate: searchParams.departureDate,
      returnDate: returnFlight ? searchParams.returnDate : undefined,
      travelers: searchParams.travelers,
      totalPrice,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID'
    });
    
    setIsProcessing(false);
    onBookingComplete(bookingCode);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Complete Your Booking</h3>
      
      {/* Flight Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Flight Details</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>Route:</strong> {flight.origin} → {flight.destination}</p>
          <p><strong>Airline:</strong> {flight.airline} ({flight.flightNumber})</p>
          <p><strong>Date:</strong> {searchParams.departureDate}</p>
          {returnFlight && (
            <>
              <hr className="my-2" />
              <p className="font-medium text-gray-900">Return Flight:</p>
              <p><strong>Route:</strong> {returnFlight.origin} → {returnFlight.destination}</p>
              <p><strong>Airline:</strong> {returnFlight.airline} ({returnFlight.flightNumber})</p>
              <p><strong>Date:</strong> {searchParams.returnDate}</p>
            </>
          )}
          <p><strong>Travelers:</strong> {searchParams.travelers}</p>
          <p className="text-lg font-semibold text-blue-600 mt-2">
            Total: ৳ {totalPrice.toLocaleString()}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div>
          <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
            <User className="w-5 h-5 mr-2" />
            Contact Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={contactInfo.name}
                onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h4 className="flex items-center text-lg font-medium text-gray-900 mb-4">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              This is a demo. In production, this would integrate with a payment gateway.
            </p>
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Payment will be processed securely</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Pay ৳ ${totalPrice.toLocaleString()}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;