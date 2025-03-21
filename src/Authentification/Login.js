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
    <div className="login-container">
      <h2>Connexion</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </form>
      <div className="signup-link">
        <p>Pas encore de compte ? <a href="/signup">Créer un compte</a></p>
      </div>
    </div>
  );
};

export default Login;
