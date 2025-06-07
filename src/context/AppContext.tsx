import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Booking, Flight, Route, SearchParams } from '../types';

interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  
  // Bookings
  userBookings: Booking[];
  allBookings: Booking[];
  createBooking: (booking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) => string;
  updateBookingStatus: (id: string, status: Booking['bookingStatus']) => void;
  setAllBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  
  // Flights & Routes
  availableFlights: Flight[];
  setAvailableFlights: React.Dispatch<React.SetStateAction<Flight[]>>;
  allRoutes: Route[];
  setAllRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  searchFlights: (params: SearchParams, options?: { allDates?: boolean; fromDate?: boolean }) => Flight[];
  updateRoute: (route: Route) => void;
  
  // Admin functions
  getAllUsers: () => User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  getAllFlights: () => Flight[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('bookings');
    return saved ? JSON.parse(saved) : [];
  });
  const [availableFlights, setAvailableFlights] = useState<Flight[]>(() => {
    const saved = localStorage.getItem('flights');
    return saved ? JSON.parse(saved) : [];
  });
  const [allRoutes, setAllRoutes] = useState<Route[]>(() => {
    const saved = localStorage.getItem('routes');
    return saved ? JSON.parse(saved) : [];
  });
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  });

  // Save all data to localStorage on change
  React.useEffect(() => {
    localStorage.setItem('users', JSON.stringify(allUsers));
  }, [allUsers]);
  React.useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(allBookings));
  }, [allBookings]);
  React.useEffect(() => {
    localStorage.setItem('routes', JSON.stringify(allRoutes));
  }, [allRoutes]);
  React.useEffect(() => {
    localStorage.setItem('flights', JSON.stringify(availableFlights));
  }, [availableFlights]);

  // Initialize currentUser from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Simple auth - in production, this would be handled by a backend
    const user = allUsers.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>): string => {
    const booking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      bookingCode: `STFL${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString()
    };
    setAllBookings(prev => [...prev, booking]);
    return booking.bookingCode;
  };

  const updateBookingStatus = (id: string, status: Booking['bookingStatus']) => {
    setAllBookings(prev =>
      prev.map(booking =>
        booking.id === id ? { ...booking, bookingStatus: status } : booking
      )
    );
  };

  /**
   * Search flights for a route.
   * @param params SearchParams
   * @param options Optional: { allDates?: boolean, fromDate?: boolean }
   *   - allDates: show all flights for the route regardless of date
   *   - fromDate: show all flights for the route on or after the selected date
   */
  const searchFlights = (
    params: SearchParams,
    options?: { allDates?: boolean; fromDate?: boolean }
  ): Flight[] => {
    if (options?.allDates) {
      return availableFlights.filter(flight =>
        flight.origin === params.origin &&
        flight.destination === params.destination &&
        flight.available
      );
    }
    if (options?.fromDate) {
      return availableFlights.filter(flight =>
        flight.origin === params.origin &&
        flight.destination === params.destination &&
        flight.available &&
        new Date(flight.departureDate) >= new Date(params.departureDate)
      );
    }
    // Default: exact date match
    return availableFlights.filter(flight =>
      flight.origin === params.origin &&
      flight.destination === params.destination &&
      flight.available &&
      flight.departureDate === params.departureDate
    );
  };

  const updateRoute = (route: Route) => {
    setAllRoutes(prev =>
      prev.map(r => r.id === route.id ? route : r)
    );
  };

  const getAllUsers = () => allUsers;
  const getAllRoutes = () => allRoutes;
  const getAllBookings = () => allBookings;
  const getAllFlights = () => availableFlights;

  const userBookings = currentUser
    ? allBookings.filter(booking => booking.userId === currentUser.id)
    : [];

  const value: AppContextType & {
    getAllRoutes: () => Route[];
    getAllBookings: () => Booking[];
    getAllFlights: () => Flight[];
  } = {
    currentUser,
    login,
    logout,
    userBookings,
    allBookings,
    createBooking,
    updateBookingStatus,
    availableFlights,
    setAvailableFlights,
    allRoutes,
    setAllRoutes,
    setAllBookings,
    searchFlights,
    updateRoute,
    getAllUsers,
    setAllUsers,
    getAllRoutes,
    getAllBookings,
    getAllFlights
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};