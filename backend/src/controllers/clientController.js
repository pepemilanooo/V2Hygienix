const { query } = require('../utils/query');
const { createId, sanitizePagination } = require('../utils/helpers');

async function listClients(req, res, next) {
  try {
    const { pageSize, offset } = sanitizePagination(req.query);
    const result = await query(
      `SELECT c.*,
              COUNT(l.id)::int AS sedi_count
       FROM clients c
       LEFT JOIN locations l ON l.client_id = c.id
       GROUP BY c.id
       ORDER BY c.ragione_sociale
       LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function getClient(req, res, next) {
  try {
    const clientResult = await query(`SELECT * FROM clients WHERE id = $1`, [req.params.id]);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente non trovato' });
    }

    const locationsResult = await query(
      `SELECT * FROM locations WHERE client_id = $1 ORDER BY nome_sede`,
      [req.params.id]
    );

    return res.json({
      ...clientResult.rows[0],
      sedi: locationsResult.rows
    });
  } catch (error) {
    return next(error);
  }
}

async function createClient(req, res, next) {
  try {
    const {
      ragione_sociale,
      piva,
      cf,
      email,
      telefono,
      indirizzo_fatturazione,
      consulente,
      numero_consulente,
      note
    } = req.body;

    const result = await query(
      `INSERT INTO clients (
        id, ragione_sociale, piva, cf, email, telefono, indirizzo_fatturazione,
        consulente, numero_consulente, note
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        createId(),
        ragione_sociale,
        piva || null,
        cf || null,
        email || null,
        telefono || null,
        indirizzo_fatturazione || null,
        consulente || null,
        numero_consulente || null,
        note || null
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function updateClient(req, res, next) {
  try {
    const {
      ragione_sociale,
      piva,
      cf,
      email,
      telefono,
      indirizzo_fatturazione,
      consulente,
      numero_consulente,
      note
    } = req.body;

    const result = await query(
      `UPDATE clients
       SET ragione_sociale = COALESCE($2, ragione_sociale),
           piva = COALESCE($3, piva),
           cf = COALESCE($4, cf),
           email = COALESCE($5, email),
           telefono = COALESCE($6, telefono),
           indirizzo_fatturazione = COALESCE($7, indirizzo_fatturazione),
           consulente = COALESCE($8, consulente),
           numero_consulente = COALESCE($9, numero_consulente),
           note = COALESCE($10, note),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id, ragione_sociale, piva, cf, email, telefono, indirizzo_fatturazione, consulente, numero_consulente, note]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente non trovato' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listClients, getClient, createClient, updateClient };
