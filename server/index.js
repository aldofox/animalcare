import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";

const app = express();
const port = Number(process.env.PORT || 3001);
const jwtSecret = process.env.JWT_SECRET || "animalcare-local-secret-change-me";
const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://localhost:4173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "aldo",
  database: process.env.DB_NAME || "animalcare",
  waitForConnections: true,
  connectionLimit: 10,
});
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)),
});

const entities = {
  Appointment: "appointments", ContactMessage: "contact_messages", FAQ: "faqs",
  FinancialRecord: "financial_records", GalleryImage: "gallery_images",
  Service: "services", Testimonial: "testimonials", Veterinarian: "veterinarians",
};
const publicReadEntities = new Set(["Service", "Veterinarian", "Testimonial", "GalleryImage", "FAQ"]);
const allowedColumns = {
  appointments: ["tutor_nome","tutor_email","tutor_telefone","pet_nome","pet_especie","pet_raca","service_id","service_nome","vet_id","vet_nome","data_agendada","hora","valor","metodo_pagamento","pagamento_status","data_pagamento","status","observacoes","google_calendar_event_id"],
  contact_messages: ["nome","email","telefone","mensagem","lida"],
  faqs: ["pergunta","resposta","categoria","ordem","ativo"],
  financial_records: ["appointment_id","descricao","valor","tipo","metodo_pagamento","data_pagamento"],
  gallery_images: ["pet_nome","pet_especie","legenda","foto_url","ativo","ordem"],
  services: ["nome","descricao","categoria","preco","duracao_minutos","imagem_url","ativo"],
  testimonials: ["autor","pet_nome","texto","nota","publicado"],
  veterinarians: ["nome","crmv","especialidade","bio","foto_url","ativo"],
};

app.use(cors({
  origin: (origin, callback) => {
    // Requests without an Origin header are non-browser or same-origin calls.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
}));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadDir));

function tokenFor(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" });
}
function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      if (required) return res.status(401).json({ message: "Autenticação necessária." });
      return next();
    }
    try {
      req.user = jwt.verify(header.slice(7), jwtSecret);
      next();
    } catch {
      return res.status(401).json({ message: "Sessão expirada." });
    }
  };
}
function admin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Acesso restrito ao administrador." });
  next();
}
function cleanData(table, data) {
  return Object.fromEntries(Object.entries(data).filter(([key, value]) => allowedColumns[table]?.includes(key) && value !== undefined));
}

function calendarConfig() {
  const required = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REFRESH_TOKEN", "GOOGLE_CALENDAR_ID"];
  return required.every((key) => process.env[key]);
}

function calendarDateTime(date, time, durationMinutes) {
  const [year, month, day] = String(date).split("-").map(Number);
  const [hour, minute] = String(time).split(":").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const end = new Date(start.getTime() + Number(durationMinutes || 30) * 60_000);
  const format = (value) => value.toISOString().replace(".000Z", "");
  return { start: format(start), end: format(end) };
}

async function googleAccessToken() {
  if (!calendarConfig()) {
    const error = new Error("A integração com o Google Calendar não está configurada.");
    error.code = "GOOGLE_CALENDAR_NOT_CONFIGURED";
    error.status = 501;
    throw error;
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) {
    const error = new Error("Não foi possível renovar a autorização do Google Calendar.");
    error.code = "GOOGLE_CALENDAR_AUTH_FAILED";
    error.status = 502;
    throw error;
  }
  return payload.access_token;
}

