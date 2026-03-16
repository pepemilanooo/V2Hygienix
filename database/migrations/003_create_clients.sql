CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY,
  ragione_sociale VARCHAR(255) NOT NULL,
  piva VARCHAR(20),
  cf VARCHAR(16),
  email VARCHAR(255),
  telefono VARCHAR(20),
  indirizzo_fatturazione TEXT,
  consulente VARCHAR(255),
  numero_consulente VARCHAR(30),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
