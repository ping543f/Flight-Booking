import React, { useState } from 'react';
import { Calendar, MapPin, CreditCard, Plane } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';

const UserDashboard: React.FC = () => {
  const { userBookings, currentUser, updateBookingStatus, availableFlights } = useApp();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const getStatusColor = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUND-COMPLETE': return 'bg-orange-100 text-orange-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'PAID': return 'text-green-600';
      case 'REFUNDED': return 'text-orange-600';
      case 'PENDING': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setShowDetails(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Booking Code:</span> <span className="font-mono">{selectedBooking.bookingCode}</span></div>
              <div><span className="font-medium">Route:</span> {selectedBooking.route}</div>
              <div><span className="font-medium">Departure:</span> {new Date(selectedBooking.departureDate).toLocaleDateString()}</div>
              {selectedBooking.returnDate && (
                <div><span className="font-medium">Return:</span> {new Date(selectedBooking.returnDate).toLocaleDateString()}</div>
              )}
              <div><span className="font-medium">Travelers:</span> {selectedBooking.travelers}</div>
              <div><span className="font-medium">Total Paid:</span> ৳ {selectedBooking.totalPrice.toLocaleString()}</div>
              <div><span className="font-medium">Status:</span> {selectedBooking.bookingStatus}</div>
              <div><span className="font-medium">Payment Status:</span> {selectedBooking.paymentStatus}</div>
              <div><span className="font-medium">Booked On:</span> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
              <div><span className="font-medium">Name:</span> {selectedBooking.userName}</div>
              <div><span className="font-medium">Email:</span> {selectedBooking.userEmail}</div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
      </div>

      {userBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Start planning your next trip!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {userBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {booking.route}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Booking Code: <span className="font-mono font-medium">{booking.bookingCode}</span>
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 mt-3 lg:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                    {booking.bookingStatus}
                  </span>
                  <span className={`text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Departure</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(booking.departureDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {booking.returnDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Return</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.returnDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Travelers</p>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.travelers} {booking.travelers === 1 ? 'Person' : 'People'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total Paid</p>
                    <p className="text-sm font-medium text-gray-900">
                      ৳ {booking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={() => { setSelectedBooking(booking); setShowDetails(true); }}
                >
                  View Details
                </button>
                {booking.bookingStatus === 'CONFIRMED' && (
                  <>
                    <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                      Modify Booking
                    </button>
                    <button
                      className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                {booking.bookingStatus === 'PENDING' && (
                  <button
                    className="bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Flights Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-blue-600" /> Available Flights
        </h2>
        {availableFlights.length === 0 ? (
          <div className="text-gray-500">No flights available at this time.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableFlights.map(flight => (
              <div key={flight.id} className="bg-white rounded-xl shadow p-5 border border-gray-200 flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">{flight.airline}</span>
                  <span className="text-xs text-gray-500">({flight.flightNumber})</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-medium">Route:</span> {flight.origin} → {flight.destination}
                  </div>
                  <div>
                    <span className="font-medium">Departure:</span> {flight.departureDate}
                  </div>
                  {flight.returnDate && (
                    <div>
                      <span className="font-medium">Return:</span> {flight.returnDate}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Departure Time:</span> {flight.departureTime}
                  </div>
                  <div>
                    <span className="font-medium">Arrival Time:</span> {flight.arrivalTime}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {flight.duration}
                  </div>
                  <div>
                    <span className="font-medium">Base Price:</span> ৳ {flight.basePrice.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2">
                  {flight.available ? (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Available</span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">Not Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;