async function googleCalendarRequest(pathname, options = {}) {
  const response = await fetch(`https://www.googleapis.com/calendar/v3${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${await googleAccessToken()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error("A API do Google Calendar recusou a operação.");
    error.code = "GOOGLE_CALENDAR_REQUEST_FAILED";
    error.status = response.status === 404 ? 404 : 502;
    error.details = payload?.error?.message;
    throw error;
  }
  return payload;
}

async function createGoogleCalendarEvent(appointment, durationMinutes) {
  const dateTime = calendarDateTime(appointment.data_agendada, appointment.hora, durationMinutes);
  const timezone = process.env.GOOGLE_CALENDAR_TIME_ZONE || "America/Sao_Paulo";
  return googleCalendarRequest(`/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID)}/events`, {
    method: "POST",
    body: JSON.stringify({
      summary: `AnimalCare — ${appointment.service_nome || "Atendimento"} — ${appointment.pet_nome}`,
      description: [
        `Tutor: ${appointment.tutor_nome}`,
        appointment.tutor_telefone && `Telefone: ${appointment.tutor_telefone}`,
        appointment.tutor_email && `E-mail: ${appointment.tutor_email}`,
        appointment.vet_nome && `Veterinário: ${appointment.vet_nome}`,
        appointment.observacoes && `Observações: ${appointment.observacoes}`,
        appointment.appointmentId && `Agendamento: ${appointment.appointmentId}`,
      ].filter(Boolean).join("\n"),
      start: { dateTime: dateTime.start, timeZone: timezone },
      end: { dateTime: dateTime.end, timeZone: timezone },
      extendedProperties: appointment.appointmentId
        ? { private: { animalcareAppointmentId: appointment.appointmentId } }
        : undefined,
    }),
  });
}

async function deleteGoogleCalendarEvent(eventId) {
  return googleCalendarRequest(
    `/calendars/${encodeURIComponent(process.env.GOOGLE_CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE" },
  );
}

app.get("/api/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok" }); }
  catch { res.status(503).json({ status: "error", message: "Banco de dados indisponível." }); }
});

app.post("/api/functions/:name", auth(false), async (req, res) => {
  if (req.params.name !== "sync-google-calendar") {
    return res.status(404).json({ message: "Função não encontrada." });
  }

  if (req.body?.action === "delete" && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Acesso restrito ao administrador." });
  }

  if (!["create", "delete"].includes(req.body?.action)) {
    return res.status(400).json({ message: "Ação de calendário inválida." });
  }

  try {
    if (req.body.action === "create") {
      if (!req.body.appointment?.data_agendada || !req.body.appointment?.hora || !req.body.appointment?.pet_nome) {
        return res.status(400).json({ message: "Dados insuficientes para criar o evento." });
      }
      const event = await createGoogleCalendarEvent(req.body.appointment, req.body.duracao_minutos);
      return res.status(201).json({ synced: true, eventId: event.id, htmlLink: event.htmlLink });
    }

    if (!req.body.eventId) return res.status(400).json({ message: "Informe o ID do evento." });
    await deleteGoogleCalendarEvent(req.body.eventId);
    return res.json({ synced: true });
  } catch (error) {
    console.error("Falha na sincronização com o Google Calendar.", error);
    return res.status(error.status || 502).json({
      message: error.message || "Não foi possível sincronizar com o Google Calendar.",
      code: error.code || "GOOGLE_CALENDAR_ERROR",
    });
  }
});

app.post("/api/uploads", auth(), admin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Selecione uma imagem válida." });
  const extension = path.extname(req.file.originalname).toLowerCase() || ".bin";
  const filename = `${req.file.filename}${extension}`;
  const target = path.join(uploadDir, filename);
  fs.renameSync(req.file.path, target);
  res.status(201).json({ file_url: `${req.protocol}://${req.get("host")}/uploads/${filename}` });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || password.length < 6) return res.status(400).json({ message: "Informe um e-mail e uma senha de pelo menos 6 caracteres." });
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query("INSERT INTO users (email, password_hash, role, verified) VALUES (?, ?, 'user', 1)", [email, passwordHash]);
    res.status(201).json({ message: "Conta criada. Use o código 123456 para confirmar." });
  } catch (error) { next(error); }
});

