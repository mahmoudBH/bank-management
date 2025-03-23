// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Réinitialiser l'erreur avant une nouvelle tentative

    try {
      const response = await axios.post('http://localhost:5000/api/login', formData);

      if (response.status === 200) {
        // Stocker le token et les données utilisateur dans localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.session)); // Stocker les infos user

        navigate('/dashboard'); // Redirection après connexion réussie
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo-container">
          <svg viewBox="0 0 100 35" className="paypal-logo">
            <path d="M25 35h-9.6L20 0h8.7l-3.7 35zM35 0l-4 35h-9.6L22.5 0H35zm15 0h-8.8l-3.7 35H35l4-35h8.8l3.7 35H65l4-35h8.8L80 0H50z" 
                  fill="#003087"/>
          </svg>
        </div>

        <div className="card">
          <h2 className="title">Connexion</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                name="email"
                className="input-field"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="input-field"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <a href="/forgot" className="forgot-password">Mot de passe oublié ?</a>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="signup-card">
          <p className="signup-text">
            Pas encore de compte ?{' '}
            <a href="/signup" className="signup-link">Créer un compte</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #f6f8fb;
          padding: 40px 20px;
        }

        .logo-container {
          text-align: center;
          margin-bottom: 40px;
          width: 125%;
        }

        .paypal-logo {
          width: 150px;
          height: auto;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 450px;
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
        }

        .title {
          color: #003087;
          font-size: 24px;
          margin-bottom: 32px;
          text-align: center;
          font-weight: 600;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-label {
          display: block;
          color: #2c3e50;
          font-size: 14px;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .input-field {
          width: 91%;
          padding: 14px;
          border: 1px solid #d9e1ec;
          border-radius: 6px;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: #009cde;
          box-shadow: 0 0 0 3px rgba(0, 156, 222, 0.2);
        }

        .forgot-password {
          display: block;
          text-align: right;
          margin-top: 12px;
          color: #009cde;
          font-size: 14px;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-password:hover {
          color: #0070ba;
          text-decoration: underline;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: #003087;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 16px;
        }

        .login-button:hover {
          background: #002569;
        }

        .login-button:disabled {
          background: #d9e1ec;
          cursor: not-allowed;
        }

        .signup-card {
          margin-top: 24px;
          text-align: center;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 107%;
          max-width: 450px;
        }

        .signup-text {
          color: #6c757d;
          margin: 0;
        }

        .signup-link {
          color: #009cde;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .signup-link:hover {
          color: #0070ba;
          text-decoration: underline;
        }

        .error-message {
          background: #ffe6e6;
          color: #d8000c;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 24px;
          border: 1px solid #ffb3b3;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .card {
            padding: 24px;
          }
          
          .title {
            font-size: 22px;
          }
        }
      `}</style>
    </div>
  );
};


export default Login;
