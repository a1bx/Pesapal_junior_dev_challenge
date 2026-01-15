# Nexus DB - Custom RDBMS & Student Registration

A high-performance, single-file relational database engine built from scratch with a glassmorphic "Nexus OS" inspired web interface. This project demonstrates core RDBMS concepts including SQL parsing, indexing, relational constraints, and real-time engine telemetry.

![Nexus DB Dashboard](client/public/dashboard_preview.png)

## 🚀 Key Features

- **Custom SQL Engine**: Supports `CREATE`, `INSERT`, `SELECT`, `UPDATE`, `DELETE`, and `INNER JOIN`.
- **Relational Integrity**: Built-in enforcement for Primary Keys (PK) and Foreign Keys (FK).
- **Business Logic Engine**: Course capacity management and enrollment limits.
- **Engine Telemetry**: Live performance monitoring and system activity logs.
- **Nexus OS UI**: A premium dark-themed dashboard with glassmorphism and real-time updates.
- **SQL Terminal**: Interactive console for direct database manipulation.
- **REPL Interface**: Native terminal interface for low-level interaction.

## 🛠️ Architecture

- **Core Engine**: TypeScript-based RDBMS using Hash-based indexing for O(1) lookups.
- **Persistence**: Flat-file JSON storage with atomic write-back.
- **Backend**: Express.js server bridging the engine to the web.
- **Frontend**: Vite + React with custom-built Nexus OS design system.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Pesapal_junior_dev_challenge
   ```

2. **Install Dependencies**
   ```bash
   # Install engine and server dependencies
   npm install

   # Install frontend dependencies
   cd client && npm install && cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the `client` directory:
   ```bash
   VITE_API_URL=http://localhost:3001/api
   ```

### Running the Project

**1. Start the Backend Server**
```bash
cd server
npm start
```

**2. Start the Frontend Dev Server**
```bash
cd client
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## 🚀 Vercel Deployment

The frontend is ready for Vercel deployment.
1. Connect your repository to Vercel.
2. Set the **Root Directory** to `client`.
3. Add the Environment Variable `VITE_API_URL` pointing to your hosted backend.

> [!IMPORTANT]
> Since the RDBMS uses local file storage, the **backend** should be hosted on a platform with persistent storage (like Render or Railway) rather than serverless functions.

## 📄 License

MIT - Developed for the Pesapal Junior Dev Challenge.
