// Rotas
/*
const express = require("express");
const path = require("path");
const router = express.Router();

router.get('/' , (req, res) => {
    res.sendFile(path.join(__dirname , '..', 'public', 'index.html'))
})

router.get('/register' , (req, res) => {
    res.sendFile(path.join(__dirname , '..', 'public', 'register.html'))
})

router.get('/login' , (req, res) => {
  res.sendFile(path.join(__dirname , '..', 'public', 'login.html'))
})

module.exports = router;
*/

const express = require("express");
const path = require("path");
const router = express.Router();
const requireAuth = require("../middleware");

// Página inicial
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Login HTML
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

// Registro HTML
router.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register.html"));
});


// Rotas protegidas
router.get("/user", requireAuth("user"), (req, res) => {
  res.sendFile(path.join(__dirname, "../protected/user.html"));
});

router.get("/admin", requireAuth("admin"), (req, res) => {
  res.sendFile(path.join(__dirname, "../protected/admin.html"));
});

module.exports = router;
