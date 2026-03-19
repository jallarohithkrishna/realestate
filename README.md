# LuxeRealEstate - Exclusive Luxury Living

LuxeRealEstate is a premier, high-end real estate marketplace designed for India's most exclusive properties. It connects elite sellers with discerning buyers in a seamless, premium digital environment.

## ✨ Key Features

- **Luxury Property Listings**: Browse a curated collection of high-end villas, mansions, and penthouses.
- **Advanced Dynamic Search**: A fluid, instantaneous search bar in the Hero section that filters properties by title, location, or lifestyle.
- **Interactive Property Details**: Deep-dive into property specifics, high-resolution imagery, and detailed descriptions.
- **Secure Property Submission**: Secure "Add Property" workflow with Google Authentication, allowing verified agents and owners to list their estates.
- **Real-time Synchronization**: Powered by Firebase Firestore for instantaneous updates and global reach.
- **Premium User Experience**: Modern, responsive design featuring glassmorphism, smooth animations (Framer Motion), and a curated color palette.

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4.x (Vanilla CSS approach with modern utilities)
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Lucide React
- **Backend & Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth (Google Provider)
- **Routing**: React Router DOM 7
- **Development Tooling**: Vite 6

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- A Firebase Project (for your own database environment)

### Local Development

1. **Clone the repository** (or extract the project folder)
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   - The app uses `firebase-applet-config.json` for database connection.
   - Ensure your Firebase project's credentials are correct in this file.
4. **Run the development server**:
   ```bash
   npm run dev
   ```
5. **Access the application**: 
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `/src/components`: Reusable UI components (Hero, FeaturedListings, AddProperty, etc.)
- `/src/firebase.ts`: Database configuration and initialization logic.
- `firestore.rules`: Security configuration for data protection.
- `firebase-applet-config.json`: Project-specific connection strings.

---
© 2026 LuxeRealEstate - Designed for Excellence.
