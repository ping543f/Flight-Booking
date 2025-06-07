import defaultProfilePic from '../assets/default-profile.png';

export const airports = [
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore' },
  { code: 'CGP', name: 'Shah Amanat International Airport', city: 'Chittagong' },
  { code: 'CXB', name: 'Cox\'s Bazar Airport', city: 'Cox\'s Bazar' }
];

export const demoUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    password: 'password',
    profilePic: defaultProfilePic
  },
  {
    id: '2',
    name: 'Admin',
    email: 'admin@flightbooking.com',
    role: 'admin',
    password: 'password',
    profilePic: defaultProfilePic
  }
];

export const demoRoutes = [
  {
    id: 'route1',
    origin: 'DAC',
    destination: 'KUL',
    basePrice: 20000,
    priceMultipliers: {}
  }
];

export const demoFlights = [
  {
    id: 'flight1',
    origin: 'DAC',
    destination: 'KUL',
    routeId: 'route1',
    departureDate: '2025-06-15',
    basePrice: 20000,
    airline: 'Sky Airlines',
    flightNumber: 'SKY123',
    departureTime: '10:00',
    arrivalTime: '14:00',
    duration: '4h',
    available: true,
    schedule: undefined
  }
];

export const demoBookings = [
  {
    id: 'booking1',
    bookingCode: 'STFL20250607ABC123',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    flightId: 'flight1',
    route: 'DAC → KUL',
    departureDate: '2025-06-15',
    travelers: 1,
    totalPrice: 20000,
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    createdAt: '2025-06-01T10:00:00.000Z'
  }
];

export const demoFinances = [
  { id: 'fin1', category: 'income', amount: 20000, description: 'Flight Booking', date: '2025-06-01' },
  { id: 'fin2', category: 'expense', amount: 5000, description: 'Airport Fees', date: '2025-06-02' }
];