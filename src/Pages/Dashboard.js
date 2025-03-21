// Dashboard.js
import React from 'react';
import Header from './Header';

const Dashboard = () => {
  return (
    <div>
      <Header />
      <main style={styles.mainContent}>
        {/* Contenu principal du tableau de bord */}
      </main>
    </div>
  );
};

const styles = {
  mainContent: {
    padding: '20px',
  },
};

export default Dashboard;
