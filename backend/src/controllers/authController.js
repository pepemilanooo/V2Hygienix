const { query } = require('../utils/query');
const { comparePassword, signToken } = require('../utils/security');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND attivo = true LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const user = result.rows[0];
    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    const token = signToken(user);
    delete user.password_hash;

    return res.json({ token, user });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const result = await query(
      'SELECT id, nome, cognome, email, telefono, ruolo, attivo, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );
    return res.json(result.rows[0] || null);
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, me };
