export interface FlightSchedule {
  recurrence: 'once' | 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ...
  startDate: string; // ISO date
  endDate?: string; // ISO date
  occurrences?: number; // Optional, for custom
}

export interface Flight {
  id: string;
  origin: string;
  destination: string;
  routeId: string; // Bind to Route
  departureDate: string;
  returnDate?: string;
  basePrice: number;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  available: boolean;
  schedule?: FlightSchedule; // New schedule field
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  basePrice: number;
  priceMultipliers: {
    [date: string]: number;
  };
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  flightId: string;
  route: string;
  departureDate: string;
  returnDate?: string;
  travelers: number;
  totalPrice: number;
  bookingStatus: 'CONFIRMED' | 'CANCELLED' | 'REFUND-COMPLETE' | 'PENDING';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string;
  profilePic?: string;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  travelers: number;
  tripType: 'oneWay' | 'roundTrip';
}