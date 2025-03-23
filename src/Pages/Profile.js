import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 120px 2rem 2rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileCard = styled.div`
  background: #fff;
  width: 100%;
  max-width: 600px;
  padding: 40px 30px;
  margin: 40px auto;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;

  &:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #003087;
  font-size: 2rem;
  letter-spacing: 0.5px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #003087;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 96%;
  padding: 14px;
  font-size: 16px;
  border: 1px solid #ccd0d5;
  border-radius: 6px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #003087;
    box-shadow: 0 0 8px rgba(0, 48, 135, 0.2);
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px;
  font-size: 16px;
  border: 1px solid #ccd0d5;
  border-radius: 6px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #003087;
    box-shadow: 0 0 8px rgba(0, 48, 135, 0.2);
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #003087;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #002060;
    transform: translateY(-2px);
  }
`;

const EditButton = styled(Button)`
  background-color: #0070ba;
  margin-top: 20px;
  &:hover {
    background-color: #005b9f;
  }
`;

const ProfilePhotoContainer = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
`;

const FileInput = styled.input`
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.1rem;
  font-weight: 500;
`;

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
    profile_photo: ''
  });
  const [file, setFile] = useState(null);
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

    // Utilisation de FormData pour inclure le fichier
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
        setUser((prevUser) => ({
          ...prevUser,
          ...response.data,
          profile_photo: response.data.profile_photo || prevUser.profile_photo
        }));
        setFile(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
      });
  };

  if (loading) {
    return <PageContainer>Chargement...</PageContainer>;
  }
  if (error) {
    return <PageContainer style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</PageContainer>;
  }

  return (
    <PageContainer>
      <ProfileCard>
        <Title>Profil de {user.firstname} {user.lastname}</Title>
        {message && <SuccessMessage>{message}</SuccessMessage>}

        <ProfilePhotoContainer>
          <ProfileImage
            src={user.profile_photo ? `http://localhost:5000/${user.profile_photo}` : 'http://localhost:5000/uploads/default-avatar.png'}
            alt="Photo de profil"
          />
          {isEditing && (
            <FileInput
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
          )}
        </ProfilePhotoContainer>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Prénom</Label>
            <Input
              type="text"
              name="firstname"
              value={user.firstname}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Nom</Label>
            <Input
              type="text"
              name="lastname"
              value={user.lastname}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Téléphone</Label>
            <Input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Date de naissance</Label>
            <Input
              type="date"
              name="birthday"
              value={user.birthday}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Adresse</Label>
            <Input
              type="text"
              name="address"
              value={user.address}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>État</Label>
            <Input
              type="text"
              name="state"
              value={user.state}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Ville</Label>
            <Input
              type="text"
              name="city"
              value={user.city}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Code Postal</Label>
            <Input
              type="text"
              name="zip"
              value={user.zip}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </FormGroup>
          <FormGroup>
            <Label>Genre</Label>
            <Select
              name="gender"
              value={user.gender}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="">Sélectionner</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
              <option value="other">Autre</option>
            </Select>
          </FormGroup>
          <Button type="submit" disabled={!isEditing}>
            Mettre à jour le profil
          </Button>
          <EditButton type="button" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Annuler' : 'Modifier le profil'}
          </EditButton>
        </form>
      </ProfileCard>
    </PageContainer>
  );
};

export default Profile;
