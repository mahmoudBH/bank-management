import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import {jwtDecode} from 'jwt-decode';

const colors = {
  primary: '#003087',
  secondary: '#009cde',
  background: '#f5f7fa',
  text: '#2d2d2d',
  error: '#e74c3c',
  success: '#2ecc71'
};

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  padding: 32px;
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.$active ? colors.primary : '#f5f7fa'};
  color: ${props => props.$active ? 'white' : colors.text};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? '#002569' : '#e0e7ff'};
  }
`;

const BalanceDisplay = styled.div`
  text-align: center;
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;

  h2 {
    color: ${colors.text};
    margin-bottom: 0.5rem;
  }
  
  .balance {
    font-size: 2rem;
    color: ${colors.primary};
    font-weight: 600;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin: 24px 0;
`;

// Nouveau style pour les cartes de paiement
const PaymentCard = styled.div`
  background: linear-gradient(
    135deg,
    ${props => props.$selected ? '#003087' : '#1e3c72'},
    ${props => props.$selected ? '#005b9f' : '#2a5298'}
  );
  border-radius: 16px;
  padding: 24px;
  color: white;
  border: ${props => props.$selected ? '3px solid #00a707' : 'none'};
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: ${props =>
    props.$selected
      ? '0 8px 24px rgba(0, 48, 135, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.15)'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 48, 135, 0.4);
  }

  .card-number {
    font-family: 'Courier New', monospace;
    letter-spacing: 3px;
    font-size: 1.2rem;
    margin-bottom: 16px;
  }

  .card-holder {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .expiry {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .balance {
    margin-top: 16px;
    font-size: 1.3rem;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const InputGroup = styled.div`
  margin: 1.5rem 0;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: ${colors.text};
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
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

const Button = styled.button`
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
  border: 1px solid ${props => props.$error ? "#f5c6cb" : "#c3e6cb"};
  background: ${props => props.$error ? "#f8d7da" : "#d4edda"};
  color: ${props => props.$error ? "#721c24" : "#155724"};
`;

const DepositWithdraw = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [amount, setAmount] = useState('');
  const [cvv, setCvv] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).userId : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsRes, profileRes] = await Promise.all([
          axios.get(`http://localhost:5000/get-payments?user_id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setCards(cardsRes.data);
        setUserBalance(profileRes.data?.account_balance || 0);
      } catch (err) {
        console.error('Erreur de chargement des données:', err);
        setError('Erreur de chargement des données');
      }
    };

    if (userId && token) fetchData();
  }, [userId, token]);

  const handleTransaction = async (type) => {
    setMessage('');
    setError('');

    if (!selectedCard || !amount || (type === 'deposit' && !cvv)) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const payload = {
        card_id: selectedCard,
        amount: parseFloat(amount),
        ...(type === 'deposit' && { cvv })
      };

      const response = await axios.post(
        `http://localhost:5000/api/${type}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message);
      setUserBalance(response.data.new_balance || userBalance);
      // Mettre à jour la carte sélectionnée avec le nouveau solde (si renvoyé)
      setCards(cards.map(card =>
        card.id === Number(selectedCard)
          ? { ...card, amount: response.data.new_card_balance }
          : card
      ));
      setAmount('');
      setCvv('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la transaction');
    }
  };

  return (
    <PageWrapper>
      <MainContainer>
        <ContentWrapper>
          <h2 style={{ color: colors.primary, textAlign: "center", marginBottom: "32px" }}>
            Gestion des fonds
          </h2>

          <BalanceDisplay>
            <h2>Solde disponible</h2>
            <div className="balance">{Number(userBalance).toFixed(2)} €</div>
          </BalanceDisplay>

          <Tabs>
            <Tab $active={activeTab === 'deposit'} onClick={() => setActiveTab('deposit')}>
              Déposer
            </Tab>
            <Tab $active={activeTab === 'withdraw'} onClick={() => setActiveTab('withdraw')}>
              Retirer
            </Tab>
          </Tabs>

          {message && <StatusMessage>{message}</StatusMessage>}
          {error && <StatusMessage $error>{error}</StatusMessage>}

          {activeTab === 'deposit' && (
            <>
              <h3 style={{ color: colors.text, margin: "32px 0 16px", fontSize: "18px", fontWeight: "500", textAlign: "center" }}>
                Sélectionnez une carte pour déposer
              </h3>
              <CardGrid>
                {cards.map(card => (
                  <PaymentCard
                    key={card.id}
                    $selected={selectedCard === card.id.toString()}
                    onClick={() => setSelectedCard(card.id.toString())}
                  >
                    <div className="card-number">•••• •••• •••• {card.card_number_last4}</div>
                    <div className="card-holder">{card.card_holder}</div>
                    <div className="expiry">Exp: {card.expiry_date}</div>
                    <div className="balance">{Number(card.amount).toFixed(2)} €</div>
                  </PaymentCard>
                ))}
              </CardGrid>

              <InputGroup>
                <Label>Montant à déposer (€)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                />
              </InputGroup>

              <InputGroup>
                <Label>Code de sécurité (CVV)</Label>
                <Input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength="3"
                />
              </InputGroup>

              <Button onClick={() => handleTransaction('deposit')}>
                Confirmer le dépôt
              </Button>
            </>
          )}

          {activeTab === 'withdraw' && (
            <>
              <h3 style={{ color: colors.text, margin: "32px 0 16px", fontSize: "18px", fontWeight: "500", textAlign: "center" }}>
                Sélectionnez une carte pour retirer
              </h3>
              <CardGrid>
                {cards.map(card => (
                  <PaymentCard
                    key={card.id}
                    $selected={selectedCard === card.id.toString()}
                    onClick={() => setSelectedCard(card.id.toString())}
                  >
                    <div className="card-number">•••• •••• •••• {card.card_number_last4}</div>
                    <div className="card-holder">{card.card_holder}</div>
                    <div className="expiry">Exp: {card.expiry_date}</div>
                    <div className="balance">{Number(card.amount).toFixed(2)} €</div>
                  </PaymentCard>
                ))}
              </CardGrid>

              <InputGroup>
                <Label>Montant à retirer (€)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                />
              </InputGroup>

              <Button onClick={() => handleTransaction('withdraw')}>
                Confirmer le retrait
              </Button>
            </>
          )}
        </ContentWrapper>
      </MainContainer>
    </PageWrapper>
  );
};

export default DepositWithdraw;
