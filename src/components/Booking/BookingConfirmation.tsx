import React from 'react';
import { CheckCircle, Download, Share2, Calendar, MapPin, Users } from 'lucide-react';

interface BookingConfirmationProps {
  bookingCode: string;
  onNewSearch: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
  bookingCode, 
  onNewSearch 
}) => {
  // Download ticket as a simple HTML file
  const handleDownload = () => {
    const ticketHtml = `<!DOCTYPE html><html><head><title>Flight Ticket</title></head><body><h2>Flight Ticket</h2><p>Booking Code: <b>${bookingCode}</b></p><p>Thank you for booking with SkyBook!</p></body></html>`;
    const blob = new Blob([ticketHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkyBook-Ticket-${bookingCode}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600">Your flight has been successfully booked</p>
      </div>

      <div className="bg-green-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Code</h3>
        <p className="text-2xl font-mono font-bold text-green-600 tracking-wider">
          {bookingCode}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Please save this code for your records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Check-in</p>
          <p className="text-xs text-gray-600">24 hours before departure</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Airport</p>
          <p className="text-xs text-gray-600">Arrive 2 hours early</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Support</p>
          <p className="text-xs text-gray-600">24/7 customer service</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
          <span>Download Ticket</span>
        </button>
        
        <button className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
          <Share2 className="w-4 h-4" />
          <span>Share Booking</span>
        </button>
        
        <button
          onClick={onNewSearch}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Book Another Flight
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          A confirmation email has been sent to your registered email address.
          Please check your inbox for detailed flight information.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;