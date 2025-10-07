// Servidor web com express
//meu-projeto/
//├── public/
//│   ├── index.html
//│   ├── about.html
//│   ├── 404.html
//│   └── style.css
//├── routes/
//│   └── index.js
//├── app.js
//├── package.json
//└── .gitignore

const express = require("express");
const app = express();
const path = require("path");
const router = require('./routes/index');

const PORT = 5000;

app.use(express.static(path.join(__dirname, 'public')))

app.use('/' , router)

app.use((req , res) =>{
  res.status(404).sendFile(path.join(__dirname , 'public', '404.html'))
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

app.use(express.urlencoded({ extended: true }))
