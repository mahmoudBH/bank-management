import React, { useState, useEffect } from 'react';

// Composant Counter pour animer le comptage
const Counter = ({ target, suffix = '', duration = 1500, format }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const stepTime = 50; // durée en ms entre chaque incrément
    const increment = target / (duration / stepTime);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setCount(start);
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);

  const display = format ? format(count) : Math.round(count);
  return <span>{display}{suffix}</span>;
};

const Home = () => {
  return (
    <div className="Home">
      {/* En-tête */}
      <header className="Home-header">
        <div className="logo">YourBank</div>
        <nav>
          <ul>
            <li><a href="#home">Accueil</a></li>
            <li><a href="#about">À Propos</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#offers">Offres</a></li>
            <li><a href="#stats">Statistiques</a></li>
            <li><a href="#testimonials">Témoignages</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Section Hero */}
      <section id="home" className="section home-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Bienvenue chez YourBank</h1>
          <p>
            Des solutions bancaires modernes et personnalisées pour sécuriser votre avenir financier.
          </p>
          <button className="btn-main">Découvrir</button>
        </div>
      </section>

      {/* Section Statistiques */}
      <section id="stats" className="section stats-section">
        <div className="container">
          <h2>Nos Performances</h2>
          <div className="stats-cards">
            <div className="stat-card">
              <h2 className="counter">
                <Counter
                  target={15}
                  suffix="%"
                  duration={1000}
                  format={(num) => `+${Math.round(num)}`}
                />
              </h2>
              <p>Croissance annuelle</p>
            </div>
            <div className="stat-card">
              <h2 className="counter">
                <Counter target={2} suffix="M+" duration={1500} format={(num) => Math.round(num)} />
              </h2>
              <p>Clients satisfaits</p>
            </div>
            <div className="stat-card">
              <h2 className="counter">
                <Counter target={5} suffix="K+" duration={1500} format={(num) => Math.round(num)} />
              </h2>
              <p>Agences mondiales</p>
            </div>
            <div className="stat-card">
              <h2 className="counter">
                <Counter target={100} suffix="%" duration={2000} />
              </h2>
              <p>Transactions sécurisées</p>
            </div>
          </div>
          <button className="btn-account">Ouvrir un compte</button>
        </div>
      </section>

      {/* Section À Propos */}
      <section id="about" className="section about-section">
        <div className="container">
          <h2>À Propos de Nous</h2>
          <p>
            YourBank innove en permanence pour offrir des services bancaires adaptés et sécurisés. Notre équipe dévouée s’engage à simplifier vos opérations financières.
          </p>
        </div>
      </section>

      {/* Section Services */}
      <section id="services" className="section services-section">
        <div className="container">
          <h2>Nos Services</h2>
          <div className="services-cards">
            <div className="card">
              <i className="fa fa-credit-card"></i>
              <h3>Comptes Bancaires</h3>
              <p>Accédez à une gestion simplifiée de vos comptes avec des outils modernes et intuitifs.</p>
            </div>
            <div className="card">
              <i className="fa fa-home"></i>
              <h3>Prêts & Hypothèques</h3>
              <p>Des solutions de financement sur mesure pour concrétiser vos projets immobiliers.</p>
            </div>
            <div className="card">
              <i className="fa fa-laptop"></i>
              <h3>Banque en Ligne</h3>
              <p>Gérez vos finances 24/7 grâce à une interface en ligne sécurisée et ergonomique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Offres Exclusives */}
      <section id="offers" className="section offers-section">
        <div className="container">
          <h2>Offres Exclusives</h2>
          <div className="offers-cards">
            <div className="offer-card">
              <h3>Compte Premium</h3>
              <p>Des avantages exclusifs et des frais réduits pour une gestion optimale de vos finances.</p>
              <button className="btn-offer">En savoir plus</button>
            </div>
            <div className="offer-card">
              <h3>Crédit à Taux Préférentiel</h3>
              <p>Financement avantageux pour vos projets, accompagné d’un suivi personnalisé.</p>
              <button className="btn-offer">En savoir plus</button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section id="testimonials" className="section testimonials-section">
        <div className="container">
          <h2>Témoignages</h2>
          <div className="testimonials-cards">
            <div className="testimonial-card">
              <p>"YourBank a transformé ma façon de gérer mes finances. Un service irréprochable et une équipe à l'écoute."</p>
              <span>- Marie D.</span>
            </div>
            <div className="testimonial-card">
              <p>"La flexibilité et la sécurité offertes par YourBank me permettent de réaliser mes projets en toute confiance."</p>
              <span>- Julien R.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Contact */}
      <section id="contact" className="section contact-section">
        <div className="container">
          <h2>Contactez-Nous</h2>
          <p>Email: support@yourbank.com</p>
          <p>Téléphone: +33 1 23 45 67 89</p>
        </div>
      </section>

      {/* Pied de page */}
      <footer>
        <p>&copy; 2025 YourBank. Tous droits réservés.</p>
      </footer>

      <style jsx>{`
        /* Global */
        .Home {
          font-family: 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          background-color: #f7f7f7;
          overflow-x: hidden;
        }

        /* Header */
        .Home-header {
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(5px);
          padding: 15px 40px;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        .logo {
          font-size: 26px;
          font-weight: 700;
        }
        nav ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
        }
        nav ul li {
          margin-left: 30px;
        }
        nav ul li a {
          color: #fff;
          text-decoration: none;
          font-size: 16px;
          transition: color 0.3s;
        }
        nav ul li a:hover {
          color: #f0a500;
        }

        /* Sections */
        .section {
          padding: 80px 20px;
          text-align: center;
          position: relative;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Home Section */
        .home-section {
          background: url('https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          overflow: hidden;
        }
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3));
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          animation: fadeInUp 1s ease-out;
        }
        .home-section h1 {
          font-size: 56px;
          margin-bottom: 20px;
          font-weight: 700;
        }
        .home-section p {
          font-size: 22px;
          margin-bottom: 40px;
        }
        .btn-main {
          padding: 16px 50px;
          background-color: #f0a500;
          border: none;
          border-radius: 50px;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }
        .btn-main:hover {
          background-color: #c78d00;
          transform: scale(1.05);
        }

        /* Stats Section */
        .stats-section {
          background-color: #fff;
          padding: 60px 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin: 40px auto;
          border-radius: 10px;
        }
        .stats-section h2 {
          font-size: 36px;
          margin-bottom: 30px;
        }
        .stats-cards {
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 40px;
          margin-bottom: 30px;
        }
        .stat-card {
          flex: 1;
          min-width: 200px;
        }
        .stat-card h2 {
          font-size: 48px;
          color: #f0a500;
          margin-bottom: 10px;
        }
        .stat-card p {
          font-size: 18px;
          font-weight: 500;
        }
        .btn-account {
          padding: 14px 40px;
          background-color: #1a73e8;
          border: none;
          border-radius: 50px;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }
        .btn-account:hover {
          background-color: #1558b0;
          transform: scale(1.05);
        }

        /* About Section */
        .about-section {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
          margin: 40px auto;
          padding: 40px 20px;
          max-width: 800px;
        }
        .about-section h2 {
          font-size: 36px;
          margin-bottom: 20px;
        }
        .about-section p {
          font-size: 18px;
          line-height: 1.6;
        }

        /* Services Section */
        .services-section h2 {
          font-size: 36px;
          margin-bottom: 40px;
        }
        .services-cards {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 30px;
        }
        .card {
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.1);
          padding: 30px 20px;
          width: 320px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        .card i {
          font-size: 45px;
          color: #f0a500;
          margin-bottom: 20px;
        }
        .card h3 {
          font-size: 24px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .card p {
          font-size: 16px;
          line-height: 1.5;
        }

        /* Offers Section */
        .offers-section h2 {
          font-size: 36px;
          margin-bottom: 40px;
        }
        .offers-cards {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 30px;
        }
        .offer-card {
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.1);
          padding: 30px 20px;
          width: 360px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .offer-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        .offer-card h3 {
          font-size: 22px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .offer-card p {
          font-size: 16px;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .btn-offer {
          padding: 12px 25px;
          background-color: #1a73e8;
          border: none;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }
        .btn-offer:hover {
          background-color: #1558b0;
          transform: scale(1.05);
        }

        /* Testimonials Section */
        .testimonials-section h2 {
          font-size: 36px;
          margin-bottom: 40px;
        }
        .testimonials-cards {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 30px;
        }
        .testimonial-card {
          background-color: #fff;
          border-radius: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.1);
          padding: 30px 20px;
          width: 380px;
          transition: transform 0.3s ease;
          font-style: italic;
        }
        .testimonial-card p {
          font-size: 16px;
          margin-bottom: 15px;
          line-height: 1.6;
        }
        .testimonial-card span {
          font-size: 14px;
          font-weight: 600;
          color: #555;
        }

        /* Contact Section */
        .contact-section h2 {
          font-size: 36px;
          margin-bottom: 20px;
        }
        .contact-section p {
          font-size: 18px;
          line-height: 1.6;
        }

        /* Footer */
        footer {
          background-color: #0a0a0a;
          color: #fff;
          text-align: center;
          padding: 20px;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          nav ul li {
            margin-left: 15px;
          }
          .home-section h1 {
            font-size: 42px;
          }
          .home-section p {
            font-size: 18px;
          }
          .services-cards, .offers-cards, .testimonials-cards {
            flex-direction: column;
            align-items: center;
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Home;
