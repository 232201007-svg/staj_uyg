const express = require('express');
const router = express.Router();

// Controller dosyamızdan fonksiyonları tek tek güvenli paket olarak çekiyoruz
const authController = require('../controllers/authController');

// Güvenlik duvarı middleware'imizi içeri alıyoruz
const { protect } = require('../middleware/authMiddleware');

// 1. Normal Rotalar (Giriş gerektirmeyenler)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// 2. Korumalı Rota (Biletsiz/Tokensız girilemeyen profil rotası)
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: "Gardaş gizli bölgeye başarıyla sızdın! İşte biletindeki bilgiler:",
        user: req.user
    });
});

// 🚀 Şifre Değiştirme Rotası (Protect Korumalı)
// Bu yazım tarzı (authController.changePassword) sayesinde asla undefined hatası fırlatamaz, kurşungeçirmezdir!
router.post('/change-password', protect, authController.changePassword);

module.exports = router;