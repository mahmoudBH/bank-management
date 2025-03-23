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
    <div className="login-wrapper">
      <div className="login-container">
        <div className="logo-container">
          <svg viewBox="0 0 100 35" className="paypal-logo">
            <path d="M25 35h-9.6L20 0h8.7l-3.7 35zM35 0l-4 35h-9.6L22.5 0H35zm15 0h-8.8l-3.7 35H35l4-35h8.8l3.7 35H65l4-35h8.8L80 0H50z" 
                  fill="#003087"/>
          </svg>
        </div>

        <div className="card">
          <h2 className="title">Créer un compte bancaire</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Prénom</label>
              <input
                type="text"
                name="firstname"
                className="input-field"
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Nom</label>
              <input
                type="text"
                name="lastname"
                className="input-field"
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </div>

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
              <label className="input-label">Numéro de téléphone</label>
              <input
                type="text"
                name="phone"
                className="input-field"
                value={formData.phone}
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
            </div>

            <div className="input-group">
              <label className="input-label">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-field"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  className="checkbox-input"
                  checked={formData.termsAccepted}
                  onChange={handleCheckboxChange}
                />
                <span className="checkmark"></span>
                Vous acceptez les{' '}
                <a href="/terms" target="_blank" className="policy-link">Conditions d'utilisation</a>{' '}
                et la{' '}
                <a href="/privacy-policy" target="_blank" className="policy-link">Politique de confidentialité</a>{' '}
                de PayPal, et vous avez l'âge légal.
              </label>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'S\'inscrire'}
            </button>
          </form>
        </div>
        <div className="signup-card">
            <p className="signup-text">
              Déjà un compte ?{' '}
              <a href="/login" className="signup-link">Se connecter</a>
            </p>
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
            width: 105%;
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
            width: 93%;
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

          .checkbox-group {
            margin: 24px 0;
            padding: 12px;
            border-radius: 6px;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
          }

          .checkbox-label {
            display: block;
            color: #6c757d;
            font-size: 14px;
            line-height: 1.5;
            cursor: pointer;
            position: relative;
            padding-left: 28px;
          }

          .checkbox-input {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
          }

          .checkmark {
            position: absolute;
            left: 0;
            top: 3px;
            height: 18px;
            width: 18px;
            background-color: #fff;
            border: 2px solid #d9e1ec;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .checkbox-label:hover .checkmark {
            border-color: #009cde;
          }

          .checkbox-input:checked ~ .checkmark {
            background-color: #003087;
            border-color: #003087;
          }

          .checkmark:after {
            content: "";
            position: absolute;
            display: none;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 8px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }

          .checkbox-input:checked ~ .checkmark:after {
            display: block;
          }

          .policy-link {
            color: #009cde;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s ease;
            font-size: 14px;
          }

          .policy-link:hover {
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

          .error-message {
            background: #ffe6e6;
            color: #d8000c;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 24px;
            border: 1px solid #ffb3b3;
            font-size: 14px;
          }
            .signup-card {
              margin-top: 24px;
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              width: 100%;
              max-width: 475px;
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

          @media (max-width: 480px) {
            .card {
              padding: 24px;
            }
            
            .title {
              font-size: 22px;
            }
            
            .checkbox-label {
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Signup;
