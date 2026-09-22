import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ApiStatusBanner from './components/ApiStatusBanner';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';
import AgentWorkflowsPage from './pages/AgentWorkflowsPage';
import LoginPage from './pages/LoginPage';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <ApiStatusBanner />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'InventoryManager']}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'InventoryManager', 'Cashier']}>
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                    <SalesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <ExpensesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent-workflows"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'InventoryManager']}>
                    <AgentWorkflowsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
