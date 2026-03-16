const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

async function hashPassword(plainText) {
  return bcrypt.hash(plainText, 12);
}

async function comparePassword(plainText, hashed) {
  return bcrypt.compare(plainText, hashed);
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.ruolo,
      nome: user.nome,
      cognome: user.cognome,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

module.exports = { hashPassword, comparePassword, signToken };
