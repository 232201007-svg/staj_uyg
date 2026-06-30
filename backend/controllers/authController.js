const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Yeni yüklediğimiz JWT kütüphanesi

// 1. Kayıt Olma Fonksiyonu (Zaten yazmıştık, aynen duruyor)
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    const userCheck = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (userCheck.recordset.length > 0) {
        return res.status(400).json({ message: "This email is already registered!" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await sql.query`
        INSERT INTO Users (name, email, password) 
        VALUES (${name}, ${email}, ${hashedPassword})
    `;
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
};

// 2. YENİ: Giriş Yapma (Login) Fonksiyonu
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kontrol 1: Alanlar boş mu?
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Kontrol 2: Bu e-postaya ait bir kullanıcı var mı?
    const userResult = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (userResult.recordset.length === 0) {
        // Dokümanın istediği anlamlı hata mesajı (Güvenlik için e-posta veya şifre hatalı deriz)
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    const user = userResult.recordset[0]; // Bulunan kullanıcıyı değişkene aldık

    // Kontrol 3: Şifreler eşleşiyor mu? (Gelen düz şifre ile DB'deki hash karşılaştırılır)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password!" });
    }

    // Her şey doğruysa: Kullanıcıya JWT (Giriş Bileti) üretme zamanı
    // .env dosyasındaki JWT_SECRET anahtarını ve kullanıcının ID'sini biletin içine gizliyoruz
    const token = jwt.sign(
        { id: user.id, name: user.name }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' } // Biletin ömrü 1 gün olsun
    );

    // Başarılı cevabı ve Token'ı frontend'e dönüyoruz
    res.status(200).json({
        message: "Login successful!",
        token: token,
        user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
};

// İki fonksiyonu da dışarıya ihraç ediyoruz
module.exports = { register, login };