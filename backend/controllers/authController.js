const { sql } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Yeni yüklediğimiz JWT kütüphanesi
const crypto = require('crypto'); // Rastgele token üretmek için Node.js'in kendi paketi

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

// 3. YENİ: Şifremi Unuttum (Forgot Password)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required!" });
    }

    // Kullanıcıyı e-posta ile ara
    const userResult = await sql.query`SELECT * FROM Users WHERE email = ${email}`;
    if (userResult.recordset.length === 0) {
        return res.status(404).json({ message: "User not found with this email!" });
    }

    const user = userResult.recordset[0];

    // Rastgele 20 karakterlik benzersiz bir token üret
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Token'ın ömrünü 10 dakika yap (Şu anki zamana 10 dakika ekle)
    const expireDate = new Date(Date.now() + 10 * 60 * 1000);

    // Veri tabanındaki ilgili kullanıcının reset alanlarını güncelle
    await sql.query`
        UPDATE Users 
        SET resetPasswordToken = ${resetToken}, resetPasswordExpire = ${expireDate}
        WHERE id = ${user.id}
    `;

    // Şefin istediği tüyo: Linki terminale konsol çıktısı olarak yazdırıyoruz
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    console.log("\nGardaş Şifre Sıfırlama Linki Aşağıda, Kopyala Next.js'te Lazım Olacak:");
    console.log(`👉 ${resetUrl} \n`);

    res.status(200).json({ message: "Reset token generated and sent to console!" });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
};

// 4. YENİ: Yeni Şifreyi Belirleme (Reset Password)
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body; // Token ve yeni şifreyi alıyoruz

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required!" });
    }

    // Dokümanın istediği veri kontrolü: Şifre en az 6 karakter mi? (Faz 2 - Madde 4)
    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long!" });
    }

    // Veri tabanında bu token'a sahip ve süresi geçmemiş (Expire tarihi şu andan büyük) kullanıcıyı ara
    const now = new Date();
    const userResult = await sql.query`
        SELECT * FROM Users 
        WHERE resetPasswordToken = ${token} AND resetPasswordExpire > ${now}
    `;

    if (userResult.recordset.length === 0) {
        return res.status(400).json({ message: "Invalid or expired token!" });
    }

    const user = userResult.recordset[0];

    // Yeni şifreyi Bcrypt ile hashle (Temiz ve Güvenli Kod)
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Kullanıcının şifresini güncelle, token alanlarını sıfırla (NULL yap)
    await sql.query`
        UPDATE Users 
        SET password = ${hashedNewPassword}, resetPasswordToken = NULL, resetPasswordExpire = NULL
        WHERE id = ${user.id}
    `;

    res.status(200).json({ message: "Password reset successful! You can now login with your new password." });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
};

// ... dosyadaki diğer eski fonksiyonlar (register, login vs.) yukarıda kalacak ...

// 🚀 404 VE EXPORT HATASINI ÇÖZEN GERÇEK ŞİFRE DEĞİŞTİRME FONKSİYONU
// 🛠️ 500 HATASINI ÇÖZEN GÜNCEL ŞİFRE DEĞİŞTİRME LOGİC (authController.js içi)
// 🛠️ KOLON HATASINI ÇÖZEN GÜNCEL ŞİFRE DEĞİŞTİRME LOGİC (authController.js içi)
// 🛠️ ŞİFRELEME (HASH) UYUMSUZLUĞUNU ÇÖZEN GÜNCEL FONKSİYON
const changePassword = async (req, res) => {
  try {
    console.log("=== 🔐 ŞİFRE DEĞİŞTİRME TETİKLENDİ ===");
    
    const userId = req.user?.id || req.user?._id || req.user?.Id; 
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun!' });
    }

    let pool;
    try {
      const mssql = require('mssql'); 
      pool = await mssql.connect(); 
    } catch (dbErr) {
      const mssql = require('mssql');
      if (typeof dbConfig !== 'undefined') { pool = await mssql.connect(dbConfig); }
      else if (typeof config !== 'undefined') { pool = await mssql.connect(config); }
      else { throw new Error("Veritabanı konfigürasyonu bulunamadı!"); }
    }

    // Kullanıcıyı veritabanından çekiyoruz
    const userResult = await pool.request()
      .input('id', userId) 
      .query('SELECT * FROM Users WHERE id = @id');

    const dbUser = userResult.recordset[0];

    if (!dbUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı!' });
    }

    const currentDbPassword = dbUser.Password || dbUser.password || dbUser.sifre;
    
    // 🛡️ BCRYPTJS İLE DOĞRULAMA (En tepedeki bcryptjs değişkenini kullanıyor)
    const isMatch = await bcrypt.compare(oldPassword, currentDbPassword);
    console.log("Bcryptjs Eşleşme Sonucu:", isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifreniz hatalı!' });
    }

    // 🚀 YENİ ŞİFREYİ DE BCRYPTJS İLE HASH'LEYİP KAYDEDİYORUZ
    const salt = await bcrypt.genSalt(10);
    const passwordToSave = await bcrypt.hash(newPassword, salt);

    const passwordColumn = dbUser.Password ? 'Password' : 'password';

    await pool.request()
      .input('id', userId)
      .input('newPass', passwordToSave)
      .query(`UPDATE Users SET ${passwordColumn} = @newPass WHERE id = @id`);

    console.log("=== ✅ ŞİFRE BAŞARIYLA GÜNCELLENDİ ===");
    return res.status(200).json({ message: 'Şifreniz başarıyla değiştirildi!' });

  } catch (error) {
    console.error('❌ ŞİFRE DEĞİŞTİRME CORESİNDE PATLAYAN YER:', error);
    return res.status(500).json({ message: `Sunucu Hatası: ${error.message || 'Veritabanı hatası'}` });
  }
};

// 🚨 DOSYANIN EN ALTINDAKİ EXPORT ALANINI BUNA GÖRE EKSİKSİZ AYARLA:
module.exports = {
  register,   // yukarıda tanımlı olan register fonksiyonun
  login,      // yukarıda tanımlı olan login fonksiyonun
  forgotPassword,
  resetPassword,
  changePassword // <-- İşte yukarıda yazdığımız yeni fonksiyonu buraya kilitledik!
};