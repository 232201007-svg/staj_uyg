const express = require('express');
const router = express.Router();
const { register } = require('../controllers/authController');

// frontend buraya istek atacak: /api/auth/register
router.post('/register', register);

module.exports = router;