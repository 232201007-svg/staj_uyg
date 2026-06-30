const mongoose = require('mongoose');

// Dokümanın istediği İngilizce standartlara (Clean Code) uygun şema 
const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ad ve soyadı tek alanda 'name' yapabiliriz veya firstName/lastName ayırabiliriz. Doküman name istemiş.
  email: { type: String, required: true, unique: true }, // e-posta 
  password: { type: String, required: true }, // şifre 
  
  // Şifremi unuttum akışı (Faz 1 - Madde 3) için gerekli alanlar 
  resetPasswordToken: { type: String }, 
  resetPasswordExpire: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);