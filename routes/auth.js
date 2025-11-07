
//Pegar o que vem do formulario Registro  e enviar para o banco de dados
/*
async para eventos que precisam de tempo para serem executados

Fluxo 1:
*Dados enviados para o banco de dados
*caso o usuario ja exista retorna que o usuario ja existe
*caso não o novo usuario é criado e a senha é criptografada
*Mesmo fluxo para Senha 

Fluxo 2: --> Login
*Dados enviados para o banco de dados
*Caso o usuario não exista retorna que o usuario não existe
*Caso o usuario exista verifica se a senha está correta
*Caso a senha esteja correta retorna que o login foi bem sucedido
*Caso a senha esteja incorreta retorna que a senha está incorreta
*/

// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

const COOKIE_NAME = "token";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET não definido nas variáveis de ambiente!");
  process.exit(1);
}

// Validação simples (enforce mínimo)
function validateCredentials(username, password) {
  if (!username || !password) return false;
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (username.length < 3 || username.length > 50) return false;
  if (password.length < 8) return false; // exigir senha mínima
  return true;
}

// Registro (usuário comum)
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!validateCredentials(username, password))
      return res.status(400).json({ error: "Usuário ou senha inválidos" });

    const [rows] = await pool.query("SELECT * FROM users WHERE user = ?", [username]);
    if (rows.length > 0) return res.status(400).json({ error: "Usuário já existe" });

    const hash = await bcrypt.hash(password, 12);
    await pool.query("INSERT INTO users (user, senha, role) VALUES (?, ?, 'user')", [username, hash]);

    res.json({ message: "Usuário registrado com sucesso!" });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Login: cria JWT e seta cookie HttpOnly
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Credenciais não informadas" });

    const [rows] = await pool.query("SELECT * FROM users WHERE user = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.senha);
    if (!valid) return res.status(401).json({ error: "Credenciais inválidas" });

    // Cria token curto
    const token = jwt.sign(
      { username: user.user, role: user.role },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "15m" }
    );

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    };

    // Seta o cookie HttpOnly — cliente não pode ler via JS
    res.cookie(COOKIE_NAME, token, cookieOptions);

    res.json({ message: "Login bem-sucedido", role: user.role });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Logout: limpa cookie HttpOnly
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logout realizado" });
});

// /me: retorna info básica do usuário (usa cookie)
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "Não autenticado" });

    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    // Opcional: re-ler do DB para garantir que usuário existe/role atualizada
    const [rows] = await pool.query("SELECT user, role FROM users WHERE user = ?", [decoded.username]);
    if (rows.length === 0) return res.status(401).json({ error: "Usuário não encontrado" });

    const user = rows[0];
    res.json({ username: user.user, role: user.role });
  } catch (err) {
    console.error("me error:", err?.message || err);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
});

module.exports = router;

