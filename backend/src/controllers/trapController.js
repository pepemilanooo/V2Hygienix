const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');

async function listTrapsByLocation(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM trap_points WHERE location_id = $1 ORDER BY codice`,
      [req.params.locationId]
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createTrap(req, res, next) {
  try {
    const { location_id, codice, tipo, posizione_descrizione, attiva } = req.body;
    const result = await query(
      `INSERT INTO trap_points (id, location_id, codice, tipo, posizione_descrizione, attiva)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [createId(), location_id, codice, tipo, posizione_descrizione || null, attiva ?? true]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listTrapsByLocation, createTrap };
