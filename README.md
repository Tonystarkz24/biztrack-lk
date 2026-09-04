# BizTrack LK

Initial full-stack project skeleton for BizTrack LK.

> **Notice:** This repository contains only the initial project skeleton. No feature implementations or CRUD operations exist yet. All team members must create and work on separate feature branches and must **not** push directly to `main`.

---

## Technology Stack

* **Frontend:** React.js with Vite and JavaScript
* **Backend:** Node.js with Express.js (CommonJS)
* **Database:** Neon PostgreSQL (Online Shared Instance)
* **PostgreSQL Client:** `pg` (node-postgres)
* **HTTP Client:** Axios

---

## Folder Overview

```text
biztrack-lk/
├── frontend/                     # Client application (React + Vite)
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page views
│   │   ├── services/
│   │   │   └── api.js            # Axios client with baseURL configuration
│   │   ├── styles/
│   │   │   └── global.css        # Global CSS styles
│   │   ├── App.jsx               # Root React component
│   │   └── main.jsx              # Vite React entry point
│   ├── .env.example              # Frontend environment template
│   ├── package.json              # Frontend dependencies and scripts
│   ├── package-lock.json         # Locked frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   └── index.html                # HTML template
│
├── backend/                      # Server application (Express.js)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Shared Neon PostgreSQL pool configuration
│   │   ├── controllers/          # Request handler controllers
│   │   ├── routes/
│   │   │   └── healthRoutes.js   # Health check route (/api/health)
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # Central error handling middleware
│   │   │   └── notFound.js       # 404 handler middleware
│   │   ├── app.js                # Express app setup & middleware wiring
│   │   └── server.js             # Server listener entry point
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies and scripts
│   └── package-lock.json         # Locked backend dependencies
│
├── database/                     # Database assets & scripts
│   ├── migrations/               # SQL schema migrations
│   └── seeds/                    # Seed data scripts
│
├── .gitignore                    # Git ignore configuration
└── README.md                     # Project documentation
```

---

## Prerequisites

Ensure you have the following installed on your development machine:

* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher recommended)
* **Git**
* A **Neon account** (for accessing the online PostgreSQL shared database)

---

## Shared Database Architecture

All four team members connect to the **same shared Neon PostgreSQL online database**.
* The database connection string is managed via the `DATABASE_URL` environment variable.
* Team members will receive the connection string securely from the project lead.
* Do **not** hardcode connection strings anywhere in code.

---

## Environment Setup & Security Warning

> ⚠️ **CRITICAL SECURITY WARNING:** Never commit or push `.env` files to GitHub. Only `.env.example` templates are tracked by Git.

### 1. Backend Environment Setup

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
# Windows (PowerShell)
Copy-Item backend/.env.example backend/.env

# macOS / Linux
cp backend/.env.example backend/.env
```

Open `backend/.env` and insert your values:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Environment Setup

Create a `.env` file in the `frontend/` directory by copying `.env.example`:

```bash
# Windows (PowerShell)
Copy-Item frontend/.env.example frontend/.env

# macOS / Linux
cp frontend/.env.example frontend/.env
```

Contents of `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Installation & Running Locally

### Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (with hot reload via nodemon):
   ```bash
   npm run dev
   ```
   Or run the production server:
   ```bash
   npm start
   ```
4. Verify backend health endpoint by navigating to:
   ```text
   http://localhost:5000/api/health
   ```
   Expected response:
   ```json
   {
     "success": true,
     "message": "Backend server is running"
   }
   ```

### Frontend Setup

1. Open another terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit:
   ```text
   http://localhost:5173
   ```
5. To test building the frontend for production:
   ```bash
   npm run build
   ```

---

## Branching & Contribution Guidelines

1. **Do not push directly to `main`**: The `main` branch is protected and holds the stable skeleton.
2. **Create feature branches**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit often with descriptive messages**: Ensure all linting and build checks pass before opening a Pull Request.
