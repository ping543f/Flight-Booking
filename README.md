# SkyBook – Flight Booking System

SkyBook is a full-featured flight booking system built with React, TypeScript, Vite, and Tailwind CSS. It supports user and admin roles, flight and route management, booking, finance tracking, and more.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Usage](#usage)
  - [User Features](#user-features)
  - [Admin Features](#admin-features)
- [Development](#development)
  - [Project Structure](#project-structure)
  - [Modifying the Codebase](#modifying-the-codebase)
  - [Adding Features](#adding-features)
- [Deployment](#deployment)
- [Customization](#customization)
- [Demo Accounts](#demo-accounts)
- [License](#license)

---

## Features

- **User Booking:** Search, book, and manage flight bookings.
- **Admin Dashboard:** Manage flights, routes, users, bookings, and finances.
- **Finance Management:** Track income, expenses, and process refunds.
- **Data Inspector:** Export and inspect system data (CSV/JSON).
- **Responsive UI:** Built with Tailwind CSS and Lucide React icons.

---

## Getting Started

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd Flight-Booking
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

### Running Locally

Start the development server:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

### User Features

- **Search Flights:** Use the search form on the homepage.
- **Book Flights:** Fill out the booking form and complete the (demo) payment.
- **Manage Bookings:** View and manage your bookings from the dashboard.

### Admin Features

- **Login as Admin:** Use the demo admin account (see below).
- **Dashboard:** Access booking, route, flight, user, and finance management.
- **Manage Flights/Routes:** Add, edit, or delete flights and routes.
- **Finance:** Track income/expenses, process refunds.
- **Data Export:** Export bookings, flights, routes, and users as CSV/JSON.

---

## Development

### Project Structure

- [`src/`](src/)
  - [`components/`](src/components/) – React components (Admin, Auth, Booking, Dashboard, Layout, Search)
  - [`context/`](src/context/) – App-wide context and hooks ([`AppContext.tsx`](src/context/AppContext.tsx))
  - [`data/`](src/data/) – Mock data ([`mockData.ts`](src/data/mockData.ts))
  - [`types/`](src/types/) – TypeScript types ([`index.ts`](src/types/index.ts))
  - [`assets/`](src/assets/) – Images and static assets
  - [`App.tsx`](src/App.tsx) – Main app logic
  - [`main.tsx`](src/main.tsx) – Entry point

### Modifying the Codebase

- **Add a new page or feature:**  
  Create a new component in `src/components/`, import and use it in [`App.tsx`](src/App.tsx) or the relevant dashboard tab.
- **Change styling:**  
  Use Tailwind CSS classes in JSX. Update [`index.css`](src/index.css) or [`tailwind.config.js`](tailwind.config.js) for global changes.
- **Update types:**  
  Edit [`src/types/index.ts`](src/types/index.ts) to add or modify TypeScript interfaces.
- **Manage state/data:**  
  Use [`AppContext.tsx`](src/context/AppContext.tsx) for global state (users, bookings, flights, etc).

### Adding Features

- **Add a new admin tab:**  
  1. Create a new component in `src/components/Admin/`.
  2. Add it to the `tabs` array and `renderTabContent` switch in [`AdminDashboard.tsx`](src/components/Admin/AdminDashboard.tsx).
- **Add new fields to bookings, flights, or users:**  
  1. Update the relevant interface in [`src/types/index.ts`](src/types/index.ts).
  2. Update forms and context logic in [`AppContext.tsx`](src/context/AppContext.tsx) and relevant components.

---

## Deployment

1. **Build for production:**
   ```sh
   npm run build
   ```
   This outputs static files to the `dist/` directory.

2. **Preview the build locally:**
   ```sh
   npm run preview
   ```

3. **Deploy:**
   - Upload the `dist/` folder to any static hosting (Vercel, Netlify, GitHub Pages, etc).
   - Ensure your hosting supports client-side routing (SPA fallback to `index.html`).

---

## Customization

- **Branding:**  
  Update logos, colors, and images in [`src/assets/`](src/assets/) and Tailwind config.
- **Demo Data:**  
  Edit [`mockData.ts`](src/data/mockData.ts) for initial airports and other mock data.
- **Authentication:**  
  The current system uses localStorage and demo accounts. Integrate a backend for production use.

---

## Demo Accounts

- **User:**  
  - Email: `john@example.com`  
  - Password: `password`
- **Admin:**  
  - Email: `admin@flightbooking.com`  
  - Password: `password`

---

## License

This project is for demo and educational purposes.

---

**For more details, see the code in the respective files:**

- [src/App.tsx](src/App.tsx)
- [src/context/AppContext.tsx](src/context/AppContext.tsx)
- [src/components/Admin/AdminDashboard.tsx](src/components/Admin/AdminDashboard.tsx)
- [src/components/Booking/BookingForm.tsx](src/components/Booking/BookingForm.tsx)
- [src/types/index.ts](src/types/index.ts)