const PDFDocument = require('pdfkit');

function createSimpleInterventionPdf(intervention) {
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Hygienix - Report Intervento', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Cliente: ${intervention.ragione_sociale || ''}`);
    doc.text(`Sede: ${intervention.nome_sede || ''}`);
    doc.text(`Tecnico: ${intervention.tecnico_nome || ''} ${intervention.tecnico_cognome || ''}`);
    doc.text(`Data programmata: ${intervention.data_programmata || ''}`);
    doc.text(`Stato: ${intervention.stato || ''}`);
    doc.moveDown();
    doc.text('Note tecnico:');
    doc.text(intervention.note_tecnico || '-');
    doc.moveDown();
    doc.text('Prodotti usati / firme / foto da completare nella prossima iterazione.');
    doc.end();
  });
}

function createSimpleSurveyPdf(survey) {
  const doc = new PDFDocument({ margin: 40 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(`Hygienix - Sopralluogo ${survey.tipo_modulo || ''}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Cliente: ${survey.ragione_sociale || ''}`);
    doc.text(`Sede: ${survey.nome_sede || ''}`);
    doc.text(`Amministratore: ${survey.amministratore || ''}`);
    doc.text(`Referente: ${survey.referente || ''}`);
    doc.text(`Data: ${survey.data_sopralluogo || ''}`);
    doc.moveDown();
    doc.text('Note generali:');
    doc.text(survey.note_generali || '-');
    doc.end();
  });
}

module.exports = {
  createSimpleInterventionPdf,
  createSimpleSurveyPdf
};
