CREATE TABLE IF NOT EXISTS pest_types (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descrizione TEXT,
  categoria VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatment_methods (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descrizione TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  nome_commerciale VARCHAR(255) NOT NULL,
  principio_attivo VARCHAR(255),
  numero_registro VARCHAR(50),
  categoria VARCHAR(50),
  unita_misura VARCHAR(20),
  quantita_disponibile DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantita_minima DECIMAL(10,2) NOT NULL DEFAULT 0,
  scheda_sicurezza_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
