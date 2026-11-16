CREATE DATABASE IF NOT EXISTS animalcare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE animalcare;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  verified TINYINT(1) NOT NULL DEFAULT 0,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id CHAR(36) PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao TEXT,
  categoria ENUM('higiene','veterinario','estetica','bem_estar') NOT NULL DEFAULT 'higiene',
  preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  duracao_minutos INT NOT NULL DEFAULT 30,
  imagem_url TEXT,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_services_active (ativo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS veterinarians (
  id CHAR(36) PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  crmv VARCHAR(50),
  especialidade VARCHAR(150),
  bio TEXT,
  foto_url TEXT,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vets_active (ativo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (
  id CHAR(36) PRIMARY KEY,
  tutor_nome VARCHAR(150) NOT NULL,
  tutor_email VARCHAR(255),
  tutor_telefone VARCHAR(50),
  pet_nome VARCHAR(150) NOT NULL,
  pet_especie ENUM('cao','gato','outro') NOT NULL DEFAULT 'cao',
  pet_raca VARCHAR(100),
  service_id CHAR(36) NOT NULL,
  service_nome VARCHAR(150),
  vet_id CHAR(36),
  vet_nome VARCHAR(150),
  data_agendada DATE NOT NULL,
  hora TIME NOT NULL,
  valor DECIMAL(10,2) DEFAULT 0,
  metodo_pagamento ENUM('pix','credito','debito') DEFAULT NULL,
  pagamento_status ENUM('pendente','pago') NOT NULL DEFAULT 'pendente',
  data_pagamento DATE DEFAULT NULL,
  status ENUM('pendente','confirmado','concluido','cancelado') NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  google_calendar_event_id VARCHAR(255),
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_appointments_date (data_agendada),
  INDEX idx_appointments_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS financial_records (
  id CHAR(36) PRIMARY KEY,
  appointment_id CHAR(36),
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  tipo ENUM('receita','despesa') NOT NULL DEFAULT 'receita',
  metodo_pagamento ENUM('pix','credito','debito','dinheiro','transferencia') NOT NULL DEFAULT 'pix',
  data_pagamento DATE,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_financial_date (data_pagamento)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS testimonials (
  id CHAR(36) PRIMARY KEY,
  autor VARCHAR(150) NOT NULL,
  pet_nome VARCHAR(150),
  texto TEXT NOT NULL,
  nota TINYINT NOT NULL DEFAULT 5,
  publicado TINYINT(1) NOT NULL DEFAULT 1,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS gallery_images (
  id CHAR(36) PRIMARY KEY,
  pet_nome VARCHAR(150) NOT NULL,
  pet_especie ENUM('cao','gato','outro') NOT NULL DEFAULT 'cao',
  legenda VARCHAR(255),
  foto_url TEXT NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  ordem INT NOT NULL DEFAULT 0,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faqs (
  id CHAR(36) PRIMARY KEY,
  pergunta VARCHAR(255) NOT NULL,
  resposta TEXT NOT NULL,
  categoria ENUM('geral','procedimentos','agendamento','pagamento') NOT NULL DEFAULT 'geral',
  ordem INT NOT NULL DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  id CHAR(36) PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  mensagem TEXT NOT NULL,
  lida TINYINT(1) NOT NULL DEFAULT 0,
  created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Troque a senha antes de usar em produção.
INSERT INTO users (id, email, password_hash, role, verified)
SELECT UUID(), 'admin@animalcare.local', '$2b$12$wkzHO2ZK.tlNEbv3oMsvKOpXsx9V8y3lGtGPNfVXy1sLF2m9AHxLm', 'admin', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@animalcare.local');
