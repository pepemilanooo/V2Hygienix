CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES users(id),
  pest_type_id UUID REFERENCES pest_types(id),
  treatment_method_id UUID REFERENCES treatment_methods(id),
  data_programmata TIMESTAMP,
  data_esecuzione TIMESTAMP,
  stato VARCHAR(30) NOT NULL DEFAULT 'pianificato',
  note_tecnico TEXT,
  note_interne TEXT,
  check_in_lat DECIMAL(10,8),
  check_in_lng DECIMAL(11,8),
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  report_pdf_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intervention_photos (
  id UUID PRIMARY KEY,
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  foto_url VARCHAR(500) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descrizione TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_usage (
  id UUID PRIMARY KEY,
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantita_usata DECIMAL(10,2),
  unita_misura VARCHAR(20),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intervention_signatures (
  id UUID PRIMARY KEY,
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('technician', 'client')),
  nome_firmatario VARCHAR(255),
  firma_url VARCHAR(500),
  signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
