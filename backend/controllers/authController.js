const { sql } = require('../config/db'); // Veri tabanı bağlantımız
const bcrypt = require('bcryptjs');

// Kayıt Olma (Register) Fonksiyonu
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body; // İngilizce alan standartları

    // 1. Gelen veriler boş mu kontrolü (Hata yönetimi)
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // 2. Bu e-posta daha önce kayıt olmuş mu? (SQL Sorgusu)
    // BAK BURADA ESKİDEN "User.findOne" VARDI, ŞİMDİ DOĞRUDAN SQL SORGUSU VAR!
    const userCheck = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (userCheck.recordset.length > 0) {
        return res.status(400).json({ message: "This email is already registered!" });
    }

    // 3. Şifreyi güvenli hale getirmek için hashle (Bcrypt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Yeni kullanıcıyı MS SQL veri tabanına kaydet
    await sql.query`
        INSERT INTO Users (name, email, password) 
        VALUES (${name}, ${email}, ${hashedPassword})
    `;

    // 5. Başarılı sonucunu frontend'e dön
    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    // Dokümanın istediği try-catch hata yönetimi
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
};

module.exports = { register };