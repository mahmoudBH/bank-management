import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiActivity } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Styles
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Card = styled(motion.div)`
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
  border: 1px solid rgba(255,255,255,0.18);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const BalanceCard = styled(Card)`
  background: linear-gradient(135deg, #003087, #002569);
  color: white;
  grid-column: 1 / -1;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: rgba(255,255,255,0.05);
    border-radius: 50%;
  }
`;

const QuickActionButton = styled(motion.button)`
  padding: 1.5rem;
  border: none;
  border-radius: 15px;
  background: linear-gradient(145deg, #ffffff, #f1f5f9);
  box-shadow: 5px 5px 15px #e2e8f0,
             -5px -5px 15px #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    font-size: 1.8rem;
    stroke-width: 1.5;
  }
`;

const TransactionItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  background: ${props => props.type === 'income' ? '#e6f9f0' : '#ffe6e6'};
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: ${props => props.type === 'income' ? '#00c853' : '#ff1744'};
  }
`;

const Loader = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #64748b;
`;

const ErrorMessage = styled(Card)`
  color: #ef4444;
  text-align: center;
  font-size: 1.1rem;
  padding: 2rem;
`;

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    accountBalance: 0,
    transactions: [],
    chartData: null,
    isLoading: true,
    error: null,
    user: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes, statsRes] = await Promise.all([
          API.get('/profile'),
          API.get('/transfer-history'),
          API.get('/statistics')
        ]);

        // Validation des données
        const safeAccountBalance = Number(profileRes.data?.account_balance) || 0;
        const safeTransactions = Array.isArray(historyRes.data) ? historyRes.data : [];
        const safeUserData = profileRes.data || {};
        
        // Traitement sécurisé des données du graphique
        const processChartData = (data) => ({
          labels: data?.labels?.map(label => label || '') || [],
          datasets: [{
            label: 'Évolution du solde',
            data: data?.data?.map(value => Number(value) || 0) || [],
            borderColor: '#003087',
            backgroundColor: 'rgba(0, 48, 135, 0.2)',
            tension: 0.4,
            fill: true
          }]
        });

        setDashboardData({
          accountBalance: safeAccountBalance,
          transactions: safeTransactions,
          chartData: processChartData(statsRes.data),
          user: safeUserData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: error.response?.data?.message || 'Erreur de chargement des données'
        }));
      }
    };

    fetchData();
  }, []);

  if (dashboardData.isLoading) {
    return <Loader>Chargement des données financières...</Loader>;
  }

  if (dashboardData.error) {
    return (
      <DashboardContainer>
        <ErrorMessage
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          ❌ Erreur : {dashboardData.error}
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  const quickActions = [
    { icon: <FiArrowUpRight />, label: 'Transfert', color: '#003087', action: () => {} },
    { icon: <FiArrowDownLeft />, label: 'Dépôt', color: '#00c853', action: () => {} },
    { icon: <FiDollarSign />, label: 'Prêt', color: '#d500f9', action: () => {} },
    { icon: <FiActivity />, label: 'Activité', color: '#ff6d00', action: () => {} }
  ];

  return (
    <DashboardContainer>
      <BalanceCard
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Solde Total</h2>
        <h1 style={{ fontSize: '3.5rem', margin: '1.5rem 0', fontWeight: 600 }}>
          {(dashboardData.accountBalance ?? 0).toLocaleString('fr-FR', { 
            style: 'currency', 
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </h1>
        <div style={{ display: 'flex', gap: '1.5rem', color: '#a0aec0', fontSize: '0.95rem' }}>
          <span>📈 +12% ce mois</span>
          <span>🔄 {dashboardData.transactions.length} transactions</span>
        </div>
      </BalanceCard>

      <Grid>
        <Card
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Activités Récentes</h3>
          {dashboardData.transactions.slice(0, 5).map(transaction => (
            <TransactionItem
              key={transaction.id}
              type={transaction.sender_id === dashboardData.user?.id ? 'expense' : 'income'}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {transaction.sender_id === dashboardData.user?.id 
                    ? `Vers ${transaction.receiver_firstname || ''} ${transaction.receiver_lastname || ''}`
                    : `De ${transaction.sender_firstname || ''} ${transaction.sender_lastname || ''}`}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {new Date(transaction.transfer_date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <div style={{ 
                color: transaction.sender_id === dashboardData.user?.id ? '#ff1744' : '#00c853',
                fontWeight: 600
              }}>
                {transaction.sender_id === dashboardData.user?.id ? '-' : '+'}
                {(transaction.amount || 0).toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            </TransactionItem>
          ))}
        </Card>

        <Card
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Actions Rapides</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
          }}>
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ color: action.color }}
                onClick={action.action}
              >
                <div style={{ fontSize: '2rem' }}>{action.icon}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{action.label}</div>
              </QuickActionButton>
            ))}
          </div>
        </Card>

        <Card
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ gridColumn: '1 / -1' }}
        >
          <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Statistiques Financières</h3>
          <div style={{ height: '400px', position: 'relative' }}>
            {dashboardData.chartData && (
              <Line 
                data={dashboardData.chartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => 
                          ` ${context.dataset.label}: €${(context.raw || 0).toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      grid: { color: 'rgba(0,0,0,0.05)' },
                      ticks: { 
                        callback: (value) => `€${(value || 0).toLocaleString('fr-FR', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}`
                      }
                    },
                    x: { grid: { display: false } }
                  }
                }}
              />
            )}
          </div>
        </Card>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;