const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');

async function createLocation(req, res, next) {
  try {
    const {
      client_id, nome_sede, indirizzo, citta, cap, provincia, latitudine, longitudine
    } = req.body;

    const result = await query(
      `INSERT INTO locations (
        id, client_id, nome_sede, indirizzo, citta, cap, provincia, latitudine, longitudine
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [createId(), client_id, nome_sede, indirizzo || null, citta || null, cap || null, provincia || null, latitudine || null, longitudine || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function getLocationCard(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM location_cards WHERE location_id = $1 LIMIT 1`,
      [req.params.id]
    );
    return res.json(result.rows[0] || null);
  } catch (error) {
    return next(error);
  }
}

async function upsertLocationCard(req, res, next) {
  try {
    const { descrizione, zone_rischio, istruzioni_operatore, dpi_richiesti, note } = req.body;
    const existing = await query(`SELECT id FROM location_cards WHERE location_id = $1`, [req.params.id]);

    let result;
    if (existing.rows.length === 0) {
      result = await query(
        `INSERT INTO location_cards (
          id, location_id, descrizione, zone_rischio, istruzioni_operatore, dpi_richiesti, note
        ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [createId(), req.params.id, descrizione || null, zone_rischio || null, istruzioni_operatore || null, dpi_richiesti || null, note || null]
      );
    } else {
      result = await query(
        `UPDATE location_cards
         SET descrizione = COALESCE($2, descrizione),
             zone_rischio = COALESCE($3, zone_rischio),
             istruzioni_operatore = COALESCE($4, istruzioni_operatore),
             dpi_richiesti = COALESCE($5, dpi_richiesti),
             note = COALESCE($6, note),
             updated_at = CURRENT_TIMESTAMP
         WHERE location_id = $1
         RETURNING *`,
        [req.params.id, descrizione, zone_rischio, istruzioni_operatore, dpi_richiesti, note]
      );
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createLocation, getLocationCard, upsertLocationCard };
