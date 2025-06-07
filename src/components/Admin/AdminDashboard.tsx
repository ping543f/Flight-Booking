import React, { useState } from 'react';
import { BarChart3, Users, Plane, Calendar, DollarSign, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import BookingManagement from './BookingManagement';
import RouteManagement from './RouteManagement';
import FinanceManagement from './FinanceManagement';
import DataInspector from './DataInspector';
import { User, Flight, FlightSchedule } from '../../types';
import defaultProfilePic from '../../assets/default-profile.png'; // Add a default profile picture asset

const AdminDashboard: React.FC = () => {
  const { allBookings, getAllUsers, availableFlights, setAvailableFlights, allRoutes, setAllUsers } = useApp();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate totals from finance data
  const totalIncome =
    allBookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0) +
    (typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('expenses') || '[]').filter((e: any) => e.category === 'income').reduce((sum: number, e: any) => sum + e.amount, 0)) : 0);
  const totalExpense = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('expenses') || '[]').filter((e: any) => e.category === 'expense').reduce((sum: number, e: any) => sum + e.amount, 0)) : 0;
  const netRevenue = totalIncome - totalExpense;

  // Use netRevenue for totalRevenue in overview
  const totalRevenue = netRevenue;

  const confirmedBookings = allBookings.filter(b => b.bookingStatus === 'CONFIRMED').length;
  const totalUsers = getAllUsers().filter(u => u.role === 'user').length;
  const totalAdmins = getAllUsers().filter(u => u.role === 'admin').length;
  const totalRoutes = allRoutes.length;

  // --- FLIGHT MANAGEMENT ---
  const FlightManagement = () => {
    const { availableFlights, setAvailableFlights, allRoutes } = useApp();
    const [flights, setFlights] = useState<Flight[]>(availableFlights);
    const [showAddEdit, setShowAddEdit] = useState(false);
    const [editFlight, setEditFlight] = useState<Flight | null>(null);
    const [schedule, setSchedule] = useState<FlightSchedule>({ recurrence: 'weekly', startDate: '', endDate: '', daysOfWeek: [] });
    const [form, setForm] = useState<Flight>({
      id: '',
      origin: '',
      destination: '',
      routeId: '',
      departureDate: '',
      returnDate: '',
      basePrice: 0,
      airline: '',
      flightNumber: '',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      available: true,
      schedule: undefined
    });
    const [feedback, setFeedback] = useState('');

    React.useEffect(() => { setFlights(availableFlights); }, [availableFlights]);

    // Helper to generate flights by schedule
    const generateFlightsBySchedule = (baseFlight: Flight, schedule: FlightSchedule): Flight[] => {
      const flights: Flight[] = [];
      if (!schedule.startDate || !schedule.endDate || !schedule.daysOfWeek || schedule.daysOfWeek.length === 0) return flights;
      const start = new Date(schedule.startDate);
      const end = new Date(schedule.endDate);
      let idSeed = Date.now();
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (schedule.daysOfWeek.includes(d.getDay())) {
          flights.push({
            ...baseFlight,
            id: (idSeed++).toString(),
            departureDate: d.toISOString().slice(0, 10),
            schedule: { ...schedule },
          });
        }
      }
      return flights;
    };

    const openAdd = () => {
      setForm({
        id: '', origin: '', destination: '', routeId: '', departureDate: '', returnDate: '', basePrice: 0, airline: '', flightNumber: '', departureTime: '', arrivalTime: '', duration: '', available: true, schedule: undefined
      });
      setSchedule({ recurrence: 'weekly', startDate: '', endDate: '', daysOfWeek: [] });
      setEditFlight(null);
      setShowAddEdit(true);
    };
    const openEdit = (flight: Flight) => {
      setForm({ ...flight });
      setSchedule(flight.schedule || { recurrence: 'weekly', startDate: flight.departureDate, endDate: flight.departureDate, daysOfWeek: [new Date(flight.departureDate).getDay()] });
      setEditFlight(flight);
      setShowAddEdit(true);
    };

    const handleSave = () => {
      if (!form.routeId || !form.airline || !form.flightNumber || !form.departureTime || !form.arrivalTime || !schedule.startDate || !schedule.endDate || !schedule.daysOfWeek || schedule.daysOfWeek.length === 0) {
        setFeedback('Please fill all required fields.');
        setTimeout(() => setFeedback(''), 2000);
        return;
      }
      // Get route info
      const route = allRoutes.find(r => r.id === form.routeId);
      if (!route) {
        setFeedback('Invalid route.');
        setTimeout(() => setFeedback(''), 2000);
        return;
      }
      // Prepare base flight (no departureDate, will be set per instance)
      const baseFlight: Flight = {
        ...form,
        origin: route.origin,
        destination: route.destination,
        basePrice: route.basePrice,
        departureDate: '',
        id: '',
        schedule: { ...schedule },
      };
      // Generate flights for all scheduled days
      const generatedFlights = generateFlightsBySchedule(baseFlight, schedule);
      setAvailableFlights(prev => [...prev, ...generatedFlights]);
      setFeedback('Flights generated and added!');
      setShowAddEdit(false);
      setTimeout(() => setFeedback(''), 2000);
    };
    const handleDelete = (flight: Flight) => {
      setAvailableFlights(prev => prev.filter(f => f.id !== flight.id));
      setFeedback('Flight deleted!');
      setTimeout(() => setFeedback(''), 2000);
    };

    return (
      <div className="bg-white rounded-xl shadow-md">
        {/* Add/Edit Modal */}
        {showAddEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowAddEdit(false)} aria-label="Close">×</button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{editFlight ? 'Edit Flight' : 'Add Flight'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                  <select
                    value={form.routeId}
                    onChange={e => {
                      const route = allRoutes.find(r => r.id === e.target.value);
                      setForm(f => ({
                        ...f,
                        routeId: e.target.value,
                        origin: route ? route.origin : '',
                        destination: route ? route.destination : '',
                        basePrice: route ? route.basePrice : 0
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select route...</option>
                    {allRoutes.map(route => (
                      <option key={route.id} value={route.id}>{route.origin} → {route.destination}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Airline</label>
                  <input type="text" value={form.airline} onChange={e => setForm({ ...form, airline: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flight Number</label>
                  <input type="text" value={form.flightNumber} onChange={e => setForm({ ...form, flightNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
                  <input type="time" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Time</label>
                  <input type="time" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
                  <input type="checkbox" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Start Date</label>
                  <input type="date" value={schedule.startDate} onChange={e => setSchedule(s => ({ ...s, startDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule End Date</label>
                  <input type="date" value={schedule.endDate} onChange={e => setSchedule(s => ({ ...s, endDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days of Week</label>
                  <div className="flex gap-2 flex-wrap">
                    {[0,1,2,3,4,5,6].map(day => (
                      <label key={day} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={schedule.daysOfWeek?.includes(day) || false}
                          onChange={e => {
                            setSchedule(s => ({
                              ...s,
                              daysOfWeek: e.target.checked
                                ? [...(s.daysOfWeek || []), day]
                                : (s.daysOfWeek || []).filter(d => d !== day)
                            }));
                          }}
                        />
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day]}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowAddEdit(false)}>Cancel</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Flight Management</h3>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium" onClick={openAdd}>Add Flight</button>
        </div>
        {feedback && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-sm font-medium">{feedback}</div>}
        <div className="p-6">
          <div className="space-y-4">
            {flights.length === 0 && <div className="text-gray-500 text-center">No flights found.</div>}
            {flights.map((flight) => (
              <div key={flight.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{flight.origin} → {flight.destination} ({flight.departureDate})</p>
                  <p className="text-sm text-gray-600">{flight.airline} | {flight.flightNumber} | {flight.departureTime} - {flight.arrivalTime} | {flight.duration}</p>
                  <p className="text-xs text-gray-500">Base Price: ৳ {flight.basePrice.toLocaleString()} | {flight.available ? 'Available' : 'Unavailable'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={() => openEdit(flight)}>Edit</button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium" onClick={() => handleDelete(flight)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Booking Management', icon: Calendar },
    { id: 'routes', label: 'Routes & Pricing', icon: Plane },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'datainspector', label: 'Data Inspector', icon: FileText }, // new tab
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <BookingManagement />;
      case 'routes':
        return <RouteManagement />;
      case 'flights':
        return <FlightManagement />;
      case 'finance':
        return <FinanceManagement />;
      case 'users':
        return <UserManagement />;
      case 'datainspector':
        return <DataInspector />;
      default:
        return <OverviewTab />;
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">৳ {totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Bookings</p>
              <p className="text-2xl font-bold text-blue-600">{confirmedBookings}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-purple-600">{totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Admins</p>
              <p className="text-2xl font-bold text-pink-600">{totalAdmins}</p>
            </div>
            <Users className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Routes</p>
              <p className="text-2xl font-bold text-orange-600">{totalRoutes}</p>
            </div>
            <Plane className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Available Flights</p>
              <p className="text-2xl font-bold text-cyan-600">{availableFlights.length}</p>
            </div>
            <Plane className="w-8 h-8 text-cyan-500" />
          </div>
        </div>
      </div>

      {/* Admin Tasks Card (before flight search panel) */}
      {/* <div className="bg-blue-50 rounded-xl p-6 shadow-md mb-6 flex items-center gap-4">
        <Calendar className="w-10 h-10 text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-1">Admin Tasks</h3>
          <p className="text-blue-800">Manage bookings, routes, users, and more from the tabs above.</p>
        </div>
      </div> */}

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {allBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{booking.bookingCode}</p>
                  <p className="text-sm text-gray-600">{booking.userName} - {booking.route}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">৳ {booking.totalPrice.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{booking.bookingStatus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const UserManagement = () => {
    const users = getAllUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddEdit, setShowAddEdit] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [feedback, setFeedback] = useState('');
    const [form, setForm] = useState<{ name: string; email: string; role: User['role']; password: string; profilePic: string }>({ name: '', email: '', role: 'user', password: '', profilePic: '' });
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [resetUser, setResetUser] = useState<User | null>(null);
    const [resetPassword, setResetPassword] = useState('');
    const [resetFeedback, setResetFeedback] = useState('');

    // Filter users by search
    const filteredUsers = users.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add/Edit modal logic
    const openAdd = () => {
      setForm({ name: '', email: '', role: 'user', password: '', profilePic: '' });
      setEditUser(null);
      setShowAddEdit(true);
    };
    const openEdit = (user: User) => {
      setForm({ name: user.name, email: user.email, role: user.role, password: user.password || '', profilePic: user.profilePic || '' });
      setEditUser(user);
      setShowAddEdit(true);
    };
    const handleSave = () => {
      if (!form.name || !form.email) {
        setFeedback('Name and email are required.');
        setTimeout(() => setFeedback(''), 2000);
        return;
      }
      if (editUser) {
        setAllUsers((prev: User[]) => prev.map((u: User) => u.id === editUser.id ? { ...u, ...form } : u));
        setFeedback('User updated!');
      } else {
        setAllUsers((prev: User[]) => [...prev, { id: Date.now().toString(), ...form } as User]);
        setFeedback('User added!');
      }
      setShowAddEdit(false);
      setTimeout(() => setFeedback(''), 2000);
    };
    // Password reset logic
    const openPasswordReset = (user: User) => {
      setResetUser(user);
      setShowPasswordReset(true);
      setResetPassword('');
      setResetFeedback('');
    };
    const handlePasswordReset = () => {
      if (!resetPassword) {
        setResetFeedback('Enter a new password.');
        return;
      }
      setAllUsers((prev: User[]) => prev.map((u: User) => u.id === resetUser?.id ? { ...u, password: resetPassword } : u));
      setShowPasswordReset(false);
      setResetFeedback('');
      setFeedback('Password reset!');
      setTimeout(() => setFeedback(''), 2000);
    };
    // Profile picture upload logic
    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          setForm({ ...form, profilePic: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-md">
        {/* Add/Edit Modal */}
        {showAddEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowAddEdit(false)} aria-label="Close">×</button>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{editUser ? 'Edit User' : 'Add User'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as User['role'] })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Set or change password" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleProfilePicChange} className="w-full" />
                  {form.profilePic && <img src={form.profilePic} alt="Profile" className="w-16 h-16 rounded-full mt-2 object-cover" />}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowAddEdit(false)}>Cancel</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )}
        {/* Password Reset Modal */}
        {showPasswordReset && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowPasswordReset(false)} aria-label="Close">×</button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reset Password</h2>
              <div className="space-y-4">
                <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter new password" />
                {resetFeedback && <div className="text-red-600 text-sm">{resetFeedback}</div>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowPasswordReset(false)}>Cancel</button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handlePasswordReset}>Save</button>
              </div>
            </div>
          </div>
        )}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <div className="flex gap-2 items-center">
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or email..." className="px-3 py-2 border border-gray-300 rounded-lg" />
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium" onClick={openAdd}>Add User</button>
          </div>
        </div>
        {feedback && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-sm font-medium">{feedback}</div>}
        <div className="p-6">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-4">
                  <img src={user.profilePic || defaultProfilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium" onClick={() => openEdit(user)}>Edit</button>
                  <button className="text-yellow-600 hover:text-yellow-800 text-sm font-medium" onClick={() => openPasswordReset(user)}>Reset Password</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your flight booking system</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            {/* Admin Tasks button in navbar */}
            <button
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar className="w-4 h-4" />
              <span>Admin Tasks</span>
            </button>
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;