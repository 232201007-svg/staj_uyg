const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    // 1. İsteklerin "Headers" kısmında "Authorization" var mı ve "Bearer" ile mi başlıyor kontrol et
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // "Bearer eyJhbGciOi..." şeklindeki yazıdan sadece token kısmını (ikinci parçayı) alıyoruz
            token = req.headers.authorization.split(' ')[1];

            // Token'ı bizim gizli anahtarımızla (JWT_SECRET) çözüyoruz/doğruluyoruz
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Bilet doğruysa, içindeki kullanıcı bilgilerini isteğin (req) içine gömüyoruz ki sonraki fonksiyonlar kullansın
            req.user = decoded;

            // Her şey yolunda, bir sonraki aşamaya geçebilirsin komutu:
            next();

        } catch (error) {
            // Bilet sahteyse veya süresi geçmişse buraya düşer
            return res.status(401).json({ message: "Not authorized, token verification failed!" });
        }
    }

    // 2. Eğer istekte hiç token gönderilmediyse
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided!" });
    }
};

module.exports = { protect };