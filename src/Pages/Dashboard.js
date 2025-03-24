import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiActivity } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

// Données mockées pour le graphique (à remplacer par des données réelles si disponibles)
const transactionsData = [
  { name: 'Lun', income: 1200, expense: 500 },
  { name: 'Mar', income: 1000, expense: 600 },
  { name: 'Mer', income: 1800, expense: 750 },
  { name: 'Jeu', income: 2000, expense: 900 },
  { name: 'Ven', income: 2200, expense: 1100 },
  { name: 'Sam', income: 2500, expense: 1200 },
  { name: 'Dim', income: 3000, expense: 1500 },
];

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 120px auto 0; /* marge en haut pour le header fixe */
  background: #f7fafc;
  border-radius: 12px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const BalanceCard = styled(Card)`
  background: linear-gradient(135deg, #003087, #002569);
  color: white;
  grid-column: 1 / -1;
  padding: 2.5rem;
  text-align: center;
`;

const TransactionItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  background: ${props => (props.isIncome ? '#e6f9f0' : '#ffe6e6')};
  margin-bottom: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: ${props => (props.isIncome ? '#c6f7d1' : '#ffccd5')};
  }
`;

const QuickActionButton = styled(motion.button)`
  padding: 1.5rem;
  border: none;
  border-radius: 15px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e0e7ff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #003087;
  margin-bottom: 32px;
  font-size: 2.5rem;
  letter-spacing: 0.5px;
`;

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const token = localStorage.getItem('token');
  let userId = token ? jwtDecode(token).userId : null;

  // Récupération du profil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération du profil:", err);
      }
    };
    if (userId) fetchProfile();
  }, [token, userId]);

  // Récupération des transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(res.data.transactions);
      } catch (err) {
        console.error("Erreur lors de la récupération des transactions:", err);
      }
    };
    if (userId) fetchTransactions();
  }, [token, userId]);

  // Récupération de l'historique des transferts
  useEffect(() => {
    const fetchTransferHistory = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/transfer-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransferHistory(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération de l'historique des transferts:", err);
      }
    };
    if (userId) fetchTransferHistory();
  }, [token, userId]);

  // Fusionner les transactions et l'historique des transferts dans les activités récentes
  const allActivities = [
    ...transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      isIncome: t.type === 'deposit',
      description: t.type === 'deposit' ? 'Dépôt' : 'Retrait',
      created_at: t.created_at,
    })),
    ...transferHistory.map(t => ({
      id: t.id,
      amount: t.amount,
      isIncome: t.receiver_id === profile.id, // Détermine si c'est un revenu
      description: t.receiver_id === profile.id 
        ? `Reçu de ${t.sender_firstname} ${t.sender_lastname}` 
        : `Envoyé à ${t.receiver_firstname} ${t.receiver_lastname}`,
      created_at: t.transfer_date,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <DashboardContainer>
      <Title>Tableau de bord</Title>
      <BalanceCard>
        <h2>Solde Total</h2>
        <h1>{profile ? profile.account_balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '0,00 €'}</h1>
        <div style={{ display: 'flex', gap: '1rem', color: '#a0aec0' }}>
          <span>+12% ce mois</span>
          <span>●</span>
          <span>3 transactions</span>
        </div>
      </BalanceCard>
      
      <Grid>
        <Card
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Activités Récentes</h3>
          {allActivities.length > 0 ? (
            allActivities.map(activity => (
              <TransactionItem 
                  key={activity.id} 
                  isIncome={activity.isIncome}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{activity.description}</div>
                    <div style={{ color: '#718096', fontSize: '0.9rem' }}>
                      {new Date(activity.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div style={{ 
                    color: activity.isIncome ? '#00c853' : '#ff1744',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}>
                    {activity.isIncome ? '+' : '-'}
                    {parseFloat(activity.amount).toLocaleString('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR',
                      minimumFractionDigits: 2
                    })}
                  </div>
                </TransactionItem>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: '#718096' }}>Aucune activité récente</div>
          )}
        </Card>

        <Card
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Actions Rapides</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[
              { icon: <FiArrowUpRight />, label: 'Transfert', color: '#003087' },
              { icon: <FiArrowDownLeft />, label: 'Dépôt', color: '#00c853' },
              { icon: <FiDollarSign />, label: 'Prêt', color: '#d500f9' },
              { icon: <FiActivity />, label: 'Activité', color: '#ff6d00' }
            ].map((action, index) => (
              <QuickActionButton
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: action.color }}
              >
                <div style={{ fontSize: '1.5rem' }}>{action.icon}</div>
                <div>{action.label}</div>
              </QuickActionButton>
            ))}
          </div>
        </Card>

        <Card
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Statistiques</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transactionsData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#00c853" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#ff1744" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;
