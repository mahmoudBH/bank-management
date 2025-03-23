import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import {jwtDecode} from "jwt-decode";

// Déclaration des couleurs (mêmes que pour Header)
const colors = {
  primary: '#003087',
  secondary: '#009cde',
  background: '#f5f7fa',
  text: '#2d2d2d',
  error: '#e74c3c',
  success: '#2ecc71'
};

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 120px 20px 40px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const MainContainer = styled.div`
  max-width: 800px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  padding: 32px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-top: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: ${colors.primary};
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 96%;
  padding: 14px;
  font-size: 16px;
  border: 1px solid #ccd0d5;
  border-radius: 6px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 8px rgba(0, 48, 135, 0.2);
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.3s ease, transform 0.2s ease;

  &:hover {
    background: #002569;
    transform: translateY(-2px);
  }
`;

const StatusMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  border: 1px solid ${props => props.success ? '#c3e6cb' : '#f5c6cb'};
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin: 24px 0;
`;

const PaymentCard = styled.div`
  background: linear-gradient(135deg, rgba(0, 48, 135, 0.95), rgba(0, 156, 222, 0.95));
  border-radius: 16px;
  padding: 24px;
  color: white;
  border: 2px solid ${props => props.selected ? '#ffffff80' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  box-shadow: ${props => props.selected 
    ? '0 8px 24px rgba(0, 48, 135, 0.25)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  transform: translateY(${props => props.selected ? '-4px' : '0'});
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 48, 135, 0.25);
  }

  div:first-child {
    font-family: 'Courier New', monospace;
    letter-spacing: 3px;
    margin-bottom: 16px;
    font-size: 1.1rem;
    position: relative;
    display: inline-block;
    padding-right: 24px;
    
    &::after {
      content: '${props => props.selected ? '✓' : ''}';
      position: absolute;
      right: 0;
      color: #00ff88;
      font-size: 1.2rem;
      filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.4));
    }
  }

  div:nth-child(2) {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 8px;
  }

  div:last-child {
    margin-top: 16px;
    font-size: 1.2rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const TransferForm = () => {
  const [transferData, setTransferData] = useState({
    receiverEmail: "",
    receiverName: "",
    selected_card_id: "",
    card_cvv: "",
    amount: ""
  });
  const [savedCards, setSavedCards] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Récupération du token et décodage pour obtenir l'ID utilisateur
  const token = localStorage.getItem("token");
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch (err) {
      console.error("Erreur de décodage du token:", err);
    }
  }

  // Récupération des cartes enregistrées pour l'utilisateur
  const fetchCards = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/get-payments?user_id=${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCards(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des cartes:", err);
    }
  };

  useEffect(() => {
    if (token && userId) fetchCards();
  }, [token, userId]);

  const handleChange = (e) => {
    setTransferData({ ...transferData, [e.target.name]: e.target.value });
  };

  const handleCardSelect = (cardId) => {
    setTransferData({ ...transferData, selected_card_id: cardId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/transfer", transferData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message + " Code PIN: " + res.data.pin);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du transfert");
    }
  };

  return (
    <PageWrapper>
      <MainContainer>
        <ContentWrapper>
          <h2 style={{ color: colors.primary, textAlign: "center", marginBottom: "32px" }}>
            Transférer des fonds
          </h2>
          {message && <StatusMessage success>{message}</StatusMessage>}
          {error && <StatusMessage>{error}</StatusMessage>}
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <div>
                <InputGroup>
                  <Label>Email du destinataire</Label>
                  <Input
                    type="email"
                    name="receiverEmail"
                    value={transferData.receiverEmail}
                    onChange={handleChange}
                    placeholder="exemple@paypal.com"
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Nom complet du destinataire</Label>
                  <Input
                    type="text"
                    name="receiverName"
                    value={transferData.receiverName}
                    onChange={handleChange}
                    placeholder="Prénom Nom"
                    required
                  />
                </InputGroup>
              </div>
              <div>
                <InputGroup>
                  <Label>Montant</Label>
                  <Input
                    type="number"
                    name="amount"
                    value={transferData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Code de sécurité (CVV)</Label>
                  <Input
                    type="text"
                    name="card_cvv"
                    value={transferData.card_cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </InputGroup>
              </div>
            </FormGrid>
            <h3 style={{ color: colors.text, margin: "32px 0 16px", fontSize: "18px", fontWeight: "500", textAlign: "center" }}>
              Sélectionnez votre carte de paiement
            </h3>
            <CardGrid>
              {savedCards.length === 0 ? (
                <p>Aucune carte enregistrée.</p>
              ) : (
                savedCards.map((card) => (
                  <PaymentCard
                    key={card.id}
                    selected={transferData.selected_card_id === card.id.toString()}
                    onClick={() => handleCardSelect(card.id.toString())}
                  >
                    <div>•••• •••• •••• {card.card_number_last4}</div>
                    <div>{card.card_holder}</div>
                    <div>Exp: {card.expiry_date}</div>
                    <div style={{ marginTop: "16px", fontWeight: "600" }}>
                      {Number(card.amount).toFixed(2)} €
                    </div>
                  </PaymentCard>
                ))
              )}
            </CardGrid>
            <SubmitButton type="submit">Confirmer le transfert</SubmitButton>
          </form>
        </ContentWrapper>
      </MainContainer>
    </PageWrapper>
  );
};

export default TransferForm;

// ==================== Styled Components Complémentaires ====================


