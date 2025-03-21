import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const Signup = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();  // Replace useHistory with useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      termsAccepted: e.target.checked,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Check if terms and conditions are accepted
    if (!formData.termsAccepted) {
      setError('Vous devez accepter les Conditions d\'utilisation et la Politique de confidentialité.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/signup', formData);
      if (response.status === 200) {
        navigate('/login');  // Redirect to login page after signup
      }
    } catch (err) {
      setError(err.response.data.message || 'Erreur lors de l\'inscription');
    }
    setIsLoading(false);
  };

  return (
    <div className="signup-container">
      <h2>Créer un compte bancaire</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Prénom</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nom</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>
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
          <label>Numéro de téléphone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
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
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleCheckboxChange}
            />
            Vous acceptez les <a href="/terms" target="_blank">Conditions d'utilisation</a> et la <a href="/privacy-policy" target="_blank">Politique de confidentialité</a> de PayPal, et vous avez l'âge légal.
          </label>
        </div>
        <div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'S\'inscrire'}
          </button>
        </div>
      </form>
      <style jsx>{`
        .signup-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .signup-container h2 {
          text-align: center;
          margin-bottom: 20px;
        }

        .signup-container form div {
          margin-bottom: 15px;
        }

        .signup-container form label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        .signup-container form input {
          width: 100%;
          padding: 10px;
          margin: 5px 0 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .signup-container form button {
          width: 100%;
          padding: 12px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
        }

        .signup-container form button:disabled {
          background-color: #cccccc;
        }

        .error-message {
          color: red;
          text-align: center;
          margin-bottom: 15px;
        }

        .signup-container form a {
          color: #007bff;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default Signup;
