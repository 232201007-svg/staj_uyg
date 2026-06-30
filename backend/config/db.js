const sql = require('mssql');
require('dotenv').config();

// Windows Authentication ile uyumlu SQL Server bağlantı ayarları
const config = {
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    options: {
        encrypt: true, 
        trustServerCertificate: true // Lokal bilgisayarda sertifika hatası vermemesi için şart
    },
    // EN ÖNEMLİ KISIM: Windows oturumunu kullanmasını söyler
    authentication: {
        type: 'default',
        options: {
            userName: '', // Boş bırakıyoruz ki Windows kimliğini kullansın
            password: ''
        }
    },
    // Bazı MS SQL sürümleri için direkt Windows Authentication emri
    domain: '', 
    parseJSON: true
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("Gardaş MS SQL Server'a Windows Authentication ile başarıyla bağlandık!");
    } catch (err) {
        console.error("Veri tabanına bağlanırken hata çıktı: ", err.message);
        process.exit(1);
    }
};

module.exports = { sql, connectDB };