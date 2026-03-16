const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');
const { createSimpleInterventionPdf } = require('../services/pdfGenerator');
const { uploadBuffer } = require('../services/s3Service');

async function listInterventions(req, res, next) {
  try {
    let sql = `
      SELECT i.*, c.ragione_sociale, l.nome_sede, u.nome AS tecnico_nome, u.cognome AS tecnico_cognome
      FROM interventions i
      JOIN clients c ON c.id = i.client_id
      JOIN locations l ON l.id = i.location_id
      LEFT JOIN users u ON u.id = i.technician_id
    `;
    const params = [];
    if (req.user.role === 'tecnico') {
      sql += ' WHERE i.technician_id = $1';
      params.push(req.user.id);
    }
    sql += ' ORDER BY i.data_programmata DESC NULLS LAST, i.created_at DESC';

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createIntervention(req, res, next) {
  try {
    const {
      client_id, location_id, technician_id, pest_type_id, treatment_method_id,
      data_programmata, stato, note_tecnico, note_interne
    } = req.body;

    const result = await query(
      `INSERT INTO interventions (
        id, client_id, location_id, technician_id, pest_type_id, treatment_method_id,
        data_programmata, stato, note_tecnico, note_interne
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [createId(), client_id, location_id, technician_id || null, pest_type_id || null, treatment_method_id || null,
        data_programmata || null, stato || 'pianificato', note_tecnico || null, note_interne || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function completeIntervention(req, res, next) {
  try {
    const interventionId = req.params.id;

    const interventionResult = await query(
      `SELECT i.*, c.ragione_sociale, l.nome_sede, u.nome AS tecnico_nome, u.cognome AS tecnico_cognome
       FROM interventions i
       JOIN clients c ON c.id = i.client_id
       JOIN locations l ON l.id = i.location_id
       LEFT JOIN users u ON u.id = i.technician_id
       WHERE i.id = $1`,
      [interventionId]
    );

    if (interventionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Intervento non trovato' });
    }

    const intervention = interventionResult.rows[0];
    const pdfBuffer = await createSimpleInterventionPdf(intervention);
    const key = `reports/interventions/${interventionId}.pdf`;
    const upload = await uploadBuffer({
      key,
      buffer: pdfBuffer,
      contentType: 'application/pdf'
    });

    await query(
      `UPDATE interventions
       SET stato = 'completato',
           data_esecuzione = COALESCE(data_esecuzione, CURRENT_TIMESTAMP),
           check_out_time = COALESCE(check_out_time, CURRENT_TIMESTAMP),
           report_pdf_url = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [interventionId, upload.url]
    );

    await query(
      `INSERT INTO client_documents (
        id, client_id, location_id, intervention_id, tipo_documento, titolo, file_url, data_documento
      ) VALUES ($1,$2,$3,$4,'report_intervento',$5,$6,CURRENT_DATE)`,
      [createId(), intervention.client_id, intervention.location_id, interventionId,
        `Report intervento ${intervention.nome_sede}`, upload.url]
    );

    return res.json({
      message: 'Intervento chiuso e PDF generato',
      report_pdf_url: upload.url
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listInterventions, createIntervention, completeIntervention };
