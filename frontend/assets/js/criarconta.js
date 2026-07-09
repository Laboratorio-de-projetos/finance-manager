const password = document.querySelector("#camposenha");
const passwordConfirm = document.querySelector("#camposenhaconfirmar");
const email = document.querySelector("#campoemail");
const firstname = document.querySelector("#camponome");
const lastname = document.querySelector("#camposobrenome");
const dateBirth = document.querySelector("#campodatanascimento");
const btnLogin = document.querySelector(".btncriarconta");

const data = new Date();

const dia = String(data.getDate()).padStart(2, '0');
const mes = String(data.getMonth() + 1).padStart(2, '0');
const ano = data.getFullYear();

const dataAtual = `${dia}/${mes}/${ano}`;
console.log(dataAtual);

btnLogin.addEventListener("click", async () => {
  btnLogin.disabled = true;

  if (
    !firstname.value.trim() ||
    !lastname.value.trim() ||
    !email.value.trim() ||
    !password.value.trim() ||
    !passwordConfirm.value.trim() ||
    !dateBirth.value
  ) {
    await Swal.fire({
      icon: "warning",
      title: "Campos obrigatórios",
      text: "Preencha todos os campos.",
    });
    return;
  }

  if(dateBirth.value > dataAtual) {
    await Swal.fire({
      icon: "warning",
      title: "Data de nascimento inválida",
      text: "A data de nascimento não pode ser maior que a data atual.",
    });
    return;
  }

  if (password.value.length < 8) {
    await Swal.fire({
      icon: "warning",
      title: "Senha inválida",
      text: "A senha deve possuir pelo menos 8 caracteres.",
    });
    return;
  }

  if (password.value !== passwordConfirm.value) {
    await Swal.fire({
      icon: "error",
      title: "Senhas diferentes",
      text: "Os campos de senha devem ser iguais.",
    });
    return;
  }

  const respostaLogin = await fetch("https://finance-manager-api-elwi.onrender.com/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      first_name: firstname.value,
      last_name: lastname.value,
      email: email.value,
      password: password.value,
      birth_date: dateBirth.value,
    }),
  });

    btnLogin.disabled = false;

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

  window.location.href = "index.html";
});
