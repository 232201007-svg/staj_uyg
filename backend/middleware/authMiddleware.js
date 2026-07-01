const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // 1. Header kontrolü (Bearer token var mı?)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı şifreli metinden ayırıyoruz
      token = req.headers.authorization.split(' ')[1];

      // Token'ı gizli anahtarla çözüyoruz
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtarim');

      // 🚨 SÜSLÜ PARANTEZLERİ DÜZELTİLMİŞ SEKTÖR:
      // Global veya yerel sql bağlantısını güvenli bir şekilde tetikliyoruz
      let mssql;
      try {
        mssql = require('mssql');
      } catch (err) {
        throw new Error("mssql modülü yüklenemedi!");
      }

      // Veritabanı bağlantı havuzunu açıyoruz
      let pool = await mssql.connect();
      
      // Veritabanından e-posta dahil tüm satırı çekiyoruz
      const userResult = await pool.request()
        .input('id', decoded.id)
        .query('SELECT id, name, email, createdAt FROM Users WHERE id = @id');

      const dbUser = userResult.recordset[0];

      if (!dbUser) {
        return res.status(401).json({ message: "Bu token'a ait kullanıcı bulunamadı!" });
      }

      // 🚀 Artık req.user içinde id, name VE email aslanlar gibi bir arada duruyor!
      req.user = dbUser;

      return next(); // Kapıyı aç, yoluna devam etsin
    } catch (error) {
      console.error('Yetkilendirme middleware hatası:', error);
      return res.status(401).json({ message: 'Yetkilendirme başarısız, geçersiz token!' });
    }
  }

  // Eğer if bloğuna hiç girmediyse veya token yoksa buraya düşer
  if (!token) {
    return res.status(401).json({ message: 'Yetkilendirme başarısız, token bulunamadı!' });
  }
};

module.exports = { protect };