import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    birthday: '',
    address: '',
    state: '',
    city: '',
    zip: '',
    gender: '',
    profile_photo: '' // URL ou nom de fichier de la photo de profil
  });
  const [file, setFile] = useState(null); // Pour le fichier de la photo
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Récupération du profil
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token manquant. Veuillez vous connecter.');
      setLoading(false);
      return;
    }
    axios
      .get('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then((response) => {
        // On s'assure que profile_photo est défini
        setUser({
          ...response.data,
          profile_photo: response.data.profile_photo || ''
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erreur lors de la récupération du profil');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token manquant. Veuillez vous connecter.');
      return;
    }

    // Utilisation de FormData pour inclure le fichier s'il existe
    const formData = new FormData();
    formData.append('firstname', user.firstname);
    formData.append('lastname', user.lastname);
    formData.append('email', user.email);
    formData.append('phone', user.phone);
    formData.append('birthday', user.birthday);
    formData.append('address', user.address);
    formData.append('state', user.state);
    formData.append('city', user.city);
    formData.append('zip', user.zip);
    formData.append('gender', user.gender);
    if (file) {
      formData.append('profile_photo', file);
    }

    axios
      .put('http://localhost:5000/api/update-profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((response) => {
        setMessage('Profil mis à jour avec succès!');
        setIsEditing(false);
        // Mise à jour de l'état utilisateur avec les nouvelles infos, notamment la photo
        // On suppose que le backend renvoie le profil mis à jour incluant profile_photo
        setUser((prevUser) => ({
          ...prevUser,
          ...response.data,
          profile_photo: response.data.profile_photo || prevUser.profile_photo
        }));
        // Réinitialisation du fichier sélectionné
        setFile(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      });
  };

  if (loading) {
    return <div>Chargement...</div>;
  }
  if (error) {
    return <div style={{ color: '#e74c3c', textAlign: 'center', marginTop: '100px' }}>{error}</div>;
  }

  return (
    <>
      <style>{`
        .profile-container {
          padding: 40px 30px;
          max-width: 600px;
          margin: 120px auto 40px;
          background: linear-gradient(135deg, #ffffff, #f7f9fc);
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          transition: all 0.3s ease;
        }
        .profile-container:hover {
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
        }
        .profile-container h1 {
          text-align: center;
          margin-bottom: 30px;
          color: #003087;
          font-size: 2rem;
          letter-spacing: 0.5px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #003087;
          font-size: 0.95rem;
        }
        .form-group input,
        .form-group select {
          width: 96%;
          padding: 14px;
          font-size: 16px;
          border: 1px solid #ccd0d5;
          border-radius: 6px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .form-group input:focus,
        .form-group select:focus {
          border-color: #003087;
          box-shadow: 0 0 8px rgba(0, 48, 135, 0.2);
          outline: none;
        }
        button {
          width: 100%;
          padding: 14px;
          background-color: #003087;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 10px;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }
        button:hover {
          background-color: #002060;
          transform: translateY(-2px);
        }
        .edit-button {
          background-color: #0070ba;
        }
        .edit-button:hover {
          background-color: #005b9f;
        }
        .success-message {
          color: #28a745;
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.1rem;
          font-weight: 500;
        }
        .profile-photo-container {
          text-align: center;
          margin-bottom: 20px;
        }
        .profile-photo-container img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
        }
        .profile-photo-container input {
          margin-top: 10px;
        }
        @media (max-width: 768px) {
          .profile-container {
            margin: 100px 20px 40px;
            padding: 30px 20px;
          }
          .profile-container h1 {
            font-size: 1.75rem;
          }
          .form-group input,
          .form-group select {
            font-size: 14px;
            padding: 12px;
          }
          button {
            font-size: 14px;
            padding: 12px;
          }
        }
      `}</style>
      <div className="profile-container">
        <h1>Profil de {user.firstname} {user.lastname}</h1>
        {message && <div className="success-message">{message}</div>}

        <div className="profile-photo-container">
          <img
            src={
              user.profile_photo
                ? `http://localhost:5000/${user.profile_photo}`
                : 'http://localhost:5000/uploads/default-avatar.png'
            }
            alt="Photo de profil"
          />
          {isEditing && (
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Prénom</label>
            <input
              type="text"
              name="firstname"
              value={user.firstname}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Nom</label>
            <input
              type="text"
              name="lastname"
              value={user.lastname}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Date de naissance</label>
            <input
              type="date"
              name="birthday"
              value={user.birthday}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Adresse</label>
            <input
              type="text"
              name="address"
              value={user.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>État</label>
            <input
              type="text"
              name="state"
              value={user.state}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input
              type="text"
              name="city"
              value={user.city}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Code Postal</label>
            <input
              type="text"
              name="zip"
              value={user.zip}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
          <div className="form-group">
            <label>Genre</label>
            <select
              name="gender"
              value={user.gender}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Sélectionner</option>
              <option value="male">male</option>
              <option value="female">female</option>
            </select>
          </div>
          <button type="submit" disabled={!isEditing}>
            Mettre à jour le profil
          </button>
          <button
            type="button"
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Annuler' : 'Modifier le profil'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Profile;
