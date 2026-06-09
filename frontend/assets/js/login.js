const senha = document.querySelector('#camposenha');
const email = document.querySelector('#campoemail');
const btnLogin = document.querySelector(".btnlogin");


btnLogin.addEventListener('click', async () => {
    const respostaLogin = await fetch ("http://localhost:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senha: senha.value,
      email: email.value,
    }),
  });

    const dados = await respostaLogin.json();

    if (!respostaLogin.ok) {
        alert(dados.detail || 'Email ou senha inválidos');
        return;
    }

    window.location.href = 'dashboard.html';
});