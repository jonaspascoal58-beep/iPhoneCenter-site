const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "troque-esta-senha";
const DB_FILE = process.env.DB_FILE || "./data/iphonecenter.db";

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    product TEXT NOT NULL,
    delivery_city TEXT,
    message TEXT,
    consent INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
`);

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) {
    res.set("WWW-Authenticate", 'Basic realm="iPhoneCenter Admin"');
    return res.status(401).send("Autenticação necessária.");
  }
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const split = decoded.indexOf(":");
  const user = split >= 0 ? decoded.slice(0, split) : "";
  const pass = split >= 0 ? decoded.slice(split + 1) : "";
  if (user !== ADMIN_USER || !crypto.timingSafeEqual(Buffer.from(pass), Buffer.from(ADMIN_PASSWORD))) {
    res.set("WWW-Authenticate", 'Basic realm="iPhoneCenter Admin"');
    return res.status(401).send("Credenciais inválidas.");
  }
  next();
}

app.post("/api/leads", (req, res) => {
  const { name, phone, email, product, deliveryCity, message, consent } = req.body || {};
  if (!name || !phone || !product || consent !== true) {
    return res.status(400).json({ ok: false, message: "Preencha os campos obrigatórios e aceite a política de privacidade." });
  }
  if (String(name).length > 120 || String(phone).length > 40 || String(email || "").length > 160 ||
      String(product).length > 100 || String(deliveryCity || "").length > 120 || String(message || "").length > 1000) {
    return res.status(400).json({ ok: false, message: "Um ou mais campos excedem o limite permitido." });
  }

  const stmt = db.prepare(`
    INSERT INTO leads (name, phone, email, product, delivery_city, message, consent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `);
  const info = stmt.run(
    String(name).trim(),
    String(phone).trim(),
    String(email || "").trim(),
    String(product).trim(),
    String(deliveryCity || "").trim(),
    String(message || "").trim(),
    new Date().toISOString()
  );

  res.status(201).json({ ok: true, id: info.lastInsertRowid });
});

app.get("/api/admin/leads", adminAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, name, phone, email, product, delivery_city AS deliveryCity, message, created_at AS createdAt
    FROM leads ORDER BY id DESC
  `).all();
  res.json({ ok: true, leads: rows });
});

app.get("/admin", adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.listen(PORT, () => {
  console.log(`iPhoneCenter rodando em http://localhost:${PORT}`);
});
