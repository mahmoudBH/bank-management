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

  const sql = `SELECT firstname, lastname, email, phone, birthday, address, state, city, zip, gender, 
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

// Ajouter une nouvelle carte et un solde
app.post("/add-payment", (req, res) => {
  const { user_id, card_number, card_holder, expiry_date, cvv, amount } = req.body;

  if (!user_id || !card_number || !card_holder || !expiry_date || !cvv || !amount) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  // On stocke uniquement les 4 derniers chiffres de la carte
  const card_number_last4 = card_number.slice(-4);

  const sql = `
    INSERT INTO account_balance (user_id, card_number_last4, card_holder, expiry_date, cvv, amount) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, card_number_last4, card_holder, expiry_date, cvv, amount], (err, result) => {
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

  const sql = "SELECT id, card_number_last4, card_holder, expiry_date, amount FROM account_balance WHERE user_id = ?";
  
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des cartes:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(results);
  });
});




// Lancer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur le port ${port}`);
});