app.post("/api/auth/verify-otp", async (req, res, next) => {
  try {
    if (String(req.body.otpCode) !== "123456") return res.status(400).json({ message: "Código inválido. Use 123456 no ambiente local." });
    const [rows] = await pool.query("SELECT id, email, role FROM users WHERE email = ?", [String(req.body.email).toLowerCase()]);
    if (!rows.length) return res.status(404).json({ message: "Usuário não encontrado." });
    res.json({ access_token: tokenFor(rows[0]), user: rows[0] });
  } catch (error) { next(error); }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id, email, password_hash, role FROM users WHERE email = ?", [String(req.body.email || "").toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(String(req.body.password || ""), rows[0].password_hash))) return res.status(401).json({ message: "E-mail ou senha inválidos." });
    const { password_hash, ...user } = rows[0];
    res.json({ access_token: tokenFor(user), user });
  } catch (error) { next(error); }
});
app.get("/api/auth/me", auth(), async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id, email, role, created_date FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(401).json({ message: "Usuário não encontrado." });
    res.json(rows[0]);
  } catch (error) { next(error); }
});
app.post("/api/auth/logout", (_req, res) => res.json({ ok: true }));
app.post("/api/auth/resend-otp", (_req, res) => res.json({ message: "Código reenviado. No ambiente local, use 123456." }));
app.post("/api/auth/forgot-password", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [String(req.body.email || "").toLowerCase()]);
    if (rows.length) console.log(`Token de recuperação para ${req.body.email}: ${jwt.sign({ id: rows[0].id, purpose: "reset" }, jwtSecret, { expiresIn: "30m" })}`);
    res.json({ message: "Se o e-mail existir, as instruções foram geradas." });
  } catch (error) { next(error); }
});
app.post("/api/auth/reset-password", async (req, res, next) => {
  try {
    const payload = jwt.verify(req.body.token, jwtSecret);
    if (payload.purpose !== "reset" || String(req.body.newPassword || "").length < 6) throw new Error("invalid");
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [await bcrypt.hash(req.body.newPassword, 12), payload.id]);
    res.json({ message: "Senha alterada." });
  } catch { res.status(400).json({ message: "Token inválido ou senha muito curta." }); }
});

app.get("/api/users", auth(), admin, async (req, res, next) => {
  try {
    const sort = String(req.query.sort || "-created_date");
    const direction = sort.startsWith("-") ? "DESC" : "ASC";
    const sortColumn = ["email", "role", "verified", "created_date", "updated_date"].includes(sort.replace(/^-/, ""))
      ? sort.replace(/^-/, "") : "created_date";
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const [rows] = await pool.query(
      `SELECT id, email, role, verified, created_date, updated_date FROM users ORDER BY \`${sortColumn}\` ${direction} LIMIT ?`,
      [limit],
    );
    res.json(rows);
  } catch (error) { next(error); }
});

app.get("/api/users/:id", auth(), admin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, email, role, verified, created_date, updated_date FROM users WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ message: "Usuário não encontrado." });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

app.post("/api/users", auth(), admin, async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = req.body.role === "admin" ? "admin" : "user";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Informe um e-mail válido." });
    if (password.length < 6) return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    const id = crypto.randomUUID();
    await pool.query(
      "INSERT INTO users (id, email, password_hash, role, verified) VALUES (?, ?, ?, ?, ?)",
      [id, email, await bcrypt.hash(password, 12), role, req.body.verified === false ? 0 : 1],
    );
    const [rows] = await pool.query("SELECT id, email, role, verified, created_date, updated_date FROM users WHERE id = ?", [id]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

app.patch("/api/users/:id", auth(), admin, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id && req.body.role && req.body.role !== "admin") {
      return res.status(400).json({ message: "Você não pode remover seu próprio acesso de administrador." });
    }
    const fields = [];
    const values = [];
    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Informe um e-mail válido." });
      fields.push("email = ?"); values.push(email);
    }
    if (req.body.role !== undefined) {
      fields.push("role = ?"); values.push(req.body.role === "admin" ? "admin" : "user");
    }
    if (req.body.verified !== undefined) {
      fields.push("verified = ?"); values.push(req.body.verified ? 1 : 0);
    }
    if (req.body.password) {
      if (String(req.body.password).length < 6) return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
      fields.push("password_hash = ?"); values.push(await bcrypt.hash(String(req.body.password), 12));
    }
    if (!fields.length) return res.status(400).json({ message: "Nenhuma alteração informada." });
    values.push(req.params.id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    const [rows] = await pool.query("SELECT id, email, role, verified, created_date, updated_date FROM users WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Usuário não encontrado." });
    res.json(rows[0]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Este e-mail já está cadastrado." });
    next(error);
  }
});

