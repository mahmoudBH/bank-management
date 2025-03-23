// DepositWithdraw.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { jwtDecode } from 'jwt-decode';

const Container = styled.div`
  max-width: 800px;
  margin: 100px auto;
  padding: 2rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 2rem;
  gap: 1rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.$active ? '#003087' : '#f5f7fa'};
  color: ${props => props.$active ? 'white' : '#2d2d2d'};
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
    color: #2d2d2d;
    margin-bottom: 0.5rem;
  }
  
  .balance {
    font-size: 2rem;
    color: #003087;
    font-weight: 600;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Card = styled.div`
  padding: 1.5rem;
  background: ${props => props.$selected ? '#e0e7ff' : '#f8f9fa'};
  border: 2px solid ${props => props.$selected ? '#003087' : '#e0e0e0'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .card-number {
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
    margin-bottom: 0.5rem;
  }

  .amount {
    font-size: 1.2rem;
    font-weight: 600;
    color: #003087;
  }
`;

const InputGroup = styled.div`
  margin: 1.5rem 0;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2d2d2d;
    font-weight: 500;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 1px solid #d9e1ec;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #003087;
    box-shadow: 0 0 0 3px rgba(0,48,135,0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #003087;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #002569;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #d9e1ec;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  background: ${props => props.$error ? '#f8d7da' : '#d4edda'};
  color: ${props => props.$error ? '#721c24' : '#155724'};
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
        console.error('Error fetching data:', err);
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
      setUserBalance(response.data.new_user_balance);
      setCards(cards.map(card => 
        card.id === selectedCard 
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
    <Container>
      <h1>Gestion des fonds</h1>
      
      <BalanceDisplay>
        <h2>Solde disponible</h2>
        <div className="balance">{(userBalance || 0).toFixed(2)} €</div>
      </BalanceDisplay>

      <Tabs>
        <Tab 
          $active={activeTab === 'deposit'}
          onClick={() => setActiveTab('deposit')}
        >
          Déposer
        </Tab>
        <Tab 
          $active={activeTab === 'withdraw'}
          onClick={() => setActiveTab('withdraw')}
        >
          Retirer
        </Tab>
      </Tabs>

      {message && <Message>{message}</Message>}
      {error && <Message $error>{error}</Message>}

      {activeTab === 'deposit' && (
        <div>
          <h2>Sélectionnez une carte pour déposer</h2>
          <CardGrid>
            {cards.map(card => (
              <Card 
                key={card.id}
                $selected={selectedCard === card.id}
                onClick={() => setSelectedCard(card.id)}
              >
                <div className="card-number">**** **** **** {card.card_number_last4}</div>
                <div>Exp: {card.expiry_date}</div>
                <div className="amount">{(card.amount || 0).toFixed(2)} €</div>
              </Card>
            ))}
          </CardGrid>

          <InputGroup>
            <label>Montant à déposer (€)</label>
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
            <label>Code de sécurité (CVV)</label>
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
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div>
          <h2>Sélectionnez une carte pour retirer</h2>
          <CardGrid>
            {cards.map(card => (
              <Card 
                key={card.id}
                $selected={selectedCard === card.id}
                onClick={() => setSelectedCard(card.id)}
              >
                <div className="card-number">**** **** **** {card.card_number_last4}</div>
                <div>Exp: {card.expiry_date}</div>
                <div className="amount">{(card.amount || 0).toFixed(2)} €</div>
              </Card>
            ))}
          </CardGrid>

          <InputGroup>
            <label>Montant à retirer (€)</label>
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
        </div>
      )}
    </Container>
  );
};

export default DepositWithdraw;