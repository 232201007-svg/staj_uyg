const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Şifreyi güvenli hale getirmek için dokümandaki kütüphane

// Kayıt Olma Fonksiyonu
const register = async (req, res) => {
  try {
    const { ad, soyad, eposta, sifre } = req.body;

    // 1. Bu e-posta daha önce kullanılmış mı kontrol et
    const userExists = await User.findOne({ eposta });
    if (userExists) {
      return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı!" });
    }

    // 2. Şifreyi hashle (Geri dönüştürülemeyecek şekilde şifrele)
    const salt = await bcrypt.genSalt(10);
    const hashedSifre = await bcrypt.hash(sifre, salt);

    // 3. Yeni kullanıcıyı oluştur ve veri tabanına kaydet
    const newUser = new User({
      ad,
      soyad,
      eposta,
      sifre: hashedSifre
    });

    await newUser.save();
    res.status(201).json({ message: "Kullanıcı başarıyla kayıt oldu!" });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası!", error: error.message });
  }
};

module.exports = { register };