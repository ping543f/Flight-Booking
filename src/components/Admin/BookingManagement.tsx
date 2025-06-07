import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';

const BookingManagement: React.FC = () => {
  const { allBookings, updateBookingStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<string>('');
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [localBookings, setLocalBookings] = useState<Booking[]>(allBookings);

  // Keep localBookings in sync with allBookings
  React.useEffect(() => { setLocalBookings(allBookings); }, [allBookings]);

  const filteredBookings = localBookings.filter(booking => {
    const matchesSearch = booking.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Booking['bookingStatus']) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUND-COMPLETE': return 'bg-orange-100 text-orange-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: Booking['bookingStatus']) => {
    updateBookingStatus(bookingId, newStatus);
    setFeedback('Booking status updated!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleExport = () => {
    if (filteredBookings.length === 0) {
      setFeedback('No bookings to export.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    const headers = ['Booking Code','User Name','User Email','Route','Departure Date','Return Date','Travelers','Total Price','Booking Status','Payment Status','Created At'];
    const rows = filteredBookings.map(b => [
      b.bookingCode,
      b.userName,
      b.userEmail,
      b.route,
      b.departureDate,
      b.returnDate || '',
      b.travelers,
      b.totalPrice,
      b.bookingStatus,
      b.paymentStatus,
      b.createdAt
    ]);
    const csv = [headers, ...rows].map(r => r.map(String).map(x => '"'+x.replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SkyBook-Bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('Bookings exported!');
    setTimeout(() => setFeedback(''), 2000);
  };

  // View modal logic
  const openView = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowView(true);
  };

  // Edit modal logic
  const openEdit = (booking: Booking) => {
    setEditBooking({ ...booking });
    setShowEdit(true);
  };
  const handleEditSave = () => {
    if (editBooking) {
      updateBookingStatus(editBooking.id, editBooking.bookingStatus);
      setFeedback('Booking updated!');
      setShowEdit(false);
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  // Delete logic
  const openDelete = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDelete(true);
  };
  const handleDelete = () => {
    if (selectedBooking) {
      setLocalBookings(prev => prev.filter(b => b.id !== selectedBooking.id));
      setFeedback('Booking deleted!');
      setShowDelete(false);
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Modal */}
      {showView && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowView(false)} aria-label="Close">×</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Booking Code:</span> <span className="font-mono">{selectedBooking.bookingCode}</span></div>
              <div><span className="font-medium">Route:</span> {selectedBooking.route}</div>
              <div><span className="font-medium">Departure:</span> {new Date(selectedBooking.departureDate).toLocaleDateString()}</div>
              {selectedBooking.returnDate && (<div><span className="font-medium">Return:</span> {new Date(selectedBooking.returnDate).toLocaleDateString()}</div>)}
              <div><span className="font-medium">Travelers:</span> {selectedBooking.travelers}</div>
              <div><span className="font-medium">Total Paid:</span> ৳ {selectedBooking.totalPrice.toLocaleString()}</div>
              <div><span className="font-medium">Status:</span> {selectedBooking.bookingStatus}</div>
              <div><span className="font-medium">Payment Status:</span> {selectedBooking.paymentStatus}</div>
              <div><span className="font-medium">Booked On:</span> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
              <div><span className="font-medium">Name:</span> {selectedBooking.userName}</div>
              <div><span className="font-medium">Email:</span> {selectedBooking.userEmail}</div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium" onClick={() => setShowView(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEdit && editBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowEdit(false)} aria-label="Close">×</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Booking</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Status</label>
                <select value={editBooking.bookingStatus} onChange={e => setEditBooking({ ...editBooking, bookingStatus: e.target.value as Booking['bookingStatus'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REFUND-COMPLETE">REFUND-COMPLETE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                <input type="number" min={1} value={editBooking.travelers} onChange={e => setEditBooking({ ...editBooking, travelers: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                <input type="number" min={0} value={editBooking.totalPrice} onChange={e => setEditBooking({ ...editBooking, totalPrice: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleEditSave}>Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {showDelete && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowDelete(false)} aria-label="Close">×</button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Booking</h2>
            <p className="mb-6">Are you sure you want to delete booking <span className="font-mono font-semibold">{selectedBooking.bookingCode}</span>?</p>
            <div className="flex justify-end gap-2">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">Booking Management</h2>
        <button onClick={handleExport} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Bookings</span>
        </button>
      </div>
      {feedback && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-sm font-medium">{feedback}</div>
      )}
      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by booking code, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUND-COMPLETE">Refund Complete</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route & Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.bookingCode}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.userName}</p>
                      <p className="text-sm text-gray-500">{booking.userEmail}</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.route}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.departureDate).toLocaleDateString()}
                        {booking.returnDate && ` - ${new Date(booking.returnDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">৳ {booking.totalPrice.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{booking.travelers} travelers</p>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.bookingStatus}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value as Booking['bookingStatus'])}
                      className={`text-xs font-medium px-3 py-1 rounded-full border-0 ${getStatusColor(booking.bookingStatus)}`}
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PENDING">PENDING</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="REFUND-COMPLETE">REFUND-COMPLETE</option>
                    </select>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" onClick={() => openView(booking)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" onClick={() => openEdit(booking)}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" onClick={() => openDelete(booking)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No bookings found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;