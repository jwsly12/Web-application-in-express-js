// Servidor web com express
/** 
projeto/
├── public/
│   ├── index.html
│   ├── about.html
│   ├── login.html   
│   ├── register.html     
│   ├── 404.html
│   └── style.css
├── routes/
│   └── index.js
├── app.js
├── package.json
└── .gitignore

 Criar uma rota pro Desh do admin /admin
 Criar a autenticação de login e registro
 
*/

const express = require("express");
const app = express();
const path = require("path");
const router = require("./routes/index");
const authRouter = require("./routes/auth");
const PORT = 5000;

// Configurações do servidor
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", router);

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
