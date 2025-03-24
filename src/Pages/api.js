import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export const fetchDashboardData = async () => {
  try {
    const [profileRes, historyRes] = await Promise.all([
      API.get('/profile'),
      API.get('/transfer-history')
    ]);
    
    return {
      accountBalance: profileRes.data.account_balance,
      transactions: historyRes.data,
      user: profileRes.data
    };
  } catch (error) {
    throw error;
  }
};

export const getChartData = async () => {
    try {
      const response = await API.get('/statistics');
      return {
        labels: response.data.labels,
        datasets: [
          {
            label: 'Évolution du solde',
            data: response.data.data,
            borderColor: '#003087',
            backgroundColor: 'rgba(0, 48, 135, 0.2)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    } catch (error) {
      throw error;
    }
  };

const processChartData = (transactions) => {
  // Traitement des données pour le graphique
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.transfer_date).toLocaleString('fr-FR', { month: 'short' });
    acc[month] = (acc[month] || 0) + transaction.amount;
    return acc;
  }, {});

  return {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Flux financier',
        data: Object.values(monthlyData),
        borderColor: '#003087',
        backgroundColor: 'rgba(0, 48, 135, 0.2)',
        tension: 0.4
      }
    ]
  };
};