const { query } = require('../utils/query');

async function listClientDocuments(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM client_documents
       WHERE client_id = $1
       ORDER BY created_at DESC`,
      [req.params.clientId]
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listClientDocuments };
