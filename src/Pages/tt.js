const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 5000;

// Configuration de la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // Remplacez par votre mot de passe MySQL
  database: 'bank_management',
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connecté à la base de données MySQL!');
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true,
  })
);




// 🔹 Route de connexion (Login)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur de base de données' });

    if (result.length === 0) return res.status(400).json({ message: 'Utilisateur non trouvé' });

    bcrypt.compare(password, result[0].password, (err, isMatch) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la comparaison du mot de passe' });

      if (!isMatch) return res.status(400).json({ message: 'Mot de passe incorrect' });

      req.session.user = {
        id: result[0].id,
        firstname: result[0].firstname,
        lastname: result[0].lastname,
        email: result[0].email,
        phone: result[0].phone,
      };

      const token = jwt.sign({ userId: result[0].id }, 'your-jwt-secret', { expiresIn: '1h' });

      res.status(200).json({
        message: 'Connexion réussie',
        token,
        user: req.session.user,
      });
    });
  });
});

// Fonction pour vérifier le token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, 'your-jwt-secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    req.userId = decoded.userId;
    next();
  });
};

// 🔹 Route pour récupérer le profil de l'utilisateur connecté avec vérification du token
app.get('/api/profile', verifyToken, (req, res) => {
  const userId = req.userId;

  const sql = `SELECT firstname, lastname, email, phone, birthday, address, state, city, zip, gender,account_balance, 
                      REPLACE(profile_photo, 'uploads/profile_photo-', '') AS profile_photo 
               FROM users WHERE id = ?`;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération du profil:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(result[0]);
  });
});


// Ajouter une nouvelle carte et un solde (lié à l'utilisateur connecté)
app.post("/add-payment", verifyToken, (req, res) => {
  const { card_number, card_holder, expiry_date, cvv, amount } = req.body;
  const userId = req.userId; // Récupération de l'ID utilisateur depuis le token

  if (!card_number || !card_holder || !expiry_date || !cvv || !amount) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // On extrait également les 4 derniers chiffres
  const card_number_last4 = card_number.slice(-4);

  const sql = `
    INSERT INTO account_balance (user_id, card_number, card_number_last4, card_holder, expiry_date, cvv, amount) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [userId, card_number, card_number_last4, card_holder, expiry_date, cvv, amount], (err, result) => {
    if (err) {
      console.error("Erreur lors de l'ajout de la carte:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ message: "Carte ajoutée avec succès", id: result.insertId });
  });
});


// Récupérer toutes les cartes enregistrées d'un utilisateur
app.get("/get-payments", (req, res) => {
  const user_id = req.query.user_id; // On récupère l'ID utilisateur depuis les paramètres de requête

  if (!user_id) {
    return res.status(400).json({ message: "L'ID utilisateur est requis" });
  }

  const sql = "SELECT id, card_number, card_number_last4, card_holder, expiry_date, amount FROM account_balance WHERE user_id = ?";
  
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des cartes:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
});

// Endpoint pour effectuer un transfert
app.post("/api/transfer", verifyToken, (req, res) => {
  const senderId = req.userId; // Expéditeur extrait du token
  const { receiverEmail, receiverName, selected_card_id, card_cvv, amount } = req.body;

  if (!receiverEmail || !receiverName || !selected_card_id || !card_cvv || !amount) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // 1. Récupérer la carte sélectionnée pour l'expéditeur
  const getCardSql = "SELECT * FROM account_balance WHERE id = ? AND user_id = ?";
  db.query(getCardSql, [selected_card_id, senderId], (err, cardResults) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (cardResults.length === 0) {
      return res.status(400).json({ message: "Carte non trouvée pour l'utilisateur" });
    }
    const card = cardResults[0];

    // 2. Vérifier le CVV de la carte sélectionnée
    if (card.cvv !== card_cvv) {
      return res.status(400).json({ message: "CVV incorrect pour la carte sélectionnée" });
    }

    // 3. Vérifier que la carte a suffisamment de solde
    const cardBalance = parseFloat(card.amount);
    if (cardBalance < amount) {
      return res.status(400).json({ message: "Solde de la carte insuffisant pour le transfert" });
    }

    // 4. Vérifier l'existence du destinataire via email et nom complet
    const getReceiverSql = "SELECT id FROM users WHERE email = ? AND CONCAT(firstname, ' ', lastname) = ?";
    db.query(getReceiverSql, [receiverEmail, receiverName], (err, receiverResults) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" });
      if (receiverResults.length === 0) {
        return res.status(400).json({ message: "Destinataire non trouvé" });
      }
      const receiverId = receiverResults[0].id;

      // 5. Générer un code PIN aléatoire (4 chiffres)
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString();

      // 6. Effectuer la transaction dans une transaction SQL
      db.beginTransaction((err) => {
        if (err) return res.status(500).json({ message: "Erreur serveur" });

        // Déduction du montant sur la carte sélectionnée
        const updateCardSql = "UPDATE account_balance SET amount = amount - ? WHERE id = ? AND user_id = ?";
        db.query(updateCardSql, [amount, selected_card_id, senderId], (err, updateCardResult) => {
          if (err) {
            return db.rollback(() => res.status(500).json({ message: "Erreur lors de la déduction du solde de la carte" }));
          }
          // Ajout du montant au solde du destinataire dans la table users
          const updateReceiverSql = "UPDATE users SET account_balance = account_balance + ? WHERE id = ?";
          db.query(updateReceiverSql, [amount, receiverId], (err, updateReceiverResult) => {
            if (err) {
              return db.rollback(() => res.status(500).json({ message: "Erreur lors de l'ajout du solde au destinataire" }));
            }
            // Insertion de l'historique du transfert
            const insertHistorySql = "INSERT INTO transfer_history (sender_id, receiver_id, card_id, amount, pin) VALUES (?, ?, ?, ?, ?)";
            db.query(insertHistorySql, [senderId, receiverId, selected_card_id, amount, pinCode], (err, historyResult) => {
              if (err) {
                return db.rollback(() => res.status(500).json({ message: "Erreur lors de l'enregistrement de l'historique du transfert" }));
              }
              db.commit((err) => {
                if (err) {
                  return db.rollback(() => res.status(500).json({ message: "Erreur lors de la transaction" }));
                }
                res.status(200).json({ message: "Transfert réussi", pin: pinCode });
              });
            });
          });
        });
      });
    });
  });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur le port ${port}`);
});
