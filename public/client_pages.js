document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Solicita info do usuário — o cookie será enviado automaticamente se o browser tiver o cookie
    const meRes = await fetch("/auth/me", { credentials: "include" });

    if (!meRes.ok) {
      // Não autenticado => redireciona para login
      window.location.href = "/login.html";
      return;
    }

    const me = await meRes.json();
    const username = me.username;
    const role = me.role;

    const nameDisplay = document.getElementById("user-name") || document.getElementById("admin-name");
    if (nameDisplay) {
      // usar textContent para evitar XSS
      nameDisplay.textContent = `Bem-vindo, ${username}!`;
    }

    // Redirecionamento cliente só para UX — sempre garantir proteção no servidor
    if (role === "admin" && window.location.pathname.includes("/user")) {
      window.location.href = "/admin";
    }
    if (role === "user" && window.location.pathname.includes("/admin")) {
      window.location.href = "/user";
    }

    // Logout: chama endpoint que limpa o cookie no servidor
    document.getElementById("logout")?.addEventListener("click", async () => {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
      // Depois do logout, redireciona para login
      window.location.href = "/login.html";
    });
  } catch (err) {
    console.error(err);
    window.location.href = "/login.html";
  }
});
