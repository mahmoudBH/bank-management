import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Pages/Home'
import Login from './Authentification/Login';
import Signup from './Authentification/Signup';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';
import PrivateRoute from './Authentification/PrivateRoute';
import Header from './Pages/Header';
import PaymentForm from './Pages/PaymentForm';
import TransferForm from './Pages/TransferForm';
import TransferHistory from './Pages/TransferHistory';
import DepositWithdraw from './Pages/DepositWithdraw';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Convertir en booléen
  }, []);

  if (isAuthenticated === null) {
    return <div>Chargement...</div>; // Éviter la redirection avant la vérification du token
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Routes privées protégées */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Header />
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Header />
                <PaymentForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/transfer"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Header />
                <TransferForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/withdraw"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Header />
                <DepositWithdraw />
              </PrivateRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Header />
                <TransferHistory />
              </PrivateRoute>
            }
          />




          <Route
            path="/profile"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Header />
                <Profile />
              </PrivateRoute>
            }
          />
          
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
