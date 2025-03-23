import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

const MainContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const Header = styled.header`
  background: #003087;
  padding: 24px;
  text-align: center;
  
  h1 {
    color: white;
    margin: 0;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    
    svg {
      width: 30px;
      height: 30px;
    }
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  }
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d9e1ec;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #009cde;
    box-shadow: 0 0 0 3px rgba(0, 156, 222, 0.2);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin: 24px 0;
`;

const PaymentCard = styled.div`
  background: linear-gradient(135deg, #003087, #002569);
  border-radius: 12px;
  padding: 20px;
  color: white;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 2px solid ${props => props.selected ? '#009cde' : 'transparent'};

  &:hover {
    transform: translateY(-2px);
  }

  div:first-child {
    font-size: 18px;
    letter-spacing: 2px;
    margin-bottom: 12px;
    font-family: 'Courier New', monospace;
  }

  div:nth-child(2) {
    font-size: 14px;
    opacity: 0.9;
  }

  div:last-child {
    margin-top: 16px;
    font-size: 18px;
    font-weight: 600;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(to right, #003087, #002569);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #d9e1ec;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  background: ${props => props.success ? '#d4edda' : '#f8d7da'};
  color: ${props => props.success ? '#155724' : '#721c24'};
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
  
    // Appel du hook useEffect inconditionnellement
    useEffect(() => {
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
      if (token && userId) {
        fetchCards();
      }
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
  
  if (!token) {
    return (
      <PageWrapper>
        <MainContainer>
          <Header>
            <h1>
              <svg viewBox="0 0 100 35" fill="currentColor">
                <path d="M25 35h-9.6L20 0h8.7l-3.7 35zM35 0l-4 35h-9.6L22.5 0H35zm15 0h-8.8l-3.7 35H35l4-35h8.8l3.7 35H65l4-35h8.8L80 0H50z"/>
              </svg>
              PayPal
            </h1>
          </Header>
          <ContentWrapper>
            <StatusMessage>Veuillez vous connecter pour effectuer un transfert</StatusMessage>
          </ContentWrapper>
        </MainContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <MainContainer>
        <Header>
          <h1>
            <svg viewBox="0 0 100 35" fill="currentColor">
              <path d="M25 35h-9.6L20 0h8.7l-3.7 35zM35 0l-4 35h-9.6L22.5 0H35zm15 0h-8.8l-3.7 35H35l4-35h8.8l3.7 35H65l4-35h8.8L80 0H50z"/>
            </svg>
            Transfert d'argent
          </h1>
        </Header>

        <ContentWrapper>
          {message && <StatusMessage success>{message}</StatusMessage>}
          {error && <StatusMessage>{error}</StatusMessage>}

          <Form onSubmit={handleSubmit}>
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
                  <Label>Nom complet</Label>
                  <Input
                    type="text"
                    name="receiverName"
                    value={transferData.receiverName}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
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
                    placeholder="0.00 €"
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

            <h3 style={{ color: '#2c3e50', marginBottom: '16px' }}>Sélectionnez une carte</h3>
            
            <CardGrid>
              {savedCards.length === 0 ? (
                <StatusMessage>Aucune carte enregistrée</StatusMessage>
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
                    <div>{Number(card.amount).toFixed(2)} €</div>
                  </PaymentCard>
                ))
              )}
            </CardGrid>

            <SubmitButton type="submit">
              Confirmer le transfert
            </SubmitButton>
          </Form>
        </ContentWrapper>
      </MainContainer>
    </PageWrapper>
  );
};

export default TransferForm;