app.delete("/api/users/:id", auth(), admin, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ message: "Você não pode excluir seu próprio usuário." });
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Usuário não encontrado." });
    res.status(204).end();
  } catch (error) { next(error); }
});

app.get("/api/entities/:entity", auth(false), async (req, res, next) => {
  try {
    const table = entities[req.params.entity];
    if (!table || !publicReadEntities.has(req.params.entity) && req.user?.role !== "admin") return res.status(403).json({ message: "Acesso negado." });
    const columns = allowedColumns[table];
    const where = [], params = [];
    for (const column of columns) if (req.query[column] !== undefined) { where.push(`\`${column}\` = ?`); params.push(req.query[column] === "true" ? 1 : req.query[column] === "false" ? 0 : req.query[column]); }
    const sort = String(req.query.sort || "-created_date");
    const sortColumn = columns.includes(sort.replace(/^-/, "")) || ["created_date", "data_agendada", "data_pagamento", "ordem"].includes(sort.replace(/^-/, "")) ? sort.replace(/^-/, "") : "created_date";
    const direction = sort.startsWith("-") ? "DESC" : "ASC";
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const [rows] = await pool.query(`SELECT * FROM \`${table}\`${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY \`${sortColumn}\` ${direction} LIMIT ?`, [...params, limit]);
    res.json(rows);
  } catch (error) { next(error); }
});
app.get("/api/entities/:entity/:id", auth(false), async (req, res, next) => {
  try {
    const table = entities[req.params.entity];
    if (!table || (!publicReadEntities.has(req.params.entity) && req.user?.role !== "admin")) return res.status(403).json({ message: "Acesso negado." });
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Registro não encontrado." });
    res.json(rows[0]);
  } catch (error) { next(error); }
});
app.post("/api/entities/:entity", auth(false), async (req, res, next) => {
  try {
    const table = entities[req.params.entity];
    if (!table || (!["Appointment", "ContactMessage"].includes(req.params.entity) && req.user?.role !== "admin")) return res.status(403).json({ message: "Acesso negado." });
    const data = cleanData(table, req.body);
    const id = crypto.randomUUID();
    const keys = ["id", ...Object.keys(data)], values = [id, ...Object.values(data)];
    await pool.query(`INSERT INTO \`${table}\` (${keys.map((key) => `\`${key}\``).join(",")}) VALUES (${keys.map(() => "?").join(",")})`, values);
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [id]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});
app.patch("/api/entities/:entity/:id", auth(), admin, async (req, res, next) => {
  try {
    const table = entities[req.params.entity];
    if (!table) return res.status(404).json({ message: "Entidade inválida." });
    const data = cleanData(table, req.body);
    const entries = Object.entries(data);
    if (!entries.length) return res.status(400).json({ message: "Nenhum campo válido informado." });
    await pool.query(`UPDATE \`${table}\` SET ${entries.map(([key]) => `\`${key}\` = ?`).join(", ")} WHERE id = ?`, [...entries.map(([, value]) => value), req.params.id]);
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (error) { next(error); }
});
app.delete("/api/entities/:entity/:id", auth(), admin, async (req, res, next) => {
  try {
    const table = entities[req.params.entity];
    if (!table) return res.status(404).json({ message: "Entidade inválida." });
    await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [req.params.id]);
    res.status(204).end();
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Erro interno do servidor." });
});
app.listen(port, () => console.log(`AnimalCare API em http://localhost:${port}`));
