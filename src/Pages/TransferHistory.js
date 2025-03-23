import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import {jwtDecode} from "jwt-decode";

const PageContainer = styled.div`
  padding: 120px 2rem 2rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  color: #fff;
  margin-bottom: 2rem;
  text-align: center;
`;

const TableWrapper = styled.div`
  width: 90%;
  max-width: 1000px;
  overflow-x: auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 1rem;
  background: #1e3c72;
  color: #fff;
  text-align: center;
  font-size: 1rem;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  text-align: center;
  font-size: 0.9rem;
`;

const TransferHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/transfer-history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors de la récupération de l'historique");
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchHistory();
    }
  }, [token, userId]);

  if (loading) {
    return (
      <PageContainer>
        <Title>Chargement de l'historique...</Title>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Title>{error}</Title>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title>Historique des transferts</Title>
      {history.length === 0 ? (
        <p style={{ color: "#fff", textAlign: "center" }}>Aucun transfert trouvé.</p>
      ) : (
        <TableWrapper>
          <StyledTable>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Expéditeur</Th>
                <Th>Destinataire</Th>
                <Th>Carte</Th>
                <Th>Montant</Th>
                <Th>Code PIN</Th>
              </tr>
            </thead>
            <tbody>
              {history.map((transfer) => (
                <tr key={transfer.id}>
                  <Td>{new Date(transfer.transfer_date).toLocaleString()}</Td>
                  <Td>{transfer.sender_firstname} {transfer.sender_lastname}</Td>
                  <Td>{transfer.receiver_firstname} {transfer.receiver_lastname}</Td>
                  <Td>{transfer.card_display}</Td>
                  <Td>{Number(transfer.amount).toFixed(2)} €</Td>
                  <Td>{transfer.pin}</Td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableWrapper>
      )}
    </PageContainer>
  );
};

export default TransferHistory;
