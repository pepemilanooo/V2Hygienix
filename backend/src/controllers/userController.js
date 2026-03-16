const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');
const { hashPassword } = require('../utils/security');

async function listUsers(req, res, next) {
  try {
    const result = await query(
      `SELECT id, nome, cognome, email, telefono, ruolo, attivo, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const result = await query(
      `SELECT id, nome, cognome, email, telefono, ruolo, attivo, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { nome, cognome, email, telefono, ruolo, password } = req.body;
    const id = createId();
    const passwordHash = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (id, nome, cognome, email, telefono, ruolo, password_hash, attivo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)
       RETURNING id, nome, cognome, email, telefono, ruolo, attivo, created_at, updated_at`,
      [id, nome, cognome, email, telefono || null, ruolo, passwordHash]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (String(error.message).includes('duplicate key')) {
      return res.status(409).json({ message: 'Email già presente' });
    }
    return next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { nome, cognome, telefono, ruolo, attivo } = req.body;
    const result = await query(
      `UPDATE users
       SET nome = COALESCE($2, nome),
           cognome = COALESCE($3, cognome),
           telefono = COALESCE($4, telefono),
           ruolo = COALESCE($5, ruolo),
           attivo = COALESCE($6, attivo),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, nome, cognome, email, telefono, ruolo, attivo, created_at, updated_at`,
      [req.params.id, nome, cognome, telefono, ruolo, attivo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { password } = req.body;
    const passwordHash = await hashPassword(password);
    const result = await query(
      `UPDATE users
       SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [req.params.id, passwordHash]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    return res.json({ message: 'Password aggiornata' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listUsers, getUser, createUser, updateUser, updatePassword };
