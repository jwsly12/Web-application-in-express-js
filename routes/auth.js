const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  res.send("Login realizado com sucesso!");
  console.log(username);
  console.log(password);
});

module.exports = router;