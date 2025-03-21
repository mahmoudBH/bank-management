import React, { useState, useEffect } from "react";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import axios from "axios";
import { motion } from "framer-motion";
import styled from "styled-components";

// Conteneur principal avec un fond moderne
const PageContainer = styled.div`
  padding: 120px 2rem 2rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// Conteneur supérieur en deux colonnes
const TopSection = styled.div`
  width: 90%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

// Bloc Solde Total
const TotalBalanceCard = styled(motion.div)`
  flex: 1;
  min-width: 280px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const CurrencySelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const CurrencyButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  background: ${props => props.active ? '#1e3c72' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
`;

const TotalTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e3c72;
  margin-bottom: 0.5rem;
`;

const TotalAmount = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #2a5298;
`;

const DecorativeStripe = styled(motion.div)`
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: rgba(46, 101, 161, 0.1);
  transform: skewX(-20deg);
`;

// Bloc Ajouter une carte
const AddCardForm = styled(motion.div)`
  flex: 1;
  min-width: 280px;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
`;

const FormTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 600;
  color: #1e3c72;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// Formulaire et ses éléments
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: #333;
`;

const StyledInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: all 0.3s ease;
  &:focus {
    border-color: #1e3c72;
    box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.2);
    outline: none;
  }
`;

const SubmitButton = styled(motion.button)`
  background: #1e3c72;
  color: #fff;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  &:hover {
    background: #16325c;
  }
`;

const Message = styled.div`
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
`;

const SuccessMessage = styled(Message)`
  background: #d4edda;
  color: #155724;
`;

const ErrorMessage = styled(Message)`
  background: #f8d7da;
  color: #721c24;
`;

// Section Cartes enregistrées
const CardsSection = styled.div`
  width: 90%;
  max-width: 1200px;
`;

const SectionTitle = styled.h3`
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// Affichage réaliste d'une carte de paiement
const CardDisplay = styled(motion.div)`
  background: linear-gradient(135deg, #2a5298, #1e3c72);
  border-radius: 16px;
  padding: 1.5rem;
  color: #fff;
  min-height: 180px;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
`;

const CardHolder = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
`;

const CardNumber = styled.div`
  font-size: 1.1rem;
  letter-spacing: 2px;
`;

const Expiry = styled.div`
  font-size: 0.9rem;
  align-self: flex-end;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const PreviewWrapper = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
`;

const PaymentForm = () => {
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
    amount: "",
    focus: ""
  });
  const [savedCards, setSavedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState('EUR');
const [conversionRate] = useState(1.08); // Taux de conversion fictif

  // On suppose que l'ID utilisateur et le token sont stockés dans localStorage
  const user_id = localStorage.getItem("user_id") || 1;
  const token = localStorage.getItem("token");

  // Récupération des cartes enregistrées
  const fetchCards = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/get-payments?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCards(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des cartes:", err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [token]);

  const handleInputChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleFocus = (e) => {
    setCardDetails({ ...cardDetails, focus: e.target.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        user_id,
        card_number: cardDetails.number,
        card_holder: cardDetails.name,
        expiry_date: cardDetails.expiry,
        cvv: cardDetails.cvc,
        amount: cardDetails.amount
      };

      await axios.post("http://localhost:5000/add-payment", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Carte ajoutée avec succès !");
      setCardDetails({ number: "", name: "", expiry: "", cvc: "", amount: "", focus: "" });
      fetchCards();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout de la carte");
    }
    setLoading(false);
  };

  // Calcul du solde total
  const totalAmount = savedCards.reduce((total, card) => total + Number(card.amount), 0);

  return (
    <PageContainer>
      <TopSection>
        {/* Solde Total */}
        <TotalBalanceCard
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 80 }}
            >
            <DecorativeStripe
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <CurrencySelector>
                <CurrencyButton 
                active={currency === 'EUR'} 
                onClick={() => setCurrency('EUR')}
                >
                EUR
                </CurrencyButton>
                <CurrencyButton                             
                active={currency === 'USD'} 
                onClick={() => setCurrency('USD')}
                >
                USD
                </CurrencyButton>
            </CurrencySelector>
            <TotalTitle>Solde Total</TotalTitle>
            <TotalAmount>
                {(currency === 'EUR' 
                ? totalAmount 
                : totalAmount * conversionRate
                ).toFixed(2)} {currency === 'EUR' ? '€' : '$'}
            </TotalAmount>
            </TotalBalanceCard>

        {/* Formulaire Ajouter une Carte */}
        <AddCardForm
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80 }}
        >
          <FormTitle>Ajouter une Carte</FormTitle>
          {message && <SuccessMessage>{message}</SuccessMessage>}
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <PreviewWrapper>
            <Cards
              number={cardDetails.number}
              name={cardDetails.name}
              expiry={cardDetails.expiry}
              cvc={cardDetails.cvc}
              focused={cardDetails.focus}
            />
          </PreviewWrapper>

          <StyledForm onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Numéro de carte</Label>
              <StyledInput
                type="tel"
                name="number"
                maxLength="16"
                value={cardDetails.number}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder="1234123412341234"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label>Nom du titulaire</Label>
              <StyledInput
                type="text"
                name="name"
                value={cardDetails.name}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder="John Doe"
                required
              />
            </InputGroup>
            <div style={{ display: "flex", gap: "1rem" }}>
              <InputGroup style={{ flex: 1 }}>
                <Label>Date d'expiration</Label>
                <StyledInput
                  type="text"
                  name="expiry"
                  maxLength="4"
                  value={cardDetails.expiry}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  placeholder="MMYY"
                  required
                />
              </InputGroup>
              <InputGroup style={{ flex: 1 }}>
                <Label>CVC</Label>
                <StyledInput
                  type="text"
                  name="cvc"
                  maxLength="3"
                  value={cardDetails.cvc}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  placeholder="123"
                  required
                />
              </InputGroup>
            </div>
            <InputGroup>
              <Label>Montant</Label>
              <StyledInput
                type="number"
                name="amount"
                value={cardDetails.amount}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder="0.00"
                required
              />
            </InputGroup>
            <SubmitButton
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? "Ajout en cours..." : "Ajouter la carte"}
            </SubmitButton>
          </StyledForm>
        </AddCardForm>
      </TopSection>

      {/* Section Cartes Enregistrées */}
      <CardsSection>
        <SectionTitle>Cartes Enregistrées</SectionTitle>
        {savedCards.length === 0 ? (
          <p style={{ color: "#fff", textAlign: "center" }}>Aucune carte enregistrée.</p>
        ) : (
          <CardsGrid>
            {savedCards.map((card) => (
              <CardDisplay
                key={card.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CardNumber>**** **** **** {card.card_number_last4}</CardNumber>
                <CardHolder>{card.card_holder}</CardHolder>
                <Expiry>Exp: {card.expiry_date}</Expiry>
                <div style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "600" }}>
                  {Number(card.amount).toFixed(2)} €
                </div>
              </CardDisplay>
            ))}
          </CardsGrid>
        )}
      </CardsSection>
    </PageContainer>
  );
};

export default PaymentForm;
