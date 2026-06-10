const senha = document.querySelector("#camposenha");
const senhaConfirmar = document.querySelector("#camposenhaconfirmar");
const email = document.querySelector("#campoemail");
const nome = document.querySelector("#camponome");
const sobrenome = document.querySelector("#camposobrenome");
const dataNascimento = document.querySelector("#datanascimento");
const btnLogin = document.querySelector(".btncriarconta");

btnLogin.addEventListener("click", async () => {
  if (
    !nome.value.trim() ||
    !sobrenome.value.trim() ||
    !email.value.trim() ||
    !senha.value.trim() ||
    !senhaConfirmar.value.trim() ||
    !dataNascimento.value
  ) {
    await Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios",
      text: "Preencha todos os campos.",
    });
    return;
  }

  if (senha.value.length < 8) {
    await Swal.fire({
      icon: "warning",
      title: "Senha inválida",
      text: "A senha deve possuir pelo menos 8 caracteres.",
    });
    return;
  }

  if (senha.value !== senhaConfirmar.value) {
    await Swal.fire({
      icon: "error",
      title: "Senhas diferentes",
      text: "Os campos de senha devem ser iguais.",
    });
    return;
  }

  const respostaLogin = await fetch("http://localhost:8000/cadastrarlogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome: nome.value,
      sobrenome: sobrenome.value,
      email: email.value,
      senha: senha.value,
      dataNascimento: dataNascimento.value,
    }),
  });

  const dados = await respostaLogin.json();

  if (!respostaLogin.ok) {
    await Swal.fire({
      icon: "error",
      title: "Erro",
      text: dados.detail || "Não foi possível criar a conta.",
    });
    return;
  }
  await Swal.fire({
    icon: "success",
    title: "Cadastro realizado!",
    text: "Sua conta foi criada com sucesso.",
  });

  window.location.href = "dashboard.html";
});
