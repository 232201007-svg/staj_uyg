const sql = require('mssql');
require('dotenv').config(); 

// SQL Server şifreli kullanıcı bağlantı ayarları
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    options: {
        encrypt: true, 
        trustServerCertificate: true // Lokal bilgisayarda sertifika hatası vermemesi için şart
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("Gardaş MS SQL Server bağlantısı başarıyla kuruldu!");
    } catch (err) {
        console.error("Veri tabanına bağlanırken hata çıktı: ", err.message);
        process.exit(1); 
    }
};

module.exports = { sql, connectDB };