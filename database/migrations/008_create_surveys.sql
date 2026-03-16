CREATE TABLE IF NOT EXISTS site_surveys (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES users(id),
  tipo_modulo VARCHAR(30) NOT NULL CHECK (tipo_modulo IN ('zanzare', 'ratti', 'blatte')),
  amministratore VARCHAR(255),
  referente VARCHAR(255),
  tipo_struttura VARCHAR(100),
  numero_famiglie INTEGER,
  condizioni_igieniche VARCHAR(30),
  presenza_locali_commerciali BOOLEAN NOT NULL DEFAULT false,
  tipo_locale_commerciale VARCHAR(100),
  orario_preferenziale VARCHAR(30),
  giorni_preferiti TEXT,
  data_sopralluogo DATE,
  firma_operatore_nome VARCHAR(255),
  numero_interventi_annui INTEGER,
  note_generali TEXT,
  pdf_url VARCHAR(500),
  stato VARCHAR(30) NOT NULL DEFAULT 'bozza',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_infestations (
  id UUID PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES site_surveys(id) ON DELETE CASCADE,
  infestante VARCHAR(100) NOT NULL,
  livello VARCHAR(20) NOT NULL CHECK (livello IN ('piccola', 'media', 'alta')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_areas (
  id UUID PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES site_surveys(id) ON DELETE CASCADE,
  area_nome VARCHAR(100) NOT NULL,
  prodotto VARCHAR(100),
  quantita VARCHAR(50),
  tempistica VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_photos (
  id UUID PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES site_surveys(id) ON DELETE CASCADE,
  foto_url VARCHAR(500) NOT NULL,
  descrizione TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS survey_signatures (
  id UUID PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES site_surveys(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('technician', 'client')),
  nome_firmatario VARCHAR(255),
  firma_url VARCHAR(500),
  signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE client_documents
  ADD CONSTRAINT client_documents_survey_fk
  FOREIGN KEY (survey_id) REFERENCES site_surveys(id) ON DELETE SET NULL;

ALTER TABLE client_documents
  ADD CONSTRAINT client_documents_quote_fk
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL;

ALTER TABLE client_documents
  ADD CONSTRAINT client_documents_invoice_fk
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;
