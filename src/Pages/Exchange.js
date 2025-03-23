import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import jwtDecode from "jwt-decode";

const PageContainer = styled.div`
  padding: 120px 20px 40px;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 2rem;
  text-align: center;
`;

const FormContainer = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #ccd0d5;
  border-radius: 6px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: #003087;
    box-shadow: 0 0 8px rgba(0, 48, 135, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #ccd0d5;
  border-radius: 6px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: #003087;
    box-shadow: 0 0 8px rgba(0, 48, 135, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: #003087;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background: #002060;
    transform: translateY(-2px);
  }
`;

const RatesInfo = styled.div`
  margin-top: 16px;
  font-size: 16px;
  color: #003087;
  text-align: center;
`;

const SearchButton = styled(Button)`
  background: #0070ba;
  margin-top: 8px;
  &:hover {
    background: #005b9f;
  }
`;
const colors = {
    primary: '#003087',
    secondary: '#009cde',
    background: '#f5f7fa',
    text: '#2d2d2d',
    error: '#e74c3c',
    success: '#2ecc71'
  };
  

const Exchange = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [ratesError, setRatesError] = useState("");
  const [loadingRates, setLoadingRates] = useState(false);

  // Remplacer par votre clé API réelle
  const API_KEY = "5aa520b11922e9918f8c6b56"; 
  const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`;

  // Récupérer le solde de l'utilisateur
  useEffect(() => {
    fetch("http://localhost:5000/api/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setBalance(data.account_balance))
      .catch((error) => console.error("Erreur de récupération du solde:", error));
  }, []);

  // Fonction pour récupérer toutes les devises disponibles
  const fetchAvailableCurrencies = async () => {
    setLoadingRates(true);
    try {
      const response = await axios.get(BASE_URL);
      if (response.data.result === "success") {
        const rates = response.data.conversion_rates;
        // Extraire les clés et les trier
        const currencies = Object.keys(rates).sort();
        setAvailableCurrencies(currencies);
        setExchangeRate(rates[toCurrency] || 1);
        setRatesError("");
      } else {
        setRatesError("Erreur de récupération des taux");
      }
    } catch (error) {
      console.error("Erreur API taux de change:", error);
      setRatesError("Échec de la connexion à l'API");
    } finally {
      setLoadingRates(false);
    }
  };

  // Mettre à jour le taux de change lorsque fromCurrency ou toCurrency change
  useEffect(() => {
    if (availableCurrencies.length > 0) {
      // On suppose que availableCurrencies provient de l'API, on peut alors calculer le taux
      axios.get(BASE_URL)
        .then((response) => {
          if (response.data.result === "success") {
            setExchangeRate(response.data.conversion_rates[toCurrency] || 1);
          }
        })
        .catch((error) => console.error("Erreur de récupération des taux:", error));
    }
  }, [fromCurrency, toCurrency, availableCurrencies]);

  const handleExchange = () => {
    if (!amount || amount <= 0 || amount > balance) {
      alert("Montant invalide !");
      return;
    }
    setConvertedAmount(amount * exchangeRate);
  };

  return (
    <PageContainer>
      <Title>Échange de devises</Title>
      <FormContainer>
        <div style={{ marginBottom: "16px", textAlign: "center", fontSize: "16px", color: colors.primary }}>
          Solde disponible : {balance} {fromCurrency}
        </div>
        <div style={{ marginBottom: "16px" }}>
          <Button onClick={fetchAvailableCurrencies}>
            {loadingRates ? "Recherche en cours..." : "Rechercher devises"}
          </Button>
        </div>
        {availableCurrencies.length > 0 && (
          <>
            <FormGroup>
              <Label>Devise de départ</Label>
              <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                {availableCurrencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Devise cible</Label>
              <Select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                {availableCurrencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </>
        )}
        {ratesError && <div style={{ color: colors.error, textAlign: "center" }}>{ratesError}</div>}
        <FormGroup>
          <Label>Montant à convertir</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </FormGroup>
        <Button onClick={handleExchange}>Convertir</Button>
        {convertedAmount > 0 && (
          <RatesInfo>
            {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
          </RatesInfo>
        )}
      </FormContainer>
    </PageContainer>
  );
};

export default Exchange;
