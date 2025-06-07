import React, { useState } from 'react';
import { Plus, Edit, Save, X, Plane } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Route } from '../../types';
import { airports as initialAirports } from '../../data/mockData';

const RouteManagement: React.FC = () => {
  const { allRoutes, setAllRoutes } = useApp();
  const [editingRoute, setEditingRoute] = useState<string | null>(null);
  const [editedRoute, setEditedRoute] = useState<Route | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [newRoute, setNewRoute] = useState<Route>({
    id: '',
    origin: '',
    destination: '',
    basePrice: 0,
    priceMultipliers: {}
  });
  const [airports, setAirports] = useState(initialAirports);
  const [newAirportCode, setNewAirportCode] = useState('');
  const [newAirportCity, setNewAirportCity] = useState('');
  const [airportFeedback, setAirportFeedback] = useState('');
  const [selectedKnownAirport, setSelectedKnownAirport] = useState('');

  const handleEditStart = (route: Route) => {
    setEditingRoute(route.id);
    setEditedRoute({ ...route });
  };

  const handleEditCancel = () => {
    setEditingRoute(null);
    setEditedRoute(null);
  };

  const handleEditSave = () => {
    if (editedRoute) {
      setAllRoutes(prev => prev.map(r => r.id === editedRoute.id ? editedRoute : r));
      setEditingRoute(null);
      setEditedRoute(null);
      setFeedback('Route updated!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  // Helper to add a range of dates to priceMultipliers
  const addDateRangeToMultipliers = (route: Route, start: string, end: string, multiplier: number) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const multipliers = { ...route.priceMultipliers };
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      multipliers[d.toISOString().slice(0, 10)] = multiplier;
    }
    return multipliers;
  };

  const handleAddNew = () => {
    setNewRoute({
      id: Date.now().toString(),
      origin: '',
      destination: '',
      basePrice: 0,
      priceMultipliers: { [new Date().toISOString().slice(0,10)]: 1.0 }
    });
    setShowAdd(true);
  };

  const handleAddSave = () => {
    if (!newRoute.origin || !newRoute.destination || newRoute.basePrice <= 0) {
      setFeedback('Please fill all fields.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    setAllRoutes(prev => [...prev, newRoute]);
    setShowAdd(false);
    setFeedback('New route added!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleAddAirport = () => {
    if (!newAirportCode || !newAirportCity) {
      setAirportFeedback('Please enter both code and city.');
      setTimeout(() => setAirportFeedback(''), 2000);
      return;
    }
    if (airports.some(a => a.code === newAirportCode)) {
      setAirportFeedback('Airport code already exists.');
      setTimeout(() => setAirportFeedback(''), 2000);
      return;
    }
    setAirports(prev => [...prev, { code: newAirportCode, name: newAirportCity + ' Airport', city: newAirportCity }]);
    setAirportFeedback('Airport added!');
    setNewAirportCode('');
    setNewAirportCity('');
    setTimeout(() => setAirportFeedback(''), 2000);
  };

  const handleAddKnownAirport = () => {
    const found = allKnownAirports.find(a => a.code === selectedKnownAirport);
    if (!found) return;
    if (airports.some(a => a.code === found.code)) {
      setAirportFeedback('Airport code already exists.');
      setTimeout(() => setAirportFeedback(''), 2000);
      return;
    }
    setAirports(prev => [...prev, { code: found.code, name: found.name, city: found.city }]);
    setAirportFeedback('Airport added!');
    setSelectedKnownAirport('');
    setTimeout(() => setAirportFeedback(''), 2000);
  };

  // Edit modal range state
  const [editRangeStart, setEditRangeStart] = useState('');
  const [editRangeEnd, setEditRangeEnd] = useState('');
  const [editRangeMultiplier, setEditRangeMultiplier] = useState(1.0);
  // Add modal range state
  const [addRangeStart, setAddRangeStart] = useState('');
  const [addRangeEnd, setAddRangeEnd] = useState('');
  const [addRangeMultiplier, setAddRangeMultiplier] = useState(1.0);

  const allKnownAirports = [
    { code: 'DAC', city: 'Dhaka', name: 'Hazrat Shahjalal International Airport' },
    { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport' },
    { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport' },
    { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport' },
    { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport' },
    { code: 'CGP', city: 'Chittagong', name: 'Shah Amanat International Airport' },
    { code: 'CXB', city: "Cox's Bazar", name: "Cox's Bazar Airport" },
    { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport' },
    { code: 'LHR', city: 'London', name: 'Heathrow Airport' },
    { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport' },
    { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport' },
    { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport' },
    { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport' },
    { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport' },
    { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport' },
    { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport' },
    { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport' },
    { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport' },
    { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport' },
    { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport' }
  ];

  // Route delete logic
  const handleDeleteRoute = (routeId: string) => {
    setAllRoutes(prev => prev.filter(r => r.id !== routeId));
    setFeedback('Route deleted!');
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Add Airport Section */}
      <div className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 max-w-xl">
        <div className="flex gap-2 items-center">
          <select value={selectedKnownAirport} onChange={e => setSelectedKnownAirport(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg w-64">
            <option value="">Select from known airports</option>
            {allKnownAirports.filter(a => !airports.some(ap => ap.code === a.code)).map(a => (
              <option key={a.code} value={a.code}>{a.code} - {a.city} ({a.name})</option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1" onClick={handleAddKnownAirport} disabled={!selectedKnownAirport}>
            <Plus className="w-4 h-4" /> Add Selected
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <input type="text" value={newAirportCode} onChange={e => setNewAirportCode(e.target.value.toUpperCase())} placeholder="Code (e.g. JFK)" className="px-3 py-2 border border-gray-300 rounded-lg w-24" maxLength={4} />
          <input type="text" value={newAirportCity} onChange={e => setNewAirportCity(e.target.value)} placeholder="City" className="px-3 py-2 border border-gray-300 rounded-lg w-40" />
          <button className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1" onClick={handleAddAirport}>
            <Plus className="w-4 h-4" /> Add Airport
          </button>
        </div>
        {airportFeedback && <div className="text-xs text-green-700 ml-2">{airportFeedback}</div>}
      </div>

      {/* Add New Route Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl" onClick={() => setShowAdd(false)} aria-label="Close">×</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Route</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <select value={newRoute.origin} onChange={e => setNewRoute({ ...newRoute, origin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select Origin</option>
                  {airports.map(a => <option key={a.code} value={a.code}>{a.code} - {a.city}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <select value={newRoute.destination} onChange={e => setNewRoute({ ...newRoute, destination: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select Destination</option>
                  {airports.map(a => <option key={a.code} value={a.code}>{a.code} - {a.city}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (৳)</label>
                <input type="number" min={0} value={newRoute.basePrice} onChange={e => setNewRoute({ ...newRoute, basePrice: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seasonal Price Multipliers</label>
                <div className="space-y-2">
                  {/* Add single date */}
                  <button className="text-blue-600 mt-2" onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + Object.keys(newRoute.priceMultipliers).length + 1);
                    setNewRoute({ ...newRoute, priceMultipliers: { ...newRoute.priceMultipliers, [d.toISOString().slice(0,10)]: 1.0 } });
                  }}>+ Add Date</button>
                  {/* Add date range */}
                  <div className="flex gap-2 items-center mt-2">
                    <input type="date" value={addRangeStart} onChange={e => setAddRangeStart(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <span>to</span>
                    <input type="date" value={addRangeEnd} onChange={e => setAddRangeEnd(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="number" step="0.1" value={addRangeMultiplier} onChange={e => setAddRangeMultiplier(parseFloat(e.target.value))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" />
                    <button className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={() => {
                      if (addRangeStart && addRangeEnd && addRangeMultiplier > 0) {
                        setNewRoute({ ...newRoute, priceMultipliers: addDateRangeToMultipliers(newRoute, addRangeStart, addRangeEnd, addRangeMultiplier) });
                        setAddRangeStart(''); setAddRangeEnd(''); setAddRangeMultiplier(1.0);
                      }
                    }}>Add Range</button>
                  </div>
                  {/* List and remove multipliers */}
                  {Object.entries(newRoute.priceMultipliers).map(([date, multiplier]) => (
                    <div key={date} className="flex items-center gap-2">
                      <input type="date" value={date} readOnly className="px-3 py-2 border border-gray-300 rounded-lg" />
                      <span className="text-sm text-gray-600">×</span>
                      <input type="number" step="0.1" value={multiplier} onChange={e => setNewRoute({ ...newRoute, priceMultipliers: { ...newRoute.priceMultipliers, [date]: parseFloat(e.target.value) } })} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" />
                      <button className="text-red-500 ml-2" onClick={() => {
                        const newMultipliers = { ...newRoute.priceMultipliers };
                        delete newMultipliers[date];
                        setNewRoute({ ...newRoute, priceMultipliers: newMultipliers });
                      }}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium" onClick={handleAddSave}>Save</button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Route & Pricing Management</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2" onClick={handleAddNew}>
          <Plus className="w-4 h-4" />
          <span>Add New Route</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2 text-sm font-medium">{feedback}</div>
      )}

      {/* Routes List */}
      <div className="space-y-4">
        {allRoutes.map((route) => (
          <div key={route.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {route.origin} → {route.destination}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {airports.find(a => a.code === route.origin)?.city} to {airports.find(a => a.code === route.destination)?.city}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {editingRoute === route.id ? (
                  <>
                    <button
                      onClick={handleEditSave}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-gray-400 text-white p-2 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEditStart(route)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRoute(route.id)}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingRoute === route.id && editedRoute ? (
              <div className="space-y-4 border-t pt-4">
                {/* Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (৳)
                  </label>
                  <input
                    type="number"
                    value={editedRoute.basePrice}
                    onChange={(e) => setEditedRoute({ ...editedRoute, basePrice: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Price Multipliers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Seasonal Price Multipliers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(editedRoute.priceMultipliers).map(([date, multiplier]) => (
                      <div key={date} className="flex items-center space-x-3">
                        <input
                          type="date"
                          value={date}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          readOnly
                        />
                        <span className="text-sm text-gray-600">×</span>
                        <input
                          type="number"
                          step="0.1"
                          value={multiplier}
                          onChange={(e) => setEditedRoute({ ...editedRoute, priceMultipliers: { ...editedRoute.priceMultipliers, [date]: parseFloat(e.target.value) } })}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-sm text-gray-600">=</span>
                        <span className="text-sm font-medium text-gray-900">
                          ৳ {Math.round(editedRoute.basePrice * multiplier).toLocaleString()}
                        </span>
                        <button className="text-red-500 ml-2" onClick={() => {
                          const newMultipliers = { ...editedRoute.priceMultipliers };
                          delete newMultipliers[date];
                          setEditedRoute({ ...editedRoute, priceMultipliers: newMultipliers });
                        }}>Remove</button>
                      </div>
                    ))}
                  </div>
                  {/* Add single date */}
                  <button className="text-blue-600 mt-2" onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + Object.keys(editedRoute.priceMultipliers).length + 1);
                    setEditedRoute({ ...editedRoute, priceMultipliers: { ...editedRoute.priceMultipliers, [d.toISOString().slice(0,10)]: 1.0 } });
                  }}>+ Add Date</button>
                  {/* Add date range */}
                  <div className="flex gap-2 items-center mt-2">
                    <input type="date" value={editRangeStart} onChange={e => setEditRangeStart(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <span>to</span>
                    <input type="date" value={editRangeEnd} onChange={e => setEditRangeEnd(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg" />
                    <input type="number" step="0.1" value={editRangeMultiplier} onChange={e => setEditRangeMultiplier(parseFloat(e.target.value))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" />
                    <button className="bg-blue-600 text-white px-3 py-2 rounded-lg" onClick={() => {
                      if (editRangeStart && editRangeEnd && editRangeMultiplier > 0) {
                        setEditedRoute({ ...editedRoute, priceMultipliers: addDateRangeToMultipliers(editedRoute, editRangeStart, editRangeEnd, editRangeMultiplier) });
                        setEditRangeStart(''); setEditRangeEnd(''); setEditRangeMultiplier(1.0);
                      }
                    }}>Add Range</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                <div>
                  <p className="text-sm text-gray-600">Base Price</p>
                  <p className="text-lg font-semibold text-gray-900">৳ {route.basePrice.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Peak Season Price</p>
                  <p className="text-lg font-semibold text-orange-600">
                    ৳ {Math.round(route.basePrice * Math.max(...Object.values(route.priceMultipliers))).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Price Variations</p>
                  <p className="text-sm text-gray-900">
                    {Object.keys(route.priceMultipliers).length} seasonal rates
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteManagement;