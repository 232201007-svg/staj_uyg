const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db.js'); 
const authRoutes = require('./routes/authRoutes');

const app = express();

// Sunucu açılırken MS SQL'e bağlansın
connectDB();

// MİDDLEWARE (Ara Yazılımlar)
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.json()); 

// YOLLARI BAĞLAMA
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gardaş sunucu ${PORT} portunda cayır cayır çalışıyor...`);
});