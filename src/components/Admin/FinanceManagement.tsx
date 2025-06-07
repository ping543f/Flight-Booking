import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, TrendingUp, TrendingDown, FileText, Calendar, Plane } from 'lucide-react';
import { Booking, Flight } from '../../types';

interface Expense {
  id: string;
  type: 'flight' | 'booking' | 'other';
  refId?: string; // flightId or bookingId
  description: string;
  amount: number;
  date: string;
  category: 'income' | 'expense';
}

const initialExpenses: Expense[] = [];

const FinanceManagement: React.FC = () => {
  const { allBookings, availableFlights } = useApp();
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Omit<Expense, 'id'>>({
    type: 'other',
    refId: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    category: 'expense',
  });
  const [feedback, setFeedback] = useState('');
  const [refundPolicy, setRefundPolicy] = useState<'full' | 'partial' | 'custom'>('full');
  const [customRefundAmount, setCustomRefundAmount] = useState<number>(0);

  // Refund modal state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundBooking, setRefundBooking] = useState<Booking | null>(null);
  const [refundType, setRefundType] = useState<'full' | 'partial' | 'custom'>('full');
  const [refundCustomAmount, setRefundCustomAmount] = useState<number>(0);

  React.useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Calculate totals
  const totalIncome =
    allBookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0) +
    expenses.filter(e => e.category === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter(e => e.category === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netRevenue = totalIncome - totalExpense;

  // Add new expense/income
  const handleSave = () => {
    if (!form.description || !form.amount || !form.date) {
      setFeedback('Fill all required fields.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    setExpenses(prev => [
      ...prev,
      { ...form, id: Date.now().toString() }
    ]);
    setShowAdd(false);
    setFeedback('Entry added!');
    setTimeout(() => setFeedback(''), 2000);
  };
  const handleDelete = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setFeedback('Entry deleted!');
    setTimeout(() => setFeedback(''), 2000);
  };

  // Refund management (integrated flow with refund policy)
  const { setAllBookings } = useApp();
  const openRefundModal = (booking: Booking) => {
    setRefundBooking(booking);
    setRefundType('full');
    setRefundCustomAmount(0);
    setShowRefundModal(true);
  };
  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundBooking(null);
  };
  const executeRefund = () => {
    if (!refundBooking) return;
    let refundAmount = refundBooking.totalPrice;
    if (refundType === 'partial') {
      refundAmount = Math.round(refundBooking.totalPrice * 0.5);
    } else if (refundType === 'custom') {
      if (!refundCustomAmount || refundCustomAmount <= 0 || refundCustomAmount > refundBooking.totalPrice) {
        setFeedback('Enter a valid custom refund amount.');
        setTimeout(() => setFeedback(''), 2000);
        return;
      }
      refundAmount = refundCustomAmount;
    }
    setAllBookings(prev => prev.map(b => b.id === refundBooking.id ? { ...b, bookingStatus: 'REFUND-COMPLETE', paymentStatus: 'REFUNDED' } : b));
    setExpenses(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'booking',
        refId: refundBooking.id,
        description: `Refund for booking ${refundBooking.bookingCode}`,
        amount: refundAmount,
        date: new Date().toISOString().slice(0, 10),
        category: 'expense',
      }
    ]);
    setFeedback('Refund processed and logged!');
    setTimeout(() => setFeedback(''), 2000);
    closeRefundModal();
  };

  // Per-flight and per-booking breakdown
  const flightIncome = (flightId: string) =>
    allBookings.filter(b => b.flightId === flightId && b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0);
  const flightExpense = (flightId: string) =>
    expenses.filter(e => e.type === 'flight' && e.refId === flightId && e.category === 'expense').reduce((sum, e) => sum + e.amount, 0);

  // List all refund-capable bookings (PAID, not already refunded)
  const refundCapableBookings = allBookings.filter(b => b.paymentStatus === 'PAID' && b.bookingStatus !== 'REFUND-COMPLETE');

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" /> Finance Management
        </h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium" onClick={() => setShowAdd(true)}>Add Entry</button>
      </div>
      {feedback && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-sm font-medium">{feedback}</div>}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4">
          <TrendingUp className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-xl font-bold text-green-700">৳ {totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 flex items-center gap-4">
          <TrendingDown className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Expense</p>
            <p className="text-xl font-bold text-red-700">৳ {totalExpense.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
          <FileText className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600 mb-1">Net Revenue</p>
            <p className="text-xl font-bold text-blue-700">৳ {netRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
      {/* Add Entry Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowAdd(false)} aria-label="Close">×</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Finance Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Expense['type'] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="other">Other</option>
                  <option value="flight">Flight</option>
                  <option value="booking">Booking</option>
                </select>
              </div>
              {(form.type === 'flight' || form.type === 'booking') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <select value={form.refId} onChange={e => setForm(f => ({ ...f, refId: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">Select...</option>
                    {form.type === 'flight' && availableFlights.map(f => (
                      <option key={f.id} value={f.id}>{f.origin} → {f.destination} ({f.departureDate})</option>
                    ))}
                    {form.type === 'booking' && allBookings.map(b => (
                      <option key={b.id} value={b.id}>{b.bookingCode} - {b.userName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input type="number" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseInt(e.target.value) }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Expense['category'] }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Expense/Income Table */}
      <div className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-2">All Finance Entries</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Amount (৳)</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-4">No entries found.</td></tr>
              )}
              {expenses.map(e => {
                const booking = e.type === 'booking' ? allBookings.find(b => b.id === e.refId) : null;
                const canRefund = booking && booking.paymentStatus === 'PAID';
                return (
                  <tr key={e.id} className="border-b">
                    <td className="px-4 py-2">{e.date}</td>
                    <td className="px-4 py-2">{e.type}</td>
                    <td className="px-4 py-2">
                      {e.type === 'flight' && availableFlights.find(f => f.id === e.refId)?.flightNumber}
                      {e.type === 'booking' && booking?.bookingCode}
                      {e.type === 'other' && '-'}
                    </td>
                    <td className="px-4 py-2">{e.description}</td>
                    <td className="px-4 py-2">{e.category}</td>
                    <td className={`px-4 py-2 text-right font-bold ${e.category === 'income' ? 'text-green-700' : 'text-red-700'}`}>৳ {e.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <button className="text-red-600 hover:text-red-800 text-xs font-medium" onClick={() => handleDelete(e.id)}>Delete</button>
                      {/* Refund button for bookings, only if not already refunded */}
                      {e.type === 'booking' && canRefund && (
                        <button className="ml-2 text-yellow-600 hover:text-yellow-800 text-xs font-medium" onClick={() => openRefundModal(booking)}>Refund</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Per-Flight Income/Expense Breakdown */}
      <div className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-2">Flight-wise Income & Expense</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Flight</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Income (৳)</th>
                <th className="px-4 py-2 text-right">Expense (৳)</th>
                <th className="px-4 py-2 text-right">Net (৳)</th>
              </tr>
            </thead>
            <tbody>
              {availableFlights.map(f => (
                <tr key={f.id} className="border-b">
                  <td className="px-4 py-2">{f.origin} → {f.destination} ({f.flightNumber})</td>
                  <td className="px-4 py-2">{f.departureDate}</td>
                  <td className="px-4 py-2 text-right text-green-700 font-bold">৳ {flightIncome(f.id).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right text-red-700 font-bold">৳ {flightExpense(f.id).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-bold">৳ {(flightIncome(f.id) - flightExpense(f.id)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Refund Capable Bookings Table */}
      {refundCapableBookings.length > 0 && (
        <div className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-2">Refundable Bookings</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-yellow-50">
                  <th className="px-4 py-2 text-left">Booking Code</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Flight</th>
                  <th className="px-4 py-2 text-right">Amount (৳)</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {refundCapableBookings.map(b => (
                  <tr key={b.id} className="border-b">
                    <td className="px-4 py-2">{b.bookingCode}</td>
                    <td className="px-4 py-2">{b.userName}</td>
                    <td className="px-4 py-2">{b.route}</td>
                    <td className="px-4 py-2 text-right font-bold">৳ {b.totalPrice.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                        onClick={() => openRefundModal(b)}
                      >Refund</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Refund Modal */}
      {showRefundModal && refundBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={closeRefundModal} aria-label="Close">×</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Process Refund</h2>
            <div className="mb-4">
              <div className="mb-2 font-medium">Booking: <span className="text-blue-700">{refundBooking.bookingCode}</span></div>
              <div className="mb-2">User: {refundBooking.userName}</div>
              <div className="mb-2">Flight: {refundBooking.route}</div>
              <div className="mb-2">Total Paid: <span className="font-bold">৳ {refundBooking.totalPrice.toLocaleString()}</span></div>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-2">Refund Policy</label>
              <select value={refundType} onChange={e => setRefundType(e.target.value as 'full' | 'partial' | 'custom')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="full">Full Refund</option>
                <option value="partial">Partial Refund (50%)</option>
                <option value="custom">Custom Amount</option>
              </select>
              {refundType === 'custom' && (
                <input
                  type="number"
                  min={0}
                  max={refundBooking.totalPrice}
                  placeholder="Enter refund amount"
                  value={refundCustomAmount}
                  onChange={e => setRefundCustomAmount(Number(e.target.value))}
                  className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full"
                />
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={closeRefundModal}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={executeRefund}>Confirm Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;
