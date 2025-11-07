const loginForm = document.getElementById("login");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", 
      });

      const data = await response.json();

      if (response.ok) {
        const meRes = await fetch("/auth/me", { credentials: "include" });
        if (!meRes.ok) {
          alert("Erro ao obter dados do usuário após login");
          return;
        }
        const me = await meRes.json();
        if (me.role === "admin") {
          window.location.href = "/admin"; // rota protegida no server
        } else {
          window.location.href = "/user";
        }
      } else {
        alert(data.error || "Erro no login");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  });
}

// Registro comum
const registerForm = document.getElementById("register");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        window.location.href = "/login.html";
      } else {
        alert(data.error || "Erro no registro");
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  });
}
