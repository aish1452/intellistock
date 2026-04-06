import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Forecast from './pages/Forecast';
import Users from './pages/Users';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        
        <Route path="products" element={
          <ProtectedRoute roleRequired={['admin', 'manager']}>
            <Products />
          </ProtectedRoute>
        } />
        
        <Route path="inventory" element={<Inventory />} />
        
        <Route path="sales" element={<Sales />} />
        
        <Route path="forecast" element={
          <ProtectedRoute roleRequired={['admin', 'manager', 'analyst']}>
            <Forecast />
          </ProtectedRoute>
        } />
        
        <Route path="users" element={
          <ProtectedRoute roleRequired={['admin']}>
            <Users />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;
