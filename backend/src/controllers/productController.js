const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');

async function listProducts(req, res, next) {
  try {
    const result = await query(`SELECT * FROM products ORDER BY nome_commerciale`);
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const {
      nome_commerciale, principio_attivo, numero_registro, categoria,
      unita_misura, quantita_disponibile, quantita_minima, scheda_sicurezza_url
    } = req.body;
    const result = await query(
      `INSERT INTO products (
        id, nome_commerciale, principio_attivo, numero_registro, categoria,
        unita_misura, quantita_disponibile, quantita_minima, scheda_sicurezza_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [createId(), nome_commerciale, principio_attivo || null, numero_registro || null, categoria || null,
        unita_misura || null, quantita_disponibile || 0, quantita_minima || 0, scheda_sicurezza_url || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listProducts, createProduct };
