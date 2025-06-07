import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

function toCSV(data: any[], columns: string[]): string {
  const header = columns.join(',');
  const rows = data.map(row => columns.map(col => JSON.stringify(row[col] ?? '')).join(','));
  return [header, ...rows].join('\r\n');
}

const DataInspector: React.FC = () => {
  const { allRoutes, availableFlights, allBookings, getAllUsers } = useApp();
  const [view, setView] = useState<{ [key: string]: 'json' | 'table' }>({
    routes: 'json',
    flights: 'json',
    bookings: 'json',
    users: 'json',
  });

  // Export helpers
  const handleExport = (data: any[], type: string, format: 'json' | 'csv') => {
    let content = '';
    let filename = `${type}-export.${format}`;
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
    } else {
      // CSV: flatten keys for each type
      let columns: string[] = [];
      if (type === 'routes') columns = ['id','origin','destination','basePrice'];
      if (type === 'flights') columns = ['id','origin','destination','flightNumber','departureDate','departureTime','arrivalTime','available'];
      if (type === 'bookings') columns = ['id','bookingCode','userName','userEmail','route','departureDate','returnDate','travelers','totalPrice','bookingStatus','paymentStatus'];
      if (type === 'users') columns = ['id','name','email','role'];
      content = toCSV(data, columns);
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">System Data Inspector</h2>
      {/* ROUTES */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">Routes
          <button className={`ml-2 px-2 py-1 rounded text-xs ${view.routes==='json'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,routes:'json'}))}>JSON</button>
          <button className={`ml-1 px-2 py-1 rounded text-xs ${view.routes==='table'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,routes:'table'}))}>Table</button>
          <button className="ml-2 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(allRoutes,'routes','json')}>Export JSON</button>
          <button className="ml-1 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(allRoutes,'routes','csv')}>Export CSV</button>
        </h3>
        {view.routes==='json' ? (
          <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs max-h-48">{JSON.stringify(allRoutes, null, 2)}</pre>
        ) : (
          <div className="overflow-x-auto text-xs max-h-48">
            <table className="min-w-full border">
              <thead><tr><th>ID</th><th>Origin</th><th>Destination</th><th>Base Price</th></tr></thead>
              <tbody>
                {allRoutes.map(r=>(<tr key={r.id}><td>{r.id}</td><td>{r.origin}</td><td>{r.destination}</td><td>{r.basePrice}</td></tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* FLIGHTS */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">Flights
          <button className={`ml-2 px-2 py-1 rounded text-xs ${view.flights==='json'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,flights:'json'}))}>JSON</button>
          <button className={`ml-1 px-2 py-1 rounded text-xs ${view.flights==='table'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,flights:'table'}))}>Table</button>
          <button className="ml-2 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(availableFlights,'flights','json')}>Export JSON</button>
          <button className="ml-1 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(availableFlights,'flights','csv')}>Export CSV</button>
        </h3>
        {view.flights==='json' ? (
          <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs max-h-48">{JSON.stringify(availableFlights, null, 2)}</pre>
        ) : (
          <div className="overflow-x-auto text-xs max-h-48">
            <table className="min-w-full border">
              <thead><tr><th>ID</th><th>Origin</th><th>Destination</th><th>Flight #</th><th>Date</th><th>Dep</th><th>Arr</th><th>Available</th></tr></thead>
              <tbody>
                {availableFlights.map(f=>(<tr key={f.id}><td>{f.id}</td><td>{f.origin}</td><td>{f.destination}</td><td>{f.flightNumber}</td><td>{f.departureDate}</td><td>{f.departureTime}</td><td>{f.arrivalTime}</td><td>{f.available?'Yes':'No'}</td></tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* BOOKINGS */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">Bookings
          <button className={`ml-2 px-2 py-1 rounded text-xs ${view.bookings==='json'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,bookings:'json'}))}>JSON</button>
          <button className={`ml-1 px-2 py-1 rounded text-xs ${view.bookings==='table'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,bookings:'table'}))}>Table</button>
          <button className="ml-2 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(allBookings,'bookings','json')}>Export JSON</button>
          <button className="ml-1 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(allBookings,'bookings','csv')}>Export CSV</button>
        </h3>
        {view.bookings==='json' ? (
          <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs max-h-48">{JSON.stringify(allBookings, null, 2)}</pre>
        ) : (
          <div className="overflow-x-auto text-xs max-h-48">
            <table className="min-w-full border">
              <thead><tr><th>ID</th><th>Code</th><th>User</th><th>Email</th><th>Route</th><th>Dep</th><th>Ret</th><th>Travelers</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
              <tbody>
                {allBookings.map(b=>(<tr key={b.id}><td>{b.id}</td><td>{b.bookingCode}</td><td>{b.userName}</td><td>{b.userEmail}</td><td>{b.route}</td><td>{b.departureDate}</td><td>{b.returnDate||'-'}</td><td>{b.travelers}</td><td>{b.totalPrice}</td><td>{b.bookingStatus}</td><td>{b.paymentStatus}</td></tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* USERS */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">Users
          <button className={`ml-2 px-2 py-1 rounded text-xs ${view.users==='json'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,users:'json'}))}>JSON</button>
          <button className={`ml-1 px-2 py-1 rounded text-xs ${view.users==='table'?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`} onClick={()=>setView(v=>({...v,users:'table'}))}>Table</button>
          <button className="ml-2 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(getAllUsers(),'users','json')}>Export JSON</button>
          <button className="ml-1 px-2 py-1 rounded text-xs bg-green-600 text-white" onClick={()=>handleExport(getAllUsers(),'users','csv')}>Export CSV</button>
        </h3>
        {view.users==='json' ? (
          <pre className="bg-gray-100 rounded p-2 overflow-x-auto text-xs max-h-48">{JSON.stringify(getAllUsers(), null, 2)}</pre>
        ) : (
          <div className="overflow-x-auto text-xs max-h-48">
            <table className="min-w-full border">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {getAllUsers().map(u=>(<tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataInspector;
