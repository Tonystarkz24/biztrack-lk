import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
