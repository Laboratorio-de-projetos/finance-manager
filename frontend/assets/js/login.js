const senha = document.querySelector("#camposenha");
const email = document.querySelector("#campoemail");
const btnLogin = document.querySelector(".btnlogin");

btnLogin.addEventListener("click", async () => {
  if (!email.value.trim() || !senha.value.trim()) {
    await Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios",
      text: "Preencha email e senha.",
      confirmButtonColor: "#1e3a8a",
    });
    return;
  }
  
  btnLogin.disabled = true;

  try {
    const respostaLogin = await fetch("https://finance-manager-api-elwi.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: senha.value,
      }),
    });

    btnLogin.disabled = false;

    const dados = await respostaLogin.json();

    if (!respostaLogin.ok) {
      senha.value = "";

      await Swal.fire({
        icon: "error",
        title: "Login inválido",
        text: dados.detail || "Email ou senha inválidos.",
        confirmButtonColor: "#1e3a8a",
      });

      senha.focus();
      return;
    }

    localStorage.setItem("token", dados.access_token);

    await Swal.fire({
      icon: "success",
      title: "Bem-vindo!",
      text: "Login realizado com sucesso.",
      confirmButtonColor: "#1e3a8a",
    });

    window.location.href = "dashboard.html";
  } catch (erro) {
    console.error(erro);

    await Swal.fire({
      icon: "error",
      title: "Erro de conexão",
      text: "Não foi possível conectar ao servidor.",
      confirmButtonColor: "#1e3a8a",
    });
  }
});
