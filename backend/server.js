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

// Pour servir les fichiers statiques dans le dossier "uploads"
app.use('/uploads', express.static('uploads'));

// Configuration de Multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où les photos seront stockées
  },
  filename: (req, file, cb) => {
    // Génère un nom basé uniquement sur la date
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// 🔹 Route d'inscription (Signup)
app.post('/api/signup', (req, res) => {
  const { firstname, lastname, email, phone, password } = req.body;

  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur de base de données' });

    if (result.length > 0) {
      return res.status(400).json({ message: 'L\'utilisateur existe déjà' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: 'Erreur de hachage' });

      const insertQuery =
        'INSERT INTO users (firstname, lastname, email, phone, password) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [firstname, lastname, email, phone, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur d\'inscription' });

        const token = jwt.sign({ userId: result.insertId }, 'your-jwt-secret', { expiresIn: '1h' });

        res.status(200).json({ message: 'Inscription réussie', token });
      });
    });
  });
});

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

  const sql = `SELECT firstname, lastname, email, phone, birthday, address, state, city, zip, gender, COALESCE(account_balance, 0) AS account_balance, 
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

// 🔹 Route pour mettre à jour le profil utilisateur (avec possibilité d'uploader la photo)
app.put('/api/update-profile', verifyToken, upload.single('profile_photo'), (req, res) => {
  const userId = req.userId;
  const { firstname, lastname, email, phone, birthday, address, state, city, zip, gender } = req.body;

  let sql, values;
  // Si une photo est uploadée, on met à jour le champ profile_photo
  if (req.file) {
    const profilePhotoPath = `uploads/${req.file.filename}`;
    sql = `
      UPDATE users 
      SET firstname = ?, lastname = ?, email = ?, phone = ?, 
          birthday = ?, address = ?, state = ?, city = ?, zip = ?, gender = ?, profile_photo = ?
      WHERE id = ?
    `;
    values = [firstname, lastname, email, phone, birthday, address, state, city, zip, gender, profilePhotoPath, userId];
  } else {
    sql = `
      UPDATE users 
      SET firstname = ?, lastname = ?, email = ?, phone = ?, 
          birthday = ?, address = ?, state = ?, city = ?, zip = ?, gender = ?
      WHERE id = ?
    `;
    values = [firstname, lastname, email, phone, birthday, address, state, city, zip, gender, userId];
  }

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Erreur lors de la mise à jour du profil:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json({ message: 'Profil mis à jour avec succès' });
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

// Endpoint pour récupérer l'historique des transferts pour l'utilisateur connecté
app.get("/api/transfer-history", verifyToken, (req, res) => {
  const userId = req.userId; // ID de l'utilisateur connecté

  const sql = `
    SELECT 
      t.id,
      t.sender_id,
      t.receiver_id,
      t.card_id,
      t.amount,
      t.pin,
      t.transfer_date,
      sender.firstname AS sender_firstname,
      sender.lastname AS sender_lastname,
      receiver.firstname AS receiver_firstname,
      receiver.lastname AS receiver_lastname,
      CONCAT('**** **** **** ', ab.card_number_last4) AS card_display
    FROM transfer_history t
    JOIN users sender ON t.sender_id = sender.id
    JOIN users receiver ON t.receiver_id = receiver.id
    JOIN account_balance ab ON t.card_id = ab.id
    WHERE t.sender_id = ? OR t.receiver_id = ?
    ORDER BY t.transfer_date DESC
  `;
  
  db.query(sql, [userId, userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de l'historique:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
});

// Dépot depuis une carte vers le solde utilisateur
app.post('/api/deposit', verifyToken, (req, res) => {
  const { card_id, amount, cvv } = req.body;
  const userId = req.userId;

  if (!card_id || !amount || !cvv) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  const getCardSql = `
    SELECT id, amount 
    FROM account_balance 
    WHERE id = ? AND user_id = ? AND cvv = ?
  `;

  db.query(getCardSql, [card_id, userId, cvv], (err, cardResults) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (!cardResults.length) {
      return res.status(400).json({ message: "CVV invalide ou carte non trouvée" });
    }

    const cardAmount = parseFloat(cardResults[0].amount) || 0;
    if (cardAmount < parseFloat(amount)) {
      return res.status(400).json({ message: "Solde insuffisant sur la carte" });
    }

    db.beginTransaction((transactionErr) => {
      if (transactionErr) return res.status(500).json({ message: "Erreur transaction" });

      const updateCardSql = `
        UPDATE account_balance 
        SET amount = amount - ? 
        WHERE id = ? AND amount >= ?
      `;

      db.query(updateCardSql, [amount, card_id, amount], (updateErr) => {
        if (updateErr) return db.rollback(() => res.status(500).json({ message: "Erreur mise à jour carte" }));

        const updateUserSql = `
          UPDATE users 
          SET account_balance = account_balance + ? 
          WHERE id = ?
        `;

        db.query(updateUserSql, [amount, userId], (userErr) => {
          if (userErr) return db.rollback(() => res.status(500).json({ message: "Erreur mise à jour solde" }));

          const insertTransactionSql = `
            INSERT INTO transactions (user_id, card_id, type, amount) 
            VALUES (?, ?, 'deposit', ?)
          `;

          db.query(insertTransactionSql, [userId, card_id, amount], (transErr) => {
            if (transErr) return db.rollback(() => res.status(500).json({ message: "Erreur enregistrement transaction" }));

            db.commit((commitErr) => {
              if (commitErr) return db.rollback(() => res.status(500).json({ message: "Échec validation" }));

              res.json({ message: "Dépôt réussi" });
            });
          });
        });
      });
    });
  });
});


// Retrait du solde utilisateur vers une carte
app.post('/api/withdraw', verifyToken, (req, res) => {
  const { card_id, amount } = req.body;
  const userId = req.userId;

  if (!card_id || !amount || isNaN(amount)) {
    return res.status(400).json({ message: "Paramètres invalides" });
  }

  const withdrawalAmount = parseFloat(amount);

  const getUserSql = "SELECT account_balance FROM users WHERE id = ?";
  
  db.query(getUserSql, [userId], (err, userResults) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });

    if (!userResults.length) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const userBalance = parseFloat(userResults[0].account_balance) || 0;
    if (userBalance < withdrawalAmount) {
      return res.status(400).json({ message: "Solde insuffisant" });
    }

    db.beginTransaction((transactionErr) => {
      if (transactionErr) return res.status(500).json({ message: "Erreur transaction" });

      const updateUserSql = `
        UPDATE users 
        SET account_balance = account_balance - ? 
        WHERE id = ? AND account_balance >= ?
      `;

      db.query(updateUserSql, [withdrawalAmount, userId, withdrawalAmount], (updateUserErr) => {
        if (updateUserErr) return db.rollback(() => res.status(500).json({ message: "Erreur débit solde" }));

        const updateCardSql = `
          UPDATE account_balance 
          SET amount = amount + ? 
          WHERE id = ?
        `;

        db.query(updateCardSql, [withdrawalAmount, card_id], (updateCardErr) => {
          if (updateCardErr) return db.rollback(() => res.status(500).json({ message: "Erreur crédit carte" }));

          const insertTransactionSql = `
            INSERT INTO transactions (user_id, card_id, type, amount) 
            VALUES (?, ?, 'withdraw', ?)
          `;

          db.query(insertTransactionSql, [userId, card_id, withdrawalAmount], (transErr) => {
            if (transErr) return db.rollback(() => res.status(500).json({ message: "Erreur enregistrement transaction" }));

            db.commit((commitErr) => {
              if (commitErr) return db.rollback(() => res.status(500).json({ message: "Échec validation" }));

              res.json({ message: "Retrait réussi" });
            });
          });
        });
      });
    });
  });
});

app.get('/api/transactions', verifyToken, (req, res) => {
  const userId = req.userId;

  const getTransactionsSql = `
    SELECT t.id, t.type, t.amount, t.created_at, a.card_number
    FROM transactions t
    LEFT JOIN account_balance a ON t.card_id = a.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
  `;

  db.query(getTransactionsSql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur", error: err });
    }

    res.json({ transactions: results });
  });
});


// Lancer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur le port ${port}`);
});
