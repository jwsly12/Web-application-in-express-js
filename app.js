// Servidor web com express
/** 
projeto/
  |-- public/
  |   |-- index.html
  |   |-- login.html
  |   |-- register.html
  |   |-- admin.html
  |   |-- user.html
  |   |-- client_auth.js
  |   |-- client_pages.js
  |-- routes/
  |   |-- index.js
  |   |-- auth.js
  |-- middleware.js
  |-- app.js
  |-- db.js
  |-- .env


 Criar uma rota pro Dash do admin /admin
 Criar a autenticação de login e registro 
*/

const express = require("express");
const path = require("path");
const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1); // importante para cookies secure atrás de proxy

// Segurança: headers
app.use(helmet());

// Parsers com limites (evitar payloads gigantes)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Cookie parser (para ler HttpOnly cookies)
app.use(cookieParser());

// CORS: permitir apenas origens confiáveis e credenciais (cookies)
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5000", // ajustar em produção
  credentials: true,
}));

// Rate limiting (protege endpoints sensíveis)
// Ajuste conforme sua necessidade
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // limite por IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplica o rate limit somente às rotas de auth (login/register)
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Rotas
app.use("/auth", authRouter);
app.use("/", indexRouter);

// 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Erro geral (middleware de erro)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});