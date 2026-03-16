const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');

async function listInvoices(req, res, next) {
  try {
    const result = await query(
      `SELECT i.*, c.ragione_sociale, l.nome_sede
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       LEFT JOIN locations l ON l.id = i.location_id
       ORDER BY i.created_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createInvoice(req, res, next) {
  try {
    const {
      client_id, location_id, quote_id, numero_fattura, data_fattura,
      imponibile, iva, totale, stato_pagamento, note
    } = req.body;

    const result = await query(
      `INSERT INTO invoices (
        id, client_id, location_id, quote_id, numero_fattura, data_fattura,
        imponibile, iva, totale, stato_pagamento, note
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [createId(), client_id, location_id || null, quote_id || null, numero_fattura, data_fattura || null,
       imponibile || 0, iva || 0, totale || 0, stato_pagamento || 'da_pagare', note || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listInvoices, createInvoice };
