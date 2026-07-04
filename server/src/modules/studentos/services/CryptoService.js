const CryptoJS = require('crypto-js');

const SECRET = process.env.STUDENTOS_TOKEN_SECRET || 'studentos-fallback-secret-32chars!';

/**
 * AES-256 encryption/decryption for Google OAuth tokens.
 * Tokens are encrypted before storage and decrypted on read.
 */
const CryptoService = {
  encrypt(plainText) {
    if (!plainText) return '';
    return CryptoJS.AES.encrypt(plainText, SECRET).toString();
  },

  decrypt(cipherText) {
    if (!cipherText) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return '';
    }
  },
};

module.exports = CryptoService;
