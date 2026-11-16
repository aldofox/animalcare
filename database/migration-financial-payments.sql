USE animalcare;

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS metodo_pagamento ENUM('pix','credito','debito') DEFAULT NULL AFTER valor,
  ADD COLUMN IF NOT EXISTS pagamento_status ENUM('pendente','pago') NOT NULL DEFAULT 'pendente' AFTER metodo_pagamento,
  ADD COLUMN IF NOT EXISTS data_pagamento DATE DEFAULT NULL AFTER pagamento_status;
