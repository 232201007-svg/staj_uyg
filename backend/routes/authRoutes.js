const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// Güvenlik duvarı middleware'imizi içeri alıyoruz
const { protect } = require('../middleware/authMiddleware');

// 1. Normal Rotalar (Giriş gerektirmeyenler)
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 2. Korumalı Rota (Biletsiz/Tokensız girilemeyen profil rotası)
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: "Gardaş gizli bölgeye başarıyla sızdın! İşte biletindeki bilgiler:",
        user: req.user
    });
});

module.exports = router;