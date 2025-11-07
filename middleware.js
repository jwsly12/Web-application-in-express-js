const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const requireAuth = (allowedRoles = []) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization?.split(" ")[1];
    const cookieToken = req.cookies?.token;
    const token = authHeader || cookieToken;

    if (!token) return res.status(401).json({ error: "Token não fornecido" });

    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    const [rows] = await pool.query("SELECT * FROM users WHERE user = ?", [decoded.username]);
    if (rows.length === 0) return res.status(401).json({ error: "Usuário não encontrado" });

    const user = rows[0];

    // Normaliza allowedRoles (pode ser string ou array)
    const roles = Array.isArray(allowedRoles) ? allowedRoles : (allowedRoles ? [allowedRoles] : []);
    if (roles.length && !roles.includes(user.role)) return res.status(403).json({ error: "Acesso negado" });

    req.user = user;
    next();
  } catch (err) {
    // Token inválido/expirado => 401
    console.error("ERRO NA AUTENTICAÇÃO:", err?.message || err);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

module.exports = requireAuth;
