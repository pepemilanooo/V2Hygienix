const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');

async function listQuotes(req, res, next) {
  try {
    const result = await query(
      `SELECT q.*, c.ragione_sociale, l.nome_sede
       FROM quotes q
       JOIN clients c ON c.id = q.client_id
       LEFT JOIN locations l ON l.id = q.location_id
       ORDER BY q.created_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createQuote(req, res, next) {
  try {
    const { client_id, location_id, numero_preventivo, oggetto, descrizione, imponibile, iva, totale, stato, note } = req.body;
    const result = await query(
      `INSERT INTO quotes (
        id, client_id, location_id, numero_preventivo, oggetto, descrizione,
        imponibile, iva, totale, stato, note
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [createId(), client_id, location_id || null, numero_preventivo, oggetto, descrizione || null, imponibile || 0, iva || 0, totale || 0, stato || 'bozza', note || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listQuotes, createQuote };
