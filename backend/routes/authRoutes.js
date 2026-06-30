const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController'); // login fonksiyonunu da çektik

// /api/auth/register
router.post('/register', register);

// /api/auth/login -> YENİ ROTA
router.post('/login', login);

module.exports = router;