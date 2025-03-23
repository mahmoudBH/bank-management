import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiActivity } from 'react-icons/fi';

// Styles de base
const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
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
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255,255,255,0.18);
`;

const BalanceCard = styled(Card)`
  background: linear-gradient(135deg, #003087, #002569);
  color: white;
  grid-column: 1 / -1;
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
`;

const Dashboard = () => {
  // Données mockées
  const accountBalance = 12540.50;
  const recentTransactions = [
    { id: 1, amount: 450, type: 'income', description: 'Dépôt client' },
    { id: 2, amount: 299.99, type: 'expense', description: 'Achat en ligne' },
    { id: 3, amount: 1200, type: 'income', description: 'Transfert reçu' }
  ];

  const quickActions = [
    { icon: <FiArrowUpRight />, label: 'Transfert', color: '#003087' },
    { icon: <FiArrowDownLeft />, label: 'Dépôt', color: '#00c853' },
    { icon: <FiDollarSign />, label: 'Demande de prêt', color: '#d500f9' },
    { icon: <FiActivity />, label: 'Activité', color: '#ff6d00' }
  ];

  return (
    <DashboardContainer>
      <BalanceCard
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Solde Total</h2>
        <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>
          {accountBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </h1>
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
          {recentTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              type={transaction.type}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{transaction.description}</div>
                <div style={{ color: '#718096', fontSize: '0.9rem' }}>
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div style={{ color: transaction.type === 'income' ? '#00c853' : '#ff1744' }}>
                {transaction.type === 'income' ? '+' : '-'}
                {transaction.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
            </TransactionItem>
          ))}
        </Card>

        <Card
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Actions Rapides</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {quickActions.map((action, index) => (
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
          <div style={{ height: '300px', background: '#f5f7fa', borderRadius: '15px' }}>
            {/* Intégrer un graphique ici (ex: Chart.js) */}
            <div style={{ 
              display: 'flex', 
              height: '100%', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#718096'
            }}>
              Graphique des activités
            </div>
          </div>
        </Card>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;