const { query } = require('../utils/query');
const { createId } = require('../utils/helpers');
const { createSimpleSurveyPdf } = require('../services/pdfGenerator');
const { uploadBuffer } = require('../services/s3Service');

async function listSurveys(req, res, next) {
  try {
    const result = await query(
      `SELECT s.*, c.ragione_sociale, l.nome_sede, u.nome AS tecnico_nome, u.cognome AS tecnico_cognome
       FROM site_surveys s
       JOIN clients c ON c.id = s.client_id
       JOIN locations l ON l.id = s.location_id
       LEFT JOIN users u ON u.id = s.technician_id
       ORDER BY s.created_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    return next(error);
  }
}

async function createSurvey(req, res, next) {
  try {
    const {
      client_id, location_id, technician_id, tipo_modulo, amministratore, referente,
      tipo_struttura, numero_famiglie, condizioni_igieniche, presenza_locali_commerciali,
      tipo_locale_commerciale, orario_preferenziale, giorni_preferiti,
      data_sopralluogo, firma_operatore_nome, numero_interventi_annui, note_generali
    } = req.body;

    const result = await query(
      `INSERT INTO site_surveys (
        id, client_id, location_id, technician_id, tipo_modulo, amministratore, referente,
        tipo_struttura, numero_famiglie, condizioni_igieniche, presenza_locali_commerciali,
        tipo_locale_commerciale, orario_preferenziale, giorni_preferiti,
        data_sopralluogo, firma_operatore_nome, numero_interventi_annui, note_generali, stato
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'bozza'
      ) RETURNING *`,
      [createId(), client_id, location_id, technician_id || null, tipo_modulo, amministratore || null, referente || null,
        tipo_struttura || null, numero_famiglie || null, condizioni_igieniche || null, presenza_locali_commerciali ?? false,
        tipo_locale_commerciale || null, orario_preferenziale || null, giorni_preferiti || null,
        data_sopralluogo || null, firma_operatore_nome || null, numero_interventi_annui || null, note_generali || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

async function completeSurvey(req, res, next) {
  try {
    const surveyId = req.params.id;
    const surveyResult = await query(
      `SELECT s.*, c.ragione_sociale, l.nome_sede
       FROM site_surveys s
       JOIN clients c ON c.id = s.client_id
       JOIN locations l ON l.id = s.location_id
       WHERE s.id = $1`,
      [surveyId]
    );

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sopralluogo non trovato' });
    }

    const survey = surveyResult.rows[0];
    const pdfBuffer = await createSimpleSurveyPdf(survey);
    const key = `reports/surveys/${surveyId}.pdf`;
    const upload = await uploadBuffer({
      key,
      buffer: pdfBuffer,
      contentType: 'application/pdf'
    });

    await query(
      `UPDATE site_surveys
       SET stato = 'completato',
           pdf_url = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [surveyId, upload.url]
    );

    await query(
      `INSERT INTO client_documents (
        id, client_id, location_id, survey_id, tipo_documento, titolo, file_url, data_documento
      ) VALUES ($1,$2,$3,$4,'sopralluogo',$5,$6,CURRENT_DATE)`,
      [createId(), survey.client_id, survey.location_id, surveyId, `Sopralluogo ${survey.tipo_modulo}`, upload.url]
    );

    return res.json({
      message: 'Sopralluogo chiuso e PDF generato',
      pdf_url: upload.url
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listSurveys, createSurvey, completeSurvey };
